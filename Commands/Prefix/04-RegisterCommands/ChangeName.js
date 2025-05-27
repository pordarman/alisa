"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EMOJIS
} = require("../../../settings.json");
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "isim",
        en: "name"
    },
    id: "isim", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "isim",
            "i",
            "ismideğiştir",
            "isimdeğiştir",
            "changename",
            "name",
            "n",
            "changenick",
            "nick",
        ],
        en: [
            "name",
            "changename",
            "n",
            "changenick",
            "nick",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının ismini değiştirmeye yarar",
        en: "Used to change the user's name"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>isim <@kişi veya Kişi ID'si> <Yeni ismi>",
        en: "<px>name <@user or User ID> <New name>"
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
    }) {

        const {
            commands: {
                isim: messages
            },
            permissions: permissionMessages,
            registers: registerMessages,
            members: memberMessages,
            missingDatas: missingDatasMessages,
            unknownError: unknownErrorMessages,
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            registerMessages.noRegister({
                prefix,
                hasAdmin: msgMember.permissions.has("Administrator")
            })
        );

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed(permissionMessages.manageNicknames, "botPermissionError");

        const content = args.join(" ");

        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, content);
        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer sunucu sahibinin ismini değiştirmeye çalışıyorsa 
        if (memberId === guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kendi ismini değiştirmeye çalışıyorsa ve yetkisi yoksa
        if (memberId === authorId && !msgMember.permissions.has("ChangeNickname")) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer etiketlediği kişinin rolünün sırası bottan yüksekse hata döndür
        const highestRole = guildMe.roles.highest;
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= highestRole.position && memberId !== guildMe.id) return errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Eğer kendi rolünün üstünde bir kişiyi değiştirmeye çalışıyorsa
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId !== guild.ownerId && memberId !== authorId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        const customName = guildDatabase.register.customNames[member.user.bot ? "registerBot" : "register"];
        let memberName = content.replace(new RegExp(`<@!?${memberId}>|${memberId}`), "").trim();

        // Eğer kullanıcının ismini girmemişse hata döndür
        if (!memberName) return errorEmbed(
            messages.enter({
                prefix,
                memberId
            })
        );

        let age;

        // Eğer bir kişinin ismini değiştirmeye çalışıyorsa
        if (!member.user.bot) {
            // Kullanıcının ismindeki yaşı çek
            age = memberName.match(Util.regex.fetchAge)?.[0];

            // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
            if (!age && guildDatabase.register.isAgeRequired) return errorEmbed(registerMessages.enterAge);

            // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
            const ageLimit = guildDatabase.register.ageLimit;
            if (ageLimit && ageLimit > Number(age)) return errorEmbed(registerMessages.underAge(ageLimit));

            // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
            if (customName.search(/<(ya[sş]|age)>/) != -1) {
                memberName = memberName.replace(age, "").replace(/ +/g, " ");
            }
        }
        memberName = Util.customMessages.registerName({
            message: customName,
            name: memberName,
            guildDatabase,
            age,
            isBot: member.user.bot
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return errorEmbed(registerMessages.discordNameError);

        // Eğer kişinin ismi yazılan isimle aynıysa
        if (member.nickname === memberName) return errorEmbed(messages.sameName(memberId));

        // Kullanıcıyı düzenle
        member.setNickname(memberName)
            // Eğer düzenleme başarılıysa
            .then(async () => {
                if (Util.isMessage(msg)) {
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.yes)
                } else {
                    // Eğer mesaj bir Interaction objesi ise
                    errorEmbed(messages.success, "success")
                }

                const NOW_TIME = Date.now();

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const userLogObject = {
                    type: "changeName",
                    newName: memberName,
                    authorId,
                    timestamp: NOW_TIME
                };
                userLogs.unshift(userLogObject);
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0
                        }
                    }
                });

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeName({
                        memberId,
                        highestRoleId: Util.getBotOrHighestRole(guildMe).id
                    }),
                    allowedMentions: {
                        users: [],
                        roles: []
                    },
                    flags: MessageFlags.Ephemeral
                })

                console.error(err)
                return msg.reply({
                    content: unknownErrorMessages.unknownError(err),
                    flags: MessageFlags.Ephemeral
                });
            })

    },
};