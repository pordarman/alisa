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
    name: "name", // Komutun ismi
    id: "isim", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "name",
        "changename",
        "n"
    ],
    description: "Used to change the user's name", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>name <@user or User ID> <New name>", // Komutun kullanım şekli
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
        authorId,
        args,
        prefix,
        errorEmbed
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        const content = args.join(" ");

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);
        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer sunucu sahibinin ismini değiştirmeye çalışıyorsa 
        if (memberId === guild.ownerId) return errorEmbed(`I can't change the server owner's name, you stupid thing :(`);

        // Eğer kendi ismini değiştirmeye çalışıyorsa ve yetkisi yoksa
        if (memberId === authorId && !msgMember.permissions.has("ChangeNickname")) return errorEmbed(`You can't change your own name you stupid thing :(`);

        // Eğer etiketlediği kişinin rolünün sırası bottan yüksekse hata döndür
        const highestRole = guildMe.roles.highest;
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= highestRole.position && memberId !== guildMe.id) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        // Eğer kendi rolünün üstünde bir kişiyi değiştirmeye çalışıyorsa
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId !== guild.ownerId && memberId !== authorId) return errorEmbed(`The person you tagged is higher than your role, so you cannot change their name`);

        const customName = guildDatabase.register.customNames[member.user.bot ? "registerBot" : "register"];
        let memberName = content.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").trim();

        // Eğer kullanıcının ismini girmemişse hata döndür
        if (!memberName) return errorEmbed(
            `Please enter the name of the person whose name you will change\n\n` +
            `**Example**\n` +
            `• ${prefix}n ${memberId} Fearless Crazy 20\n` +
            `• ${prefix}n <@${memberId}> Fearless Crazy 20\n` +
            `• ${prefix}n Fearless Crazy 20 <@${memberId}>`
        );

        let inputAge;

        // Eğer bir kişinin ismini değiştirmeye çalışıyorsa
        if (!member.user.bot) {

            // Kullanıcının ismindeki yaşı çek
            inputAge = memberName.match(Util.regex.fetchAge);

            // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
            if (!inputAge && guildDatabase.register.isAgeRequired) return errorEmbed("Heyyy, wait there! You must enter a valid age when registering on this server!");

            // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
            const ageLimit = guildDatabase.register.ageLimit ?? -1;
            if (ageLimit > Number(inputAge?.[0])) return errorEmbed(`Heyyy, wait there! You cannot register anyone under the age of **${ageLimit}** on this server!`);

            // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
            if (customName.search(/<(ya[sş]|age)>/) != -1) {
                memberName = memberName.replace(inputAge?.[0], "").replace(/ +/g, " ");
            }
        }
        memberName = Util.customMessages.registerName({
            message: customName,
            memberName,
            guildDatabase,
            inputAge,
            isBot: member.user.bot
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return errorEmbed("Server name cannot exceed 32 characters! Please reduce the number of characters");

        // Eğer kişinin ismi yazılan isimle aynıysa
        if (member.nickname === memberName) return errorEmbed(`<@${memberId}>'s name is already the same as the name you wrote`);

        // Kullanıcıyı düzenle
        return await member.setNickname(memberName)
            // Eğer düzenleme başarılıysa
            .then(() => {
                msg.react(EMOJIS.yes);

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const NOW_TIME = Date.now();
                userLogs.unshift({
                    type: "changeName",
                    newName: memberName,
                    authorId,
                    timestamp: NOW_TIME
                });
                return database.writeFile(guildDatabase, guildId);

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`• I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

                console.log(err)
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};