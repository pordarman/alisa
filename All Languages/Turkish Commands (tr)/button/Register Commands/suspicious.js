"use strict";
const {
    RESTJSONErrorCodes
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "suspicious", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı şüpheliye atar", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        alisa,
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        const intMember = int.member;

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const guildMe = guild.members.me;

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

        const [_, memberId] = customId.split("-");
        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(");

        // Eğer kullanıcı kendi kendini şüpheliye atmaya çalışıyorsa
        if (memberId === authorId) return errorEmbed("Kendi kendini şüpheliye atamazsın şapşik şey seni :)")

        // Eğer sunucu sahibini şüpheliye atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini şüpheliye atamazsın şapşik şey seni :)");

        // Eğer şüpheli rolü ayarlanmamışsa
        const suspiciousRoleId = guildDatabase.suspicious.roleId;
        if (!suspiciousRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir şüpheli rolü __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
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

                int.message.reply(`• ⛔ <@${memberId}> adlı kişi <@${authorId}> tarafından Şüpheli'ye atıldı!`)
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                // Eğer kişi sunucuda değilse
                if (err.code == RESTJSONErrorCodes.UnknownMember) return int.reply({
                    content: "• Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(",
                    ephemeral: true
                });

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `• <@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    ephemeral: true,
                    allowedMentions: {
                        roles: []
                    }
                });

                console.log(err)
                return int.reply({
                    content: `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``,
                    ephemeral: true
                });
            });
    },
};