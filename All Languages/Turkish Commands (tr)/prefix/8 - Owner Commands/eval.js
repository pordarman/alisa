"use strict";
const database = require("../../../../Helpers/Database");
const Discord = require("discord.js");
const Util = require("../../../../Helpers/Util");
const Time = require("../../../../Helpers/Time");
const settings = require("../../../../settings.json");
const messages = require("../../../../messages.json");

module.exports = {
    name: "eval", // Komutun ismi
    id: "eval", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "eval"
    ],
    description: "eval fonksiyonunu kullanırsınız", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>eval <İstediğiniz bir komut>", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        /**
         * Girilen ID'deki sunucunun davetini çek
         * @param {String} guildId 
         * @returns {Promise<String>} 
         */
        async function createInvite(guildId) {
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

        let message = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!message) return msg.reply("Lütfen bir kod parçacığı girin");

        // Eğer kod tek satırsa ve başında "return" ifadesi yoksa başına return ifadesini ekle
        if (!message.includes("\n") && !message.startsWith("return ")) message = `return ${message}`;

        const result = await eval(`(async () => {${message}})()`);

        switch (typeof result) {
            case "string":
            case "number":
            case "bigint":
            case "symbol":
            case "function":
            case "object":
                const resultString = typeof result == "object" ? JSON.stringify(result, null, 4) : String(result);

                // Bütün komutları discord mesaj karakteri sınırlamasına göre sırala
                const allCommands = Util.splitMessage({
                    arrayString: resultString.split("\n"),
                    joinString: "\n",
                    limit: 2000
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < allCommands.length; ++i) {
                    await msg.channel.send({
                        content: allCommands[i],
                        allowedMentions: {
                            roles: [],
                            users: []
                        }
                    });

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }
                return;

            case "boolean":
                return msg.reply(result ? "Doğru!" : "Yanlış!");

            case "undefined":
                return msg.reply(
                    message.startsWith("return ") ?
                        "• Herhangi bir geri dönüş yok!" :
                        "• İşlem gerçekleşti!"
                )
        }

    },
};