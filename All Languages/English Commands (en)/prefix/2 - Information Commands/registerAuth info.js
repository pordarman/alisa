"use strict";
const {
    EmbedBuilder,
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "authinfo", // Komutun ismi
    id: "yetkilibilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "authinfo",
        "authinformation",
        "auth-info",
    ],
    description: "Shows the registration information of the person you tagged", // Komutun açıklaması
    category: "Information commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>authinfo [@user or User ID]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        guildMe,
        authorId,
        args,
        errorEmbed,
        language,
    }) {

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi kayıt bilgilerini kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        // Eğer etiketlediği kişi botsa ve Alisa dışında bir botu etiketlemişse hata döndür
        if (user.bot && user.id != guildMe.id) return errorEmbed("Botların kayıt sayısına bakmayı gerçekten düşünmüyorsun değil mi");

        // Son 1 saat, 1 gün, 1 hafta gibi kayıt bilgilerini kontrol etmemiz için şimdiki zamanı çekmemiz lazım
        const NOW_TIME = Date.now();
        const lastRegisterCount = {
            hour: 0,
            day: 0,
            week: 0,
            month: 0
        };
        const TIMES = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };

        const userAvatar = user.displayAvatarURL();

        // Şimdi verileri çekme zamanı
        const {
            countables: {
                girl: girlCount,
                boy: boyCount,
                normal: normalCount,
                bot: botCount,
                total: totalCount
            },
            firstRegister,
            lastRegister
        } = guildDatabase.register.authorizedInfos[user.id] ?? {
            countables: {
                girl: 0,
                boy: 0,
                normal: 0,
                bot: 0,
                total: 0
            }
        };

        // Sunucuda kaçıncı sırada olduğunu bulma
        const entries = Object.entries(guildDatabase.register.authorizedInfos).sort(([_, firstData], [__, secondData]) => (secondData.countables.total ?? 0) - (firstData.countables.total ?? 0));
        const usersGuildRank = entries.findIndex(([userId]) => userId == user.id) + 1;

        // Etiketlendiği kişiye göre gösterilecek mesajları değiştir
        let allMessages;

        switch (user.id) {

            // Eğer etiketlediği kişi kendisiyse
            case authorId:
                allMessages = {
                    firstAndLastRegister(registerInfo) {
                        return `👤 **Registered person:** <@${registerInfo.memberId}>\n` +
                            `${EMOJIS.role} **The role(s) you gave:** ${registerInfo.roles}\n` +
                            `⏲️ **Date:** <t:${Math.round(registerInfo.timestamp)}:F>`
                    },
                    guildRank: `\n📈 **Your server rank:** ${usersGuildRank == 0 ?
                        `You have no ranking` :
                        `${Util.numberToRank(usersGuildRank)}`
                        } *(from ${Util.toHumanize(entries.length, language)} person)*`,
                    rank: `🔰 **Rank:** ${Util.getUserRank(totalCount, language) || "You have no rank"}`,
                    registers: {
                        all: `People you registered`,
                        info: `**${guildDatabase.register.type == "normal" ?
                            `${EMOJIS.normal} Member:** ${Util.toHumanize(normalCount, language)}` :
                            (`${EMOJIS.boy} Male:** ${Util.toHumanize(boyCount, language)}\n` +
                                `**${EMOJIS.girl} Girl:** ${Util.toHumanize(girlCount, language)}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${Util.toHumanize(botCount, language)}`,
                        activity: "Your registration activity",
                        first: "The first person you registered",
                        last: "The last person you saved",
                        lastRegisters: "Your last 5 registers",
                    },
                    footer: "I love you <3"
                }
                break;

            // Eğer etiketlediği kişi "Alisa" ise
            case guildMe.id:
                allMessages = {
                    firstAndLastRegister(registerInfo) {
                        return `👤 **Registered person:** <@${registerInfo.memberId}>\n` +
                            `${EMOJIS.role} **The role(s) I give:** ${registerInfo.roles}\n` +
                            `⏲️ **Date:** <t:${Math.round(registerInfo.timestamp)}:F>`
                    },
                    guildRank: `\n📈 **My server rank:** ${usersGuildRank == 0 ?
                        `I don't have a ranking` :
                        `${Util.numberToRank(usersGuildRank)}`
                        } *(from ${Util.toHumanize(entries.length, language)} person)*`,
                    rank: `🔰 **My rank:** Bots don't have rank :)`,
                    registers: {
                        all: `People I registered`,
                        info: `**${EMOJIS.bot} Bot:** ${Util.toHumanize(botCount, language)}`,
                        activity: "My registration activity",
                        first: "The first person I registered",
                        last: "The last person I registered",
                        lastRegisters: "My last 5 registers",
                    },
                    footer: "I'm glad to have you <3"
                }
                break;

            // Eğer başka birisini etiketlediyse
            default:
                allMessages = {
                    firstAndLastRegister(registerInfo) {
                        return `👤 **Registered person:** <@${registerInfo.memberId}>\n` +
                            `${EMOJIS.role} **The role(s) you gave:** ${registerInfo.roles}\n` +
                            `⏲️ **Date:** <t:${Math.round(registerInfo.timestamp)}:F>`
                    },
                    guildRank: `\n📈 **Server rank:** ${usersGuildRank == 0 ?
                        `No ranking` :
                        `${Util.numberToRank(usersGuildRank)}`
                        } *(from ${Util.toHumanize(entries.length, language)} person)*`,
                    rank: `🔰 **Rank:** ${Util.getUserRank(totalCount, language) || "No rank"}`,
                    registers: {
                        all: `People he/she registered`,
                        info: `**${guildDatabase.register.type == "normal" ?
                            `${EMOJIS.normal} Member:** ${Util.toHumanize(normalCount, language)}` :
                            (`${EMOJIS.boy} Male:** ${Util.toHumanize(boyCount, language)}\n` +
                                `**${EMOJIS.girl} Girl:** ${Util.toHumanize(girlCount, language)}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${Util.toHumanize(botCount, language)}`,
                        activity: "Registration activity",
                        first: "First registered person",
                        last: "Last registered person",
                        lastRegisters: "Last 5 registers",
                    },
                    footer: "I love you <3"
                }
                break;
        }

        const SHOW_REGISTERS_IN_EMBED = 5;

        // Son 5 kayıtını ve son 1 saat, 1 gün, 1 hafta gibi kayıtları çekme
        const lastRegisters = [];
        for (let i = 0; i < guildDatabase.register.lastRegisters.length; ++i) {
            let {
                authorId,
                gender,
                timestamp,
                memberId,
                isAgainRegister
            } = guildDatabase.register.lastRegisters[i];

            // Eğer Registrar kişi etiketlenen kişi değilse döngüyü geç
            if (authorId != user.id) continue;

            // Eğer dizinin uzunluğu sınırı geçmediyse kayıtı diziye ekle
            if (lastRegisters.length < SHOW_REGISTERS_IN_EMBED) {
                lastRegisters.push(
                    `• (${EMOJIS[gender]}) <@${memberId}> - <t:${Math.round(timestamp / 1000)}:F>${isAgainRegister ? " 🔁" : ""}`
                );
            }

            // Kayıt son 1 saatte yapıldıysa
            if (NOW_TIME - TIMES.hour <= timestamp) lastRegisterCount.hour += 1;

            // Kayıt son 1 günde yapıldıysa
            if (NOW_TIME - TIMES.day <= timestamp) lastRegisterCount.day += 1;

            // Kayıt son 1 haftada yapıldıysa
            if (NOW_TIME - TIMES.week <= timestamp) lastRegisterCount.week += 1;

            // Kayıt son 1 ayda yapıldıysa
            if (NOW_TIME - TIMES.month <= timestamp) lastRegisterCount.month += 1;
            //  Eğer kayıt son 1 aydan daha sonra yapıldıysa ve dizi sınıra ulaştıysa döngüyü bitir
            else if (lastRegisters.length >= SHOW_REGISTERS_IN_EMBED) break;

        };

        let firstRegisterContent;
        let lastRegisterContent;

        // Eğer ilk veya son kayıt ayarlıysa embed mesajında göster
        if (firstRegister) {
            firstRegisterContent = allMessages.firstAndLastRegister(firstRegister);
            lastRegisterContent = allMessages.firstAndLastRegister(lastRegister);
        }

        // Mesajda gösterilecek embed 
        const embed = new EmbedBuilder()
            .setAuthor({
                name: user.displayName,
                iconURL: userAvatar
            })
            .setDescription(`${allMessages.rank}${allMessages.guildRank}`)
            .addFields(
                {
                    name: `${allMessages.registers.all} (${Util.toHumanize(totalCount, language)})`,
                    value: allMessages.registers.info,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: allMessages.registers.activity,
                    value: `**⏰ Last 1 hour:** \`${Util.toHumanize(lastRegisterCount.hour, language)}\`\n` +
                        `**📅 Last 1 day:** \`${Util.toHumanize(lastRegisterCount.day, language)}\`\n` +
                        `**📆 Last 1 week:** \`${Util.toHumanize(lastRegisterCount.week, language)}\`\n` +
                        `**🗓️ Last 1 month:** \`${Util.toHumanize(lastRegisterCount.month, language)}\``,
                    inline: true
                },
                {
                    name: allMessages.registers.first,
                    value: firstRegisterContent || "• There's nothing to show here..."
                },
                {
                    name: allMessages.registers.last,
                    value: lastRegisterContent || "• There's nothing to show here..."
                },
                {
                    name: allMessages.registers.lastRegisters,
                    value: lastRegisters.join("\n") || "• There's nothing to show here..."
                }
            )
            .setThumbnail(userAvatar)
            .setColor("#7a1ac0")
            .setFooter({
                text: allMessages.footer,
                iconURL: msg.client.user.displayAvatarURL()
            })
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};