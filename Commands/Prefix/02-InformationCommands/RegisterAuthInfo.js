"use strict";
const {
    EmbedBuilder,
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yetkilibilgi",
        en: "authinfo"
    },
    id: "yetkilibilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yetkilibilgi",
            "ybilgi"
        ],
        en: [
            "authinfo",
            "authinformation",
            "auth-info",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Etiketlediğiniz kişinin kayıt bilgilerini gösterir",
        en: "Shows the registration information of the person you tagged"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yetkilibilgi [@kişi veya Kişi ID'si]",
        en: "<px>authinfo [@user or User ID]"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        guildMe,
        args,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                "yetkilibilgi": messages
            }
        } = allMessages[language];

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi kayıt bilgilerini kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        // Eğer etiketlediği kişi botsa ve Alisa dışında bir botu etiketlemişse hata döndür
        if (user.bot && user.id != guildMe.id) return errorEmbed(messages.botError);

        // Son 1 saat, 1 gün, 1 hafta gibi kayıt bilgilerini kontrol etmemiz için şimdiki zamanı çekmemiz lazım
        const NOW_TIME = Date.now();
        const lastRegisterCount = {
            hour: 0,
            day: 0,
            week: 0,
            month: 0
        };

        const userAvatar = user.displayAvatarURL();

        // Şimdi verileri çekme zamanı
        const {
            countables: {
                girl: girlCount,
                boy: boyCount,
                member: memberCount,
                bot: botCount,
                total: totalCount
            },
            firstRegister,
            lastRegister
        } = guildDatabase.register.authorizedInfos[user.id] ?? Util.DEFAULTS.registerAuthData;

        // Sunucuda kaçıncı sırada olduğunu bulma
        const entries = Object.entries(guildDatabase.register.authorizedInfos).sort(([_, firstData], [__, secondData]) => (secondData.countables.total ?? 0) - (firstData.countables.total ?? 0));
        const usersGuildRank = Util.binarySearch(entries, guildDatabase.register.authorizedInfos[user.id]?.countables?.total ?? 0, user.id);

        // Etiketlendiği kişiye göre gösterilecek mesajları değiştir
        let allRankMessages;

        switch (user.id) {

            // Eğer etiketlediği kişi kendisiyse
            case authorId:
                allRankMessages = messages.rankMessages.author;
                break;

            // Eğer etiketlediği kişi "Alisa" ise
            case guildMe.id:
                allRankMessages = messages.rankMessages.alisa;
                break;

            // Eğer başka birisini etiketlediyse
            default:
                allRankMessages = messages.rankMessages.user;
                break;
        }

        const SHOW_REGISTERS_IN_EMBED = 5;

        // Son 5 kayıtını ve son 1 saat, 1 gün, 1 hafta gibi kayıtları çekme
        const lastRegisters = [];
        for (let i = 0; i < guildDatabase.register.lastRegisters.length; ++i) {
            const {
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
                    `• (${EMOJIS[gender]}) <@${memberId}> - <t:${Util.msToSecond(timestamp)}:F>${isAgainRegister ? " 🔁" : ""}`
                );
            }

            // Kayıt son 1 saatte yapıldıysa
            if (NOW_TIME - Time.TIMES.hour <= timestamp) lastRegisterCount.hour += 1;

            // Kayıt son 1 günde yapıldıysa
            if (NOW_TIME - Time.TIMES.day <= timestamp) lastRegisterCount.day += 1;

            // Kayıt son 1 haftada yapıldıysa
            if (NOW_TIME - Time.TIMES.week <= timestamp) lastRegisterCount.week += 1;

            // Kayıt son 1 ayda yapıldıysa
            if (NOW_TIME - Time.TIMES.month <= timestamp) lastRegisterCount.month += 1;
            //  Eğer kayıt son 1 aydan daha sonra yapıldıysa ve dizi sınıra ulaştıysa döngüyü bitir
            else if (lastRegisters.length >= SHOW_REGISTERS_IN_EMBED) break;

        };

        let firstRegisterContent;
        let lastRegisterContent;

        // Eğer ilk veya son kayıt ayarlıysa embed mesajında göster
        if (firstRegister) {
            firstRegisterContent = allRankMessages.firstAndLastRegister(firstRegister);
            lastRegisterContent = allRankMessages.firstAndLastRegister(lastRegister);
        }

        // Mesajda gösterilecek embed 
        const embed = new EmbedBuilder()
            .setAuthor({
                name: user.displayName,
                iconURL: userAvatar
            })
            .setDescription(`${allRankMessages.rank(totalCount)}${allRankMessages.guildRank({ usersGuildRank, fromPeople: entries.length })}`)
            .addFields(
                {
                    name: `${allRankMessages.registers.all} (${Util.toHumanize(totalCount, language)})`,
                    value: allRankMessages.registers.info({
                        registerType: guildDatabase.register.type,
                        memberCount: Util.toHumanize(memberCount, language),
                        boyCount: Util.toHumanize(boyCount, language),
                        girlCount: Util.toHumanize(girlCount, language),
                        botCount: Util.toHumanize(botCount, language),
                    }),
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: allRankMessages.registers.activity,
                    value: `**⏰ ${messages.rankMessages.last.onehour}:** \`${Util.toHumanize(lastRegisterCount.hour, language)}\`\n` +
                        `**📅 ${messages.rankMessages.last.oneday}:** \`${Util.toHumanize(lastRegisterCount.day, language)}\`\n` +
                        `**📆 ${messages.rankMessages.last.oneweek}:** \`${Util.toHumanize(lastRegisterCount.week, language)}\`\n` +
                        `**🗓️ ${messages.rankMessages.last.onemonth}:** \`${Util.toHumanize(lastRegisterCount.month, language)}\``,
                    inline: true
                },
                {
                    name: allRankMessages.registers.first,
                    value: Util.stringOr(firstRegisterContent, language)
                },
                {
                    name: allRankMessages.registers.last,
                    value: Util.stringOr(lastRegisterContent, language)
                },
                {
                    name: allRankMessages.registers.lastRegisters,
                    value: Util.stringOr(lastRegisters.join("\n"), language)
                }
            )
            .setThumbnail(userAvatar)
            .setColor("#7a1ac0")
            .setFooter({
                text: allRankMessages.footer,
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