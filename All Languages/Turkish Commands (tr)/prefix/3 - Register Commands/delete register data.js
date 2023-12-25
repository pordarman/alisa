"use strict";
const database = require("../../../../Helpers/Database");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıtsıfırla", // Komutun ismi
    id: "kayıtsıfırla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıtsıfırla",
        "kayıtsil",
        "kayıt-sıfırla",
        "kayıt-sil",
        "deleteregister"
    ],
    description: "Bütün kayıt verilerini siler", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıtsıfırla", // Komutun kullanım şekli
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
                time: 45 * 1000 // 45 saniye boyunca kullanıcının işlem yapmasını bekle
            })
                // Mesajı attıysa
                .then(async messages => {
                    // Eğer mesajı attıysa database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteRegister;
                    database.writeFile(guildDatabase, guildId);

                    const message = messages.first();

                    // Eğer verileri silmek istiyorsa
                    if (message.content.toLocaleLowerCase(language) === "evet") {
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
                        return message.reply("İşlem iptal edilmiştir");
                    }
                })
                // Eğer mesajı atmadıysa
                .catch(() => {
                    // Database'den kayıt verisini sil
                    delete guildDatabase.waitMessageCommands.deleteRegister;
                    database.writeFile(guildDatabase, guildId);

                    return msg.reply(`⏰ <@${authorId}>, süreniz bitti!`)
                })
        }

        // Eğer bot yeniden başlatılmışsa fonksiyonu direkt çalıştır
        if (extras) return await deleteDatas();

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const embed = new EmbedBuilder()
            .setTitle('Dikkat')
            .setDescription(
                `Tüm kayıt bilgilerinizi sıfırlamak istediğinizden emin misiniz. Sıfırlamadan önce **${prefix}kayıt-bilgi** yazarak kayıt ayarlarınızı gözden geçirebilirsiniz\n\n` +
                `• **NOT!!** Şu anda sileceğini şeyler sunucunun tagı, sembolü, düzenlenecek isimler, özel mesajlar ve rol ve kanal ID'leridir. Son kayıtlar gibi şeyler silinmeyecektir\n\n` +
                `• Eğer silmek istiyorsanız **evet**, istemiyorsanız **hayır** yazınız`
            )
            .setColor('#a80303')
            .setFooter({
                text: 'Cevap vermek için 45 saniyeniz vardır'
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