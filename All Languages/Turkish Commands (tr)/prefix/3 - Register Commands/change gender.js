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
    name: "değiştir", // Komutun ismi
    id: "değiştir", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "değiştir",
        "roldeğiştir",
        "değiştirrol",
        "rollerideğiştir",
        "cinsiyetideğiştir",
        "change",
        "changerole",
        "changeroles"
    ],
    description: "Kullanıcının cinsiyetini değiştirir", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>değiştir <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
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

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed("Bu komut sadece __**Cinsiyet**__ ile kayıt yapanlara özeldir");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer botta "Rolleri Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

        const {
            boy: boyRoleIds,
            girl: girlRoleIds,
        } = guildDatabase.register.roleIds;

        // Eğer kız veya erkek rollerinden birisi yoksa hata döndür
        if (girlRoleIds.length == 0) return errorEmbed(
            `Bu sunucuda herhangi bir kız rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        if (boyRoleIds.length == 0) return errorEmbed(
            `Bu sunucuda herhangi bir erkek rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}erkek-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
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
        if (member.roles.highest.position >= msgMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("Etiketlediğiniz kişinin rolünün sırası sizin rolünüzün sırasından yüksek olduğu için bunu yapamazsınız");

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...boyRoleIds, ...girlRoleIds].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`[${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

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
        if (!memberHasBoyRoles && !memberHasGirlRoles) return errorEmbed("Etiketlediğiniz kişide hem erkek rolü hem de kız rolü bulunmuyor!");

        // Eğer hem erkek hem de kız rolü varsa
        if (memberHasBoyRoles && memberHasGirlRoles) {
            const allButtons = new ActionRowBuilder();

            const boyButton = new ButtonBuilder()
                .setLabel("Erkek")
                .setEmoji(EMOJIS.boy)
                .setStyle(ButtonStyle.Primary)
                .setCustomId("COMMAND_CHANGE_BOY");

            const girlButton = new ButtonBuilder()
                .setLabel("Kız")
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
                content: "Etiketlediğiniz kişide hem erkek hem de kız rolü bulunuyor. Lütfen aşağıdaki düğmelerden hangi rolü vermemi istyorsanız onu seçiniz",
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
                                content: `• ♻️ ${EMOJIS.boy} <@${memberId}> adlı kişiden kız rolünü alıp erkek rolünü verdim`,
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
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                            console.log(err);
                            return msg.reply(
                                `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
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
                                content: `• ♻️ ${EMOJIS.girl} <@${memberId}> adlı kişiden erkek rolünü alıp kız rolünü verdim`,
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
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                            console.log(err);
                            return msg.reply(
                                `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
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
                    content: `*• Bu mesaj artık aktif değildir*\n` +
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
                        content: `• ♻️ ${EMOJIS.girl} <@${memberId}> adlı kişiden erkek rolünü alıp kız rolünü verdim`,
                        allowedMentions: {
                            users: [],
                            repliedUser: true
                        }
                    });
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
                        content: `• ♻️ ${EMOJIS.boy} <@${memberId}> adlı kişiden kız rolünü alıp erkek rolünü verdim`,
                        allowedMentions: {
                            users: [],
                            repliedUser: true
                        }
                    });
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
        }

    },
};