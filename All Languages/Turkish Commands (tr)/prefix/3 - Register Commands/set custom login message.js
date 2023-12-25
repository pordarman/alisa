"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "özel", // Komutun ismi
    id: "özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "özel",
        "özelmesaj",
        "özelkayıtmesaj",
        "özel-mesaj",
        "özel-kayıt-mesaj",
        "custom",
        "customregister",
        "customregistermessage",
        "custom-register",
        "custom-register-message",
    ],
    description: "Giriş mesajını özelleştirebilmenizi sağlar", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>özel", // Komutun kullanım şekli
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

        // Bu fonksiyonu bot yeniden başlatıldıktan sonra da kullanacağımız için bir fonksiyon şeklinde yapıyoruz
        async function waitMessage() {
            // Mesaj atmasını bekle
            await msg.channel?.awaitMessages({
                filter: message => message.author.id === authorId,
                max: 1,
                time: 1000 * 60 * 8 // 8 dakika
            })
                // Eğer mesaj attıysa
                .then(messages => {
                    delete guildDatabase.waitMessageCommands.customLogin;
                    database.writeFile(guildDatabase, guildId);

                    const message = messages.first();

                    // Mesajın başındaki ve sonundaki boşlukları kaldır
                    message.content = message.content.trim();

                    // Eğer hiçbir yazı girmemişse
                    if (message.content.length == 0) return message.reply("Keşke bir yazı yazsaydın be");

                    switch (message.content.toLocaleLowerCase(language)) {
                        // Eğer işlemi iptal ettiyse
                        case "iptal":
                            return message.reply("İşlem iptal edilmiştir");

                        // Eğer ayarlanan veriyi sıfırlamak istiyorsa
                        case "sıfırla":
                        case "sifirla": {
                            // Eğer zaten sıfırlanmışsa
                            if (!guildDatabase.register.customLogin) return message.reply("Özelleştirilmiş giriş mesajı zaten ayarlı değil");

                            // Database'ye kaydet
                            guildDatabase.register.customLogin = {
                                content: "",
                                image: "",
                                isEmbed: false,
                            }
                            database.writeFile(guildDatabase, guildId);

                            return message.reply(`${EMOJIS.yes} Özelleştirilmiş giriş mesajı başarıyla sıfırlandı`);
                        }

                        // Eğer bir şeyler ayarlamak istiyorsa
                        default: {

                            // Mesajın kutulu mu kutusuz mu olacağını kontrol etmek için yeni bir string oluşturacağız
                            // Ve ikisi arasında karakter farkı varsa "kutulu", yoksa "kutusuz" olduğunu ayarlayacağız
                            let newString = message.content.replace(/<\/?(unboxed)>/g, "");
                            const isEmbed = message.content.length == newString.length;
                            const maxLength = isEmbed ? Util.MAX.customMessageLength.embed : Util.MAX.customMessageLength.message;

                            // Eğer mesajda çok fazla karakter varsa
                            if (message.content.length > maxLength) return message.reply(
                                `Karakter sayısı çok fazla! Mesajınız **${maxLength}** karakterden küçük olmalıdır!`
                            );

                            // Mesajdan resmi çek
                            let image = message.attachments.find(({ contentType }) => /^(video|image)/.test(contentType))?.url;

                            // Eğer resim yoksa URL'yi çekmeye çalış
                            if (!image) {
                                image = message.content.match(Util.regex.fetchURL)?.[0];

                                // Eğer URL'yi çektiyse mesajdan URL'yi kaldır
                                if (image) {
                                    newString.replace(image, "");
                                }
                            }

                            // Mesajın başındaki ve sonundaki \n karakterlerini kaldır
                            newString = newString.replace(/(^(\n)+|(\n)+$)/g, "");

                            // Database'ye kaydet
                            guildDatabase.register.customLogin = {
                                content: newString,
                                image,
                                isEmbed,
                            };
                            database.writeFile(guildDatabase, guildId);

                            return message.reply(`${EMOJIS.yes} Özelleştirilmiş giriş mesajı başarıyla ayarlandı. Nasıl göründüğüne bakmak için **${prefix}fake** yazabilirsiniz`);
                        }
                    }

                    // Eğer işlemi sıfırladıysa
                })
                // Eğer mesaj atmadıysa
                .catch(() => {
                    msg.reply(`⏰ <@${authorId}>, süreniz bitti!`);

                    delete guildDatabase.waitMessageCommands.customLogin;
                    database.writeFile(guildDatabase, guildId);
                });
        }

        // Eğer bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır
        if (extras) return await waitMessage();

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "yetki");

        // Eğer bu komut şu anda çalışıyorsa
        if (guildDatabase.waitMessageCommands.customLogin) return errorEmbed(`Heyy dur bakalım orada! Şu anda başka bir yetkili özel mesajı ayarlıyor!`);

        const NOW_TIME = Date.now();
        // Eğer bot yeniden başlarsa gerekli verileri database'ye yazdır
        guildDatabase.waitMessageCommands.customLogin = {
            commandName: this.name,
            channelId: msg.channelId,
            messageId: msg.id,
            authorId,
            timestamp: NOW_TIME
        };
        database.writeFile(guildDatabase, guildId);

        const createdTimestamp = msg.author.createdTimestamp;
        const createdTimestampSecond = Math.round(createdTimestamp / 1000);

        const TWO_WEEKS = 1000 * 60 * 60 * 24 * 7 * 2;
        const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
        // Eğer kullanıcı hesabını son 2 hafta içinde açmışsa
        const security = createdTimestamp > (NOW_TIME - TWO_WEEKS) ?
            `Güvensiz ${EMOJIS.unsafe}` :
            // Eğer son 1 ay içinde açmışsa
            createdTimestamp > (NOW_TIME - ONE_MONTH) ?
                `Şüpheli ${EMOJIS.suspicious}` :
                // Eğer 1 aydan daha da önce açmışsa
                `Güvenli ${EMOJIS.safe}`;

        const registerAuthRoleId = guildDatabase.register.roleIds.registerAuth;

        const embed = new EmbedBuilder()
            .setTitle("Şimdi düşünme zamanı")
            .setDescription(
                `• İptal etmek için **iptal**\n` +
                `• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n` +
                `**Giriş mesajının kutusuz olmasını istiyorsanız yazacağın mesajın başına <kutusuz> yazman yeterli!**\n\n` +
                `**Değişkenler**\n` +
                `**• <sunucuAdı>** => Sunucu adını yazar - ( ${guild.name} ) \n` +
                `**• <rol>** => Yetkili rolünü etiketler - ( ${registerAuthRoleId ? `<@&${registerAuthRoleId}>` : "__**ROL AYARLI DEĞİL**__"} )\n` +
                `**• <üye>** => Gelen kişiyi etiketler - ( <@${authorId}> )\n` +
                `**• <üyeİsim>** => Gelen kişinin adını yazar - ( ${Util.recreateString(msg.author.displayName)} )\n` +
                `**• <üyeID>** => Gelen kişinin ID'sini yazar - ( ${authorId} )\n` +
                `**• <toplam>** => Sunucunun toplam üye sayısını yazar - ( ${Util.toHumanize(guild.memberCount, language)} )\n` +
                `**• <emojiToplam>** => Sunucunun toplam üye sayısını emojili halde yazar - ( ${Util.stringToEmojis(guild.memberCount)} )\n` +
                `**• <tarih>** => Hesabın kuruluş tarihini yazar - ( <t:${createdTimestampSecond}:F> )\n` +
                `**• <tarih2>** => Hesabın kuruluş tarihini yazar - ( <t:${createdTimestampSecond}:R> )\n` +
                `**• <tarih3>** => Hesabın kuruluş tarihini yazar - ( ${Time.toDateString(msg.author.createdTimestamp, language)} )\n` +
                `**• <güvenlik>** => Güvenli olup olmadığını gösterir - ( ${security} )`
            )
            .setImage("https://i.hizliresim.com/hjv5aum.png")
            .setColor("Blue")
            .setFooter({
                text:
                    "Cevap vermek için 8 dakikanız vardır"
            });

        msg.reply({
            embeds: [
                embed
            ]
        });
        return await waitMessage()
    },
};