"use strict";
const database = require("../../../Helpers/Database.js");
const Discord = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const settings = require("../../../settings.json");
const mongodb = require("mongodb");

module.exports = {
    name: { // Komutun ismi
        tr: "eval",
        en: "eval"
    },
    id: "eval", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "eval"
        ],
        en: [
            "eval"
        ]
    },
    description: { // Komutun açıklaması
        tr: "eval fonksiyonunu kullanırsınız",
        en: "You use the eval function"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>eval <İstediğiniz bir komut>",
        en: "<px>eval <Any command you want>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute(params) {
        const {
            alisa,
            msg,
            guildDatabase,
            guildId,
            guildMe,
            guildMePermissions,
            guild,
            msgMember,
            prefix,
            authorId,
            language,
            errorEmbed,
            isOwner,
            premium,
        } = params;

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

        /**
         * Girilen kanal ID'sine ve mesaj ID'sine mesaj gönder
         * @param {String} channelIdAndMessageId 
         */
        async function sendMessage(channelIdAndMessageId, messageContent) {
            if (!channelIdAndMessageId) return "Geçerli bir kanal ve mesaj ID'si giriniz!";

            const [channelId, messageId] = channelIdAndMessageId.split("-");

            // Eğer kanal ID'si veya mesaj ID'si girilmemişse
            if (!channelId || !messageId) return "Geçerli bir kanal ve mesaj ID'si giriniz!";

            const channel = msg.client.channels.cache.get(channelId);
            if (!channel) return "Böyle bir kanal bulunamadı!";

            const message = channel.messages.cache.get(messageId) || await channel.messages.fetch(messageId).catch(() => { });
            if (!message) return "Böyle bir mesaj bulunamadı!";

            return message.reply(messageContent);
        }

        let message = Util.getContentWithoutCommandName(msg.content, prefix, this.aliases[language]);
        if (!message) return msg.reply("Lütfen bir kod parçacığı girin");

        // Eğer kod tek satırsa ve başında "return" ifadesi yoksa başına return ifadesini ekle
        if (!message.includes("\n") && !message.startsWith("return ")) message = `return ${message}`;
        const result = await eval(`(async () => { ${message} })()`);

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
                // Eğer mesaj "return" ile başlıyorsa ne döndürdüğünü belirt
                if (message.startsWith("return")) return msg.reply("Bu kod parçacığı bir şey döndürmedi");
                return msg.react(
                    settings.EMOJIS.yes
                );
        }

    },
};