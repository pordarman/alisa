"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "registerchannel", // Komutun ismi
    id: "kayıtkanal", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "registerchannel"
    ],
    description: "You set the recording channel", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>registerchannel <#channel or Channel ID>", // Komutun kullanım şekli
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
            if (!channelIds.register) return errorEmbed("The recording channel has already been reset");

            channelIds.register = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("recording channel reset successfully", "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            `• To set the recording channel **${prefix}${this.name} #channel**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(`The channel you tagged is not a text channel. Please tag another channel`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == channelIds.register) return errorEmbed("The recording channel is the same as the channel you already tagged");

        channelIds.register = channel.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, registrations will only be made on the <#${channel.id}> channel`,
            "success"
        );

    },
};