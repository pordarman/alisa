"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "afterregister", // Komutun ismi
    id: "günlük", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "afterregister",
        "afterregisterchannel"
    ],
    description: "You set the post-recording channel", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>afterregister <#channel or Channel ID>", // Komutun kullanım şekli
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
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const content = args.join(" ");
        const channelIds = guildDatabase.register.channelIds;

        // Eğer ayarlanan mod log kanalını sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!channelIds.afterRegister) return errorEmbed("The post-record channel has already been reset");

            channelIds.afterRegister = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Post-registration channel successfully reset", "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            `• To set the post-record channel **${prefix}${this.name} #channel**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(`The channel you tagged is not a text channel. Please tag another channel`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == channelIds.afterRegister) return errorEmbed("After recording, the channel is the same as the channel you have already tagged");

        channelIds.afterRegister = channel.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, after registering someone, a welcome message will be sent to the member registered to the <#${channel.id}> channel`,
            "success"
        );

    },
};