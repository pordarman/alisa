const {
    EMOJIS,
    mainBotId
} = require("../../../../settings.json");
const allOtherMessages = require("./Others")

const registerTypeToText = {
    boy: `Erkek ${EMOJIS.boy}`,
    girl: `Kız ${EMOJIS.girl}`,
    member: `Üye ${EMOJIS.member}`,
    bot: `Bot ${EMOJIS.bot}`,
}

const registerMessages = {
    commandNames: {
        auth: "yetkilirol",
        boy: "erkekrol",
        girl: "kızrol",
        member: "üyerol",
        botRole: "botrol",
        unregisterRole: "kayıtsızrol",
        registerChannel: "kayıtkanal",
    },
    roleNames: {
        auth: "kullanıcıları kaydeden yetkili",
        boy: "erkek",
        girl: "kız",
        member: "üye",
        unregister: "kayıtsız",
    },
    registerChannelName: "kayıt",
    noRegister({
        hasAdmin,
        prefix,
    }) {
        return `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (hasAdmin ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
    },
    registerTypeIs: {
        member({
            prefix,
            hasAdmin
        }) {
            return `Kayıt türüm __**Üyeli kayıt**__ olarak ayarlı! Lütfen \`${prefix}kayıt\` komutunu kullanınız` +
                (hasAdmin ?
                    `\n\n• Eğer kız ve erkek olarak kayıt etmek isterseniz **${prefix}kayıttür cinsiyet** yazabilirsiniz` :
                    "")
        },
        gender({
            prefix,
            hasAdmin
        }) {
            return `Kayıt türüm __**Cinsiyet**__ olarak ayarlı! Lütfen \`${prefix}e\` veya \`${prefix}k\` komutunu kullanınız` +
                (hasAdmin ?
                    `\n\n• Eğer kız ve erkek olarak kayıt etmek istemezseniz **${prefix}kayıttür üye** yazabilirsiniz` :
                    "")
        }
    },
    isNotRegisterChannel(channelId) {
        return `Lütfen kayıtları kayıt kanalı olan <#${channelId}> kanalında yapınız`
    },
    cantRegisterBotAsMember: {
        startString: "Bir botu bu komutu kullanarak kayıt edemezsin\n\n",
        existBotRole({
            prefix,
            botId
        }) {
            return this.startString + `• Eğer botu kayıt etmek isterseniz **${prefix}bot ${botId}** yazabilirsiniz`
        },
        notExistBotRole(prefix) {
            return this.startString + `• Eğer botu kayıt etmek isterseniz ilk önce **${prefix}bot-rol** ile bir bot rolünü ayarlamalısınız`
        },
        notExistBotRoleAndNotAdmin() {
            return this.startString + "• Eğer botu kayıt etmek isterseniz yetkililere bir bot rolü ayarlamasını söyleyiniz"
        }
    },
    cantRegisterMemberAsBot({
        prefix,
        registerType
    }) {
        return `You can't register someone as a bot, you stupid thing\n\n` +
            `• If you want to register a person! Please use **${registerType == "member" ?
                `${prefix}member` :
                `${prefix}boy **or** ${prefix}girl`
            }** commands`
    },
    notInGuild(memberId) {
        return `• <@${memberId}> adlı kişi işlem yapılırken sunucudan ayrıldığı için işlem iptal edildi`
    },
    notRegisterBefore: "Şeyyy... Bu kişi daha önceden bu sunucuda kayıt olmadığı için bu komutu kullanamazsın :(",
    whileRegister: {
        you: `${allOtherMessages.waitThere} Aynı anda hem butonla hem de komutla kayıt edemezsin!`,
        other: `${allOtherMessages.waitThere} Şu anda başkası kayıt işlemini gerçekleştiriyor!`,
    },
    whileChangeName: {
        you: `${allOtherMessages.waitThere} Aynı anda hem butonla hem de komutla isim değiştiremezsin!`,
        other: `${allOtherMessages.waitThere} Şu anda başkası isim değiştirme işlemini gerçekleştiriyor!`,
    },
    alreadyRegister(memberId) {
        return `<@${memberId}> adlı kişi zaten daha önceden kayıt edilmiş`
    },
    alreadyRegisterBot(memberId) {
        return `<@${memberId}> adlı bot zaten daha önceden kayıt edilmiş`
    },
    enterName({
        prefix,
        memberId,
        commandName
    }) {
        return `Lütfen kayıt edeceğiniz kişinin ismini giriniz (Bu hatayı **${prefix}isimzorunlu kapat** yazarak kapatabilirsiniz)\n\n` +
            `**Örnek**\n` +
            `• ${prefix}${commandName} ${memberId} Fearless Crazy 20\n` +
            `• ${prefix}${commandName} <@${memberId}> Fearless Crazy 20\n` +
            `• ${prefix}${commandName} Fearless Crazy 20 <@${memberId}>`
    },
    again: {
        differentType: "Heyy dur bakalım orada! Bu kişi daha önce **Üye** olarak kayıtlıydı, ancak şu anda kayıt tipim __**Cinsiyet**__ olduğundan bu komutu kullanamazsın",
        noAge: "Bu kişinin daha önceden yapılan kaydında yaş bilgisi girilmemiş ve bu sunucuda yaş zorunluluğu aktif! Lütfen kişiyi normal şekilde kayıt ediniz",
        underAge({
            age,
            ageLimit
        }) {
            return `Bu kişinin daha önceden yapılan kaydında yaş bilgisi **${age}** olarak girilmiş ancak şu an sunucunun yaş sınırı **${ageLimit}**! Lütfen kişiyi normal şekilde kayıt ediniz`
        },
        discordNameError: "Kullanıcı adı 32 karakterden fazla! Lütfen kişiyi normal şekilde kayıt ediniz"
    },
    enterAge: `${allOtherMessages.waitThere} Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!`,
    underAge(ageLimit) {
        return `${allOtherMessages.waitThere} Bu sunucuda **${ageLimit}** yaşından küçükleri kayıt edemezsin!`
    },
    discordNameError: "Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz",
    buttonLabels: {
        changeName: "İsmini değiştir",
        changeGender: "Cinsiyetini değiştir",
        unregister: "Kayıtsıza at",
    },
    writeMembersName({
        authorId,
        memberId,
        isAgeRequired,
        isNameRequired,
        type
    }) {
        return `${EMOJIS[type]} <@${authorId}>, kayıt etmek istediğiniz <@${memberId}> adlı kişinin **sadece ismini ${isAgeRequired ? "ve yaşını " : ""}**mesaj olarak yazınız` +
            (isNameRequired ? "" : `\n\n*• Eğer isim girmek istemiyorsanız __**İsimsiz**__ yazabilirsiniz*`);
    },
    enterOnlyName({
        authorId,
        memberId
    }) {
        return `• 📝 <@${authorId}>, ismini değiştimek istediğiniz <@${memberId}> adlı kişinin lütfen **SADECE İSMİNİ** yazınız`
    },
    successChangeName({
        authorId,
        memberId,
        memberName
    }) {
        return `• <@${memberId}> adlı kişinin ismini **${memberName}** olarak değiştirdim. Bir daha dikkatli ol <@${authorId}> :)`
    },
    embedRegister: {
        author: "Kayıt yapıldı",
        botsHaveNoRank: "Botların rankı olmaz :)",
        description: {
            alreadyRegister({
                memberId,
                registerCount,
                prefix
            }) {
                return `• <@${memberId}> adlı kişi bu sunucuda daha önceden **${registerCount}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberId}**)`
            },
            congrats({
                authorId,
                newRank
            }) {
                return `• <@${authorId}> Tebrikler **${newRank}** kümesine terfi ettin! 🎉`
            },
            giveNewRole({
                authorId,
                rankCount,
                roleId
            }) {
                return `• <@${authorId}> Tebrikler, toplamda **${rankCount}** kez kayıt işlemi yaptığın için sana <@&${roleId}> rolü verildi! 🎉`
            }
        },
        fields({
            authorId,
            rank,
            registerCount,
            memberId,
            newName,
            givenRoles
        }) {
            return [
                {
                    name: "`Kayıt yapan`",
                    value: `> 👤 **Adı:** <@${authorId}>\n` +
                        `> 🔰 **Rankı:** ${rank || "Rankı yok"}\n` +
                        `> 📈 **Kayıt sayısı:** ${registerCount}`,
                    inline: true
                },
                {
                    name: "`Kayıt edilen`",
                    value: `> 👤 **Adı:** <@${memberId}>\n` +
                        `> 📝 **Yeni ismi:** ${newName}\n` +
                        `> ${EMOJIS.role} **Verilen rol(ler):** ${givenRoles}`,
                    inline: true
                }
            ]
        },
    },
    embedRegisterBot: {
        description: `**• Bot otomatik olarak kayıt edildi ${EMOJIS.yes}**`,
        noBotRole: `Bu sunucuda herhangi bir bot rolü ayarlanmadığı için botu otomatik olarak kayıt edemedim`
    },
    embedAfterRegister: {
        title: "Aramıza hoşgeldin",
        description({
            memberId,
            givenRoles
        }) {
            return `${EMOJIS.crazy} **• <@${memberId}> aramıza ${givenRoles} rolleriyle katıldı**`
        },
        fields({
            authorId,
            authorName,
            memberId,
            memberName,
        }) {
            return {
                name: "Kaydın bilgileri",
                value: `**• Kayıt eden yetkili:** <@${authorId}> - ${authorName}\n` +
                    `**• Kayıt edilen kişi:** <@${memberId}> - ${memberName}`
            }
        },
        footer: "Yetkilinin kayıt sayısı"
    },
    embedLog: {
        description({
            registerType,
            totalRegisterCount,
            authorId,
            authorName,
            authorRegisterCounts: {
                total,
                boy,
                girl,
                member,
                bot
            },
            commandOrButton,
            registerAt,
            memberId,
            memberName,
            isMemberHasUnregisterRole,
            takenRole,
            givenRoles,
            newName,
            type,
            memberPrevNamesLength
        }) {
            return `**• Sunucuda toplam ${totalRegisterCount} kişi kayıt edildi!**\n\n` +
                `🧰 **KAYIT EDEN YETKİLİ**\n` +
                `**• Adı:** <@${authorId}> - ${authorName}\n` +
                (
                    authorId == mainBotId ?
                        `**• Kayıt sayısı:** ${bot} - (${EMOJIS.bot} ${bot})\n` :
                        `**• Kayıt sayısı:** ${total} - (${registerType == "gender" ? `${EMOJIS.boy} ${boy}, ${EMOJIS.girl} ${girl}` : `${EMOJIS.member} ${member}`}, ${EMOJIS.bot} ${bot})\n`
                ) +
                `**• Nasıl kayıt etti:** ${commandOrButton}\n` +
                `**• Kayıt zamanı:** <t:${registerAt}:F> - <t:${registerAt}:R>\n\n` +
                `👤 **KAYIT EDİLEN ÜYE**\n` +
                `**• Adı:** <@${memberId}> - ${memberName}\n` +
                `**• Alınan rol:** ${isMemberHasUnregisterRole ? `<@&${takenRole}>` : "Üyede kayıtsız rolü yoktu"}\n` +
                `**• Verilen rol(ler):** ${givenRoles}\n` +
                `**• Yeni ismi:** ${newName}\n` +
                `**• Kayıt şekli:** ${registerTypeToText[type]}\n` +
                `**• Üye daha önceden kayıt edilmiş mi:** ${memberPrevNamesLength > 0 ? `Evet ${memberPrevNamesLength} kere` : "Hayır"}`
        },
        command: "Komut kullanarak",
        button: "Buton kullanarak",
        auto: "Otomatik",

    }
}

module.exports = registerMessages;