"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
    AttachmentBuilder,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database");
const {
    EMOJIS,
    supportGuildId,
    channelIds: {
        featuresThatMayCome: featuresThatMayComeChannelId,
        support: supportChannelId,
        welcome: welcomeChannelId
    },
    roleIds: {
        bot: botRoleId,
        member: memberRoleId,
    },
    colors
} = require("../../../settings.json");
const {
    guildMemberAdd: guildMemberAddMessages
} = require("../../../messages.json")
const Util = require("../../../Helpers/Util");


module.exports = {
    name: Events.GuildMemberAdd,
    /**
     * 
     * @param {GuildMember} member 
     */
    async execute(member) {
        try {
            const startedTimestamp = Date.now();

            const {
                guild,
                user,
                id: memberId
            } = member;
            const guildId = guild.id;
            const userAvatar = user.displayAvatarURL();

            // Eğer kullanıcı destek sunucusuna girmişse özel mesaj gönder
            if (guildId === supportGuildId) {
                // Eğer botsa sadece rol ver
                if (user.bot) return member.roles.add(botRoleId);

                const channel = guild.channels.cache.get(welcomeChannelId);

                // Eğer olur da kanalı bulamazsa hiçbir şey yapma
                if (!channel) return;

                // Girilen dizideki rastgele bir veriyi döndürür
                function random(array) {
                    return array[Math.floor(Math.random() * array.length)];
                }

                // Eğer bot değilse rol ver ve kanala mesaj gönder
                member.roles.add(memberRoleId);
                const allMessages = [
                    `Geri çekilin <@${memberId}> sunucuya geldi`,
                    `*Pişt pişt <@${memberId}> nasılsın*`,
                    `Seni buralarda görmek çok güzel <@${memberId}>`,
                    `Sensiz buralar çok boştu iyi ki geldin <@${memberId}>`,
                    `Sahne senin <@${memberId}>`,
                    `Bu kadar tatlı olman normal mi <@${memberId}>?`,
                    `Bu kadar tatlı olman yasadışı <@${memberId}>`,
                    `Sen var ya seennnn <@${memberId}>`,
                    `H-hey selam <@${memberId}>`,
                    `Huh bu girişe hazır değilim bekle <@${memberId}>`,
                    `Sence evrende gerçekten yalnız mıyız <@${memberId}>?`,
                    `Güneş bile senin kadar parlamadı be <@${memberId}>`,
                    `Buraya nasıl girdin çabuk söyle <@${memberId}>!!`,
                    `Her zaman buraya geleceğini hayal ederdim biliyor musun <@${memberId}>`,
                    `*Seni seviyorum* <@${memberId}>`,
                    `Bu sunucunun ilk kuralı, bu sunucu hakkında asla konuşmamak <@${memberId}>`,
                    `**Welcome to Final Problem **<@${memberId}>`,
                    `<@${memberId}> ay sen mi geldin şapşik şey seni`,
                    `Herkes kahraman olamaz ama benim kahramanım sensin <@${memberId}>`,
                    `<@${memberId}> senin gelişine kurban olsunlar`,
                    `<@${memberId}> o bir kuş!!`,
                    `<@${memberId}> hayır o bir uçak!!`,
                    `<@${memberId}> hayır hayır o SUPERMAN!!`
                ];
                const allGifs = [
                    "https://media.giphy.com/media/xT0Cyhi8GCSU91PvtC/giphy.gif",
                    "https://media.giphy.com/media/eM7eOXa6YQ8SFggYML/giphy.gif",
                    "https://media.giphy.com/media/R6gvnAxj2ISzJdbA63/giphy-downsized-large.gif",
                    "https://media.giphy.com/media/2dQ3FMaMFccpi/giphy.gif",
                    "https://media.giphy.com/media/bWlAX1nD1StjO/giphy.gif",
                    "https://media.giphy.com/media/l2Jhok92mZ2PZHjDG/giphy.gif",
                    "https://media.giphy.com/media/5V83c4OVqmi5O/giphy.gif",
                    "https://media.giphy.com/media/6s7DwURljGmAiICI8Y/giphy.gif",
                    "https://media.giphy.com/media/5brPoXO6LC7AlmzasY/giphy.gif",
                    "https://media.giphy.com/media/QKUA2bIAgjFgk/giphy.gif",
                    "https://media.giphy.com/media/l2ZDUVbw657jD9bs4/giphy.gif",
                    "https://media.giphy.com/media/lqMxLjlpyAaAjfJ9yj/giphy.gif",
                    "https://media.giphy.com/media/RgapnV0F0opQ1ERigL/giphy.gif",
                    "https://media.giphy.com/media/8Mvvz0OZNSUvqmSXad/giphy.gif",
                    "https://media.giphy.com/media/RO82jI1GHAgWA/giphy.gif",
                    "https://media.giphy.com/media/cIzeEovXAjMH8GqKYr/giphy.gif",
                    "https://media.giphy.com/media/UQOtfc9uIXVv9IidCD/giphy.gif",
                    "https://media.giphy.com/media/ChTbtWsFB75oA/giphy.gif",
                    "https://media.giphy.com/media/MVXd61lZkMu2I/giphy.gif",
                    "https://media.giphy.com/media/26u4dZBA1V4I1rYIM/giphy.gif",
                    "https://media.giphy.com/media/l1IYjLwJjfUek47gA/giphy.gif",
                    "https://media.giphy.com/media/OrMzQ9Dn3lnfq/giphy.gif",
                    "https://media.giphy.com/media/3oEjHXm0J3Wi61FRHW/giphy.gif",
                    "https://media.giphy.com/media/26BGGgb1CYhgll00o/giphy.gif",
                    "https://media.giphy.com/media/3oEduH2JSVrHwAFKJG/giphy.gif",
                    "https://media.giphy.com/media/RBbBTRdz128PC/giphy.gif",
                    "https://media.giphy.com/media/PQjo2hlnIOjf2/giphy.gif",
                    "https://media.giphy.com/media/uigXewBzyy14k/giphy.gif",
                    "https://media.giphy.com/media/l2QE6naM1MTLEiK1W/giphy.gif",
                    "https://media.giphy.com/media/Wn15IqCohpOAhNpS5k/giphy.gif",
                    "https://media.giphy.com/media/Hp4lpOT1Ns60o/giphy.gif",
                    "https://media.giphy.com/media/cxkEyLYzYzgd87spz9/giphy.gif",
                    "https://media.giphy.com/media/kkAdqZnvhsc12/giphy.gif",
                    "https://media.giphy.com/media/XHMnwI3rUP4mlq2wCF/giphy.gif",
                    "https://media.giphy.com/media/l4FsxGFksrYwTvejS/giphy.gif",
                    "https://media.giphy.com/media/ANWrQlKi9ChaM/giphy.gif",
                    "https://media.giphy.com/media/Fto0AGJcv8Pw4/giphy.gif",
                    "https://media.giphy.com/media/nG7T7iJNQ5Kp2/giphy.gif",
                    "https://media.giphy.com/media/UTjR39r1y9aPFfqnZo/giphy.gif",
                    "https://media.giphy.com/media/3e47Z0iyEG3PG/giphy.gif",
                    "https://media.giphy.com/media/26FL4O8Or8MSsZOFO/giphy.gif",
                    "https://media.giphy.com/media/ihAbqNNryJUp0xuhah/giphy.gif",
                    "https://media.giphy.com/media/tWEAaSo9nCwmc/giphy.gif",
                    "https://media.giphy.com/media/3oEjHZa7X6Axs2PXfG/giphy.gif",
                    "https://media.giphy.com/media/xUA7aPLQyolzw5QEqA/giphy.gif",
                    "https://media.giphy.com/media/26FKUStbIiJbfF4Xu/giphy.gif",
                    "https://media.giphy.com/media/3o85xwGZR5UtB6SiL6/giphy.gif",
                    "https://media.giphy.com/media/4VlbCwmZlV2U0/giphy.gif",
                    "https://media.giphy.com/media/nx4k3ntt0ChAk/giphy.gif",
                    "https://media.giphy.com/media/oo2tEZ4bKu4s2dgSgI/giphy.gif",
                    "https://media.giphy.com/media/3d78lX84bkU6T4zNOg/giphy.gif",
                    "https://media.giphy.com/media/dLRcpPlPhDQgo/giphy.gif",
                    "https://media.giphy.com/media/rUb5SFPR0Bb5MKLkGC/giphy.gif",
                    "https://media.giphy.com/media/l0Ex1BL79C4MRMYWQ/giphy.gif",
                    "https://media.giphy.com/media/ywlIjUE8aUP1tGniE6/giphy.gif",
                    "https://media.giphy.com/media/brsEO1JayBVja/giphy.gif",
                    "https://media.giphy.com/media/3A3PvQtjS0oyA/giphy.gif",
                    "https://media.giphy.com/media/WTmXCoCf60MtW/giphy.gif",
                    "https://media.giphy.com/media/BpS6k9mXoDiZa/giphy.gif",
                    "https://media.giphy.com/media/lq2quUU0yt3H9TSvKO/giphy.gif",
                    "https://media.giphy.com/media/jOxKLRziCKmcj62OuI/giphy.gif",
                    "https://media.giphy.com/media/26BRGHQJZVRu5Mg3S/giphy.gif",
                    "https://media.giphy.com/media/xUyrMCdgrOL3ntbTvK/giphy.gif",
                    "https://media.giphy.com/media/l3V0uEmPgKpjZH6ve/giphy.gif",
                    "https://media.giphy.com/media/9HBduC3ZIgrG8/giphy.gif",
                    "https://media.giphy.com/media/l4JyOCNEfXvVYEqB2/giphy.gif",
                    "https://media.giphy.com/media/XD9o33QG9BoMis7iM4/giphy.gif",
                    "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif",
                    "https://media.giphy.com/media/3o72EWpXXrrFvEsZPO/giphy.gif",
                    "https://media.giphy.com/media/OF0yOAufcWLfi/giphy.gif",
                    "https://media.giphy.com/media/FQyQEYd0KlYQ/giphy.gif",
                    "https://media.giphy.com/media/KczqttEJqm55hE1ccU/giphy.gif",
                    "https://media.giphy.com/media/kHs1lBhZWaK5rj7lt3/giphy.gif",
                    "https://media.giphy.com/media/VeBeB9rR524RW/giphy.gif",
                    "https://media.giphy.com/media/3oEjHQn7PBRvy9A5mE/giphy.gif",
                    "https://media.giphy.com/media/cE02lboc8JPO/giphy.gif"
                ];

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Güzelliğin böylesi... ${user.displayName} :3`,
                        iconURL: userAvatar
                    })
                    .setDescription(
                        `${EMOJIS.crazy} **${Util.recreateString(member.client.user.displayName)} destek sunucusuna hoşgeldiiinnnn <@${memberId}>\n\n` +
                        `${EMOJIS.drink} Hey duydum ki <#${featuresThatMayComeChannelId}> kanalında benim muhteşemliğime muhteşemlik katacak bazı şeyler varmış bi bakmak ister misin?\n\n` +
                        `${EMOJIS.perfect} Eğer yardıma ihtiyacın varsa <#${supportChannelId}> kanalından bizimle iletişime geçebilirsiniz!\n\n` +
                        `${EMOJIS.kiss} Seni seviyorum burada keyfine bak**`
                    )
                    .setImage(random(allGifs))
                    .setColor("Random")
                    .setFooter({
                        text: `Pişt pişt nasılsın ${user.displayName}?`,
                        iconURL: userAvatar
                    });

                return channel.send({
                    content: random(allMessages),
                    embeds: [
                        embed
                    ]
                })
            }

            // Eğer destek sunucusuna girmemişse normal devam et
            const guildDatabase = Util.getGuildData(member.client, guildId);
            const NOW_TIME = Date.now();

            // Kullanıcının log bilgilerini güncelle
            const userLogs = guildDatabase.userLogs[memberId] ??= [];

            userLogs.unshift({
                type: "joinGuild",
                timestamp: NOW_TIME,
            });

            database.writeFile(guildDatabase, guildId)

            // Eğer kayıt ayarı kapalıysa hiçbir şey yapma
            if (guildDatabase.register.isRegisterOff) return;

            const registerChannelId = guildDatabase.register.channelIds.register;
            if (registerChannelId) {
                const registerChannel = guild.channels.cache.get(registerChannelId);

                // Eğer kanal yoksa hiçbir şey yapma
                if (!registerChannel) return;

                const language = guildDatabase.language;

                // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
                const allMessages = Util.eventMessages.guildMemberAdd[language];

                const {
                    permissionsErrors: {
                        manageRoles,
                        manageNicknames,
                        suspiciousRole,
                        unregisterRole,
                        errorGivingRole,
                        errorGivingSuspiciousRole,
                        errorGivingUnregisterRole,
                        memberAboveFromMe
                    },
                    errorEmbed: {
                        errorTitle,
                        reasons: REASONS,
                        information
                    },
                    buttonLabels,
                    roleNotSetted
                } = allMessages;

                // Tanımlamalar
                const guildMe = guild.members.me;
                const guildMePermissions = guildMe.permissions;
                const highestRole = guildMe.roles.highest;

                const memberHighestRolePosition = member.roles.highest.position;
                const memberAvatar = user.displayAvatarURL();
                const createdTimestamp = user.createdTimestamp;
                const createdTimestampSecond = Math.round(createdTimestamp / 1000);

                const memberCount = guild.memberCount;
                const toHumanize = Util.toHumanize(memberCount, language);

                const registerAuthId = guildDatabase.register.roleIds.registerAuth;
                const isAutoBotRegister = guildDatabase.register.isAutoRegisterForBot;
                const unregisterRoleId = guildDatabase.register.roleIds.unregister;

                const messageEmbeds = [];
                const memberEditObject = {};

                const jailRoleId = guildDatabase.jail.roleId;
                const jailGuild = guildDatabase.jail.prevRoles;

                // Eğer kişi sunucudan çıkarken Jail'e düşmüşse jail rolünü ver
                if (jailGuild[memberId]) {
                    memberEditObject.roles = [jailRoleId];
                }
                // Eğer kişi bot değilse rollerini güncelle
                else if (unregisterRoleId && !(isAutoBotRegister && user.bot)) {

                    // Kullanıcının rollerini düzenle
                    const expectRoles = new Set([unregisterRoleId]);
                    const memberRoles = [];
                    for (let i = 0; i < member["_roles"].length; ++i) {
                        const roleId = member["_roles"][i];

                        // Eğer rol hariç tutulan rollerden birisiyse döngünü geç
                        if (expectRoles.has(roleId)) continue;

                        memberRoles.push(roleId);
                    }

                    memberEditObject.roles = [
                        unregisterRoleId,
                        ...memberRoles
                    ];
                }

                const allButtons = new ActionRowBuilder();

                // Eğer kişi bot değilse
                if (!user.bot) {
                    const memberCustomName = guildDatabase.register.customNames.guildAdd;

                    const {
                        autoSuspicious,
                        suspiciousTime,
                        role: suspiciousRoleId
                    } = guildDatabase.suspicious;

                    const {
                        security: {
                            unsafe,
                            suspicious,
                            safe,
                            openAt,
                            accountIs,
                        },
                        suspicious: {
                            kickMember,
                            noRole: noSuspiciousRole
                        }
                    } = allMessages;

                    const ONE_DAY = 24 * 60 * 60 * 1000;
                    const TWO_WEEKS = ONE_DAY * 7 * 2;
                    const ONE_MONTH = ONE_DAY * 30;

                    // Eğer kullanıcı hesabını son 2 hafta içinde açmışsa
                    const security = createdTimestamp > (NOW_TIME - TWO_WEEKS) ?
                        `${unsafe} ${EMOJIS.unsafe}` :
                        // Eğer son 1 ay içinde açmışsa
                        createdTimestamp > (NOW_TIME - ONE_MONTH) ?
                            `${suspicious} ${EMOJIS.suspicious}` :
                            // Eğer 1 aydan daha da önce açmışsa
                            `${safe} ${EMOJIS.safe}`;
                    //                      Eğer şüpheliye atma zamanı ayarlanmışsa ve ayarlanan zamandan sonra hesabı açmışsa kullanıcıyı güvensiz olarak göster                   
                    const isAccountUnsafe = suspiciousTime ? createdTimestamp > NOW_TIME - suspiciousTime : (security !== `${safe} ${EMOJIS.safe}`);

                    // Eğer her şey ayarlı ise kullanıcıyı şüpheliye at
                    if (isAccountUnsafe && autoSuspicious) {

                        // Eğer şüpheli rolü varsa
                        if (suspiciousRoleId) {
                            const message = suspiciousTime ?
                                openAt(createdTimestamp) :
                                accountIs(security);

                            // Kullanıcıyı şüpheliye at
                            return await member.edit({
                                roles: [
                                    suspiciousRoleId
                                ]
                            })
                                // Eğer şüpheliye atma başarılır olursa
                                .then(() =>
                                    registerChannel.send(
                                        kickMember(memberId, message)
                                    )
                                )
                                // Eğer bir hata oluşursa
                                .catch(async err => {
                                    const reasons = [];

                                    // Eğer botta "Rolleri Yönet" yetkisi yoksa
                                    if (!guildMePermissions.has("ManageRoles")) reasons.push(manageRoles);

                                    // Eğer rolün pozisyonu botun rolünden üstteyse
                                    if (guild.roles.cache.get(suspiciousRoleId).position >= highestRole.position) reasons.push(
                                        suspiciousRole(suspiciousRoleId)
                                    );

                                    const embed = new EmbedBuilder()
                                        .setTitle(errorTitle)
                                        .setDescription(
                                            errorGivingSuspiciousRole(suspiciousRoleId)
                                        )
                                        .addFields({
                                            name: REASONS,
                                            value: reasons.join("\n") || `• ${err}`
                                        })
                                        .setColor("Red")
                                        .setTimestamp();

                                    messageEmbeds.push(embed);

                                    return loginMessageFunc()
                                });
                        }
                        // Eğer şüpheli rolü yoksa
                        else {
                            const embed = new EmbedBuilder()
                                .setTitle(information)
                                .setDescription(
                                    noSuspiciousRole(memberId)
                                )
                                .setColor("Blue")
                                .setTimestamp();

                            messageEmbeds.push(embed)
                        }
                    }

                    // Giriş mesajını atan fonksiyon
                    async function loginMessageFunc() {
                        const memberName = Util.customMessages.unregisterName({
                            message: memberCustomName,
                            name: user.displayName,
                            guildDatabase,
                        });

                        // Eğer kullanıcının ismi düzenlenecek ismiyle aynı değilse ismini güncelle
                        if (member.displayName != memberName) memberEditObject.nick = memberName;

                        // Eğer kullanıcının düzenlenecek herhangi bir şeyi varsa güncelle
                        if (Object.keys(memberEditObject).length > 0) await member.edit(memberEditObject)
                            // Eğer bir hata oluşursa
                            .catch(err => {
                                const reasons = [];

                                // Eğer botta "Rolleri Yönet" yetkisi yoksa
                                if (!guildMePermissions.has("ManageRoles")) reasons.push(manageRoles);

                                // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa
                                if (!guildMePermissions.has("ManageNicknames")) reasons.push(manageNicknames);

                                // Eğer kayıtsız rolü botun rolünden üstteyse
                                if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) reasons.push(
                                    unregisterRole(unregisterRoleId)
                                );

                                // Eğer gelen kişinin rolü botun rolünden üstteyse
                                if (memberHighestRolePosition > highestRole.position) reasons.push(
                                    memberAboveFromMe(memberId)
                                );

                                const embed = new EmbedBuilder()
                                    .setTitle(errorTitle)
                                    .setDescription(
                                        errorGivingUnregisterRole(memberId, unregisterRoleId)
                                    )
                                    .addFields({
                                        name: REASONS,
                                        value: reasons.join("\n") || `• ${err}`
                                    })
                                    .setColor("Red")
                                    .setTimestamp();

                                messageEmbeds.push(embed);
                            });

                        // Eğer sunucunun kayıt şekli "Normal kayıt" ise
                        if (guildDatabase.register.type == "normal") {
                            const memberButton = new ButtonBuilder()
                                .setLabel(buttonLabels.normal)
                                .setEmoji(EMOJIS.normal)
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId(`registerNormal-${memberId}`);

                            // Butonu ekle
                            allButtons.addComponents(memberButton);
                        }
                        // Eğer sunucunun kayıt şekli "Cinsiyet" ise
                        else {
                            const boyButton = new ButtonBuilder()
                                .setLabel(buttonLabels.boy)
                                .setEmoji(EMOJIS.boy)
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId(`registerBoy-${memberId}`);

                            const girlButton = new ButtonBuilder()
                                .setLabel(buttonLabels.girl)
                                .setEmoji(EMOJIS.girl)
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId(`registerGirl-${memberId}`);

                            // Butonları ekle
                            allButtons.addComponents(boyButton, girlButton);
                        }

                        const memberPrevNames = guildDatabase.register.prevNamesOfMembers[memberId];
                        let isFirstCome = true;

                        // Eğer kullanıcı bu sunucuya daha önceden gelip kayıt olmuşsa
                        if (memberPrevNames) {
                            isFirstCome = false;

                            // Eğer son kayıt edildiği ayarlar ile şimdiki ayarlar aynıysa buton oluştur
                            if (
                                (memberPrevNames[0].gender == "normal" && guildDatabase.register.type == "normal") ||
                                (memberPrevNames[0].gender != "normal" && guildDatabase.register.type == "gender")
                            ) {
                                const againButton = new ButtonBuilder()
                                    .setLabel(buttonLabels.again)
                                    .setEmoji("🔁")
                                    .setStyle(ButtonStyle.Success)
                                    .setCustomId(`registerAgain-${memberId}`);

                                // Butonu ekle
                                allButtons.addComponents(againButton);
                            }
                        }

                        // Eğer hesap güvensizse buton ekle
                        if (isAccountUnsafe) {
                            const suspiciousButton = new ButtonBuilder()
                                .setLabel(buttonLabels.suspicious)
                                .setEmoji("⛔")
                                .setStyle(ButtonStyle.Danger)
                                .setCustomId(`suspicious-${memberId}`);

                            // Butonu ekle
                            allButtons.addComponents(suspiciousButton);
                        }

                        const customLoginMessage = guildDatabase.register.customLogin;
                        let messageEmbed;

                        const recreateUserName = Util.recreateString(user.displayName);

                        const {
                            welcomeEmbed: {
                                member: {
                                    again,
                                    welcome,
                                    embed: embedMessage
                                }
                            }
                        } = allMessages;

                        // Eğer özel giriş mesajı varsa
                        if (customLoginMessage.content.length > 0) {
                            const loginMessage = Util.customMessages.guildAddMessage({
                                message: customLoginMessage.content,
                                language,
                                guild,
                                userId: memberId,
                                recreateName: recreateUserName,
                                toHumanize,
                                authRoleString: registerAuthId ? `<@&${registerAuthId}>` : `__**${roleNotSetted}**__`,
                                createdTimestamp,
                                createdTimestampSecond,
                                security
                            });



                            // Eğer giriş mesajını embed olarak ayarlamamışlarsa
                            if (!customLoginMessage.isEmbed) {
                                // Eğer resim de ayarlanmışsa mesaja resmi de ekle
                                const messageFiles = [];

                                if (customLoginMessage.image) {
                                    messageFiles.push(
                                        new AttachmentBuilder(customLoginMessage.image)
                                    );
                                }

                                return registerChannel.send({
                                    content: loginMessage,
                                    embeds: messageEmbeds,
                                    files: messageFiles,
                                    components: [
                                        allButtons
                                    ]
                                });
                            }

                            messageEmbed = new EmbedBuilder()
                                .setTitle(`${isFirstCome ? welcome : again} ${recreateUserName} ${EMOJIS.hi}`)
                                .setDescription(loginMessage)
                                .setImage(customLoginMessage.image ?? null)
                                .setThumbnail(memberAvatar)
                                .setColor("Random")
                                .setTimestamp()
                                .setFooter({
                                    text: `${embedMessage.footer} ${user.displayName}?`
                                });

                        }
                        // Eğer özel giriş mesajı ayarlanmamışsa
                        else {
                            const embed = new EmbedBuilder()
                                .setTitle(`${isFirstCome ? welcome : again} ${recreateUserName} ${EMOJIS.hi}`)
                                .setDescription(
                                    embedMessage.description({
                                        guild,
                                        createdTimestampSecond,
                                        security,
                                        toHumanize
                                    })
                                )
                                .setThumbnail(memberAvatar)
                                .setColor("Random")
                                .setTimestamp()
                                .setFooter({
                                    text: `${embedMessage.footer} ${user.displayName}?`
                                });

                            messageEmbed = embed;
                        }

                        messageEmbeds.push(messageEmbed);

                        return registerChannel.send({
                            content: `${registerAuthId ? `<@&${registerAuthId}>, ` : ""}${guildMemberAddMessages[language][Math.floor(Math.random() * guildMemberAddMessages[language].length)].replace("<m>", `<@${memberId}>`)}`,
                            embeds: messageEmbeds,
                            components: [
                                allButtons
                            ]
                        });
                    }

                    // Giriş mesajını at
                    return loginMessageFunc();
                }

                async function loginMessageBot(embedsParam = []) {
                    const botName = Util.customMessages.unregisterName({
                        message: guildDatabase.register.customNames.guildAddBot,
                        name: user.displayName,
                        guildDatabase,
                    });

                    // Eğer botun ismi düzenlenecek ismiyle aynı değilse ismini güncelle
                    if (member.displayName != botName) memberEditObject.nick = botName;

                    // Eğer botun düzenlenecek herhangi bir şeyi varsa güncelle
                    if (Object.keys(memberEditObject).length > 0) await member.edit(memberEditObject)
                        // Eğer bir hata oluşursa
                        .catch(err => {
                            const reasons = [];

                            // Eğer botta "Rolleri Yönet" yetkisi yoksa
                            if (!guildMePermissions.has("ManageRoles")) reasons.push(manageRoles);

                            // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa
                            if (!guildMePermissions.has("ManageNicknames")) reasons.push(manageNicknames);

                            // Eğer kayıtsız rolü botun rolünden üstteyse
                            if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) reasons.push(
                                unregisterRole(unregisterRoleId)
                            );

                            // Eğer gelen kişinin rolü botun rolünden üstteyse
                            if (memberHighestRolePosition > highestRole.position) reasons.push(
                                memberAboveFromMe(memberId)
                            );

                            const embed = new EmbedBuilder()
                                .setTitle(errorTitle)
                                .setDescription(
                                    errorGivingUnregisterRole(memberId)
                                )
                                .addFields({
                                    name: REASONS,
                                    value: reasons.join("\n") || `• ${err}`
                                })
                                .setColor("Red")
                                .setTimestamp();

                            embedsParam.push(embed);
                        });

                    // Botu kayıt et butonunu ekle
                    allButtons
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel(buttonLabels.bot)
                                .setEmoji(EMOJIS.bot)
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId(`registerBot-${memberId}`)
                        )

                    const customLoginMessage = guildDatabase.register.customLogin;
                    let messageEmbed;

                    const {
                        welcomeEmbed: {
                            bot: {
                                welcome: {
                                    welcome,
                                    embed: embedMessage
                                }
                            }
                        }
                    } = allMessages;

                    // Eğer özel giriş mesajı varsa
                    if (customLoginMessage.content.length > 0) {
                        const loginMessage = Util.customMessages.guildAddMessage({
                            message: customLoginMessage.content,
                            language,
                            guild,
                            userId: memberId,
                            recreateName: recreateUserName,
                            toHumanize,
                            authRoleString: registerAuthId ? `<@&${registerAuthId}>` : `__**${roleNotSetted}**__`,
                            createdTimestamp,
                            createdTimestampSecond,
                            security: `Bot ${EMOJIS.bot}`
                        });

                        // Eğer giriş mesajını embed olarak ayarlamamışlarsa
                        if (!customLoginMessage.isEmbed) {
                            // Eğer resim de ayarlanmışsa mesaja resmi de ekle
                            const messageFiles = [];

                            if (customLoginMessage.image) {
                                messageFiles.push(
                                    new AttachmentBuilder(customLoginMessage.image)
                                );
                            }
                            
                            return registerChannel.send({
                                content: loginMessage,
                                embeds: embedsParam,
                                files: messageFiles,
                                components: [
                                    allButtons
                                ],
                                allowedMentions: {
                                    roles: [],
                                    users: []
                                }

                            });
                        }

                        messageEmbed = new EmbedBuilder()
                            .setTitle(`${welcome} ${EMOJIS.hi}`)
                            .setDescription(loginMessage)
                            .setImage(customLoginMessage.image ?? null)
                            .setThumbnail(memberAvatar)
                            .setColor("Random")
                            .setTimestamp();

                    }
                    // Eğer özel giriş mesajı ayarlanmamışsa
                    else {
                        const embed = new EmbedBuilder()
                            .setTitle(`${welcome} ${EMOJIS.hi}`)
                            .setDescription(
                                embedMessage.description({
                                    guild,
                                    toHumanize,
                                    createdTimestampSecond
                                })
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("Random")
                            .setTimestamp();

                        messageEmbed = embed;
                    }

                    embedsParam.push(messageEmbed);

                    return registerChannel.send({
                        content: `• <@${memberId}> bip bop, bop bip`,
                        embeds: embedsParam,
                        components: [
                            allButtons
                        ]
                    });
                }

                // Eğer botları otomatik olarak kayıt etme kapalıysa
                if (!isAutoBotRegister) {
                    const reasonsEmbed = [];

                    // Eğer botun düzenlenecek herhangi bir şeyi varsa güncelle
                    if (Object.keys(memberEditObject).length > 0) await member.edit(memberEditObject)
                        // Eğer bir hata oluşursa
                        .catch(err => {
                            const reasons = [];

                            // Eğer botta "Rolleri Yönet" yetkisi yoksa
                            if (!guildMePermissions.has("ManageRoles")) reasons.push(manageRoles);

                            // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa
                            if (!guildMePermissions.has("ManageNicknames")) reasons.push(manageNicknames);

                            // Eğer kayıtsız rolü botun rolünden üstteyse
                            if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) reasons.push(
                                unregisterRole(unregisterRoleId)
                            );

                            // Eğer gelen kişinin rolü botun rolünden üstteyse
                            if (memberHighestRolePosition > highestRole.position) reasons.push(
                                memberAboveFromMe(memberId)
                            );

                            const embed = new EmbedBuilder()
                                .setTitle(errorTitle)
                                .setDescription(
                                    errorGivingRole(memberId)
                                )
                                .addFields({
                                    name: REASONS,
                                    value: reasons.join("\n") || `• ${err}`
                                })
                                .setColor("Red")
                                .setTimestamp();

                            reasonsEmbed.push(embed);
                        });

                    return loginMessageBot(reasonsEmbed);
                }
                // Eğer botları otomatik olarak kayıt etme açıksa
                else {
                    const botRoleIds = guildDatabase.register.roleIds.bot;

                    // Eğer bot rolleri ayarlıysa
                    if (botRoleIds.length > 0) {

                        const botName = Util.customMessages.registerName({
                            message: guildDatabase.register.customNames.registerBot,
                            memberName: user.displayName,
                            guildDatabase,
                            inputAge: null,
                            isBot: true
                        });

                        // Botun rollerini düzenle
                        const expectRoles = new Set([unregisterRoleId, ...botRoleIds]);
                        const botRoles = [];
                        for (let i = 0; i < member["_roles"].length; ++i) {
                            const roleId = member["_roles"][i];

                            // Eğer rol hariç tutulan rollerden birisiyse döngünü geç
                            if (expectRoles.has(roleId)) continue;

                            botRoles.push(roleId);
                        }

                        // Botu kayıt et
                        return await member.edit({
                            roles: [
                                ...botRoleIds,
                                ...botRoles
                            ],
                            nick: botName
                        })
                            // Eğer kayıt etme başarılıysa
                            .then(() => {
                                const NOW_TIME = Date.now();
                                const authorId = member.client.user.id;
                                const botRolesString = botRoleIds.map(roleId => `<@&${roleId}>`).join(", ");
                                const authorData = guildDatabase.register.authorizedInfos[authorId] ??= {
                                    countables: {
                                        girl: 0,
                                        boy: 0,
                                        normal: 0,
                                        bot: 0,
                                        total: 0
                                    }
                                };
                                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                                userLogs.unshift({
                                    type: "register",
                                    gender: "bot",
                                    authorId,
                                    timestamp: NOW_TIME
                                });

                                authorData.countables.total += 1;

                                const totalRegisterCount = authorData.countables.total;
                                const toHumanizeRegisterCount = Util.toHumanize(totalRegisterCount, language);
                                const recreateName = Util.recreateString(botName);

                                const {
                                    welcomeEmbed: {
                                        bot: {
                                            register: {
                                                registerEmbed,
                                                logEmbed
                                            }
                                        }
                                    }
                                } = allMessages;

                                const embed = new EmbedBuilder()
                                    .setAuthor({
                                        name: user.displayName,
                                        iconURL: memberAvatar
                                    })
                                    .setDescription(registerEmbed.description)
                                    .addFields(
                                        registerEmbed.fileds({
                                            authorId,
                                            toHumanizeRegisterCount,
                                            memberId,
                                            recreateName,
                                            botRolesString
                                        })
                                    )
                                    .setThumbnail(memberAvatar)
                                    .setColor(colors.bot)
                                    .setFooter({
                                        text: `Alisa ${registerEmbed.footer}`,
                                        iconURL: member.client.user.displayAvatarURL()
                                    })
                                    .setTimestamp()

                                registerChannel.send({
                                    embeds: [
                                        embed
                                    ]
                                });

                                const memberPrevNames = guildDatabase.register.prevNamesOfMembers[memberId] ??= [];

                                // Database'ye kaydedilecek son veriler
                                guildDatabase.register.lastRegisters.unshift({
                                    gender: "bot",
                                    authorId,
                                    memberId,
                                    isAgainRegister: memberPrevNames.length > 0,
                                    timestamp: NOW_TIME
                                });

                                // Log kanalına mesaj atılacak mesaj
                                const logChannelId = guildDatabase.register.channelIds.log;
                                if (logChannelId) {
                                    const logChannel = member.guild.channels.cache.get(logChannelId);
                                    if (logChannel) {
                                        const NOW_TIME_IN_SECOND = Math.round(NOW_TIME / 1000);
                                        const embed = new EmbedBuilder()
                                            .setAuthor({
                                                name: user.displayName,
                                                iconURL: memberAvatar
                                            })
                                            .setDescription(
                                                logEmbed.description({
                                                    guildDatabase,
                                                    user,
                                                    memberId,
                                                    authorId,
                                                    toHumanizeRegisterCount,
                                                    NOW_TIME_IN_SECOND,
                                                    recreateName,
                                                    botRolesString
                                                })
                                            )
                                            .setThumbnail(memberAvatar)
                                            .setColor("#b90ebf")
                                            .setFooter({
                                                text: `Alisa ${logEmbed.footer}`,
                                                iconURL: guildMe.displayAvatarURL()
                                            })
                                            .setTimestamp()

                                        logChannel.send({
                                            embeds: [
                                                embed
                                            ]
                                        })
                                    }
                                }

                                const lastAndFirstRegisterObject = {
                                    memberId,
                                    roles: botRolesString,
                                    timestamp: NOW_TIME
                                };
                                authorData.firstRegister ||= lastAndFirstRegisterObject;
                                authorData.lastRegister = lastAndFirstRegisterObject;

                                memberPrevNames.unshift({
                                    gender: "bot",
                                    name: botName,
                                    roles: botRolesString,
                                    authorId,
                                    timestamp: NOW_TIME
                                });

                                // Kaydı kaydet
                                const allRegistersFile = database.getFile("all registers", "other");
                                const guildData = allRegistersFile[guildId] ??= {
                                    boy: 0,
                                    girl: 0,
                                    normal: 0,
                                    bot: 0,
                                    total: 0
                                }
                                guildData.boy += 1;

                                // En sonunda ise dosyaları kaydet
                                database.writeFile(allRegistersFile, "all registers", "other");
                                return database.writeFile(guildDatabase, guildId);
                            })
                            // Eğer bir hata oluşursa
                            .catch(err => {
                                const reasons = [];

                                // Eğer botta "Rolleri Yönet" yetkisi yoksa
                                if (!guildMePermissions.has("ManageRoles")) reasons.push(manageRoles);

                                // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa
                                if (!guildMePermissions.has("ManageNicknames")) reasons.push(manageNicknames);

                                // Eğer kayıtsız rolü botun rolünden üstteyse
                                if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) reasons.push(
                                    unregisterRole(unregisterRoleId)
                                );

                                // Eğer gelen kişinin rolü botun rolünden üstteyse
                                if (memberHighestRolePosition > highestRole.position) reasons.push(
                                    memberAboveFromMe(memberId)
                                );

                                const embed = new EmbedBuilder()
                                    .setTitle(errorTitle)
                                    .setDescription(
                                        errorGivingRole(memberId)
                                    )
                                    .addFields({
                                        name: REASONS,
                                        value: reasons.join("\n") || `• ${err}`
                                    })
                                    .setColor("Red")
                                    .setTimestamp();

                                return loginMessageBot([embed]);
                            })
                    }
                    // Eğer bot rolü ayarlı değilse
                    else {
                        const embed = new EmbedBuilder()
                            .setTitle(information)
                            .setDescription(allMessages.welcomeEmbed.bot.register.noBotRole)
                            .setColor("Blue")
                            .setTimestamp();

                        return loginMessageBot([embed]);
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
}