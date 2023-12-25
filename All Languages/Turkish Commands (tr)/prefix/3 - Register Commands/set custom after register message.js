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
    name: "günlüközel", // Komutun ismi
    id: "günlüközel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "günlüközel",
        "günlüközelmesaj",
        "afterregistermessage",
        "afterregister",
    ],
    description: "Kayıt sonrası mesajını özelleştirebilmenizi sağlar", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>günlüközel", // Komutun kullanım şekli
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
                .then(async messages => {
                    delete guildDatabase.waitMessageCommands.customAfterRegister;
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
                            if (!guildDatabase.register.customAfterRegister) return message.reply("Kayıt sonrası özelleştirilmiş mesajı zaten ayarlı değil");

                            // Database'ye kaydet
                            guildDatabase.register.customAfterRegister = {
                                content: "",
                                image: "",
                                isEmbed: false,
                            }
                            database.writeFile(guildDatabase, guildId);

                            return message.reply(`${EMOJIS.yes} Kayıt sonrası özelleştirilmiş mesajı başarıyla sıfırlandı`);
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
                            guildDatabase.register.customAfterRegister = {
                                content: newString,
                                image,
                                isEmbed,
                            };
                            database.writeFile(guildDatabase, guildId);

                            await message.reply(
                                `${EMOJIS.yes} Kayıt sonrası özelleştirilmiş mesajı başarıyla ayarlandı\n\n` +
                                `**Şöyle gözükecek**`
                            );

                            const messageContent = Util.customMessages.afterRegisterMessage({
                                message: newString,
                                language,
                                memberId: clientUser.id,
                                recreateMemberName: recreateClientName,
                                givenRolesString: "__**VERİLEN ROLLER**__ (Bu role sahip olanlara bildirim gitmeyecek)",
                                memberCount: guild.memberCount,
                                authorId,
                                recreateAuthorName,
                                guildTag,
                                toHumanizeRegisterCount: "888"
                            });

                            const allMessages = Util.afterRegisterMessages[language].normal;

                            return msg.reply(
                                isEmbed ?
                                    // Eğer mesajı embed olarak ayarlamışlarsa
                                    {
                                        content: allMessages[Math.floor(Math.random() * allMessages.length)].replace("<m>", `<@${clientUser.id}>`),
                                        embeds: [
                                            new EmbedBuilder()
                                                .setTitle(`Aramıza hoşgeldin ${recreateClientName} ${EMOJIS.hi}`)
                                                .setDescription(messageContent)
                                                .setThumbnail(msg.client.user.displayAvatarURL())
                                                .setImage(image ?? null)
                                                .setColor("Random")
                                                .setTimestamp()
                                        ]
                                    } :
                                    // Eğer kutusuz olarak ayarlamışlarsa
                                    {
                                        content: messageContent,
                                        files: image ?
                                            [new AttachmentBuilder(image)] :
                                            [],
                                        allowedMentions: {
                                            roles: [],
                                            users: [clientUser.id]
                                        }
                                    }
                            )
                        }
                    }

                    // Eğer işlemi sıfırladıysa
                })
                // Eğer mesaj atmadıysa
                .catch(() => {
                    msg.reply(`⏰ <@${authorId}>, süreniz bitti!`);

                    delete guildDatabase.waitMessageCommands.customAfterRegister;
                    database.writeFile(guildDatabase, guildId);
                });
        }

        const guildTag = guildDatabase.register.tag;
        const clientUser = msg.client.user;
        const recreateClientName = Util.recreateString(clientuser.displayName);
        const recreateAuthorName = Util.recreateString(msg.author.displayName);

        // Eğer bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır
        if (extras) return await waitMessage();

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "yetki");

        // Eğer bu komut şu anda çalışıyorsa
        if (guildDatabase.waitMessageCommands.customAfterRegister) return errorEmbed(`Heyy dur bakalım orada! Şu anda başka bir yetkili özel mesajı ayarlıyor!`);

        const NOW_TIME = Date.now();
        // Eğer bot yeniden başlarsa gerekli verileri database'ye yazdır
        guildDatabase.waitMessageCommands.customAfterRegister = {
            commandName: this.name,
            channelId: msg.channelId,
            messageId: msg.id,
            authorId,
            timestamp: NOW_TIME
        };
        database.writeFile(guildDatabase, guildId);

        const embed = new EmbedBuilder()
            .setTitle("Şimdi düşünme zamanı")
            .setDescription(
                `• İptal etmek için **iptal**\n` +
                `• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n` +
                `**Kayıt sonrası mesajının kutusuz olmasını istiyorsanız yazacağın mesajın başına <kutusuz> yazman yeterli!**\n\n` +
                `**Değişkenler**\n` +
                `**• <üye>** => Kayıt edilen kişiyi etiketler - ( <@${clientUser.id}> )\n` +
                `**• <üyeİsim>** => Kayıt edilen kişinin adını yazar - ( ${recreateClientName} )\n` +
                `**• <üyeID>** => Kayıt edilen kişinin ID'sini yazar - ( ${clientUser.id} )\n` +
                `**• <rol>** => Verilen rolü etikerler (bu role sahip olanlara bildirim gitmez) - ( @Roller )\n` +
                `**• <tag>** => Sunucunun tag(larını) yazar - ( ${guildTag || "**TAG YOK**"} )\n` +
                `**• <toplam>** => Sunucuda bulunan kişi sayısını yazar - ( ${Util.toHumanize(guild.memberCount, language)} )\n` +
                `**• <emojiToplam>** => Sunucuda bulunan kişi sayısını emojili yazar - ( ${Util.stringToEmojis(guild.memberCount)} )\n` +
                `**• <yetkili>** => Kayıt eden yetkiliyi etiketler - ( <@${authorId}> )\n` +
                `**• <yetkiliİsim>** => Kayıt eden yetkilinin tüm adını yazar - ( ${recreateAuthorName} )\n` +
                `**• <yetkiliID>** => Kayıt eden yetkilinin ID'sini yazar - ( ${authorId} )\n` +
                `**• <kayıttoplam>** => Kayıt eden yetkilinin kayıt sayısını yazar - ( 888 )`
            )
            .setImage("https://i.hizliresim.com/dbe56m0.png")
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