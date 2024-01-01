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
    name: "changeGender", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcının cinsiyetini değiştirir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        guild,
        guildId,
        authorId,
        errorEmbed,
    }) {
        
        const intMember = int.member;

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed("This command is only for those who register with __**Gender**__");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer botta "Rolleri Yönet" yetkisi yoksa hata döndür
        const guildMe = guild.members.me;
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

        const {
            boy: boyRoleIds,
            girl: girlRoleIds,
        } = guildDatabase.register.roleIds;

        // Eğer kız veya erkek rollerinden birisi yoksa hata döndür
        if (girlRoleIds.length == 0) return errorEmbed(
            `Girl roles are __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}girl-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        if (boyRoleIds.length == 0) return errorEmbed(
            `Boy roles are __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}boy-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        const memberId = int.customId.split("-")[1];
        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Wellyyy... I think this person is no longer on the server, you stupid thing :(");

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't use this command on yourself, you stupid thing :)");

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const highestRole = guildMe.roles.highest;
        if (member.roles.highest.position >= intMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("You cannot do this because the role rank of the person you tagged is higher than your role rank");

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const roleAboveTheBotRole = [...boyRoleIds, ...girlRoleIds].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`The rank of the role(s) named [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

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
            const waitMessage = await int.reply({
                content: `• <@${authorId}>, The person you tag has both a boy and a girl role. Please select which role you would like me to assign from the buttons below`,
                components: [allButtons],
                fetchReply: true
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
                                content: `• ♻️ ${EMOJIS.boy} <@${authorId}>, I took the girl role from <@${memberId}> and gave him the boy role`,
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
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return waitMessage.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                            console.log(err);
                            return waitMessage.reply(
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
                                content: `• ♻️ ${EMOJIS.girl} <@${authorId}>, I took the boy role from <@${memberId}> and gave him the girl role`,
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
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return waitMessage.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                            console.log(err);
                            return waitMessage.reply(
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
                    !int.channel.messages.cache.has(waitMessage.id)
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

                    return int.reply({
                        content: `• ♻️ ${EMOJIS.girl} <@${authorId}>, I took the boy role from <@${memberId}> and gave him the girl role`,
                        allowedMentions: {
                            users: [],
                            repliedUser: true
                        }
                    });
                })
                // Eğer düzenleme başarısızsa
                .catch(err => {
                    // Eğer yetki hatası verdiyse
                    if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                        content: `I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`,
                        ephemeral: true
                    });

                    console.log(err);
                    return int.reply({
                        content: `Ummm... There was an error, can you try again later??\n` +
                            `\`\`\`js\n` +
                            `${err}\`\`\``,
                        ephemeral: true
                    });
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

                    return int.reply({
                        content: `• ♻️ ${EMOJIS.boy} <@${authorId}>, I took the girl role from <@${memberId}> and gave him the boy role`,
                        allowedMentions: {
                            users: [],
                            repliedUser: true
                        }
                    });
                })
                // Eğer düzenleme başarısızsa
                .catch(err => {
                    // Eğer yetki hatası verdiyse
                    if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                        content: `I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`,
                        ephemeral: true
                    });

                    console.log(err);
                    return int.reply({
                        content: `Ummm... There was an error, can you try again later??\n` +
                            `\`\`\`js\n` +
                            `${err}\`\`\``,
                        ephemeral: true
                    });
                });
        }
    },
};