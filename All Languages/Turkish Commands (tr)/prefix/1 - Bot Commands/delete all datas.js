"use strict";
const database = require("../../../../Helpers/Database");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "sıfırla", // Komutun ismi
    id: "sıfırla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sıfırla",
        "verisil",
        "verilerisil",
        "deletedatas",
        "deletedata"
    ],
    description: "Bu sunucudaki bütün verileri (afk sistemi hariç) sıfırlar", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sıfırla", // Komutun kullanım şekli
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
        extras,
        language,
    }) {

        // Eğer bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        async function deleteDatas() {
            // Mesaj atmasını bekle
            return await msg.channel.awaitMessages({
                filter: message => message.author.id === authorId && ["evet", "hayır", "hayir"].includes(message.content.toLocaleLowerCase(language)),
                max: 1,
                time: 2 * 60 * 1000 // 2 dakika
            })
                // Mesajı attıysa
                .then(async messages => {
                    // Eğer mesajı attıysa database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteAllDatas;
                    database.writeFile(guildDatabase, guildId);

                    const message = messages.first();

                    // Eğer verileri silmek istiyorsa
                    if (message.content.toLocaleLowerCase(language) === "evet") {
                        // afk, dil ve prefix verisi hariç diğer bütün verileri sil
                        const tempDatas = {
                            afk: {
                                ...guildDatabase.afk
                            },
                            prefix: guildDatabase.prefix,
                            language: guildDatabase.language
                        }
                        const tempData = { ...guildDatabase.afk };
                        for (const key in database.defaultGuildDatabase) {
                            guildDatabase[key] = database.defaultGuildDatabase[key];
                        }
                        for (const key in tempDatas) {
                            guildDatabase[key] = tempDatas[key];
                        }
                        database.writeFile(guildDatabase, guildId);

                        return message.reply("Başarıyla bu sunucudaki **BÜTÜN** verilerinizi sıfırladım");
                    }
                    // Eğer silmek istemiyorsa
                    else {
                        return message.reply("İşlem iptal edilmiştir");
                    }
                })
                // Eğer mesajı atmadıysa
                .catch(() => {
                    // Database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteAllDatas;
                    database.writeFile(guildDatabase, guildId);

                    return msg.reply(`⏰ <@${authorId}>, süreniz bitti!`)
                })
        }

        // Eğer bot yeniden başlatılmışsa fonksiyonu direkt çalıştır
        if (extras) return await deleteDatas();

        // Eğer kişi sunucu sahibi değilse hata döndür
        if (guild.ownerId != authorId) return errorEmbed("Bu komutu kullanabilmek için **Sunucu sahibi** olmalısın şapşik şey seni :(");

        const embed = new EmbedBuilder()
            .setTitle("DİKKATT!!")
            .setDescription(
                `• Tüm kayıtları, ayarlanmış rolleri ve kanalları, kayıt geçmişini, jail bilgilerini ve ayarlarını ve diğer **TÜM HER ŞEYİ** sıfırlamak/silmek istediğinizden emin misiniz? \n\n` +
                `• Eğer silmek istiyorsanız **evet** istemiyorsanız **hayır** yazınız\n\n` +
                `**Dikkatt!!** Bu işlem kalıcıdır ve geri alınamaz! Lütfen iyice düşünün...`
            )
            .setColor("#6d0000")
            .setFooter({
                text: "Cevap vermek için 2 dakikanız vardır"
            });

        const waitMessage = await msg.reply({
            embeds: [
                embed
            ]
        });

        // Eğer bir hata olurda mesajı atamazsa hiçbir şey döndürme
        if (!waitMessage) return;

        // Database'ye kaydedilecek verileri kaydet
        guildDatabase.waitMessageCommands.deleteAllDatas = {
            commandName: this.name,
            messageId: msg.id,
            channelId: msg.channelId,
            timestamp: Date.now()
        };
        database.writeFile(guildDatabase, guildId);

        return await deleteDatas();

    },
};