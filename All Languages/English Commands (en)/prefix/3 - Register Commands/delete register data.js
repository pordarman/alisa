"use strict";
const database = require("../../../../Helpers/Database");
const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "deleteregister", // Komutun ismi
    id: "kayıtsıfırla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "deleteregister"
    ],
    description: "Deletes all register data", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>deleteregister", // Komutun kullanım şekli
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
        authorId,
        prefix,
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
                time: 45 * 1000 // 45 saniye boyunca kullanıcının işlem yapmasını bekle
            })
                // Mesajı attıysa
                .then(async messages => {
                    // Eğer mesajı attıysa database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteRegister;
                    database.writeFile(guildDatabase, guildId);

                    const message = messages.first();

                    // Eğer verileri silmek istiyorsa
                    if (["yes", "yeah", "yep"].includes(message.content.toLocaleLowerCase(language))) {
                        // Database'den rol ve kanal ID'lerini sil
                        const tempData = { ...guildDatabase.register };
                        guildDatabase.register = database.defaultGuildDatabase.register;

                        // Silinmeyecek verileri geri yükle
                        for (const key of ["authorizedInfos", "lastRegisters", "prevNamesOfMembers"]) {
                            guildDatabase.register[key] = tempData[key];
                        }

                        database.writeFile(guildDatabase, guildId);

                        return message.reply("Başarıyla bu sunucudaki kayıt bilgilerinizi sıfırladım");
                    }
                    // Eğer silmek istemiyorsa
                    else {
                        return message.reply("The transaction has been canceled");
                    }
                })
                // Eğer mesajı atmadıysa
                .catch(() => {
                    // Database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteRegister;
                    database.writeFile(guildDatabase, guildId);

                    return msg.reply(`⏰ <@${authorId}>, your time is up!`)
                })
        }

        // Eğer bot yeniden başlatılmışsa fonksiyonu direkt çalıştır
        if (extras) return await deleteDatas();

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const embed = new EmbedBuilder()
            .setTitle('Attention')
            .setDescription(
                `Are you sure you want to reset all your registration information? Before resetting, you can review your registration settings by typing **${prefix}registration-info**\n\n` +
                `• **NOTE!!** The things you will delete now are the server's tag, symbol, names to be edited, private messages, and role and channel IDs. Things like recent recordings will not be deleted\n\n` +
                `• If you want to delete it, write **yes**, otherwise write **no**`
            )
            .setColor('#a80303')
            .setFooter({
                text: 'You have 45 seconds to respond'
            })
            .setTimestamp();

        const waitMessage = await msg.reply({
            embeds: [
                embed
            ]
        });

        // Eğer bir hata olurda mesajı atamazsa hiçbir şey döndürme
        if (!waitMessage) return;

        // Database'ye kaydedilecek verileri kaydet
        guildDatabase.waitMessageCommands.deleteRegister = {
            commandName: this.name,
            messageId: msg.id,
            channelId: msg.channelId,
            timestamp: Date.now()
        };
        database.writeFile(guildDatabase, guildId);

        return await deleteDatas();

    },
};