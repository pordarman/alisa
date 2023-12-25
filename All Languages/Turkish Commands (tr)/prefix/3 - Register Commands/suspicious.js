"use strict";
const {
    RESTJSONErrorCodes
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "şüpheli", // Komutun ismi
    id: "şüpheli", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "şüpheli",
        "şüpheliat",
        "suspicious"
    ],
    description: "Kullanıcıyı şüpheliye atar", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>şüpheli <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
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
        language,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

        const member = await Util.fetchMemberForce(int, args[0]);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer kullanıcı kendi kendini şüpheliye atmaya çalışıyorsa
        if (memberId === authorId) return errorEmbed("Kendi kendini şüpheliye atamazsın şapşik şey seni :)")

        // Eğer sunucu sahibini şüpheliye atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini şüpheliye atamazsın şapşik şey seni :)");

        // Eğer şüpheli rolü ayarlanmamışsa
        const suspiciousRoleId = guildDatabase.suspicious.roleId;
        if (!suspiciousRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir şüpheli rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}şüpheli-rol @rol** yazabilirsiniz` :
                "")
        );

        // Eğer kullanıcıda şüpheli rol zate varsa
        if (member["_roles"].includes(suspiciousRoleId)) return errorEmbed("Heyyy dur bakalım orada! Bu kişi zaten şüpheliye atılmış durumda!");

        // Kullanıcıyı düzenle
        return await member.edit({
            roles: [suspiciousRoleId]
        })
            // Eğer düzenleme başarılıysa
            .then(() => {
                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "suspicious",
                    author: authorId,
                    timestamp: NOW_TIME,
                });

                // Database'yi kaydet
                database.writeFile(guildDatabase, guildId);

                msg.reply(`• ⛔ <@${memberId}> adlı kişi <@${authorId}> tarafından Şüpheli'ye atıldı!`)
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                // Eğer kişi sunucuda değilse
                if (err.code == RESTJSONErrorCodes.UnknownMember) return msg.reply("• Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(");

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: `• <@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    allowedMentions: {
                        roles: []
                    }
                });

                console.log(err)
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            });

    },
};