"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RESTJSONErrorCodes
} = require("discord.js");
const {
    EMOJIS,
    colors
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "kız", // Komutun ismi
    id: "kız", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kız",
        "k",
        "kızkayıt"
    ],
    description: "Kişiyi kız olarak kayıt eder", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kız <@kişi veya Kişi ID'si> <Yeni ismi>", // Komutun kullanım şekli
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
        language
    }) {

        // Önce yetkili rolü var mı onu kontrol ediyoruz, eğer yoksa hata, eğer varsa kişide rol var mı onu kontrol ediyoruz
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (!authorizedRoleId) return errorEmbed(
            `Bu sunucuda üyeleri kayıt eden yetkili rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}yetkili-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(
            `Kayıt türüm __**Normal Kayıt**__ olarak ayarlı! Lütfen \`${prefix}kayıt\` komutunu kullanınız` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Eğer kız ve erkek olarak kayıt etmek isterseniz **${prefix}kayıttür cinsiyet** yazabilirsiniz` :
                "")
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const girlRoleIds = guildDatabase.register.roleIds.girl;
        if (girlRoleIds.length == 0) return errorEmbed(
            `Bu sunucuda herhangi bir kız rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        const unregisterRoleId = guildDatabase.register.roleIds.unregister
        if (!unregisterRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        const registerChannel = guildDatabase.register.channelIds.register
        if (!registerChannel) return errorEmbed(
            `Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kayıtkanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );

        // Eğer kayıtlar kayıt kanalında yapmıyorsa hata döndür
        if (msg.channelId !== registerChannel) return errorEmbed(`Lütfen kayıtları kayıt kanalı olan <#${registerChannel}> kanalında yapınız`);

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...girlRoleIds, unregisterRoleId].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`[${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`)

        const messageContent = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, messageContent);
        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        // Eğer etiketlenen kişi bot ise hata döndür
        if (member.user.bot) {
            if (guildDatabase.register.roleIds.bot) return errorEmbed(
                `Bir botu kız olarak kayıt edemezsin şapşik şey seni\n\n` +
                `• Eğer botu kayıt etmek isterseniz **${prefix}bot ${member.id}** yazabilirsiniz`
            );

            if (msgMember.permissions.has("Administrator")) return errorEmbed(
                `Bir botu kız olarak kayıt edemezsin şapşik şey seni\n\n` +
                `• Eğer botu kayıt etmek isterseniz ilk önce **${prefix}bot-rol** ile bir bot rolünü ayarlamalısınız`
            );

            return errorEmbed(
                `Bir botu kız olarak kayıt edemezsin şapşik şey seni\n\n` +
                `• Eğer botu kayıt etmek isterseniz yetkililere bir bot rolü ayarlamasını söyleyiniz`
            );
        }

        const memberId = member.id;

        // Kullanıcıyı hem butonla hem de komutla etmeye çalışırsa hata döndür
        const isButtonRegistering = msg.client.buttonRegisterMember.get(`${guildId}.${memberId}`);
        if (isButtonRegistering) return errorEmbed(
            isButtonRegistering == authorId ?
                "Heyyy dur bakalım orada! Aynı anda hem butonla hem de komutla kayıt edemezsin!" :
                "Heyyy dur bakalım orada! Şu anda başkası kayıt işlemini gerçekleştiriyor!"
        );

        // Eğer kullanıcı kendi kendini kayıt etmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("Kendi kendini kayıt edemezsin şapşik şey seni :)")

        // Eğer sunucu sahibini kayıt etmeye çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini kayıt edemezsin şapşik şey seni :)");

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Eğer kişi daha önceden kayıt olmuşsa hata döndür
        const boyRoleIds = guildDatabase.register.roleIds.boy
        if (
            girlRoleIds.every(rolId => memberRolesSet.has(rolId)) ||
            (boyRoleIds.length && boyRoleIds.every(rolId => memberRolesSet.has(rolId)))
        ) return errorEmbed("Etiketlediğiniz kişi zaten daha önceden kayıt edilmiş");

        // Eğer kişide kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        let isMemberHasUnregisterRole = true;
        if (!memberRolesSet.has(unregisterRoleId)) isMemberHasUnregisterRole = false;

        const guildTag = guildDatabase.register.tag;
        const hasGuildCustomRegisterName = guildDatabase.register.customNames.register;
        let memberName = messageContent.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").trim();

        // Eğer kullanıcının ismini girmemişse hata döndür
        if (!memberName) return errorEmbed(
            `Lütfen kayıt edeceğiniz kişinin ismini giriniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}k ${memberId} Fearless Crazy 20\n` +
            `• ${prefix}k <@${memberId}> Fearless Crazy 20\n` +
            `• ${prefix}k Fearless Crazy 20 <@${memberId}>`
        );

        // Kullanıcının ismindeki yaşı çek
        let inputAge = memberName.match(Util.regex.fetchAge);

        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
        if (!inputAge && guildDatabase.register.isAgeRequired) return errorEmbed("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!");

        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
        const ageLimit = guildDatabase.register.ageLimit ?? -1;
        if (ageLimit > Number(inputAge?.[0])) return errorEmbed(`Heyyy dur bakalım orada! Bu sunucuda **${ageLimit}** yaşından küçükleri kayıt edemezsin!`);

        // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
        if (hasGuildCustomRegisterName.search(/<(ya[sş]|age)>/) != -1) {
            memberName = memberName.replace(inputAge?.[0], "").replace(/ +/g, " ");
        }
        memberName = Util.customMessages.registerName({
            message: hasGuildCustomRegisterName,
            memberName,
            guildDatabase,
            inputAge,
            isBot: false
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return errorEmbed("Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz");

        // Kullanıcının rollerini düzenle
        const expectRoles = new Set([...girlRoleIds, unregisterRoleId]);
        const memberRoles = [];
        for (let i = 0; i < member["_roles"].length; ++i) {
            const roleId = member["_roles"][i];

            // Eğer rol hariç tutulan rollerden birisiyse döngünü geç
            if (expectRoles.has(roleId)) continue;

            memberRoles.push(roleId);
        }

        // Ve en sonunda ise kullanıcıyı düzenle
        await member.edit({
            roles: [
                ...girlRoleIds,
                ...memberRoles
            ],
            nick: memberName
        })
            // Eğer kullanıcı düzgün bir şekilde kayıt edildiyse database'ye kaydet
            .then(async () => {
                const NOW_TIME = Date.now();
                const girlRolesString = girlRoleIds.map(roleId => `<@&${roleId}>`).join(", ");
                const authorData = guildDatabase.register.authorizedInfos[authorId] ??= {
                    countables: {
                        girl: 0,
                        boy: 0,
                        normal: 0,
                        bot: 0,
                        total: 0
                    }
                };
                const memberPrevNames = guildDatabase.register.prevNamesOfMembers[memberId] ??= [];
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                let embedDescription = null;

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                userLogs.unshift({
                    type: "register",
                    gender: "girl",
                    authorId,
                    timestamp: NOW_TIME
                });

                // Eğer kişi daha önceden kayıt olmuşsa kayıt sayısını arttırma
                if (memberPrevNames.length != 0) {
                    embedDescription = `• <@${memberId}> adlı kişi bu sunucuda daha önceden **${memberPrevNames.length}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberId}**)`
                } else {
                    authorData.countables.girl += 1
                    authorData.countables.total += 1;
                    const newRank = Util.getUserRank(authorData.countables.total, language);

                    // Eğer rankı atladıysa yeni rankını embed mesajda göster
                    if (newRank) {
                        embedDescription = `• <@${authorId}> Tebrikler **${newRank}** kümesine terfi ettin! 🎉`
                    }
                }

                const totalRegisterCount = authorData.countables.total;
                const toHumanizeRegisterCount = Util.toHumanize(totalRegisterCount, language);
                const clientAvatar = msg.client.user.displayAvatarURL();
                const memberAvatar = member.displayAvatarURL();
                const allButtons = new ActionRowBuilder()
                    .addComponents(
                        // İsmini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel("İsmini değiştir")
                            .setEmoji("📝")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId(`changeName-${memberId}`),

                        // Cinsiyetini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel("Cinsiyetini değiştir")
                            .setEmoji("♻️")
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`changeGender-${memberId}`),

                        // Kayıtsıza atma butonu
                        new ButtonBuilder()
                            .setLabel("Kayıtsıza at")
                            .setEmoji("⚒️")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`kickUnregistered-${memberId}`),
                    );
                const recreateName = Util.recreateString(memberName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "Kayıt yapıldı",
                        iconURL: guild.iconURL()
                    })
                    .setDescription(embedDescription)
                    .addFields(
                        {
                            name: "`Kayıt yapan`",
                            value: `> 👤 **Adı:** <@${authorId}>\n` +
                                `> 🔰 **Rankı:** ${Util.getUserRank(totalRegisterCount, language) || "Rankı yok"}\n` +
                                `> 📈 **Kayıt sayısı:** ${toHumanizeRegisterCount}`,
                            inline: true
                        },
                        {
                            name: "`Kayıt edilen`",
                            value: `> 👤 **Adı:** <@${memberId}>\n` +
                                `> 📝 **Yeni ismi:** ${recreateName}\n` +
                                `> ${EMOJIS.role} **Verilen rol(ler):** ${girlRolesString}`,
                            inline: true
                        }
                    )
                    .setThumbnail(memberAvatar)
                    .setFooter({
                        text: `${msg.client.user.username} Kayıt sistemi`,
                        iconURL: clientAvatar
                    })
                    .setColor(`#${colors.girl}`)
                    .setTimestamp();

                msg.reply({
                    embeds: [
                        embed
                    ],
                    components: [
                        allButtons
                    ]
                });

                const recreateMemberName = Util.recreateString(member.user.displayName);
                const recreateAuthorName = Util.recreateString(msg.author.displayName);

                const afterRegisterChannelId = guildDatabase.register.channelIds.afterRegister;

                if (afterRegisterChannelId) {
                    const allMessages = Util.afterRegisterMessages[language].girl;
                    const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)].replace("<m>", `<@${memberId}>`);
                    const channel = guild.channels.cache.get(afterRegisterChannelId);
                    // Eğer kanal varsa alttaki kodları çalıştır
                    if (channel) {
                        const customAfterLoginMessage = guildDatabase.register.customAfterRegister;

                        // Eğer özel mesaj ayarlanmışsa ayarlanan mesajı düzenle ve gönder
                        if (customAfterLoginMessage.content.length > 0) {

                            // Mesajı düzenle
                            const resultMessage = Util.customMessages.afterRegisterMessage({
                                message: customAfterLoginMessage.content,
                                language,
                                memberId,
                                memberCount: guild.memberCount,
                                authorId,
                                recreateAuthorName,
                                recreateMemberName,
                                givenRolesString: girlRolesString,
                                guildTag,
                                toHumanizeRegisterCount
                            });

                            // Mesajı gönder
                            channel.send(
                                customAfterLoginMessage.isEmbed ?
                                    // Eğer mesaj embed olarak gönderilecekse
                                    {
                                        content: randomMessage,
                                        embeds: [
                                            new EmbedBuilder()
                                                .setTitle(`Aramıza hoşgeldin ${recreateMemberName} ${EMOJIS.hi}`)
                                                .setDescription(resultMessage)
                                                .addFields(
                                                    {
                                                        name: "Kaydın bilgileri",
                                                        value: `**• Kayıt edilen kişi:** ${recreateMemberName}\n` +
                                                            `**• Kayıt eden yetkili:** ${recreateAuthorName}`
                                                    }
                                                )
                                                .setImage(customAfterLoginMessage.image ?? null)
                                                .setThumbnail(memberAvatar)
                                                .setColor(`#${colors.girl}`)
                                                .setFooter({
                                                    text: `Yetkilinin kayıt sayısı: ${toHumanizeRegisterCount}`
                                                })
                                        ]
                                    } :
                                    // Eğer mesaj normal gönderilecekse
                                    {

                                        content: resultMessage,
                                        files: customAfterLoginMessage.image ?
                                            [new AttachmentBuilder(customAfterLoginMessage.image)] :
                                            [],
                                        allowedMentions: {
                                            users: [
                                                memberId
                                            ],
                                            roles: []
                                        }
                                    }
                            );

                        }
                        // Eğer özel mesaj ayarlanmamışsa mesajı gönder
                        else {
                            const embed = new EmbedBuilder()
                                .setTitle(`Aramıza hoşgeldin ${recreateMemberName} ${EMOJIS.hi}`)
                                .setDescription(`${EMOJIS.crazy} **• <@${memberId}> aramıza ${girlRolesString} rolleriyle katıldı**`)
                                .addFields(
                                    {
                                        name: "Kaydın bilgileri",
                                        value: `**• Kayıt edilen kişi:** ${recreateMemberName}\n` +
                                            `**• Kayıt eden yetkili:** ${recreateAuthorName}`
                                    }
                                )
                                .setThumbnail(memberAvatar)
                                .setColor(`#${colors.girl}`)
                                .setFooter({
                                    text: `Yetkilinin kayıt sayısı: ${toHumanizeRegisterCount}`
                                });

                            // Mesajı gönder
                            channel.send({
                                content: randomMessage,
                                embeds: [
                                    embed
                                ],
                            });
                        }

                    }
                }

                // Database'ye kaydedilecek son veriler
                guildDatabase.register.lastRegisters.unshift({
                    gender: "girl",
                    authorId,
                    memberId,
                    isAgainRegister: memberPrevNames.length > 0,
                    timestamp: NOW_TIME
                })

                // Log kanalına mesaj atılacak mesaj
                const logChannelId = guildDatabase.register.channelIds.log;
                if (logChannelId) {
                    const logChannel = guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const NOW_TIME_IN_SECOND = Math.round(NOW_TIME / 1000);
                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                `**• Sunucuda toplam ${Util.toHumanize(guildDatabase.register.lastRegisters.length, language)} kişi kayıt edildi!**\n\n` +
                                `🧰 **KAYIT EDEN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${recreateAuthorName}\n` +
                                `**• Kayıt sayısı:** ${toHumanizeRegisterCount} - (${EMOJIS.boy} ${Util.toHumanize(authorData.countables.boy || 0, language)}, ${EMOJIS.girl} ${Util.toHumanize(authorData.countables.girl || 0, language)})\n` +
                                `**• Nasıl kayıt etti:** Komut kullanarak\n` +
                                `**• Kayıt zamanı:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                `👤 **KAYIT EDİLEN ÜYE**\n` +
                                `**• Adı:** <@${memberId}> - ${recreateMemberName}\n` +
                                `**• Alınan rol:** ${isMemberHasUnregisterRole ? `<@&${unregisterRoleId}>` : "Üyede kayıtsız rolü yoktu"}\n` +
                                `**• Verilen rol(ler):** ${girlRolesString}\n` +
                                `**• Yeni ismi:** ${recreateName}\n` +
                                `**• Kayıt şekli:** Kız ${EMOJIS.girl}\n` +
                                `**• Üye daha önceden kayıt edilmiş mi:** ${memberPrevNames.length > 0 ? `Evet ${memberPrevNames.length} kere` : "Hayır"}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(`#${colors.girl}`)
                            .setFooter({
                                text: `${msg.client.user.username} Log sistemi`,
                                iconURL: clientAvatar
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
                    roles: girlRolesString,
                    timestamp: NOW_TIME
                };
                authorData.firstRegister ||= lastAndFirstRegisterObject;
                authorData.lastRegister = lastAndFirstRegisterObject;

                memberPrevNames.unshift({
                    gender: "girl",
                    name: memberName,
                    roles: girlRolesString,
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
                guildData.girl += 1;
                guildData.total += 1;
                alisa.registersCount.nowTotal += 1;

                // Eğer kayıt 100'ün katıysa database'ye kaydet
                if (alisa.registersCount.nowTotal % 100 == 0) {
                    alisa.registersCount[alisa.registersCount.nowTotal] = NOW_TIME
                }

                // En sonunda ise dosyaları kaydet
                database.writeFile(alisa, "alisa", "other");
                database.writeFile(allRegistersFile, "all registers", "other");
                return database.writeFile(guildDatabase, guildId);
            })
            // Eğer hata çıktıysa kullanıcıya bildir
            .catch(async err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                console.log(err);
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};