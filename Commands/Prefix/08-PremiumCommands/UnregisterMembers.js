"use strict";
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtsızlar",
        en: "unregistermembers"
    },
    id: "kayıtsızlar", // Komutun ID'si
    cooldown: 30, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtsızlar",
            "kayıtsızüye",
            "kayıtsızüyeler"
        ],
        en: [
            "unregistermembers",
            "unregistermember"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bütün kayıtsız üyeleri etiketler",
        en: "Tags all unregistered members"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Premium komutları",
        en: "Premium commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtsızlar",
        en: "<px>unregistermembers"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        guild,
        msgMember,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                kayıtsızlar: messages
            },
            permissions: permissionMessages,
            roles: roleMessages,
            others: {
                commandNames
            }
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            roleMessages.roleNotSet({
                roleName: messages.unregister,
                hasAdmin: msgMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix,
                    commandName: commandNames.unregisterRole
                }
            })
        );

        const allMembers = await Util.getMembers(guild);

        const unregisteredMembers = allMembers.filter(member => member["_roles"].includes(unregisterRoleId));

        // Eğer hiç kimsede kayıtsız rolü yoksa
        if (unregisteredMembers.size == 0) return msg.reply(messages.nooneHasUnregistered);

        // Şimdi üyelerin ID'lerini discord karakter limitine göre (1024) göre düzenle ve mesaj olarak gönder
        const arrayMembers = Util.splitMessage({
            arrayString: unregisteredMembers.map(member => `<@${member.id}>`),
            firstString: `• <@&${unregisterRoleId}>\n\n• **${messages.unregisters} (__${Util.toHumanize(unregisteredMembers.size, language)}__)**\n`,
            joinString: " | ",
            limit: 2000
        });

        // Bütün sayfaları teker teker mesaj olarak gönder
        for (let i = 0; i < arrayMembers.length; ++i) {
            await msg.channel.send(arrayMembers[i]);

            // 500 milisaniye bekle
            await Util.wait(500);
        }

    },
};