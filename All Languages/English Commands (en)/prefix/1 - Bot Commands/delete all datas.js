"use strict";
const database = require("../../../../Helpers/Database");
const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "reset", // Komutun ismi
    id: "sıfırla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "reset",
        "deletedatas",
        "deletedata"
    ],
    description: "This resets all data on the server (except the afk system)", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>reset", // Komutun kullanım şekli
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
        guildId,
        guild,
        authorId,
        errorEmbed,
        extras,
        language,
    }) {

        // Eğer bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        async function deleteDatas() {
            // Mesaj atmasını bekle
            return await msg.channel.awaitMessages({
                filter: message => message.author.id === authorId && ["yes", "no", "yeah", "yep", "nope"].includes(message.content.toLocaleLowerCase(language)),
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
                    if (["yes", "yeah", "yep"].includes(message.content.toLocaleLowerCase(language))) {
                        // afk, dil ve prefix verisi hariç diğer bütün verileri sil
                        const tempDatas = {
                            afk: {
                                ...guildDatabase.afk
                            },
                            prefix: guildDatabase.prefix,
                            language: guildDatabase.language
                        }
                        for (const key in database.defaultGuildDatabase) {
                            guildDatabase[key] = database.defaultGuildDatabase[key];
                        }
                        for (const key in tempDatas) {
                            guildDatabase[key] = tempDatas[key];
                        }
                        database.writeFile(guildDatabase, guildId);

                        return message.reply("I have successfully reset **ALL** your data on this server");
                    }
                    // Eğer silmek istemiyorsa
                    else {
                        return message.reply("The transaction has been canceled");
                    }
                })
                // Eğer mesajı atmadıysa
                .catch(() => {
                    // Database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteAllDatas;
                    database.writeFile(guildDatabase, guildId);

                    return msg.reply(`⏰ <@${authorId}>, your time is up!`)
                })
        }

        // Eğer bot yeniden başlatılmışsa fonksiyonu direkt çalıştır
        if (extras) return await deleteDatas();

        // Eğer kişi sunucu sahibi değilse hata döndür
        if (guild.ownerId != authorId) return errorEmbed("You must be a **server owner** to use this command, you stupid thing :(");

        const embed = new EmbedBuilder()
            .setTitle("ATTENTION!!")
            .setDescription(
                `• Are you sure you want to reset/delete all saves, set roles and channels, save history, jail info and settings, and **EVERYTHING** else? \n\n` +
                `• If you want to delete it, write **yes**, if not, write **no**\n\n` +
                `**Attention!!** This process is permanent and cannot be undone! Please think carefully...`
            )
            .setColor("#6d0000")
            .setFooter({
                text: "You have 2 minutes to respond"
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