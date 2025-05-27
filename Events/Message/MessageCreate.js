"use strict";
const {
    EmbedBuilder,
    Message,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require("discord.js");
const {
    owners,
    EMOJIS,
    botInviteLink,
    discordInviteLink,
    topgglink
} = require("../../settings.json");
const database = require("../../Helpers/Database.js");
const Util = require("../../Helpers/Util.js");
const allMessages = require("../../Helpers/Localizations/Index.js");
const SpamControl = require("../../Helpers/SpamControl");
const spamControl = new SpamControl();

module.exports = {
    name: Events.MessageCreate,
    /**
     *
     * @param {Message} msg
     */
    async execute(msg) {
        try {

            // Eğer kullanıcı bir bot ise mesajını görmezden gel
            if (msg.author.bot) return;

            const guild = msg.guild;
            if (!guild) return; // Eğer mesaj bir sunucuda değilse hiçbir şey yapma

            const authorId = msg.author.id;
            const guildId = msg.guildId;

            const [guildDatabase, alisaFile] = await Promise.all([
                database.getGuild(guildId),
                database.getFile("alisa")
            ]);

            // Eğer stat ayarı açıksa
            if (guildDatabase.isStatOn) {
                let authorData = guildDatabase.stats[authorId];
                let isNewUser = false;

                if (!authorData) {
                    isNewUser = true;
                    authorData = guildDatabase.stats[authorId] = Util.DEFAULTS.memberStat;
                }

                authorData.totals.message += 1;
                const messageChannel = authorData.messages[msg.channelId] ??= [];
                messageChannel.unshift(msg.createdTimestamp);
                await database.updateGuild(guildId,
                    (isNewUser ?
                        {
                            $set: {
                                [`stats.${authorId}`]: authorData
                            }
                        } :
                        {
                            $inc: {
                                [`stats.${authorId}.totals.message`]: 1
                            },
                            $push: {
                                [`stats.${authorId}.messages.${msg.channelId}`]: {
                                    $each: [msg.createdTimestamp],
                                    $position: 0
                                }
                            }
                        }
                    ),
                    isNewUser
                );
            }

            const language = guildDatabase.language;

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const {
                others: {
                    events: {
                        messageOrInteractionCreate: otherMessages
                    }
                }
            } = allMessages[language];

            const blacklistUser = alisaFile.blacklistUsers[authorId];
            if (blacklistUser) {

                // Eğer kullanıcı kalıcı olarak atılmamışsa ve süresi dolmamışsa hiçbir şey döndürme
                if (blacklistUser.temp) {
                    const expiresTimestamp = blacklistUser.temp.expiresTimestamp;
                    if (expiresTimestamp > Date.now()) return;
                } else {

                    // Eğer kullanıcı mesajı daha önceden görmüşse hiçbir şey döndürme
                    if (blacklistUser.isSee) return;

                    // Bilgilendirme mesajı gönder
                    return msg.reply(
                        otherMessages.bannedFromBot(bannedUser.reason)
                    )
                        // Eğer mesajı atıldıysa mesajı gördü olarak işaretle
                        .then(() => {
                            blacklistUser.isSee = true;
                            database.updateFile("alisa", {
                                $set: {
                                    [`blacklistUsers.${authorId}.isSee`]: true
                                }
                            });
                        })
                }
            }

            const guildMe = guild.members.me;
            const guildMePermissions = guildMe.permissions;
            const msgMember = msg.member;
            const {
                afk: afkDatabase,
                autoResponse = {}
            } = guildDatabase;

            // Eğer mesaj bir tetikleyici mesaj ise
            const replyMessage = autoResponse[msg.content];
            if (replyMessage) {
                if (replyMessage.content) {
                    msg.reply(replyMessage.content);
                }
            }


            // Eğer database'de en az bir kullanıcı bulunuyorsa afk sistemini çalıştır
            if (Object.keys(afkDatabase).length > 0) {
                const afkMembers = [];

                // Eğer kullanıcı afk ise afk'lıktan çıkar
                if (afkDatabase[authorId]) {

                    // Eğer kullanıcının ismini değiştirebiliyorsa isminin başındaki "[AFK]" yazısını kaldır
                    if (
                        msgMember.nickname?.startsWith("[AFK] ") &&
                        authorId != guild.ownerId &&
                        guildMePermissions.has("ChangeNickname") &&
                        msgMember.roles.highest.position < guildMe.roles.highest.position
                    ) msgMember.setNickname(msgMember.displayName.replace("[AFK] ", ""));

                    Util.waitAndDeleteMessage(
                        msg.reply(
                            otherMessages.afk.authorIsBack(authorId, afkDatabase[authorId].timestamp)
                        ),
                        8 * 1000 // Mesajı 8 saniye boyunca göster
                    );

                    delete afkDatabase[authorId];
                    await database.updateGuild(guildId, {
                        $unset: {
                            [`afk.${authorId}`]: ""
                        }
                    });
                }

                // Kullanıcının etiketlediği kişileri kontrol et
                msg.mentions.members.forEach(user => {
                    const isUserAFK = afkDatabase[user.id];
                    if (isUserAFK) afkMembers.push(
                        otherMessages.afk.memberIsAfk(user.id, isUserAFK)
                    )
                });

                // Eğer en az 1 tane afk olan kullanıcıyı etiketlemişse bilgilendirme mesajını gönder
                if (afkMembers.length > 0) {
                    const isSpam = await spamControl.addCountAndReturnMessage(authorId, "afk", language);
                    if (isSpam) return msg.reply(isSpam);

                    msg.reply({
                        content: afkMembers.join("\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n"),
                        allowedMentions: {
                            repliedUser: true,
                            users: [],
                            roles: []
                        }
                    })
                }
            }

            const clientId = msg.client.user.id;
            const contentTrim = msg.content.trim();
            const guildPrefix = guildDatabase.prefix;

            // Eğer kullanıcı mesajında sadece Alisa'ı etiketlemişse bilgilendirme mesajını gönder
            if (new RegExp(`^ *<@!?${clientId}> *$`).test(contentTrim)) {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const {
                    thankYouMessage: {
                        title,
                        description,
                        footer,
                        buttons: {
                            inviteMe,
                            supportGuild,
                            voteMe
                        }
                    },
                } = otherMessages;

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: title,
                        iconURL: clientAvatar
                    })
                    .setDescription(
                        description({
                            prefix: guildPrefix,
                            clientId: guildMe.id,
                            joinedTimestamp: Util.msToSecond(guildMe.joinedTimestamp)
                        })
                    )
                    .setColor("Purple")
                    .setThumbnail(clientAvatar)
                    .setTimestamp()
                    .setFooter({
                        text: footer,
                        iconURL: guild.iconURL()
                    });

                const allButtons = new ActionRowBuilder()
                    .addComponents(
                        // Botun davet linki
                        new ButtonBuilder()
                            .setLabel(inviteMe)
                            .setEmoji("💌")
                            .setStyle(ButtonStyle.Link)
                            .setURL(botInviteLink),

                        // Oy verme linki
                        new ButtonBuilder()
                            .setLabel(voteMe)
                            .setEmoji(EMOJIS.shy)
                            .setStyle(ButtonStyle.Link)
                            .setURL(topgglink),

                        // Destek sunucusu linki
                        new ButtonBuilder()
                            .setLabel(supportGuild)
                            .setEmoji("🎉")
                            .setStyle(ButtonStyle.Link)
                            .setURL(discordInviteLink)
                    );

                return msg.reply({
                    embeds: [
                        embed
                    ],
                    components: [
                        allButtons
                    ]
                })
            }

            let commandContent = new RegExp(`^(${Util.disableRegExp(guildPrefix)}|<@!?${clientId}>)`).exec(contentTrim);
            if (!commandContent) return; // Eğer kullanıcı komut çalıştırmıyorsa alttakileri çalıştırma

            commandContent = commandContent[0];

            const args = contentTrim.slice(commandContent.length).trim().split(/\s+/);
            const commandName = args.shift().toLocaleLowerCase(language);
            const command = Util.getCommand(Util.maps.prefixCommands.get(language), commandName);

            // Eğer komut bulunamazsa database'ye hangi komutun yanlış yazıldığını kaydet
            if (!command) {
                // Eğer komut kayıt edilecekse ve komutun uzunluğu 1'den büyükse ve sadece harflerden oluşuyorsa yanlış komut olarak kaydet
                if (/^\w{2,}$/.test(commandName)) {
                    const wrongCommands = await database.getFile("wrong commands") || {};
                    wrongCommands[commandName] ??= { language: language, count: 0 };
                    wrongCommands[commandName].count += 1;

                    await database.updateFile("wrong commands", {
                        $set: {
                            [commandName]: wrongCommands[commandName]
                        }
                    });
                }
                return;
            }

            // Eğer botta "Bağlantı yerleştir" yetkisi yoksa hata döndür
            if (!guildMePermissions.has("EmbedLinks")) return msg.reply(otherMessages.embedLinkError);

            const isOwner = owners.includes(authorId), // Kullanıcının bot sahibi olup olmadığını kontrol eder
                channel = msg.channel;

            // Premiuma sahip olup olmadığını kontrol eder
            const premiumFile = await database.getFile("premium");
            const premium = premiumFile[guildId];

            if (!isOwner) {
                // Eğer komut sahip komutuysa hiçbir şey döndürme
                if (command.ownerOnly) return;

                const isSpam = await spamControl.addCountAndReturnMessage(authorId, "command", language);
                if (isSpam) return msg.reply(isSpam);

                // Komutun bakım modunda olup olmadığını kontrol eder
                if (command.care) return msg.reply(
                    otherMessages.care
                );

                // Komutun premium kullanıcılara özel olup olmadığını kontrol eder
                if (command.premium && !premium) return msg.reply(
                    otherMessages.premium(guildPrefix)
                );

                const isCooldown = Util.maps.prefixCooldown.get(`${authorId}.${command.id}`);

                // Kullanıcı aynı komutu çok hızlı kullanırsa onu durdur
                if (isCooldown) {
                    // Eğer mesajı daha önceden atmışsa alttakileri çalıştırma
                    if (isCooldown.isSee) return;

                    isCooldown.isSee = true;
                    const remainTime = isCooldown.expires - Date.now();
                    if (remainTime > 0) return Util.waitAndDeleteMessage(
                        msg.reply(
                            otherMessages.waitCommand(remainTime)
                        ),
                        remainTime // Mesajı bekleme süresi boyunca göster
                    );

                    Util.maps.prefixCooldown.delete(`${authorId}.${command.id}`);
                }

                Util.maps.prefixCooldown.set(`${authorId}.${command.id}`, {
                    isSee: false,
                    expires: Date.now() + (command.cooldown * 1000)
                });

                const channelCooldown = Util.maps.channelCooldown.get(channel.id);

                if (channelCooldown) {
                    channelCooldown.count += 1;
                    setTimeout(() => {
                        channelCooldown.count -= 1;
                    }, 2000)

                    // Eğer kanalda çok kısa sürede 4 taneden fazla komut kullanılmış ise uyarı ver
                    if (channelCooldown.count > 4) {

                        // Eğer kanalda aynı anda komut kullanılırsa kullanıcıları uyar
                        if (channelCooldown.isSee) return; // Eğer mesajı daha önceden atmışsa alttakileri çalıştırma
                        channelCooldown.isSee = true;

                        // 5 saniye sonra isSee değerini false yap
                        setTimeout(() => {
                            channelCooldown.isSee = false;
                        }, 5 * 1000);

                        return Util.waitAndDeleteMessage(
                            msg.reply(
                                otherMessages.waitChannel
                            ),
                            2 * 1000 // Mesajı 2 saniye boyunca göster
                        );
                    }
                } else {
                    const object = {
                        isSee: false,
                        count: 1
                    }
                    Util.maps.channelCooldown.set(channel.id, object);
                    setTimeout(() => {
                        object.count -= 1;
                    }, 2 * 1000);
                }
            }

            // Komut kullanımını database'ye kaydet
            alisaFile.commandUses[command.id].prefix += 1;
            alisaFile.commandUses[command.id].total += 1;

            alisaFile.usersCommandUses[authorId] = (alisaFile.usersCommandUses[authorId] || 0) + 1;
            alisaFile.guildsCommandUses[guildId] = (alisaFile.guildsCommandUses[guildId] || 0) + 1;

            await database.updateFile("alisa", {
                $inc: {
                    [`commandUses.${command.id}.prefix`]: 1,
                    [`commandUses.${command.id}.total`]: 1,
                    [`usersCommandUses.${authorId}`]: 1,
                    [`guildsCommandUses.${guildId}`]: 1
                }
            });

            // Eğer komutu Alisa'ı etiketleyerek çağırdıysa (yani @Alisa#1170 yardım yazarak komut kullandıysa) etiketlenen kullanıcılardan Alisa'ı sil
            if (commandContent != guildPrefix) {
                msg.mentions.members.delete(clientId);
                msg.mentions.users.delete(clientId);
            }

            // Komutu çalıştırmaya çalış
            try {
                await command.execute({
                    alisa: alisaFile,
                    msg,
                    guildDatabase,
                    guildId,
                    guildMe,
                    guildMePermissions,
                    guild,
                    msgMember,
                    args,
                    prefix: guildPrefix,
                    authorId,
                    language,
                    errorEmbed: Util.errorEmbed(msg, otherMessages.errorEmbed),
                    isOwner,
                    premium
                });

                const newAlisaFile = await database.getFile("alisa");
                const setObject = {};

                if (!Util.deepCompare(alisaFile.registersCount, newAlisaFile.registersCount)) setObject["alisa.registersCount"] = newAlisaFile.registersCount;
                if (!Util.deepCompare(alisaFile.blacklistUsers, newAlisaFile.blacklistUsers)) setObject["alisa.blacklistUsers"] = newAlisaFile.blacklistUsers;
                if (!Util.deepCompare(alisaFile.blacklistGuilds, newAlisaFile.blacklistGuilds)) setObject["alisa.blacklistGuilds"] = newAlisaFile.blacklistGuilds;

                await database.updateFile("alisa", {
                    $set: setObject
                });
            }
            // Eğer hata çıkarsa kullanıcıyı bilgilendir
            catch (error) {

                // Eğer kullanan kişi bot sahibiyse hatayı konsola değil mesajda göster
                if (isOwner) return msg.reply(
                    otherMessages.commandErrorOwner(error.stack)
                );

                // Eğer kişi bot sahibi değilse
                msg.reply(
                    otherMessages.commandError(authorId)
                );
                Util.error(error, command.dirname, msg)

            }

        } catch (error) {
            console.error(error);
        }
    },
};
