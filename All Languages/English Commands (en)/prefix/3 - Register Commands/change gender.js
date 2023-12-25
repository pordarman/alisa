"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RESTJSONErrorCodes
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "change", // Komutun ismi
    id: "değiştir", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "change",
        "changerole",
        "changeroles"
    ],
    description: "Changes the user's gender", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>change <@user or User ID>", // Komutun kullanım şekli
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
        errorEmbed,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed("This command is only for those who register with __**Gender**__");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer botta "Rolleri Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

        const {
            boy: boyRoleIds,
            girl: girlRoleIds,
        } = guildDatabase.register.roleIds;

        // Eğer kız veya erkek rollerinden birisi yoksa hata döndür
        if (girlRoleIds.length == 0) return errorEmbed(
            `Girl roles are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}girl-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        if (boyRoleIds.length == 0) return errorEmbed(
            `Boy roles are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}boy-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]);

        // Eğer kişiyi etiketlememişse
        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer komutu botun üzerinde denemeye çalışıyorsa
        if (member.user.bot) return errorEmbed("This command is not used on bots");

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't use this command on yourself, you stupid thing :)");

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        if (member.roles.highest.position >= msgMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("You cannot do this because the role rank of the person you tagged is higher than your role rank");

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...boyRoleIds, ...girlRoleIds].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`The rank of the role(s) named [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Kişide erkek ve kız rolleri var mı kontrol ediyoruz
        const memberHasBoyRoles = boyRoleIds.every(roleId => memberRolesSet.has(roleId));
        const memberHasGirlRoles = girlRoleIds.every(roleId => memberRolesSet.has(roleId));

        // Kullanıcıya verilecek rolleri düzenle
        const expectRoles = new Set([...boyRoleIds, ...girlRoleIds]);
        const memberRoles = [];
        for (let i = 0; i < member["_roles"].length; ++i) {
            const roleId = member["_roles"][i];

            // Eğer rol hariç tutulan rollerden birisiyse döngünü geç
            if (expectRoles.has(roleId)) continue;

            memberRoles.push(roleId);
        }

        // Eğer ikisi de bulunmuyorsa
        if (!memberHasBoyRoles && !memberHasGirlRoles) return errorEmbed("The person you tagged does not have both a boy role and a girl role!");

        // Eğer hem erkek hem de kız rolü varsa
        if (memberHasBoyRoles && memberHasGirlRoles) {
            const allButtons = new ActionRowBuilder();

            const boyButton = new ButtonBuilder()
                .setLabel("Boy")
                .setEmoji(EMOJIS.boy)
                .setStyle(ButtonStyle.Primary)
                .setCustomId("COMMAND_CHANGE_BOY");

            const girlButton = new ButtonBuilder()
                .setLabel("Girl")
                .setEmoji(EMOJIS.girl)
                .setStyle(ButtonStyle.Primary)
                .setCustomId("COMMAND_CHANGE_GIRL");

            allButtons
                .addComponents(
                    boyButton,
                    girlButton
                );

            // Mesajı at ve cevap vermesini bekle
            const waitMessage = await msg.reply({
                content: "The person you tag has both a boy and a girl role. Please select which role you would like me to assign from the buttons below",
                components: [allButtons]
            });

            // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
            if (!waitMessage) return;

            const waitComponents = waitMessage.createMessageComponentCollector({
                filter: button => button.user.id == authorId,
                time: 15 * 1000, // 15 saniye boyunca kullanıcının işlem yapmasını bekle
            });

            // Eğer butona tıklarsa
            waitComponents.on("collect", async button => {

                // Eğer erkek rolünü seçtiyse
                if (button.customId == "COMMAND_CHANGE_BOY") {

                    // Kullanıcıyı düzenle
                    await member.edit({
                        roles: [...boyRoleIds, ...memberRoles]
                    })
                        // Eğer düzenleme başarılıysa
                        .then(() => {

                            // Düğmeleri etkisiz hale getir
                            boyButton
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(true);
                            girlButton
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);

                            const actionRow = new ActionRowBuilder()
                                .addComponents(
                                    boyButton,
                                    girlButton
                                );

                            const userLogs = guildDatabase.userLogs[memberId] ??= [];

                            // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                            const NOW_TIME = Date.now();
                            userLogs.unshift({
                                type: "changeRoles",
                                to: "boy",
                                authorId,
                                timestamp: NOW_TIME
                            });
                            database.writeFile(guildDatabase, guildId);

                            return waitMessage.edit({
                                content: `• ♻️ ${EMOJIS.boy} I took the girl role from <@${memberId}> and gave him the boy role`,
                                components: [actionRow],
                                allowedMentions: {
                                    users: [],
                                    repliedUser: true
                                }
                            });
                        })
                        // Eğer düzenleme başarısızsa
                        .catch(err => {
                            // Eğer yetki hatası verdiyse
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                            console.log(err);
                            return msg.reply(
                                `Ummm... There was an error, can you try again later??\n` +
                                `\`\`\`js\n` +
                                `${err}\`\`\``
                            );
                        });
                }
                // Eğer kız rolünü seçtiyse
                else {
                    // Kullanıcıyı düzenle
                    await member.edit({
                        roles: [...girlRoleIds, ...memberRoles]
                    })
                        // Eğer düzenleme başarılıysa
                        .then(() => {

                            // Düğmeleri etkisiz hale getir
                            boyButton
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                            girlButton
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(true);

                            const actionRow = new ActionRowBuilder()
                                .addComponents(
                                    boyButton,
                                    girlButton
                                );

                            const userLogs = guildDatabase.userLogs[memberId] ??= [];

                            // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                            const NOW_TIME = Date.now();
                            userLogs.unshift({
                                type: "changeRoles",
                                to: "girl",
                                authorId,
                                timestamp: NOW_TIME
                            });
                            database.writeFile(guildDatabase, guildId);

                            return waitMessage.edit({
                                content: `• ♻️ ${EMOJIS.girl} I took the boy role from <@${memberId}> and gave him the girl role`,
                                components: [actionRow],
                                allowedMentions: {
                                    users: [],
                                    repliedUser: true
                                }
                            });
                        })
                        // Eğer düzenleme başarısızsa
                        .catch(err => {
                            // Eğer yetki hatası verdiyse
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                            console.log(err);
                            return msg.reply(
                                `Ummm... There was an error, can you try again later??\n` +
                                `\`\`\`js\n` +
                                `${err}\`\`\``
                            );
                        });
                }
            });

            // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
            waitComponents.on("end", () => {
                // Eğer mesaj silinmişse hiçbir şey yapma
                if (
                    !msg.channel.messages.cache.has(waitMessage.id)
                ) return;

                // Butonları deaktif et
                boyButton
                    .setDisabled(true);
                girlButton
                    .setDisabled(true);

                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        boyButton,
                        girlButton
                    );

                return waitMessage.edit({
                    content: `*• This message is no longer active*\n` +
                        waitMessage.content,
                    components: [
                        actionRow
                    ]
                })
            });

        }
        // Eğer sadece erkek rolü varsa
        else if (memberHasBoyRoles) {
            // Kullanıcıyı düzenle
            return await member.edit({
                roles: [...girlRoleIds, ...memberRoles]
            })
                // Eğer düzenleme başarılıysa
                .then(() => {

                    const userLogs = guildDatabase.userLogs[memberId] ??= [];

                    // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                    const NOW_TIME = Date.now();
                    userLogs.unshift({
                        type: "changeRoles",
                        to: "girl",
                        authorId,
                        timestamp: NOW_TIME
                    });
                    database.writeFile(guildDatabase, guildId);

                    return msg.reply({
                        content: `• ♻️ ${EMOJIS.girl} I took the boy role from <@${memberId}> and gave him the girl role`,
                        allowedMentions: {
                            users: [],
                            repliedUser: true
                        }
                    });
                })
                // Eğer düzenleme başarısızsa
                .catch(err => {
                    // Eğer yetki hatası verdiyse
                    if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                    console.log(err);
                    return msg.reply(
                        `Ummm... There was an error, can you try again later??\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``
                    );
                });
        }
        // Eğer sadece kız rolü varsa
        else {
            // Kullanıcıyı düzenle
            return await member.edit({
                roles: [...boyRoleIds, ...memberRoles]
            })
                // Eğer düzenleme başarılıysa
                .then(() => {

                    const userLogs = guildDatabase.userLogs[memberId] ??= [];

                    // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                    const NOW_TIME = Date.now();
                    userLogs.unshift({
                        type: "changeRoles",
                        to: "boy",
                        authorId,
                        timestamp: NOW_TIME
                    });
                    database.writeFile(guildDatabase, guildId);

                    return msg.reply({
                        content: `• ♻️ ${EMOJIS.boy} I took the girl role from <@${memberId}> and gave him the boy role`,
                        allowedMentions: {
                            users: [],
                            repliedUser: true
                        }
                    });
                })
                // Eğer düzenleme başarısızsa
                .catch(err => {
                    // Eğer yetki hatası verdiyse
                    if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                    console.log(err);
                    return msg.reply(
                        `Ummm... There was an error, can you try again later??\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``
                    );
                });
        }

    },
};