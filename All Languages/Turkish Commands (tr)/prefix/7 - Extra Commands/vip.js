"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "vip", // Komutun ismi
    id: "vip", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "vip",
        "viprol",
        "vip-rol",
        "vipyetkili",
        "vipver",
        "vip-ver"
    ],
    description: "Vip ile ilgili komutları gösterir", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>vip <Seçenekler>", // Komutun kullanım şekli
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
        guildMe,
        guildId,
        guild,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Girdiği seçeneklere göre kodu çalıştır
        switch (args[0]?.toLocaleLowerCase()) {

            // Eğer vip rolü ayarlamak istiyorsa
            case "role":
            case "viprol":
            case "vrol":
            case "rol": {
                // Eğer kullanıcıda "Yönetici" yetkisine sahip değilse hata döndür
                if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

                const roleId = args.join(" ");

                // Eğer rolü sıfırlamaya çalışıyorsa
                if (["sıfırla", "sifirla"].includes(roleId.toLocaleLowerCase(language))) {

                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.roleIds.vip == "") return errorEmbed("Vip rolü zaten sıfırlanmış durumda");

                    // Database'ye kaydet
                    guildDatabase.roleIds.vip = "";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("Vip rolü başarıyla sıfırlandı", "success");
                }

                // Rolü ayarla
                const role = Util.fetchRole(msg);

                // Eğer rolü etiketlememişse hata döndür
                if (!role) return errorEmbed(
                    `• Vip rolü ayarlamak için **${prefix}${this.name} rol @rol**\n` +
                    `• Sıfırlamak için ise **${prefix}${this.name} rol sıfırla** yazabilirsiniz`,
                    "warn"
                );

                // Eğer bot rolü etiketlemişse hata döndür
                if (role.managed) return errorEmbed(`Botların oluşturduğu rolleri başkalarına veremem`);

                // Eğer ayarlanan rolü etiketlemişse hata döndür
                if (guildDatabase.roleIds.vip === role.id) return errorEmbed("Vip rolü zaten etiketlediğiniz rolle aynı");

                // Eğer vip yetkili rolünü etiketlemişse hata döndür
                if (role.id == guildDatabase.roleIds.vipAuth) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki vip yetkili rolü. Lütfen başka bir rol etiketleyiniz`);

                // Database'ye kaydet
                guildDatabase.roleIds.vip = role.id;
                database.writeFile(guildDatabase, guildId);
                return errorEmbed(`Vip rolü başarıyla <@&${role.id}> olarak ayarlandı`, "success");
            }

            // Eğer vip yetkili rolünü ayarlamak istiyorsa
            case "vipyetkilirol":
            case "yetkilirol":
            case "yetkili": {
                // Eğer kullanıcıda "Yönetici" yetkisine sahip değilse hata döndür
                if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

                const roleId = args.join(" ");

                // Eğer rolü sıfırlamaya çalışıyorsa
                if (["sıfırla", "sifirla"].includes(roleId.toLocaleLowerCase(language))) {

                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.roleIds.vipAuth == "") return errorEmbed("Vip yetkili rolü zaten sıfırlanmış durumda");

                    // Database'ye kaydet
                    guildDatabase.roleIds.vipAuth = "";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("Vip yetkili rolü başarıyla sıfırlandı", "success");
                }

                // Rolü ayarla
                const role = Util.fetchRole(msg);

                // Eğer rolü etiketlememişse hata döndür
                if (!role) return errorEmbed(
                    `• Vip yetkili rolü ayarlamak için **${prefix}${this.name} yetkili @rol**\n` +
                    `• Sıfırlamak için ise **${prefix}${this.name} yetkili sıfırla** yazabilirsiniz`,
                    "warn"
                );

                // Eğer bot rolü etiketlemişse hata döndür
                if (role.managed) return errorEmbed(`Botların oluşturduğu rolleri başkalarına veremem`);

                // Eğer ayarlanan rolü etiketlemişse hata döndür
                if (guildDatabase.roleIds.vip === role.id) return errorEmbed("Vip rolü zaten etiketlediğiniz rolle aynı");

                // Eğer vip rolünü etiketlemişse hata döndür
                if (role.id == guildDatabase.roleIds.vip) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki vip rolü. Lütfen başka bir rol etiketleyiniz`);

                // Database'ye kaydet
                guildDatabase.roleIds.vipAuth = role.id;
                database.writeFile(guildDatabase, guildId);
                return errorEmbed(`Vip rolü başarıyla <@&${role.id}> olarak ayarlandı`, "success");
            }

            // Eğer vip rolünü almak istiyorsa
            case "al":
            case "rolal":
            case "viprolal": {
                const memberId = args[1];

                // Eğer bir kişiyi etiketlememişse
                if (!memberId) return errorEmbed(
                    `• Bir kişiye vip rolünü vermek için **${prefix}${this.name} @kişi**\n` +
                    `• Bir kişiden vip rolünü almak için **${prefix}${this.name} al @kişi**\n` +
                    `• Vip rolünü ayarlamak için **${prefix}${this.name} rol @rol**\n` +
                    `• Vip yetkili rolünü ayarlamak için **${prefix}${this.name} yetkili @rol** yazabilirsiniz`,
                    "warn"
                );

                // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
                const authorizedRoleId = guildDatabase.roleIds.vipAuth;
                if (authorizedRoleId) {
                    // Eğer kullanıcıda yetkili rolü yoksa hata döndür
                    if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
                }
                // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
                else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

                // Vip rolünün ayarlanıp ayarlanmadığını kontrol et
                const vipRoleId = guildDatabase.roleIds.vip
                if (!vipRoleId) return errorEmbed(
                    `Bu sunucuda herhangi bir vip rolü __ayarlanmamış__` +
                    (msgMember.permissions.has("Administrator") ?
                        `\n\n• Ayarlamak için **${prefix}${this.name} rol @rol** yazabilirsiniz` :
                        "")
                );

                // Eğer botta "Rolleri yönet" yetkisi yoksa hata döndür
                if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

                const member = msg.mentions.members.first() || await Util.fetchMember(msg, memberId);
                if (!member) return errorEmbed(
                    member === null ?
                        "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                        "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
                );

                // Eğer kullanıcı bota
                if (member.bot) return errorEmbed("Botlardan vip rolünü alamazsın şapşik şey seni :)");

                if (!member["_roles"].includes(vipRoleId)) return errorEmbed(`Etiketlediğiniz kişide zaten vip rolü bulunmuyor`);

                // Eğer vip rolü botun rolünün üstündeyse hata döndür
                const highestRole = guildMe.roles.highest;
                if (guild.roles.cache.get(vipRoleId).position >= highestRole.position) return errorEmbed(`<@&${vipRoleId}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                // Kullanıcıdan rolü almayı dene
                return await member.roles.remove(vipRoleId)
                    // Eğer başarılı olursa
                    .then(() => {
                        msg.react(EMOJIS.yes)
                    })
                    // Eğer bir hata oluşursa
                    .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${member.id}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                        console.log(err);
                        return msg.reply(
                            `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                            `\`\`\`js\n` +
                            `${err}\`\`\``
                        );
                    })
            }

            // Eğer hiçbir şey girmemişse
            default: {
                const memberId = args[0];

                // Eğer bir kişiyi etiketlememişse
                if (!memberId) return errorEmbed(
                    `• Bir kişiye vip rolünü vermek için **${prefix}${this.name} @kişi**\n` +
                    `• Bir kişiden vip rolünü almak için **${prefix}${this.name} al @kişi**\n` +
                    `• Vip rolünü ayarlamak için **${prefix}${this.name} rol @rol**\n` +
                    `• Vip yetkili rolünü ayarlamak için **${prefix}${this.name} yetkili @rol** yazabilirsiniz`,
                    "warn"
                );

                // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
                const authorizedRoleId = guildDatabase.roleIds.vipAuth;
                if (authorizedRoleId) {
                    // Eğer kullanıcıda yetkili rolü yoksa hata döndür
                    if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
                }
                // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
                else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

                // Vip rolünün ayarlanıp ayarlanmadığını kontrol et
                const vipRoleId = guildDatabase.roleIds.vip
                if (!vipRoleId) return errorEmbed(
                    `Bu sunucuda herhangi bir vip rolü __ayarlanmamış__` +
                    (msgMember.permissions.has("Administrator") ?
                        `\n\n• Ayarlamak için **${prefix}${this.name} rol @rol** yazabilirsiniz` :
                        "")
                );

                // Eğer botta "Rolleri yönet" yetkisi yoksa hata döndür
                if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

                const member = msg.mentions.members.first() || await Util.fetchMember(msg, memberId);
                if (!member) return errorEmbed(
                    member === null ?
                        "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                        "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
                );

                // Eğer kullanıcı bota
                if (member.bot) return errorEmbed("Botlara vip rolünü veremezsin şapşik şey seni :)");

                if (member["_roles"].includes(vipRoleId)) return errorEmbed(`Etiketlediğiniz kişide zaten vip rolü bulunuyor`);

                // Eğer vip rolü botun rolünün üstündeyse hata döndür
                const highestRole = guildMe.roles.highest;
                if (guild.roles.cache.get(vipRoleId).position >= highestRole.position) return errorEmbed(`<@&${vipRoleId}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                // Kullanıcıya rolü vermeyi dene
                return await member.roles.add(vipRoleId)
                    // Eğer başarılı olursa
                    .then(() => {
                        msg.react(EMOJIS.yes)
                    })
                    // Eğer bir hata oluşursa
                    .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${member.id}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                        console.log(err);
                        return msg.reply(
                            `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                            `\`\`\`js\n` +
                            `${err}\`\`\``
                        );
                    })
            }
        }

    },
};