"use strict";
const database = require("../../Helpers/Database");
const Time = require("../../Helpers/Time");
const {
   Client,
   EmbedBuilder,
   Events
} = require("discord.js");
const {
   shardCount,
   EMOJIS
} = require("../../settings.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../Helpers/Util");

module.exports = {
   name: Events.ClientReady,
   once: true, // Bu event sadece bir kez çalıştırılacak
   /**
    * 
    * @param {Client} client 
    */
   async execute(client) {

      const alisaFile = database.getFile("alisa", "other");

      const rest = new REST()
         .setToken(client.token);

      // Bütün sunucularda dolaş ve silinen verileri database'den sil
      client.guilds.cache.forEach(async (guild, guildId) => {

         // 2 Objeyi derinlemesine kopyalar
         function combineTwoObjects(obj1, obj2) {

            // Derinlemesine kopyala
            (function deepCombine(_obj1, _obj2) {
               for (const key in _obj2) {
                  const data = _obj2[key];

                  // Girilen değerin obje olup olmadığını kontrol eder
                  function isObject(obj) {
                     return Object.prototype.toString.call(obj) === '[object Object]';
                  }

                  // Eğer veri yine bir obje ise bu fonksiyonu yeniden çalıştır
                  if (isObject(data) && isObject(_obj1[key])) {
                     deepCombine(_obj1[key], data);
                  } else if (!(key in _obj1)) {
                     _obj1[key] = data;
                  }

               }
            })(obj1, obj2);

            return obj1;
         }

         // Eğer Database'ye yeni veriler eklenmişse yeni verileri bu sunucuya aktar
         const guildDatabase = Util.getGuildData(client, guildId);
         combineTwoObjects(guildDatabase, database.defaultGuildDatabase);

         try {
            // Slash komutlarını oluştur
            rest.put(
               Routes.applicationGuildCommands(client.user.id, guildId),
               {
                  body: client.slashCommandsJSON
               },
            ).catch(() => { });
         }
         // Eğer herhangi bir hata olduğunda konsola yazdır
         catch (error) {
            console.error(error);
         }

         // Eğer sunucunun kayıt şekli "Normal Kayıt" ise önbelleğe kaydet
         if (guildDatabase.register.type == "normal") client.registerOptions.add(guildId)

         const language = guildDatabase.language;

         // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
         const {
            register,
            chaneName,
            deleteAll,
            deleteRegister
         } = Util.waitMessages[language];

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

            // Eğer komutun kullanma zamanı 30 saniyeden önceyse hiçbir şey yapma
            const TIME_LIMIT = 30 * 1000;
            if (Date.now() - timestamp >= TIME_LIMIT) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               continue;
            }

            // Eğer kanalı çekemediyse hiçbir şey yapma
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               continue;
            }

            // Eğer mesajı çekemediyse hiçbir şey yapma
            const message = await channel.messages.fetch(messageId).catch(() => { });
            if (!message) {
               delete guildDatabase.waitMessageCommands.buttonRegister[memberId];
               continue;
            }

            message.user = message.author;

            // İşlemin devam ettiğini belirtmek için önceden mesaj gönder
            await message.reply(
               register
            );

            // Butonla kayıta devam et
            client.buttonRegisterMember.set(`${guildId}.${memberId}`, authorId);
            client.buttonCommands[language].get(commandName).execute({
               alisa: alisaFile,
               guildDatabase,
               int: message,
               customId: `-${memberId}`,
               guild,
               guildId,
               authorId,
               language,
               registerDatas: {
                  authorId,
                  isMemberHasUnregisterRole
               }
            });
         }

         // Eğer kayıt kur yapılırken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.setup) {
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName
               } = guildDatabase.waitMessageCommands.setup;

               // Eğer komutun kullanma zamanı 1 dakikadan önceyse hiçbir şey yapma
               const TIME_LIMIT = 1 * 60 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.setup;
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.setup;
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.setup;
                  continue;
               }

               // Bütün verileri silmeye devam et
               client.prefixCommands[language].get(commandName).execute({
                  guildDatabase,
                  msg: message,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: guildDatabase.waitMessageCommands.setup
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

            // Eğer komutun kullanma zamanı 30 saniyeden önceyse hiçbir şey yapma
            const TIME_LIMIT = 30 * 1000;
            if (Date.now() - timestamp >= TIME_LIMIT) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               continue;
            }

            // Eğer kanalı çekemediyse hiçbir şey yapma
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               continue;
            }

            // Eğer mesajı çekemediyse hiçbir şey yapma
            const message = await channel.messages.fetch(messageId).catch(() => { });
            if (!message) {
               delete guildDatabase.waitMessageCommands.changeName[memberId];
               continue;
            }

            message.user = message.author;

            // İşlemin devam ettiğini belirtmek için önceden mesaj gönder
            await message.reply(
               chaneName
            );

            // Butonla isim değiştirmeye devam et
            client.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);
            client.buttonCommands[language].get(commandName).execute({
               alisa: alisaFile,
               guildDatabase,
               int: message,
               customId: `-${memberId}`,
               guild,
               guildId,
               authorId,
               language,
               registerDatas: guildDatabase.waitMessageCommands.changeName[memberId]
            });
         }

         // Eğer bütün verileri silerken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.deleteAllDatas) {
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName
               } = guildDatabase.waitMessageCommands.deleteAllDatas;

               // Eğer komutun kullanma zamanı 2 dakikadan önceyse hiçbir şey yapma
               const TIME_LIMIT = 2 * 60 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.deleteAllDatas;
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.deleteAllDatas;
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.deleteAllDatas;
                  continue;
               }

               // İşlemin devam ettiğini belirtmek için önceden mesaj gönder
               await message.reply(
                  deleteAll
               );

               // Bütün verileri silmeye devam et
               client.prefixCommands[language].get(commandName).execute({
                  guildDatabase,
                  msg: message,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: true
               });
            }
         }

         // Eğer kayıt verisini silerken bot yeniden başlamışsa komutu yeniden çalıştır
         if (guildDatabase.waitMessageCommands.deleteRegister) {
            for (let i = 0; i < 1; ++i) {
               const {
                  messageId,
                  channelId,
                  timestamp,
                  commandName
               } = guildDatabase.waitMessageCommands.deleteRegister;

               // Eğer komutun kullanma zamanı 45 saniyeden önceyse hiçbir şey yapma
               const TIME_LIMIT = 45 * 1000;
               if (Date.now() - timestamp >= TIME_LIMIT) {
                  delete guildDatabase.waitMessageCommands.deleteRegister;
                  continue;
               }

               // Eğer kanalı çekemediyse hiçbir şey yapma
               const channel = guild.channels.cache.get(channelId);
               if (!channel) {
                  delete guildDatabase.waitMessageCommands.deleteRegister;
                  continue;
               }

               // Eğer mesajı çekemediyse hiçbir şey yapma
               const message = await channel.messages.fetch(messageId).catch(() => { });
               if (!message) {
                  delete guildDatabase.waitMessageCommands.deleteRegister;
                  continue;
               }

               // İşlemin devam ettiğini belirtmek için önceden mesaj gönder
               await message.reply(
                  deleteRegister
               );

               // Kayıt verisini silmeye devam et
               client.prefixCommands[language].get(commandName).execute({
                  guildDatabase,
                  msg: message,
                  guild,
                  guildId,
                  authorId: message.author.id,
                  language,
                  extras: true
               });
            }
         }

         // Sunucunun verilerini kontrol et ve eğer bazı roller veya kanallar silinmişse databaseden verileri sil ve sunucu sahibine bilgilendirme mesajı gönder
         const deletedRoleAndChannels = Util.checkGuildData(guild, guildDatabase);

         // Eğer silinen veri varsa bilgilendirme mesajı gönder ve database'ye kaydet
         if (deletedRoleAndChannels.length > 0) {

            // Sunucu sahibine bilgilendirme mesajı gönder, eğer sunucu sahibini çekemezse hiçbir şey döndürme
            const guildOwner = await Util.fetchUserForce(client, guild.ownerId);
            if (guildOwner) {
               const {
                  embed: {
                     title,
                     roleAndChannelDescription,
                     and
                  }
               } = Util.rolesAndChannelMessages[language];

               const lastElement = deletedRoleAndChannels.pop();
               const informationMessage = deletedRoleAndChannels.length ? `${deletedRoleAndChannels.join(", ")} ${and} ${lastElement}` : lastElement;

               const embed = new EmbedBuilder()
                  .setTitle(title)
                  .setDescription(
                     roleAndChannelDescription({
                        guild,
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
               });
            }

         }

         // Eğer ses kanalı ayarlanmışsa o ses kanalına giriş yap
         const voiceChannelId = guildDatabase.channelIds.voice;

         if (voiceChannelId) {
            // Her 5 dakikada bir ses kanalına giriş yap
            client.guildVoices.set(guildId,
               setInterval(() => {
                  if (!guild.members.me.voice.channelId) DiscordVoice.joinVoiceChannel({
                     channelId: voiceChannelId,
                     guildId: guild.id,
                     adapterCreator: guild.voiceAdapterCreator,
                     selfDeaf: true,
                     selfMute: true
                  });
               }, 1000 * 60 * 5)
            );
         }

         // Database'ye kaydet
         database.writeFile(guildDatabase, guildId);
      })


      // Eğer son shard'da başarıyla başlatıldıysa alttaki kodları çalıştır
      if (client.shard.ids[0] + 1 == shardCount) {
         console.log(`${client.user.tag} is ready!`);

         // Ne kadar sürede başladığını hesaplıyoruz (milisaniye cinsinden)
         const startTime = Date.now() - alisaFile.lastUptimeTimestamp;

         Util.webhooks.ready.send(
            `• **${Util.recreateString(client.user.displayName)}** kullanıma hazırdır! (${Time.duration(startTime, "tr")} içinde başlatıldı)`
         );

         // Eğer bot komut kullanarak yeniden başlatıldıysa
         if (alisaFile.lastUptimeMessage) {

            // Sunucunun shardını bul ve mesajı güncelle
            await client.shard.broadcastEval(
               async (clientParam, {
                  messageId,
                  channelId,
                  EMOJIS
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
                     `${EMOJIS.yes} **Botün bütün shardları başarıyla yeniden başlatıldı!**`
                  );
 
               },
               {
                  shard: Util.shardId(alisaFile.lastUptimeMessage.guildId),
                  context: {
                     messageId: alisaFile.lastUptimeMessage.messageId,
                     channelId: alisaFile.lastUptimeMessage.channelId,
                     EMOJIS
                  }
               }
            );

            // Veriyi sil ve database'ye kaydet
            delete alisaFile.lastUptimeMessage;
            database.writeFile(alisaFile, "alisa", "other");
         }
      }
   },
};
