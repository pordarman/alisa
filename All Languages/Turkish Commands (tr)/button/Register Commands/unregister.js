"use strict";
const database = require("../../../../Helpers/Database");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kickUnregistered", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı kayıtsıza atar", // Butonun açıklaması
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

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        const guildMe = guild.members.me;
        const guildMePermissions = guildMe.permissions;
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kayıtsız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );

        const memberId = int.customId.split("-")[1];
        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(");

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("Bu komutu kendinde kullanamazsın şapşik şey seni :)");

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= intMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("Etiketlediğiniz kişinin rolünün sırası sizin rolünüzün sırasından yüksek olduğu için bunu yapamazsınız");

        // Kişinin rolü botun sırasının üstündeyse hata döndür
        const highestRole = guildMe.roles.highest;
        if (memberHighestRolePosition >= highestRole.position) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek olduğu için onu kayıtsıza atamam`)

        // Eğer kayıtsız rolünün sırası botun üstündeyse hata döndür
        if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) return errorEmbed("Kayıtsız rolünün sırası benim rolümün sırasından yüksek olduğu için kullanıcıyı kayıtsıza atamam");

        // Eğer kişi zaten kayıtsıza atılmışsa
        if (member["_roles"].length == 1 && member["_roles"].includes(unregisterRoleId)) return errorEmbed("Etiketlediğiniz kişi zaten kayıtsız alınmış durumda");

        // Kişinin ismini ayarla

        const memberName = Util.customMessages.unregisterName({
            message: guildDatabase.register.customNames.guildAdd,
            guildDatabase,
            name: member.user.displayName
        }).slice(0, Util.MAX.usernameLength);

        // Kişiyi düzenle
        return await member.edit({
            roles: [unregisterRoleId],
            nick: memberName
        })
            // Eğer düzenleme başarılıysa
            .then(() => {
                int.message.reply(`• ⚒️ <@${authorId}>, <@${memberId}> adlı kişiden tüm rolleri alıp başarıyla kayıtsız rolünü verdim`);

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const NOW_TIME = Date.now();
                userLogs.unshift({
                    type: "unregister",
                    authorId,
                    timestamp: NOW_TIME
                });
                database.writeFile(guildDatabase, guildId);
            })
            // Eğer düzenleme başarısızsa
            .catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `<@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    ephemeral: true
                });

                console.log(err);
                return int.reply({
                    content: `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``,
                    ephemeral: true
                });
            });
    },
};