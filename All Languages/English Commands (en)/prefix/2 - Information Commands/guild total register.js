"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "totalguild", // Komutun ismi
    id: "sunucutoplam", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "guildtotal",
        "totalguild"
    ],
    description: "Shows what the server has done so far", // Komutun açıklaması
    category: "Information commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>totalguild", // Komutun kullanım şekli
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
        guild,
        authorId,
        language,
    }) {

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
        const TIMES = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };

        // Kaç erkek, kız, üye gibi kayıt bilgilerini tanıma
        const allRegisters = {
            boy: 0,
            girl: 0,
            normal: 0,
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
            if (NOW_TIME - TIMES.hour <= timestamp) lastRegisterCount.hour += 1;

            // Kayıt son 1 günde yapıldıysa
            if (NOW_TIME - TIMES.day <= timestamp) lastRegisterCount.day += 1;

            // Kayıt son 1 haftada yapıldıysa
            if (NOW_TIME - TIMES.week <= timestamp) lastRegisterCount.week += 1;

            // Kayıt son 1 ayda yapıldıysa
            if (NOW_TIME - TIMES.month <= timestamp) lastRegisterCount.month += 1;
        }

        // En çok kayıt yapan 3 kişiyi çek
        const top3Register = Object.entries(guildDatabase.register.authorizedInfos)
            .filter(([_, { countables }]) => countables.total !== undefined)
            .sort(([_, { countables: countablesA }], [__, { countables: countablesB }]) => countablesB.total - countablesA.total)
            .slice(0, 3)
            .map(([userId, { countables }], index) => {
                switch (userId) {

                    // Eğer kullanıcı komutu kullanan kişiyse
                    case authorId:
                        return `• ${Util.stringToEmojis(index + 1)} **<@${userId}> ${Util.toHumanize(countables.total || 0, language)} Number of registrations • ${Util.getUserRank(countables.total, language) || "You have no rank"}**`

                    // Eğer kullanıcı bot ise (Yani Alisa ise)
                    case guildMe.id:
                        return `• ${Util.stringToEmojis(index + 1)} ${EMOJIS.alisa} <@${userId}> **${Util.toHumanize(countables.total || 0, language)}** Number of my registrations **•** Bots have no rank :)`

                    default:
                        return `• ${Util.stringToEmojis(index + 1)} <@${userId}> **${Util.toHumanize(countables.total || 0, language)}** Number of registrations **•** ${Util.getUserRank(countables.total, language) || "No rank"}`
                }
            });

        // Embed mesajında gözükecek emojileri çekme objesi
        const textToEmoji = {
            boy: EMOJIS.boy,
            girl: EMOJIS.girl,
            normal: EMOJIS.normal,
            bot: EMOJIS.bot
        }

        // Son 5 kayıtı göster
        const last5Registers = guildDatabase.register.lastRegisters.slice(0, 5).map(
            ({ gender, memberId, timestamp }, index) => `• \`#${length - index}\` (${textToEmoji[gender]}) <@${memberId}> - <t:${Math.round(timestamp / 1000)}:F>`
        );

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .addFields(
                guildDatabase.register.type == "normal" ?
                    // Eğer sunucunun kayıt şekli "Normal Kayıt" ise 
                    {
                        name: `RECORDED (${Util.toHumanize(length, language)})`,
                        value: `${EMOJIS.normal} **Member:** ${Util.toHumanize(allRegisters.normal, language)}\n` +
                            `${EMOJIS.bot} **Bot:** ${Util.toHumanize(allRegisters.bot, language)}`,
                        inline: true
                    } :
                    // Eğer sunucunun kayıt şekli "Cinsiyet" ise
                    {
                        name: `RECORDED (${Util.toHumanize(length, language)})`,
                        value: `${EMOJIS.boy} **Boy:** ${Util.toHumanize(allRegisters.boy, language)}\n` +
                            `${EMOJIS.girl} **Girl:** ${Util.toHumanize(allRegisters.girl, language)}\n` +
                            `${EMOJIS.bot} **Bot:** ${Util.toHumanize(allRegisters.bot, language)}`,
                        inline: true
                    },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: "REGISTRATION ACTIVITY OF THE SERVER",
                    value: `**⏰ last 1 hour:** \`${Util.toHumanize(lastRegisterCount.hour, language)}\`\n` +
                        `**📅 Last 1 day:** \`${Util.toHumanize(lastRegisterCount.day, language)}\`\n` +
                        `**📆 Last 1 week:** \`${Util.toHumanize(lastRegisterCount.week, language)}\`\n` +
                        `**🗓️ Last 1 month:** \`${Util.toHumanize(lastRegisterCount.month, language)}\``,
                    inline: true
                },
                {
                    name: "`Last 5 records`",
                    value: last5Registers.join("\n") || "• There's nothing to show here..."
                },
                {
                    name: "`Top 3 registered people`",
                    value: top3Register.join("\n") || "• There's nothing to show here..."
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