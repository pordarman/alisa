"use strict";
const database = require("../../../Helpers/Database");
const Util = require("../../../Helpers/Util");
const allMessages = require("../../../Helpers/Localizations/Index");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "rankrol",
        en: "rankrole"
    },
    id: "rankrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "rankrol",
            "rank-rol",
            "rankrolü",
            "rank-rolü",
            "rankrole",
        ],
        en: [
            "rankrole",
            "rank-role",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının kayıt etme sayısına verilecek rolleri belirler",
        en: "Gives a role according to the user's registration count"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "rankrol <ekle/kaldır/düzenle/liste> [kayıt sayısı] [rol]",
        en: "rankrole <add/remove/edit/list> [registration count] [role]"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        alisa,
        msg,
        guildDatabase,
        guildId,
        guildMe,
        guildMePermissions,
        guild,
        msgMember,
        args,
        prefix,
        authorId,
        language,
        errorEmbed,
        isOwner,
        premium
    }) {

        const {
            commands: {
                rankrol: messages
            },
            permissions: permissionMessages,
            roles: roleMessages,
            switchs: {
                registerCountRoles: registerCountRolesSwitchs
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        switch (registerCountRolesSwitchs(args[0]?.toLocaleLowerCase(language))) {

            // Eğer yeni bir rol eklemek istiyorsa
            case "set": {
                const role = Util.fetchRole(msg);
                if (!role) return errorEmbed(messages.enterAdd(prefix), "warn");

                let number;

                // Argslarda dolaş ve sayıyı ve rolü al
                for (let i = 1; i < args.length; i++) {
                    number = parseInt(args[i]);

                    // Eğer sayı varsa sayıyı kontrol et ve eğer geçerliyse döngüyü kır
                    if (number) {
                        if (number > 0 && number < 9999) break;
                    }
                }

                // Eğer sayı yoksa hata döndür
                if (!number) return errorEmbed(messages.enterAdd(prefix), "warn");

                // Eğer rol bot rolüyse hata döndür
                if (role.managed) return errorEmbed(roleMessages.botRole);

                // Eğer rolün sırası botun sırasından yüksekse hata döndür
                if (role.position > guildMe.roles.highest.position) return errorEmbed(roleMessages.roleIsHigherThanMe({
                    roleId: role.id,
                    highestRoleId: Util.getBotOrHighestRole(guildMe).id
                }));

                // Eğer rol daha önceden eklenmişse hata döndür
                const findRankCount = Object.entries(guildDatabase.register.rankRoles).find(([_, roleId]) => roleId === role.id)?.[0];
                if (findRankCount) return errorEmbed(messages.roleAlreadyExists(findRankCount));

                // Eğer sayı 0'dan küçükse hata döndür
                if (number <= 0) return errorEmbed(messages.negativeNumber);

                // Eğer sayı daha önceden eklenmişse hata döndür
                if (guildDatabase.register.rankRoles[number]) return errorEmbed(messages.numberAlreadyExists(guildDatabase.register.rankRoles[number]));

                // Rolü ekle
                guildDatabase.register.rankRoles[number] = role.id;
                await database.updateGuild(guildId, {
                    $set: {
                        [`register.rankRoles.${number}`]: role.id
                    }
                });

                return errorEmbed(
                    messages.successAdd({
                        rankCount: number,
                        rankRoleId: role.id
                    }),
                    "success"
                );
            }

            // Eğer eklenen rolü kaldırmak istiyorsa
            case "remove": {
                const role = Util.fetchRole(msg);
                if (!role) return errorEmbed(messages.enterRemove(prefix), "warn");

                let number;

                // Argslarda dolaş ve sayıyı ve rolü al
                for (let i = 1; i < args.length; i++) {
                    number = parseInt(args[i]);

                    // Eğer sayı varsa sayıyı kontrol et ve eğer geçerliyse döngüyü kır
                    if (number) {
                        if (number > 0 && number < 9999) break;
                    }
                }

                // Eğer sayı yoksa hata döndür
                if (!number) return errorEmbed(messages.enterRemove(prefix), "warn");

                // Eğer rol girilmişse rolünden key'ine ulaş
                if (!number) number = Object.entries(guildDatabase.register.rankRoles).find(([key, roleId]) => roleId === role.id)?.[0];

                // Eğer sayı yoksa hata döndür
                if (!number) return errorEmbed(messages.noNumberOrRoleData);

                // Rolü sil
                delete guildDatabase.register.rankRoles[number];
                await database.updateGuild(guildId, {
                    $unset: {
                        [`register.rankRoles.${number}`]: ""
                    }
                });

                return errorEmbed(
                    messages.successRemove(role.id),
                    "success"
                );
            }


            // Eğer eklenen rolü düzenlemek istiyorsa
            case "change": {
                const role = Util.fetchRole(msg);
                if (!role) return errorEmbed(messages.enterChange(prefix), "warn");

                let number;

                // Argslarda dolaş ve sayıyı ve rolü al
                for (let i = 1; i < args.length; i++) {
                    number = parseInt(args[i]);

                    // Eğer sayı varsa sayıyı kontrol et ve eğer geçerliyse döngüyü kır
                    if (number) {
                        if (number > 0 && number < 9999) break;
                    }
                }

                // Eğer sayı yoksa hata döndür
                if (!number) return errorEmbed(messages.enterChange(prefix), "warn");

                // Eğer rol bot rolüyse hata döndür
                if (role.managed) return errorEmbed(roleMessages.botRole);

                // Eğer rolün sırası botun sırasından yüksekse hata döndür
                if (role.position > guildMe.roles.highest.position) return errorEmbed(roleMessages.roleIsHigherThanMe({
                    roleId: role.id,
                    highestRoleId: Util.getBotOrHighestRole(guildMe)
                }));

                // Eğer rol daha önceden eklenmemişse hata döndür
                if (!guildDatabase.register.rankRoles[number]) return errorEmbed(messages.noNumberData);

                // Eğer sayı daha önceden eklenmişse hata döndür
                if (guildDatabase.register.rankRoles[number] === role.id) return errorEmbed(messages.roleIsAlreadySame);

                // Rolü değiştir
                guildDatabase.register.rankRoles[number] = role.id;
                await database.updateGuild(guildId, {
                    $set: {
                        [`register.rankRoles.${number}`]: role.id
                    }
                });

                return errorEmbed(
                    messages.successChange({
                        rankCount: number,
                        rankRoleId: role.id
                    }),
                    "success"
                );
            }

            // Eğer eklenen rolleri listelemek istiyorsa
            case "list": {
                const allDatas = Object.entries(guildDatabase.register.rankRoles);
                const length = allDatas.length;

                // Eğer bu sunucuda daha önceden hiç rank rolü eklenmemişse hata döndür
                if (!length) return errorEmbed(messages.noData);

                const guildIcon = guildId.iconURL();

                return createMessageArrows({
                    msg,
                    array: allDatas, 
                    async arrayValuesFunc({
                        result: [rankCount, roleId]
                    }) {
                        return `• ${rankCount} - <@&${roleId}>`
                    },
                    embed: {
                        author: {
                            name: guild.name,
                            iconURL: guildIcon
                        }
                    },
                    forwardAndBackwardCount: 5,
                    VALUES_PER_PAGE: 15,
                    language
                });
            }

            // Eğer eklenen bütün rolleri silmek istiyorsa
            case "reset": {
                // Eğer bu sunucuda daha önceden hiç rank rolü eklenmemişse hata döndür
                if (!Object.keys(guildDatabase.register.rankRoles).length) return errorEmbed(messages.noData);

                // Rolü sıfırla
                guildDatabase.register.rankRoles = {};
                await database.updateGuild(guildId, {
                    $unset: {
                        "register.rankRoles": ""
                    }
                });

                return errorEmbed(messages.successReset, "success");
            }

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default: {
                return errorEmbed(
                    messages.enter(prefix),
                    "warn"
                )
            }
        }

    },
};