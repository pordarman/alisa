"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "jaillog", // Komutun ismi
    id: "jaillog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "jaillog",
    ],
    description: "You set the jail log channel", // Komutun açıklaması
    category: "Jail commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>jaillog <#channel or Channel ID>", // Komutun kullanım şekli
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
        const jail = guildDatabase.jail;

        // Eğer ayarlanan jail log kanalını sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!jail.logChannelId) return errorEmbed("Jail log channel has already been reset");

            jail.logChannelId = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Jail log channel successfully reset", "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            `• To set the jail log channel **${prefix}${this.name} #channel**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(`The channel you tagged is not a text channel. Please tag another channel`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == jail.logChannelId) return errorEmbed("Jail log channel is the same as the channel you have already tagged");

        jail.logChannelId = channel.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, I will send all Jail logs (if the command was used via Alisa) to the <#${channel.id}> channel`,
            "success"
        );

    },
};