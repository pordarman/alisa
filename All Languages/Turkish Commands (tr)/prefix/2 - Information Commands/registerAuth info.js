"use strict";
const {
    EmbedBuilder,
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");
const lastRegisters = require("./last registers");


module.exports = {
    name: "yetkilibilgi", // Komutun ismi
    id: "yetkilibilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yetkilibilgi",
        "ybilgi",
    ],
    description: "Etiketlediğiniz kişinin kayıt bilgilerini gösterir", // Komutun açıklaması
    category: "Bilgi komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yetkilibilgi [@kişi veya Kişi ID'si]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
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
                        return `👤 **Kayıt ettiğin kişi:** <@${registerInfo.memberId}>\n` +
                            `${EMOJIS.role} **Verdiğin rol(ler):** ${registerInfo.roles}\n` +
                            `⏲️ **Tarihi:** <t:${Math.round(registerInfo.timestamp)}:F>`
                    },
                    guildRank: `\n📈 **Sunucu sıralaman:** ${usersGuildRank == 0 ?
                        `Sıralaman yok` :
                        `${usersGuildRank}. sıradasın`
                        } *(${Util.toHumanize(entries.length, language)} kişi içinden)*`,
                    rank: `🔰 **Rankın:** ${Util.getUserRank(totalCount, language) || "Rankın yok"}`,
                    registers: {
                        all: `Kayıt ettiklerin`,
                        info: `**${guildDatabase.register.type == "normal" ?
                            `${EMOJIS.normal} Üye:** ${Util.toHumanize(normalCount, language)}` :
                            (`${EMOJIS.boy} Erkek:** ${Util.toHumanize(boyCount, language)}\n` +
                                `**${EMOJIS.girl} Kız:** ${Util.toHumanize(girlCount, language)}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${Util.toHumanize(botCount, language)}`,
                        activity: "Kayıt etkinliğin",
                        first: "Kayıt ettiğin ilk kişi",
                        last: "Kayıt ettiğin son kişi",
                        lastRegisters: "Son 5 kaydın",
                    },
                    footer: "Seni seviyorum <3"
                }
                break;

            // Eğer etiketlediği kişi "Alisa" ise
            case guildMe.id:
                allMessages = {
                    firstAndLastRegister(registerInfo) {
                        return `👤 **Kayıt ettiğim kişi:** <@${registerInfo.memberId}>\n` +
                            `${EMOJIS.role} **Verdiğim rol(ler):** ${registerInfo.roles}\n` +
                            `⏲️ **Tarihi:** <t:${Math.round(registerInfo.timestamp)}:F>`
                    },
                    guildRank: `\n📈 **Sunucu sıralamam:** ${usersGuildRank == 0 ?
                        `Sıralamam yok` :
                        `${usersGuildRank}. sıradayım`
                        } *(${Util.toHumanize(entries.length, language)} kişi içinden)*`,
                    rank: `🔰 **Rankım:** Botların rankı olmaz :)`,
                    registers: {
                        all: `Kayıt ettiklerim`,
                        info: `**${EMOJIS.bot} Bot:** ${Util.toHumanize(botCount, language)}`,
                        activity: "Kayıt etkinliğim",
                        first: "Kayıt ettiğim ilk kişi",
                        last: "Kayıt ettiğim son kişi",
                        lastRegisters: "Son 5 kaydım",
                    },
                    footer: "Sizleri seviyorum <3"
                }
                break;

            // Eğer başka birisini etiketlediyse
            default:
                allMessages = {
                    firstAndLastRegister(registerInfo) {
                        return `👤 **Kayıt ettiği kişi:** <@${registerInfo.memberId}>\n` +
                            `${EMOJIS.role} **Verdiği rol(ler):** ${registerInfo.roles}\n` +
                            `⏲️ **Tarihi:** <t:${Math.round(registerInfo.timestamp)}:F>`
                    },
                    guildRank: `\n📈 **Sunucu sıralaması:** ${usersGuildRank == 0 ?
                        `Sıralaması yok` :
                        `${usersGuildRank}. sırada`
                        } *(${Util.toHumanize(entries.length, language)} kişi içinden)*`,
                    rank: `🔰 **Rankı:** ${Util.getUserRank(totalCount, language) || "Rankı yok"}`,
                    registers: {
                        all: `Kayıt ettikleri`,
                        info: `**${guildDatabase.register.type == "normal" ?
                            `${EMOJIS.normal} Üye:** ${Util.toHumanize(normalCount, language)}` :
                            (`${EMOJIS.boy} Erkek:** ${Util.toHumanize(boyCount, language)}\n` +
                                `**${EMOJIS.girl} Kız:** ${Util.toHumanize(girlCount, language)}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${Util.toHumanize(botCount, language)}`,
                        activity: "Kayıt etkinliği",
                        first: "Kayıt ettiği ilk kişi",
                        last: "Kayıt ettiği son kişi",
                        lastRegisters: "Son 5 kaydı",
                    },
                    footer: "Seni seviyorum <3"
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

            // Eğer kayıt yapan kişi etiketlenen kişi değilse döngüyü geç
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
                    value: `**⏰ Son 1 saat:** \`${Util.toHumanize(lastRegisterCount.hour, language)}\`\n` +
                        `**📅 Son 1 gün:** \`${Util.toHumanize(lastRegisterCount.day, language)}\`\n` +
                        `**📆 Son 1 hafta:** \`${Util.toHumanize(lastRegisterCount.week, language)}\`\n` +
                        `**🗓️ Son 1 ay:** \`${Util.toHumanize(lastRegisterCount.month, language)}\``,
                    inline: true
                },
                {
                    name: allMessages.registers.first,
                    value: firstRegisterContent || "• Burada gösterilecek hiçbir şey yok..."
                },
                {
                    name: allMessages.registers.last,
                    value: lastRegisterContent || "• Burada gösterilecek hiçbir şey yok..."
                },
                {
                    name: allMessages.registers.lastRegisters,
                    value: lastRegisters.join("\n") || "• Burada gösterilecek hiçbir şey yok..."
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