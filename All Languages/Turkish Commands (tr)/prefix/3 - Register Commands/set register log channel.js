"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıtlog", // Komutun ismi
    id: "kayıtlog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıtlog",
        "kayıtlogkanal",
        "registerlog",
        "registerlogchannel"
    ],
    description: "Kayıt log kanalını ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıtlog <#kanal veya Kanal ID'si>", // Komutun kullanım şekli
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
        const channelIds = guildDatabase.register.channelIds;

        // Eğer ayarlanan mod log kanalını sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!channelIds.log) return errorEmbed("Kayıt log kanalı zaten sıfırlanmış durumda");

            channelIds.log = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Kayıt log kanalı başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            `• Kayıt log kanalını ayarlamak için **${prefix}${this.name} #kanal**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(`Etiketlediğiniz kanal bir yazı kanalı değildir. Lütfen başka bir kanal etiketleyiniz`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == channelIds.log) return errorEmbed("Kayıt log kanalı zaten etiketlediğiniz kanalla aynı");

        channelIds.log = channel.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra birisini kayıt ettikten sonra <#${channel.id}> kanalına kayıt bilgilerini gösteren mesaj atılacaktır`,
            "success"
        );

    },
};