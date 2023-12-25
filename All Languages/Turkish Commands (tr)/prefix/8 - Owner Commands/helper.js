"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");
const {
    Message
} = require("discord.js");

class Helper {

    /**
     * Girilen ID'deki sunucunun davetini çek
     * @param {Message} msg
     * @param {String} guildId 
     * @returns {Promise<String>} 
     */
    async createInvite(msg, guildId) {
        // Eğer sunucu ID'sini girmemişse veya girilen ID gerçek bir ID değilse
        if (
            typeof guildId != "string" ||
            !/^\d{17,20}$/.test(guildId)
        ) return "Geçerli bir sunucu ID'si giriniz!";

        // Sunucunun shardını bul ve daveti çek
        return await msg.client.shard.broadcastEval(
            async (client, guildId) => {
                const guild = client.guilds.cache.get(guildId);

                // Eğer sunucu bulunamadıysa
                if (!guild) return "Böyle bir sunucu bulunamadı!";

                // Eğer botun sunucuda davetleri yönet yetkisi yoksa
                if (!guild.members.me.permissions.has("CreateInstantInvite")) return "Botun bu sunucuda davetleri yönet yetkisi yok!";

                // Eğer bir davet varsa onunla giriş yap, yoksa yeni davet oluştur
                const inviteURL = await guild.invites.fetch().catch(() => { });

                // Yeni bir davet oluştur
                return inviteURL.first()?.url || (await guild.invites.create(guild.channels.cache.first())).url;
            },
            {
                shard: Util.shardId(guildId),
                context: guildId
            }
        )
    }

}

module.exports = {
    name: "helper", // Komutun ismi
    id: "helper", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "helper",
        "helpers",
        "h"
    ],
    description: "Bazı gerekli fonksiyonları (sunucunun davetini almak gibi vs.) içerir", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>h <Komut>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
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
        language
    }) {

        let message = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        
        // Kullanılabilir komutları çek
        
        if (!message) return msg.reply("Lütfen bir kod parçacığı girin");

    },
};