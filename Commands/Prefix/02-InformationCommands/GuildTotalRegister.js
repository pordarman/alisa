"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "sunucutoplam",
        en: "totalguild"
    },
    id: "sunucutoplam", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sunucutoplam",
            "toplamsunucu",
            "guildtotal",
            "totalguild"
        ],
        en: [
            "guildtotal",
            "totalguild"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun bu zamana kadar yaptığı şeyleri gösterir",
        en: "Shows what the server has done so far"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sunucutoplam",
        en: "<px>totalguild"
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
        guild,
        authorId,
        language,
    }) {

        const {
            commands: {
                sunucutoplam: messages
            },
            others: {
                roleNames
            }
        } = allMessages[language];

        const guildIcon = guild.iconURL();

        const lastRegisters = guildDatabase.register.lastRegisters;

        // Son 1 saat, 1 gün, 1 hafta gibi kayıt bilgilerini kontrol etmemiz için şimdiki zamanı çekmemiz lazım
        const NOW_TIME = Date.now();
        const lastRegisterCount = {
            hour: 0,
            day: 0,
            week: 0,
            month: 0
        };

        // Kaç erkek, kız, üye gibi kayıt bilgilerini tanıma
        const allRegisters = {
            boy: 0,
            girl: 0,
            member: 0,
            bot: 0
        }

        // Bütün kayıtlarda gez
        const length = lastRegisters.length;
        for (let index = 0; index < length; index++) {
            const {
                gender,
                timestamp
            } = lastRegisters[index];

            allRegisters[gender] += 1;

            // Kayıt son 1 saatte yapıldıysa
            if (NOW_TIME - Time.TIMES.hour <= timestamp) lastRegisterCount.hour += 1;

            // Kayıt son 1 günde yapıldıysa
            if (NOW_TIME - Time.TIMES.day <= timestamp) lastRegisterCount.day += 1;

            // Kayıt son 1 haftada yapıldıysa
            if (NOW_TIME - Time.TIMES.week <= timestamp) lastRegisterCount.week += 1;

            // Kayıt son 1 ayda yapıldıysa
            if (NOW_TIME - Time.TIMES.month <= timestamp) lastRegisterCount.month += 1;
        }

        // En çok kayıt yapan 3 kişiyi çek
        const top3Register = Util.stringOr(
            Util.sliceMapAndJoin(
                Object.entries(guildDatabase.register.authorizedInfos)
                    .filter(([_, { countables }]) => countables.total !== undefined)
                    .sort(([_, { countables: countablesA }], [__, { countables: countablesB }]) => countablesB.total - countablesA.total),
                0,
                3,
                ([userId, { countables }], index) => {
                    switch (userId) {

                        // Eğer kullanıcı komutu kullanan kişiyse
                        case authorId:
                            return messages.top3Register.author({
                                userId,
                                total: countables.total,
                                indexEmoji: Util.stringToEmojis(index + 1)
                            });

                        // Eğer kullanıcı bot ise (Yani Alisa ise)
                        case guildMe.id:
                            return messages.top3Register.alisa({
                                userId,
                                total: countables.total,
                                indexEmoji: Util.stringToEmojis(index + 1)
                            });

                        default:
                            return messages.top3Register.user({
                                userId,
                                total: countables.total,
                                indexEmoji: Util.stringToEmojis(index + 1)
                            });
                    }
                },
                "\n"
            ),
            language
        );

        // Son 5 kayıtı göster
        const last5Registers = Util.stringOr(
            Util.sliceMapAndJoin(
                guildDatabase.register.lastRegisters,
                0,
                5,
                ({ gender, memberId, timestamp }) => `• (${Util.textToEmoji(gender)}) <@${memberId}> - <t:${Util.msToSecond(timestamp)}:F>`,
                "\n"
            ),
            language
        );

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .addFields(
                guildDatabase.register.type == "member" ?
                    // Eğer sunucunun kayıt şekli "Üyeli kayıt" ise 
                    {
                        name: `${messages.recorded.title} (${Util.toHumanize(length, language)})`,
                        value: `${EMOJIS.member} **${roleNames.member}:** ${Util.toHumanize(allRegisters.member, language)}\n` +
                            `${EMOJIS.bot} **${roleNames.bot}:** ${Util.toHumanize(allRegisters.bot, language)}`,
                        inline: true
                    } :
                    // Eğer sunucunun kayıt şekli "Cinsiyet" ise
                    {
                        name: `${messages.recorded.title} (${Util.toHumanize(length, language)})`,
                        value: `${EMOJIS.boy} **${roleNames.boy}:** ${Util.toHumanize(allRegisters.boy, language)}\n` +
                            `${EMOJIS.girl} **${roleNames.girl}:** ${Util.toHumanize(allRegisters.girl, language)}\n` +
                            `${EMOJIS.bot} **${roleNames.bot}:** ${Util.toHumanize(allRegisters.bot, language)}`,
                        inline: true
                    },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: messages.registrationActivity.title,
                    value: `**⏰ ${messages.registrationActivity.last1Hour}:** \`${Util.toHumanize(lastRegisterCount.hour, language)}\`\n` +
                        `**📅 ${messages.registrationActivity.last1Day}:** \`${Util.toHumanize(lastRegisterCount.day, language)}\`\n` +
                        `**📆 ${messages.registrationActivity.last1Week}:** \`${Util.toHumanize(lastRegisterCount.week, language)}\`\n` +
                        `**🗓️ ${messages.registrationActivity.last1Month}:** \`${Util.toHumanize(lastRegisterCount.month, language)}\``,
                    inline: true
                },
                {
                    name: `\`${messages.last5Records}\``,
                    value: last5Registers
                },
                {
                    name: `\`${messages.top3RegisteredPeople}\``,
                    value: top3Register
                }
            )
            .setThumbnail(guildIcon)
            .setColor("#290529")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};