"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "modlog", // Komutun ismi
    id: "modlog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "modlog",
        "modlogkanalı",
    ],
    description: "Mod log kanalını ayarlarsınız", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>modlog <#kanal veya Kanal ID'si>", // Komutun kullanım şekli
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

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const content = args.join(" ");
        const channelIds = guildDatabase.moderation.channelIds;

        // Eğer ayarlanan mod log kanalını sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!channelIds.modLog) return errorEmbed("Mod log kanalı zaten sıfırlanmış durumda");

            channelIds.modLog = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Mod log kanalı başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            `• Mod log kanalını ayarlamak için **${prefix}${this.name} #kanal**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(`Etiketlediğiniz kanal bir yazı kanalı değildir. Lütfen başka bir kanal etiketleyiniz`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == channelIds.modLog) return errorEmbed("Mod log kanalı zaten etiketlediğiniz kanalla aynı");

        channelIds.modLog = channel.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra bütün moderasyon loglarını (Eğer komut Alisa üzerinden kullanılmışsa) <#${channel.id}> kanalına atacağım`,
            "success"
        );

    },
};