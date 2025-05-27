"use strict";
const database = require("../../Helpers/Database.js");
const Time = require("../../Helpers/Time");
const {
   Client,
   EmbedBuilder,
   Events,
   RESTJSONErrorCodes
} = require("discord.js");
const {
   shardCount,
   EMOJIS,
   ownerId
} = require("../../settings.json");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../Helpers/Util.js");
const allMessages = require("../../Helpers/Localizations/Index.js");

module.exports = {
   name: Events.ClientReady,
   once: true, // Bu event sadece bir kez çalıştırılacak
   /**
    * 
    * @param {Client} client 
    */
   async execute(client) {

      const alisaFile = await database.getFile("alisa");
      const NOW_TIME = Date.now();

      Util.setRestToken(client.token);

      // Bütün sunucularda dolaş ve silinen verileri database'den sil
      client.guilds.cache.forEach(async (guild, guildId) => {

         const setObject = {};
         const unsetObject = {};
         const pushObject = {};

         // Eğer sunucu karalistedeyse sunucudan çık
         if (alisaFile.blacklistGuilds[guildId]) return guild.leave();

         const guildDatabase = await database.getGuild(guildId);
         const language = guildDatabase.language;

         // Slash komutlarını oluştur
         Util.setGuildCommands(client.user.id, guildId, Util.maps.guildCommandsJSON.get(language));

         // Eğer sunucunun kayıt şekli "Üyeli kayıt" ise önbelleğe kaydet
         if (guildDatabase.register.type == "member") Util.maps.registerOptions.add(guildId);

         // Kullanıcıların sesteki aktivitelerini kontrol et
         for (const memberId in guildDatabase.stats) {
            const memberData = guildDatabase.stats[memberId];

            // Eğer kullanıcının bot yeniden başlamadan önce seste durduğu kayıt varsa ve ses kanalını değiştirmişse
            if (memberData.currVoice.channelId) {
               const member = await Util.fetchMemberForce(guild, memberId);

               if (!member) {
                  memberData.currVoice = setObject[`stats.${memberId}.currVoice`] = {};
                  continue;
               }

               // Eğer kullanıcı ses kanalını değiştirmişse
               if (member.voice.channelId != memberData.currVoice.channelId) {
                  const {
                     startedTimestamp,
                     channelId
                  } = memberData.currVoice;

                  // Eğer kullanıcı şu anda başka bir ses kanalında ise
                  memberData.currVoice = setObject[`stats.${memberId}.currVoice`] = member.voice.channelId ? {
                     startedTimestamp: NOW_TIME,
                     channelId: member.voice.channelId
                  } : {};

                  // Seste kaldığı süre
                  const time = NOW_TIME - startedTimestamp;

                  // Database'ye kaydet
                  memberData.totals.voice = setObject[`stats.${memberId}.totals.voice`] = (memberData.totals.voice + time);

                  memberData.voice ??= {};

                  const voiceChannel = memberData.voice[channelId] ??= Util.DEFAULTS.memberVoiceStat;
                  voiceChannel.total = setObject[`stats.${memberId}.voice.${channelId}.total`] = (voiceChannel.total + time);

                  const voiceChannelObject = {
                     startedTimestamp: NOW_TIME,
                     endedTimestamp: NOW_TIME,
                     duration: time
                  };
                  voiceChannel.datas.unshift(voiceChannelObject);
                  pushObject[`stats.${memberId}.voice.${channelId}.datas`] = {
                     $each: [voiceChannelObject],
                     $position: 0
                  };
               }
            }
         };

         // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
         const {
            commands: {
               mute: muteMessages,
               unjail: unjailMessages
            },
            members: memberMessages,
            unknownErrors: unknownErrorMessages,
            others: {
               wait: {
                  register,
                  chaneName
               },
               rolesAndChannels,
               embedFooters
            },
         } = allMessages[language];

         // Eğer butonla kayıtlar yapılırken bot yeniden başlamışsa komutu yeniden çalıştır
         for (const memberId in guildDatabase.waitMessageCommands.buttonRegister) {
            const {
               commandName,
               authorId,
               messageId,
               channelId,
               isMemberHasUnregisterRole,
               timestamp
            } = guildDatabase.waitMessageCommands.buttonRegister[memberId];

            if (!channelId || !messageId) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               unsetObject[`waitMessageCommands.buttonRegister.${memberId}`] = "";
               continue;
            }

            // Eğer komutun kullanma zamanı 30 saniyeden önceyse hiçbir şey yapma
            const TIME_LIMIT = 30 * 1000;
            if (Date.now() - timestamp >= TIME_LIMIT) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               unsetObject[`waitMessageCommands.buttonRegister.${memberId}`] = "";
               continue;
            }

            // Eğer kanalı çekemediyse hiçbir şey yapma
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               unsetObject[`waitMessageCommands.buttonRegister.${memberId}`] = "";
               continue;
            }

            // Eğer mesajı çekemediyse hiçbir şey yapma
            const message = await channel.messages.fetch(messageId).catch(() => { });
            if (!message) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               unsetObject[`waitMessageCommands.buttonRegister.${memberId}`] = "";
               continue;
            }

            message.user = message.author;

            // İşlemin devam ettiğini belirtmek için önceden mesaj gönder
            await message.reply(
               register
            );

            // Butonla kayıta devam et
            Util.maps.buttonRegisterMember.set(`${guildId}.${memberId}`, authorId);
            Util.maps.buttonCommands.get(commandName).execute({
               alisa: alisaFile,
               guildDatabase,
               int: message,
               intMember: message.member,
               splitCustomId: [commandName, memberId],
               guild,
               guildId,
               authorId,
               language,
               extras: {
                  authorId,
                  isMemberHasUnregisterRole
               }
            });
         }

         const commands = Util.maps.prefixCommands.get(language);

         // Eğer kayıt kur yapılırken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.setup) {

            // Tek kullanımlık for döngüsü, return kullanmadan işlem akışını kontrol edebilmek için eklendi
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName
               } = guildDatabase.waitMessageCommands.setup;

               if (!channelId || !messageId) {
                  delete guildDatabase.waitMessageCommands.setup;
                  unsetObject["waitMessageCommands.setup"] = "";
                  continue;
               }

               // Eğer komutun kullanma zamanı 1 dakikadan önceyse hiçbir şey yapma
               const TIME_LIMIT = 1 * 60 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.setup;
                  unsetObject["waitMessageCommands.setup"] = "";
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.setup;
                  unsetObject["waitMessageCommands.setup"] = "";
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.setup;
                  unsetObject["waitMessageCommands.setup"] = "";
                  continue;
               }

               // Bütün verileri silmeye devam et
               Util.getCommand(commands, commandName).execute({
                  guildDatabase,
                  msg: message,
                  msgMember: message.member,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: guildDatabase.waitMessageCommands.setup
               });
            }
         }

         // Eğer oto cevap işlemi yapılırken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.autoResponse) {

            // Tek kullanımlık for döngüsü, return kullanmadan işlem akışını kontrol edebilmek için eklendi
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName,
                  autoResponseData
               } = guildDatabase.waitMessageCommands.autoResponse;

               if (!channelId || !messageId) {
                  delete guildDatabase.waitMessageCommands.autoResponse;
                  unsetObject["waitMessageCommands.autoResponse"] = "";
                  continue;
               }

               // Eğer komutun kullanma zamanı 1 dakikadan önceyse hiçbir şey yapma
               const TIME_LIMIT = 1 * 60 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.autoResponse;
                  unsetObject["waitMessageCommands.autoResponse"] = "";
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.autoResponse;
                  unsetObject["waitMessageCommands.autoResponse"] = "";
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.autoResponse;
                  unsetObject["waitMessageCommands.autoResponse"] = "";
                  continue;
               }

               // Butonla kayıta devam et
               Util.getCommand(commands, commandName).execute({
                  alisa: alisaFile,
                  guildDatabase,
                  int: message,
                  intMember: message.member,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: autoResponseData
               });
            }
         }

         // Eğer kayıt mesajı özelleştirirken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.customLogin) {
            // Tek kullanımlık for döngüsü, return kullanmadan işlem akışını kontrol edebilmek için eklendi
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName
               } = guildDatabase.waitMessageCommands.customLogin;

               if (!channelId || !messageId) {
                  delete guildDatabase.waitMessageCommands.customLogin;
                  unsetObject["waitMessageCommands.customLogin"] = "";
                  continue;
               }

               // Eğer komutun kullanma zamanı 1 dakikadan önceyse hiçbir şey yapma
               const TIME_LIMIT = 1 * 60 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.customLogin;
                  unsetObject["waitMessageCommands.customLogin"] = "";
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.customLogin;
                  unsetObject["waitMessageCommands.customLogin"] = "";
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.customLogin;
                  unsetObject["waitMessageCommands.customLogin"] = "";
                  continue;
               }

               // Butonla kayıta devam et
               Util.getCommand(commands, commandName).execute({
                  alisa: alisaFile,
                  guildDatabase,
                  int: message,
                  intMember: message.member,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: guildDatabase.waitMessageCommands.customLogin
               });
            }
         }

         // Eğer kayıt sonrası mesajı özelleştirirken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.customAfterRegister) {
            // Tek kullanımlık for döngüsü, return kullanmadan işlem akışını kontrol edebilmek için eklendi
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName
               } = guildDatabase.waitMessageCommands.customAfterRegister;

               if (!channelId || !messageId) {
                  delete guildDatabase.waitMessageCommands.customAfterRegister;
                  unsetObject["waitMessageCommands.customAfterRegister"] = "";
                  continue;
               }

               // Eğer komutun kullanma zamanı 1 dakikadan önceyse hiçbir şey yapma
               const TIME_LIMIT = 1 * 60 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.customAfterRegister;
                  unsetObject["waitMessageCommands.customAfterRegister"] = "";
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.customAfterRegister;
                  unsetObject["waitMessageCommands.customAfterRegister"] = "";
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.customAfterRegister;
                  unsetObject["waitMessageCommands.customAfterRegister"] = "";
                  continue;
               }

               // Butonla kayıta devam et
               Util.getCommand(commands, commandName).execute({
                  alisa: alisaFile,
                  guildDatabase,
                  int: message,
                  intMember: message.member,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: guildDatabase.waitMessageCommands.customAfterRegister
               });
            }
         }

         // Eğer butonla ismini değiştirirken bot yeniden başlamışsa komutu yeniden çalıştır
         for (const memberId in guildDatabase.waitMessageCommands.changeName) {
            const {
               authorId,
               messageId,
               channelId,
               timestamp,
               commandName
            } = guildDatabase.waitMessageCommands.changeName[memberId];

            if (!channelId || !messageId) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               unsetObject[`waitMessageCommands.changeName.${memberId}`] = "";
               continue;
            }

            // Eğer komutun kullanma zamanı 30 saniyeden önceyse hiçbir şey yapma
            const TIME_LIMIT = 30 * 1000;
            if (Date.now() - timestamp >= TIME_LIMIT) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               unsetObject[`waitMessageCommands.changeName.${memberId}`] = "";
               continue;
            }

            // Eğer kanalı çekemediyse hiçbir şey yapma
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               unsetObject[`waitMessageCommands.changeName.${memberId}`] = "";
               continue;
            }

            // Eğer mesajı çekemediyse hiçbir şey yapma
            const message = await channel.messages.fetch(messageId).catch(() => { });
            if (!message) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               unsetObject[`waitMessageCommands.changeName.${memberId}`] = "";
               continue;
            }

            message.user = message.author;

            // İşlemin devam ettiğini belirtmek için önceden mesaj gönder
            await message.reply(
               chaneName
            );

            // Butonla isim değiştirmeye devam et
            Util.maps.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);
            Util.maps.buttonCommands.get(commandName).execute({
               alisa: alisaFile,
               guildDatabase,
               int: message,
               intMember: message.member,
               customId: `-${memberId}`,
               guild,
               guildId,
               authorId,
               language,
               extras: guildDatabase.waitMessageCommands.changeName[memberId]
            });
         }

         // Eğer sunucuda birisi susturulmuşsa ve süresi dolmuşsa bilgilendirme mesajı at
         for (const memberId in guildDatabase.moderation.nowMutedMembers) {
            const {
               channelId,
               messageId,
               expiresTimestamp,
               timestamp,
               authorId,
               reason,
               penaltyNumber
            } = guildDatabase.moderation.nowMutedMembers[memberId];

            if (!channelId || !messageId) {
               delete guildDatabase.moderation.nowMutedMembers[memberId];
               unsetObject[`moderation.nowMutedMembers.${memberId}`] = "";
               continue;
            }

            // Eğer kullanıcıyı çekemediyse hiçbir şey yapma
            const member = await Util.fetchMemberForce(guild, memberId);
            if (!member) {
               delete guildDatabase.moderation.nowMutedMembers[memberId];
               unsetObject[`moderation.nowMutedMembers.${memberId}`] = "";
               continue;
            }

            // Eğer kanalı çekemediyse hiçbir şey yapma
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
               delete guildDatabase.moderation.nowMutedMembers[memberId];
               unsetObject[`moderation.nowMutedMembers.${memberId}`] = "";
               continue;
            }

            // Eğer mesajı çekemediyse hiçbir şey yapma
            const message = await channel.messages.fetch(messageId).catch(() => { });
            if (!message) {
               delete guildDatabase.moderation.nowMutedMembers[memberId];
               unsetObject[`moderation.nowMutedMembers.${memberId}`] = "";
               continue;
            }

            // setTimeout fonksiyonunu tekrar çalıştır
            if (!Util.maps.mutedMembers.has(guildId)) Util.maps.mutedMembers.set(guildId, new Map());
            Util.maps.mutedMembers.get(guildId).set(memberId,
               Util.setTimeout(async () => {

                  // Kişinin susturulması kaldırıldığında mesajı gönder
                  message?.reply(
                     muteMessages.unmute(memberId)
                  );

                  const NOW_TIME = Date.now();

                  // Önbellekteki veriyi sil
                  Util.maps.mutedMembers.get(guildId)?.delete(memberId);

                  const guildDatabase = await database.getGuild(guildId);

                  // Kişinin mutesi bittiği için Database'deki veriyi sil
                  delete guildDatabase.moderation.nowMutedMembers[memberId];

                  // Kullanıcının log bilgilerini güncelle
                  const userLogs = guildDatabase.userLogs[memberId] ??= [];
                  const userLogObject = {
                     type: "unmute",
                     authorId,
                     timestamp: NOW_TIME
                  }
                  userLogs.unshift(userLogObject);

                  // Database'yi güncelle
                  await database.updateGuild(guildId, {
                     $push: {
                        [`userLogs.${memberId}`]: {
                           $each: [userLogObject],
                           $position: 0
                        }
                     },
                     $unset: {
                        [`moderation.nowMutedMembers.${memberId}`]: ""
                     }
                  });

                  // Eğer mod log kanalı varsa o kanala mesaj at
                  const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                  if (modLogChannelId) {
                     const modChannel = guild.channels.cache.get(modLogChannelId);

                     // Eğer kanal yoksa hiçbir şey döndürme
                     if (!modChannel) return;

                     const memberAvatar = member.displayAvatarURL();

                     const msToHumanize = Time.duration(expiresTimestamp - timestamp, language);

                     const author = await Util.fetchUserForce(client, authorId);

                     const embed = new EmbedBuilder()
                        .setAuthor({
                           name: member.user.displayName,
                           iconURL: memberAvatar
                        })
                        .setDescription(
                           muteMessages.embedUnmute.description({
                              memberId,
                              authorId,
                              authorDisplayName: Util.escapeMarkdown(author.displayName),
                              memberDisplayName: Util.escapeMarkdown(member.displayName),
                              muteAt: Util.msToSecond((expiresTimestamp - timestamp)),
                              reason,
                              msToHumanize,
                              penaltyNumber
                           })
                        )
                        .setThumbnail(memberAvatar)
                        .setColor("#b90ebf")
                        .setFooter({
                           text: embedFooters.log,
                           iconURL: client.user.displayAvatarURL()
                        })
                        .setTimestamp()

                     modChannel.send({
                        embeds: [
                           embed
                        ]
                     })
                  }
               }, expiresTimestamp - Date.now())
            );
         }

         // Eğer sunucuda birisi jaile atılmışsa ve süresi dolmuşsa rollerini geri ver
         for (const memberId in guildDatabase.jail.nowJailedMembers) {
            const {
               expiresTimestamp,
               messageId,
               authorId,
               channelId,
               reason,
            } = guildDatabase.jail.nowJailedMembers[memberId];

            if (!channelId || !messageId) {
               delete guildDatabase.jail.nowJailedMembers[memberId];
               unsetObject[`jail.nowJailedMembers.${memberId}`] = "";
               continue;
            }

            // Eğer kullanıcıyı çekemediyse hiçbir şey yapma
            const member = await Util.fetchMemberForce(guild, memberId);
            if (!member) {
               delete guildDatabase.jail.nowJailedMembers[memberId];
               unsetObject[`jail.nowJailedMembers.${memberId}`] = "";
               continue;
            }

            // Eğer kanalı çekemediyse hiçbir şey yapma
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
               delete guildDatabase.jail.nowJailedMembers[memberId];
               unsetObject[`jail.nowJailedMembers.${memberId}`] = "";
               continue;
            }

            // Eğer mesajı çekemediyse hiçbir şey yapma
            const message = await channel.messages.fetch(messageId).catch(() => { });
            if (!message) {
               delete guildDatabase.jail.nowJailedMembers[memberId];
               unsetObject[`jail.nowJailedMembers.${memberId}`] = "";
               continue;
            }

            // setTimeout fonksiyonunu tekrar çalıştır
            if (!Util.maps.jailedMembers.has(guildId)) Util.maps.jailedMembers.set(guildId, new Map());
            Util.maps.jailedMembers.get(guildId).set(memberId,
               Util.setTimeout(async () => {

                  // Önbellekteki veriyi sil
                  Util.maps.jailedMembers.get(guildId)?.delete(memberId);

                  const guildDatabase = await database.getGuild(guildId);

                  const memberPrevRoles = guildDatabase.jail.prevRoles[memberId];
                  const jailRoleId = guildDatabase.jail.roleId;


                  // Kişinin önceki rollerini geri vermeye çalış
                  member.edit({
                     roles: memberPrevRoles
                  })
                     // Eğer rol verme başarılıysa
                     .then(async () => {
                        // Kişinin jailden çıktığını belirt
                        message.reply(
                           unjailMessages.unjailed(memberId)
                        );

                        const NOW_TIME = Date.now();

                        // Kişinin jail süresi bittiği için Database'deki veriyi sil
                        delete guildDatabase.jail.nowJailedMembers[memberId];
                        delete guildDatabase.jail.prevRoles[memberId];

                        // Kullanıcının log bilgilerini güncelle
                        const userLogs = guildDatabase.userLogs[memberId] ??= [];
                        const userLogObject = {
                           type: "unjail",
                           authorId,
                           timestamp: NOW_TIME
                        }
                        userLogs.unshift(userLogObject);

                        // Jail'den çıkmasını database'ye kaydet
                        const lastJailObject = {
                           timestamp: NOW_TIME,
                           reason,
                           authorId,
                           isTempJailed: false,
                           isJailed: false,
                           memberId
                        }
                        guildDatabase.jail.last.unshift(lastJailObject);

                        // Database'yi güncelle
                        await database.updateGuild(guildId, {
                           $push: {
                              [`userLogs.${memberId}`]: {
                                 $each: [userLogObject],
                                 $position: 0
                              },
                              "jail.last": {
                                 $each: [lastJailObject],
                                 $position: 0
                              }
                           },
                           $unset: {
                              [`jail.prevRoles.${memberId}`]: "",
                              [`jail.nowJailedMembers.${memberId}`]: ""
                           }
                        });

                        // Eğer jail log kanalı varsa o kanala mesaj at
                        const jailLogChannelId = guildDatabase.jail.logChannelId;
                        if (jailLogChannelId) {
                           const modChannel = guild.channels.cache.get(jailLogChannelId);

                           // Eğer kanal yoksa hiçbir şey döndürme
                           if (!modChannel) return;

                           const memberAvatar = member.displayAvatarURL();

                           const author = await Util.fetchUserForce(client, authorId);

                           const embed = new EmbedBuilder()
                              .setAuthor({
                                 name: member.user.displayName,
                                 iconURL: memberAvatar
                              })
                              .setDescription(
                                 unjailMessages.embed.description({
                                    memberId,
                                    authorId,
                                    authorDisplayName: Util.escapeMarkdown(author.displayName),
                                    memberDisplayName: Util.escapeMarkdown(member.displayName),
                                    jailRoleId
                                 })
                              )
                              .setThumbnail(memberAvatar)
                              .setColor("#b90ebf")
                              .setFooter({
                                 text: embedFooters.log,
                                 iconURL: client.user.displayAvatarURL()
                              })
                              .setTimestamp()

                           modChannel.send({
                              embeds: [
                                 embed
                              ]
                           })
                        }
                     })
                     // Eğer rol verme başarısızsa
                     .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                           content: memberMessages.memberIsHigherThanMeRole({
                              memberId,
                              highestRoleId: Util.getBotOrHighestRole(guild.members.me).id
                           }),
                           allowedMentions: {
                              users: [],
                              roles: []
                           }
                        });

                        console.error(err);
                        return message.reply(
                           unknownErrorMessages.unknownError(err)
                        );
                     })
               }, expiresTimestamp - Date.now())
            );
         }

         // Sunucunun verilerini kontrol et ve eğer bazı roller veya kanallar silinmişse databaseden verileri sil ve sunucu sahibine bilgilendirme mesajı gönder
         const {
            deletedRoleAndChannels,
            changedGuildData
         } = Util.checkGuildData(guild, guildDatabase);

         Util.mergeObjects(changedGuildData.$set, setObject);
         Util.mergeObjects(changedGuildData.$unset, unsetObject);

         // Eğer silinen veri varsa bilgilendirme mesajı gönder ve database'ye kaydet
         if (deletedRoleAndChannels.length > 0) {

            // Sunucu sahibine bilgilendirme mesajı gönder, eğer sunucu sahibini çekemezse hiçbir şey döndürme
            const guildOwner = await Util.fetchUserForce(client, guild.ownerId);
            if (guildOwner) {
               const {
                  embed: {
                     title,
                     roleAndChannelDescription
                  }
               } = rolesAndChannels;

               const informationMessage = Util.formatArray(deletedRoleAndChannels, language);

               const embed = new EmbedBuilder()
                  .setTitle(title)
                  .setDescription(
                     roleAndChannelDescription({
                        guildName: guild.name,
                        guildId,
                        informationMessage
                     })
                  )
                  .setColor("Blue")
                  .setTimestamp();

               guildOwner.send({
                  embeds: [
                     embed
                  ]
               }).catch(() => { });
            }

         }

         // Eğer ses kanalı ayarlanmışsa o ses kanalına giriş yap
         const voiceChannelId = guildDatabase.channelIds.voice;
         if (voiceChannelId) {
            const voiceChannel = guild.channels.cache.get(voiceChannelId);
            if (voiceChannel) {
               DiscordVoice.joinVoiceChannel({
                  channelId: voiceChannel.id,
                  guildId: guild.id,
                  adapterCreator: guild.voiceAdapterCreator,
                  selfDeaf: true,
                  selfMute: true
               });
            } else {
               // Eğer ses kanalı yoksa database'ye kaydet
               setObject["channelIds.voice"] = "";
            }
         }

         // Database'ye kaydet
         await database.updateGuild(guildId, {
            $set: setObject,
            $unset: unsetObject,
            $push: pushObject
         }, true);
      });

      // Eğer son shard'da başarıyla başlatıldıysa alttaki kodları çalıştır
      if (client.shard.ids[0] + 1 == shardCount) {
         console.log(`${client.user.tag} is ready!`);

         // Ne kadar sürede başladığını hesaplıyoruz (milisaniye cinsinden)
         const startTime = Date.now() - process.timestamp;

         delete process.timestamp;

         Util.webhooks.ready.send(
            `• **${Util.escapeMarkdown(client.user.displayName)}** kullanıma hazırdır! (${Time.duration(startTime, "tr")} içinde başlatıldı)`
         );

         // 1 hafta sonra bütün timeoutları sil ve database'ye kaydet
         const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
         setTimeout(async () => {
            // Yeniden başlatmadan önce alisa.lastUptimeTimestamp verisini güncelle
            await database.updateFile("alisa", {
               $set: {
                  lastUptimeTimestamp: Date.now()
               }
            });

            // Botun bütün shardlarını yeniden başlat
            return client.shard.respawnAll();
         }, ONE_WEEK);

         // Eğer bot komut kullanarak yeniden başlatıldıysa
         if (alisaFile.lastUptimeMessage) {

            // Sunucunun shardını bul ve mesajı güncelle
            await client.shard.broadcastEval(
               async (/** @type {{ channels: { cache: { get: (arg0: any) => any; }; }; }} */ clientParam, {
                  messageId,
                  channelId,
                  yesEmoji
               }) => {

                  // Kanalı bul
                  const channel = clientParam.channels.cache.get(channelId);

                  // Eğer kanalı bulamazsa hiçbir şey yapma
                  if (!channel) return;

                  // Mesajı çek
                  const message = await channel.messages.fetch(messageId).catch(() => { });

                  // Eğer mesajı çekemezse hiçbir şey yapma
                  if (!message) return;

                  // Mesajı güncelle
                  await message.edit(
                     `${yesEmoji} **Botun bütün shardları başarıyla yeniden başlatıldı!**`
                  );

               },
               {
                  shard: Util.shardId(alisaFile.lastUptimeMessage.guildId),
                  context: {
                     messageId: alisaFile.lastUptimeMessage.messageId,
                     channelId: alisaFile.lastUptimeMessage.channelId,
                     yesEmoji: EMOJIS.yes
                  }
               }
            );

            // Veriyi sil ve database'ye kaydet
            delete alisaFile.lastUptimeMessage;
            await database.updateFile("alisa", {
               $unset: {
                  "lastUptimeMessage": ""
               }
            });
         }

         const [wrongCommands, premiumData] = await Promise.all([
            database.getFile("wrong commands"),
            database.getFile("premium")
         ]);
         const unsetObject = {};

         for (const wrongCommand in wrongCommands) {

            // Eğer wrongCommands[wrongCommand] bir obje değilse hiçbir şey yapma
            if (Object.prototype.toString.call(wrongCommands[wrongCommand]) !== "[object Object]") continue;

            const {
               language: wrongLanguage,
            } = wrongCommands[wrongCommand];

            // Eğer komutun ismi şu anki komutlar arasında varsa veya kaydedilmesini istemediğimiz komutlardan biriyse veriyi sil
            if (Util.getCommand(Util.maps.prefixCommands.get(wrongLanguage), wrongCommand)) {
               unsetObject[`${wrongCommand}`] = "";
               continue;
            }
         };
         await database.updateFile("wrong commands", {
            $unset: unsetObject
         });

         // ID'si girilen kullanıcıya mesaj atar
         /**
          * @param {string} userId
          * @param {string | import("discord.js").MessagePayload | import("discord.js").MessageCreateOptions} messageObject
          */
         async function sendMessage(userId, messageObject) {
            // Eğer kullanıcıyı bulamadıysa hiçbir şey yapma
            const user = await Util.fetchUserForce(client, userId);
            if (!user) return;

            return user.send(messageObject).catch(() => { });
         }

         // Girilen Premium kodunun verisini döndür
         /**
          * @param {any} premiumCode
          */
         function getPremiumGuildId(premiumCode) {
            return Object.entries(premiumData).find(([_, value]) => value.code === premiumCode)?.[0];
         }

         for (const guildId in premiumData) {
            // Eğer guildId sadece sayılardan oluşmuyorsa hiçbir şey yapma
            if (!/^\d{17,20}$/.test(guildId)) continue;

            const {
               authorId,
               expiresTimestamp,
               startedTimestamp,
               isFinished,
               code
            } = premiumData[guildId];

            // Eğer premium kodu kullanılmamışsa veya süresi sınırsızsa hiçbir şey yapma
            if (
               isNaN(guildId) ||
               expiresTimestamp == null ||
               isFinished
            ) continue;

            // Eğer sunucu bu shards'a ait değilse veriyi geç
            if (!client.guilds.cache.has(guildId)) continue;

            Util.maps.guildPremiums.set(guildId,
               Util.setTimeout(async () => {
                  const [newPremiumFile, guildDatabase] = await Promise.all([
                     database.getFile("premium"),
                     database.getGuild(guildId)
                  ]);

                  const language = guildDatabase.language;

                  const premiumGuildId = getPremiumGuildId(code);

                  const newPremiumData = newPremiumFile[premiumGuildId];

                  // Veriyi sil ve yenisini oluştur
                  delete newPremiumFile[premiumGuildId];
                  const newName = `${premiumGuildId} - ${Date.now()}`;
                  newPremiumFile[newName] = {
                     ...newPremiumData,
                     isFinished: true,
                  };

                  const [guildName] = await Promise.all([
                     Util.getGuildNameOrId(client, guildId, language),
                     database.updateFile("premium", {
                        $set: {
                           [newName]: newPremiumFile[newName],
                        },
                        $unset: {
                           [premiumGuildId]: ""
                        }
                     })
                  ]);

                  // Kullanıcıya ve bot sahibine bilgilendirme mesajı gönder
                  sendMessage(
                     authorId,
                     allMessages[language].others.events.ready.premiumFinised(guildName)
                  );
                  sendMessage(
                     ownerId,
                     `**> PREMİUM BİLGİLENDİRME**\n\n` +
                     `• ${guildName} - **(${guildId})** sunucunun premium'u bitmiştir\n` +
                     `• **Satın alan kişi:** <@${authorId}> - (${authorId})\n` +
                     `• **Kullandığı süre:** ${Time.duration(expiresTimestamp - startedTimestamp, "tr")}`
                  );
               }, expiresTimestamp - Date.now())
            );
         }
      }
   },
};
