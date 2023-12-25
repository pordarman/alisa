"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "günlük", // Komutun ismi
    id: "günlük", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "günlük",
        "günlükkanal",
        "kayıtsonrasıkanal",
        "afterregisterchannel"
    ],
    description: "Kayıt sonrası kanalını ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>günlük <#kanal veya Kanal ID'si>", // Komutun kullanım şekli
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
            if (!channelIds.afterRegister) return errorEmbed("Kayıt sonrası kanalı zaten sıfırlanmış durumda");

            channelIds.afterRegister = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Kayıt sonrası kanalı başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            `• Kayıt sonrası kanalını ayarlamak için **${prefix}${this.name} #kanal**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(`Etiketlediğiniz kanal bir yazı kanalı değildir. Lütfen başka bir kanal etiketleyiniz`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == channelIds.afterRegister) return errorEmbed("Kayıt sonrası kanalı zaten etiketlediğiniz kanalla aynı");

        channelIds.afterRegister = channel.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra birisini kayıt ettikten sonra <#${channel.id}> kanalına kayıt edilen üye için hoşgeldin mesajı atılacaktır`,
            "success"
        );

    },
};