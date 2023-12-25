"use strict";
const database = require("../../../../Helpers/Database");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıtsız", // Komutun ismi
    id: "kayıtsız", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıtsız",
        "kayıtsızat",
        "unregister"
    ],
    description: "Kullanıcıyı kayıtsıza atar", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıtsız <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
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
        guildMePermissions,
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

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kayıtsız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]);

        // Eğer kişiyi etiketlememişse
        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer komutu botun üzerinde denemeye çalışıyorsa
        if (member.user.bot) return errorEmbed("Bu komut botlar üzerinde kullanılmaz");

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("Bu komutu kendinde kullanamazsın şapşik şey seni :)");

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("Etiketlediğiniz kişinin rolünün sırası sizin rolünüzün sırasından yüksek olduğu için bunu yapamazsınız");

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
                msg.reply(`• ⚒️ <@${member.user.id}> adlı kişiden tüm rolleri alıp başarıyla kayıtsız rolünü verdim`);

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
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                console.log(err);
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            });

    },
};