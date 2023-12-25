"use strict";
const { EmbedBuilder } = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");
const {
    EMOJIS
} = require("../../../../settings.json");

module.exports = {
    name: "partner", // Komutun ismi
    id: "partner", // Komutun ID'si
    cooldown: 5, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "partner",
    ],
    description: "Sunucunun partner rolünü ayarlar", // Komutun açıklaması
    category: "Premium komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>partner <Seçenek>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
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

        // Eğer komutu kullanan kişide "Yönetici" yetkisi yoksa
        if (!msgMember.permissions.has("Administrator")) {
            const partnerRoleId = guildDatabase.premium.partnerRoleId;

            // Eğer sunucuda partner rolü ayarlanmamışsa
            if (!partnerRoleId) return msg.react(EMOJIS.no);

            // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
            const allMembers = await Util.getMembers(msg);
            const partnerMembers = allMembers.filter(member => !member.user.bot && member["_roles"].includes(partnerRoleId));

            // Eğer hiç kimsede yetkili rolü yoksa
            if (partnerMembers.size == 0) return msg.react(EMOJIS.no);

            // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
            const arrayMembers = Util.splitMessage({
                arrayString: partnerMembers.map(member => `<@${member.id}>`),
                firstString: `• <@&${partnerRoleId}>\n\n• **Partner yetkilileri (__${Util.toHumanize(partnerMembers.size, language)}__)**\n`,
                joinString: " | ",
                limit: 2000
            });

            // Bütün sayfaları teker teker mesaj olarak gönder
            for (let i = 0; i < arrayMembers.length; ++i) {
                await msg.channel.send({
                    content: arrayMembers[i],
                    allowedMentions: {
                        roles: [],
                        users: []
                    }
                });

                // 500 milisaniye bekle
                await Util.wait(500)
            }

            // En sonda ise rollere ve kullanıcılara bildirim gitmediğini belirten mesaj gönder
            return msg.channel.send(`*• Yukarıda etiketlenen **role ve üyelere** bildirim __gitmedi__*`);
        }

        switch (args[0]?.toLocaleLowerCase(language)) {
            // Eğer rolleri ayarlamak istiyorsa
            case "ayarla":
            case "rolayarla":
            case "setrole":
            case "setroles": {

                // Rolü ayarla
                const role = Util.fetchRole(msg);
                if (!role) return errorEmbed(
                    `• Partner rolünü ayarlamak için **${prefix}${this.name} ayarla @rol @rol @rol**\n\n` +
                    `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
                    "warn"
                );

                // Eğer rollerin içinde bot rolü varsa hata döndür
                if (role.managed) return errorEmbed(`Botların oluşturduğu rolleri başkalarına veremem`);

                // Database'ye kaydet
                guildDatabase.premium.partnerRoleId = role.id;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(
                    `Partner rolü başarıyla <@&${role.id}> olarak ayarlandı`,
                    "success"
                );
            }

            // Eğer partner rolünü sıfırlamak istiyorsa
            case "sıfırla":
            case "sifirla":
            case "reset": {
                // Eğer zaten sıfırlanmış ise
                if (!guildDatabase.premium.partnerRoleId) return errorEmbed("Partner rolü zaten sıfırlanmış durumda");

                guildDatabase.premium.partnerRoleId = "";
                database.writeFile(guildDatabase, guildId);
                return errorEmbed("Partner rolü başarıyla sıfırlandı", "success");
            }

            // Eğer bütün üyeleri etiket atmadan görmek istiyorsa
            case "gör":
            case "see": {
                const partnerRoleId = guildDatabase.premium.partnerRoleId;

                // Eğer rol ayarlanmamışsa hata döndür
                if (!partnerRoleId) return errorEmbed(
                    `Bu sunucuda herhangi bir partner yetkili rolü ayarlı değil\n\n` +
                    `• Ayarlamak için **${prefix}${this.name} ayarla @rol** yazabilirsiniz`
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(msg);
                const partnerMembers = allMembers.filter(member => !member.user.bot && member["_roles"].includes(partnerRoleId));

                // Eğer hiç kimsede yetkili rolü yoksa
                if (partnerMembers.size == 0) return errorEmbed("Şeyyy.. Partner yetkili rolüne kimse sahip değil şapşik şey seni")

                // Şimdi üyelerin ID'lerini discord embed karakter limitine göre (4096) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: partnerMembers.map(member => `<@${member.id}>`),
                    firstString: `• <@&${partnerRoleId}>\n\n• **Partner yetkilileri (__${Util.toHumanize(partnerMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 4096
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Bütün yetkililer")
                                .setDescription(arrayMembers[i])
                                .setColor("Blue")
                        ]
                    });

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }

            }

                break;

            // Eğer bütün üyelere etiket atarak görmek istiyorsa
            case "etiket":
            case "etiketle": {
                const partnerRoleId = guildDatabase.premium.partnerRoleId;

                // Eğer rol ayarlanmamışsa hata döndür
                if (!partnerRoleId) return errorEmbed(
                    `Bu sunucuda herhangi bir yetkili rolü ayarlı değil\n\n` +
                    `• Ayarlamak için **${prefix}${this.name} ayarla @rol** yazabilirsiniz`
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(msg);
                const partnerMembers = allMembers.filter(member => !member.user.bot && member["_roles"].includes(partnerRoleId));

                // Eğer hiç kimsede partner yetkili rolü yoksa
                if (partnerMembers.size == 0) return errorEmbed("Şeyyy.. Partner yetkili rolüne kimse sahip değil şapşik şey seni")

                // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: partnerMembers.map(member => `<@${member.id}>`),
                    firstString: `• <@&${partnerRoleId}>\n\n• **Partner yetkilileri (__${Util.toHumanize(partnerMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 2000
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send(arrayMembers[i]);

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }
            }

                break;

            // Eğer ayarlanan rolleri görmek istiyorsa
            case "rol":
            case "role":
            case "roles":
            case "rollerigör":
            case "roller": {
                const partnerRoleId = guildDatabase.premium.partnerRoleId;

                // Eğer rol ayarlanmamışsa hata döndür
                if (!partnerRoleId) return errorEmbed(
                    `Bu sunucuda herhangi bir partner yetkili rolü ayarlı değil\n\n` +
                    `• Ayarlamak için **${prefix}${this.name} ayarla @rol** yazabilirsiniz`
                );

                return msg.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**• Partner rolü:** <@&${partnerRoleId}>`
                            )
                            .setColor("Blue")
                    ]
                })
            }

            // Eğer hiçbir şey yazmamışsa bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• Partner yetkilisi rolü ayarlama için **${prefix}${this.name} ayarla**\n` +
                    `• Partner rolünü sıfırlamak için **${prefix}${this.name} sıfırla**\n` +
                    `• Bütün partner yetkililerini etiketlemek için **${prefix}${this.name} etiket**\n` +
                    `• Bütün partner yetkililerini bildirim gitmeden görmek için **${prefix}${this.name} gör**\n` +
                    `• Partner yetkilisi rolünü görmek için **${prefix}${this.name} rol** yazabilirsiniz`,
                    "warn",
                    30 * 1000 // Bu mesajı 30 saniye boyunca göster
                );
        }

    },
};