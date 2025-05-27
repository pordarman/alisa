const Util = require("../../../Util.js");
const Time = require("../../../Time");
const {
    prefix: defaultPrefix,
    discordInviteLink,
    botInviteLink,
    ownerId,
    EMOJIS
} = require("../../../../settings.json");
const {
    GuildDefaultMessageNotifications
} = require("discord.js");

// Dil
const language = "tr";

const allMessages = {
    afk: {
        success: `${EMOJIS.yes} Başarıyla AFK moduna girdiniz!`,
    },
    alisa: {
        times: "kere",
        unknown: "Bilinmeyen",
        enterOption(prefix) {
            return `Lütfen bir seçenek giriniz\n\n` +
                `**🗒️ Girilebilir seçenekler**\n` +
                `**• ${prefix}alisa sıra =>** Botun komutlarını en çok kullanan kişiler\n` +
                `**• ${prefix}alisa toplam =>** Şu ana kadar yapılmış kayıtların sayısı\n` +
                `**• ${prefix}alisa komutlar =>** Komutların kaç kere kullanıldığını gösterir\n` +
                `**• ${prefix}alisa sunucu =>** Bütün kayıt yapan sunucu sıralaması\n` +
                `**• ${prefix}alisa kim =>** Alisa kim???`
        },
        lb: {
            description({
                length,
                userIndex,
                commandUses
            }) {
                return `• Botun komutlarını en çok kullanan kişiler\n` +
                    `• Sen **${length}** kişi içerisinden **${userIndex}.** sıradasın! (**__${commandUses}__ kullanım**) 🎉`
            }
        },
        commands: {
            description(totalUsageCount) {
                return `Botun komutları toplamda ${totalUsageCount} kere kullanıldı`
            }
        },
        total: {
            registered: "KAYIT EDİLEN",
            type: "KAYIT TÜRÜ",
            gender: "Cinsiyet",
            member: "Üyeli kayıt",
            most: "En fazla kayıt yapan 8 sunucu"
        },
        guilds: {
            embed: {
                description({
                    length,
                    guildIndex,
                    total
                }) {
                    return `**• En fazla kayıt yapan sunucu sıralaması __(${length} sunucu)__**\n` +
                        (
                            guildIndex == -1 ?
                                `• Sunucunun sıralaması bulunamadı!` :
                                `• Bu sunucu tam olarak ${guildIndex}. sırada! (**__${total}__ kayıt**) 🎉`
                        )
                }
            }
        },
        who: {
            who: "kim",
            description({
                username,
                createdTimestamp,
                prefix,
                lastOneDay,
                length
            }) {
                return `• ${username} **<t:${createdTimestamp}:F>** tarihinde tatlı mı tatlı bir bot olarak oluşturuldu\n\n` +
                    `• ${username} aslında ilk public botumun yardımcısı olarak oluşturulmuştu fakat sonradan bu botla uğraşmaktan daha çok zevk aldığımı fark ettim ve ilk botumu kapattım\n\n` +
                    `• Bota hemen hemen her gün farklı bir özellik veya optimizasyon getiriyorum ki bot hızını asla yitirmesin\n\n` +
                    `• Ayrıca sizin verdiğiniz öneriler sayesinde bota birçok yeni ve gelişmiş özellikler getiriyoruz ki botun birçok komutu öneriler sayesinde geldi. **(${prefix}ses komutu, jail sistemi vb.)**\n\n` +
                    `• Son 24 saatte **${lastOneDay}**, toplamda **${length}** sunucuya eklendim!`
            },
            footer: "İyi ki varsınız <3"
        }
    },
    ban: {
        successBan({
            authorName,
            reason
        }) {
            return `Yasaklayan: ${authorName} | Sebebi: ${reason || "Sebep belirtilmemiş"}`
        },
        successMsg({
            userName,
            userId,
            penaltyNumber,
            guildMember
        }) {
            return `${EMOJIS.yes} **${userName} - (${userId})** başarıyla sunucudan yasaklandı, tadını çıkar 🥳${penaltyNumber ? ` **Ceza numarası:** \`#${penaltyNumber}\`` : ""}${!guildMember ? " - *( Bu kişi sunucuda değildi )*" : ""}`
        },
        embed: {
            description({
                userId,
                authorId,
                authorDisplayName,
                userDisplayName,
                reason,
                penaltyNumber,
                banAt
            }) {
                return `**${EMOJIS.ban} <@${userId}> adlı üye __kalıcı__ olarak sunucudan yasaklandı**\n\n` +
                    `🧰 **BANLAYAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Ban tarihi:** <t:${banAt}:F> - <t:${banAt}:R>\n\n` +
                    `👤 **BANLANAN ÜYE**\n` +
                    `**• Adı:** <@${userId}> - ${userDisplayName}\n` +
                    `**• Banlanma sebebi:** ${reason || "Sebep belirtilmemiş"}` +
                    (penaltyNumber ?
                        `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                        "")
            }
        },
        error(error) {
            return "Yasaklamak istediğiniz üyeyi sunucudan yasaklayamadım :(\n\n" +
                "**Sebebi:**" +
                `• ${error}`
        }
    },
    banner: {
        noBanner(userId) {
            return `<@${userId}> adlı kişinin bir bannerı bulunmuyor :(`;
        },
        noBannerYou: "Sizin bir banneriniz bulunmuyor :(",
    },
    bototo: {
        optionName: "Bot otomatik kayıt",
        enter(prefix) {
            return `• Botları otomatik kayıt etmeyi açmak için **${prefix}bototo aç**\n` +
                `• Kapatmak için ise **${prefix}bototo kapat** yazabilirsiniz`
        }
    },
    davet: {
        invite: "Al bakalım şapşik şey :)",
        inviteButtons: {
            invite: "Beni davet et",
            vote: "Oy ver",
            support: "Destek sunucum"
        }
    },
    değiştir: {
        commandOnlyGender: "Bu komut sadece __**Cinsiyet**__ ile kayıt yapanlara özeldir",
        dontHaveBoyOrGirlRole(memberId) {
            return `<@${memberId}> adlı kişide hem erkek rolü hem de kız rolü bulunmuyor!`
        },
        selectGenderContent: "Etiketlediğiniz kişide hem erkek hem de kız rolü bulunuyor. Lütfen aşağıdaki düğmelerden hangi rolü vermemi istyorsanız onu seçiniz",
        successTo: {
            boy(memberId) {
                return `• ♻️ ${EMOJIS.boy} <@${memberId}> adlı kişiden kız rolünü alıp erkek rolünü verdim`;
            },
            girl(memberId) {
                return `• ♻️ ${EMOJIS.girl} <@${memberId}> adlı kişiden erkek rolünü alıp kız rolünü verdim`;
            }
        },
    },
    destek: {
        description(prefix) {
            return `• Görünüşe göre biraz yardıma ihtiyacın var gibi görünüyor isterseniz size biraz yardım edebilirim ne dersin?\n\n` +
                `• **[Destek sunucuma](${discordInviteLink})** gelip yetkililerden yardım etmesini isteyebilirsiniz\n\n` +
                `• Ha eğer destek sunucuma gelmeden yardım almak istiyorsanız kısaca **${prefix}kur** komutunu kullanıp bütün sorulara cevap vererek bütün kayıt sistemini hızlı bir şekilde kurabilirsiniz\n\n` +
                `• Ve mümkünse **${prefix}yardım** yazarak bütün komutlarımı gördükten sonra kullanmaya başlayınız çünkü birçok komutum işlemleriniz daha kolay ve daha pratik bir şekilde yapmanızı sağlıyor. **__Bu yüzden bütün komutlarıma bakmayı sakın unutmayınız.__**\n\n` +
                `• Eğer daha fazla yardıma ihtiyacınız varsa **[destek sunucuma](${discordInviteLink})** gelmeyi sakın unutma ^^\n\n` +
                `• Ve en önemlisi *seni seviyorum...* :)`
        }
    },
    dil: {
        already: "Zaten **Türkçe 🇹🇷** dilini kullanıyorsun şapşik şey seni :)",
        changed: "The bot's language has been successfully changed to **English 🇬🇧** for server",
        enter(prefix) {
            return `Lütfen botun sunucu için değişeceği dili giriniz\n\n` +
                `**Şu anda kullanılabilir diller:**\n` +
                `• ${prefix}dil türkçe\n` +
                `• ${prefix}dil ingilizce`;
        }
    },
    emoji: {
        enter(prefix) {
            return `Lütfen bir emoji belirtiniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}emoji ${EMOJIS.alisa}\n` +
                `• ${prefix}emoji 123456789012345678\n` +
                `• ${prefix}emoji alisa`
        },
        notFound: "Belirtilen emoji bulunamadı",
        animated: "Animasyonlu",
        notAnimated: "Animasyonsuz",
        embedDescription({
            emojiName,
            emojiId,
            createdTimestampInSecond,
            authorOfEmojiTag,
            authorOfEmojiId,
            emojiType,
            emojiImage,
            emojiTypeEmoji,
            emojiRawName
        }) {
            return `• **${emojiName}** adlı emoji hakkında bilgiler\n\n` +
                `📝 **Emojinin adı:** ${emojiName}\n` +
                `🆔 **Emojinin ID'si:** ${emojiId}\n` +
                `🗓️ **Emojinin oluşturulma tarihi:** <t:${createdTimestampInSecond}:F> - <t:${createdTimestampInSecond}:R>\n` +
                `👤 **Emojinin oluşturan kişi:** ${authorOfEmojiTag} (${authorOfEmojiId})\n` +
                `${emojiTypeEmoji} **Emojinin tipi:** ${emojiType}\n` +
                `🌐 **Emojinin URL'si:** [Buraya tıkla](${emojiImage})\n` +
                `📌 **Ham emoji:** \`${emojiRawName}\``
        }
    },
    emojiekle: {
        enter(prefix) {
            return `Lütfen eklemek istediğiniz emojiyi ve ismini giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}emojiekle ${EMOJIS.drink} Ham\n` +
                `• ${prefix}emojiekle https://cdn.discordapp.com/emojis/1178353610518708264.png?size=4096 Ham`
        },
        invalidType: "Girdiğiniz resimin tipi geçerli bir resim değil! Lütfen resmin tipini jpg, jpeg, png veya gif olarak değiştiriniz",
        enterName: "Lütfen eklemek istediğiniz emojiye bir isim giriniz. İsmini girerken sadece harf, rakam ve alt çizgi kullanabilirsiniz gerisi silinecektir",
        tooLongName: "Emoji ismi çok uzun olamaz! Emoji ismi **32** karakterden küçük olmalıdır",
        sameName: "Bu isimde bir emoji zaten var",
        tooMuchEmoji: "Sunucunun emoji limitine ulaşıldı! Lütfe sunucudan bir emoji silerek tekrar deneyiniz",
        invalidForm: "Girdiğiniz emoji adı, emoji URL'si veya girdiğiniz resmin boyutu çok büyük! Lütfen geçerli bir emoji adı veya emoji URL'si giriniz",
        invalidEmoji: "Girdiğiniz emoji geçerli bir emoji değil! Lütfen geçerli bir emoji giriniz",
        maxSize: "Eklemeye çalıştığınız emoji çok büyük! Emoji boyutu **256KB**'dan küçük olmalıdır",
        adding: "Emoji sunucuya ekleniyor...",
        success(emoji) {
            return `• ${emoji} adlı emoji başarıyla sunucuya eklendi ${EMOJIS.yes}`
        },
    },
    günlüközel: {
        anothers: "Heyy dur bakalım orada! Şu anda başka bir yetkili özel mesajı ayarlıyor",
        cancel: "İşlem iptal edilmiştir",
        resets: {
            already: `Kayıt sonrası özelleştirilmiş mesajı zaten ayarlı değil`,
            success: `${EMOJIS.yes} Kayıt sonrası özelleştirilmiş mesajı başarıyla sıfırlandı`
        },
        tooMuchCharacter(maxLength) {
            return `Karakter sayısı çok fazla! Mesajınız **${maxLength}** karakterden küçük olmalıdır!`
        },
        success: `${EMOJIS.yes} Kayıt sonrası özelleştirilmiş mesajı başarıyla ayarlandı\n\n` +
            `**Şöyle gözükecek**`,
        givenRoles: "__**VERİLEN ROLLER**__ (Bu role sahip olanlara bildirim gitmeyecek)",
        embed: {
            title: "Şimdi düşünme zamanı",
            description({
                clientUserId,
                recreateClientName,
                guildTag,
                memberCount,
                memberCountEmojis,
                authorId,
                recreateAuthorName
            }) {
                return `• İptal etmek için **iptal**\n` +
                    `• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n` +
                    `**Kayıt sonrası mesajının kutusuz olmasını istiyorsanız yazacağın mesajın başına <kutusuz> yazman yeterli!**\n\n` +
                    `**Değişkenler**\n` +
                    `**• <üye>** => Kayıt edilen kişiyi etiketler - ( <@${clientUserId}> )\n` +
                    `**• <üyeİsim>** => Kayıt edilen kişinin adını yazar - ( ${recreateClientName} )\n` +
                    `**• <üyeID>** => Kayıt edilen kişinin ID'sini yazar - ( ${clientUserId} )\n` +
                    `**• <rol>** => Verilen rolü etikerler (bu role sahip olanlara bildirim gitmez) - ( @Roller )\n` +
                    `**• <tag>** => Sunucunun tag(larını) yazar - ( ${guildTag || "**TAG YOK**"} )\n` +
                    `**• <toplam>** => Sunucuda bulunan kişi sayısını yazar - ( ${memberCount} )\n` +
                    `**• <emojiToplam>** => Sunucuda bulunan kişi sayısını emojili yazar - ( ${memberCountEmojis} )\n` +
                    `**• <yetkili>** => Kayıt eden yetkiliyi etiketler - ( <@${authorId}> )\n` +
                    `**• <yetkiliİsim>** => Kayıt eden yetkilinin tüm adını yazar - ( ${recreateAuthorName} )\n` +
                    `**• <yetkiliID>** => Kayıt eden yetkilinin ID'sini yazar - ( ${authorId} )\n` +
                    `**• <kayıttoplam>** => Kayıt eden yetkilinin kayıt sayısını yazar - ( 888 )`
            },
            footer: "Cevap vermek için 16 dakikanız vardır"
        }
    },
    hata: {
        enterMessage: "Lütfen bildirmek istediğiniz hatayı yazınız",
        success: "📢 **Hata mesajınız alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**"
    },
    isim: {
        success: "Kullanıcının ismi başarıyla değiştirildi!",
        enter({
            prefix,
            memberId
        }) {
            return `Lütfen ismini değiştireceğiniz kişinin ismini giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}i ${memberId} Fearless Crazy 20\n` +
                `• ${prefix}i <@${memberId}> Fearless Crazy 20\n` +
                `• ${prefix}i Fearless Crazy 20 <@${memberId}>`
        },
        sameName(memberId) {
            return `<@${memberId}> adlı kişinin ismi yazdığınız isimle aynı zaten`
        }
    },
    "isim-özel": {
        register: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `Buradaki değişkenleri kullanarak kayıt edilen kişinin ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel kayıt sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Girdiğiniz ismi ekler - ( ${userDisplayName} )\n` +
                    `**• <yaş>** => Eğer yaşını girdiyseniz yaşını ekler, girmediyseniz hiçbir şey eklemez - ( 20 )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}isim-özel kayıt <tag> <isim> [<yaş>]\n` +
                    `• ${prefix}isim-özel kayıt ♫ <isim> | <yaş> <tag>`
            },
            reset: {
                already: "Kullanıcının kayıt sırasında düzenlenecek ismi zaten sıfırlanmış durumda",
                success: "Kullanıcının kayıt sırasında düzenlenecek ismi başarıyla sıfırlandı!"
            },
            success: "Kullanıcının kayıt sırasında düzenlenecek ismi başarıyla güncellendi!\n\n" +
                "**Şöyle gözükecek**"
        },
        registerbot: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `Buradaki değişkenleri kullanarak kayıt edilen __botun__ ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel kayıtbot sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Girdiğiniz ismi ekler - ( ${userDisplayName} )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}isim-özel kayıtkayıt <tag> <isim>\n` +
                    `• ${prefix}isim-özel kayıtkayıt ♫ <isim> | <tag>`
            },
            reset: {
                already: "Botun kayıt sırasında düzenlenecek ismi zaten sıfırlanmış durumda",
                success: "Botun kayıt sırasında düzenlenecek ismi başarıyla sıfırlandı!"
            },
            success: "Botun kayıt sırasında düzenlenecek ismi başarıyla güncellendi!\n\n" +
                "**Şöyle gözükecek**"
        },
        login: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `Buradaki değişkenleri kullanarak sunucuya giren kişinin ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel giriş sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Kullanıcının ismini yazar - ( ${userDisplayName} )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}isim-özel giriş <tag> <isim>\n` +
                    `• ${prefix}isim-özel giriş ♫ <isim> | <tag>`
            },
            reset: {
                already: "Kullanıcının sunucuya girdiğinde düzenlenecek ismi zaten sıfırlanmış durumda",
                success: "Kullanıcının sunucuya girdiğinde düzenlenecek ismi başarıyla sıfırlandı!"
            },
            success: "Kullanıcının sunucuya girdiğinde düzenlenecek ismi başarıyla güncellendi!\n\n" +
                "**Şöyle gözükecek**"
        },
        loginbot: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `Buradaki değişkenleri kullanarak sunucuya giren __botun__ ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel girişbot sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Kullanıcının ismini yazar - ( ${userDisplayName} )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}isim-özel girişbot <tag> <isim>\n` +
                    `• ${prefix}isim-özel girişbot ♫ <isim> | <tag>`
            },
            reset: {
                already: "Botun sunucuya girdiğinde düzenlenecek ismi zaten sıfırlanmış durumda",
                success: "Botun sunucuya girdiğinde düzenlenecek ismi başarıyla sıfırlandı!"
            },
            success: "Botun sunucuya girdiğinde düzenlenecek ismi başarıyla güncellendi!\n\n" +
                "**Şöyle gözükecek**"
        },
        enter(prefix) {
            return `• Yeni gelen kullanıcının ismini düzenlemek için **${prefix}isim-özel giriş**\n` +
                `• Birisini kayıt ettikten sonraki ismini düzenlemek için **${prefix}isim-özel kayıt**\n\n` +
                `• Yeni gelen __botun__ ismini düzenlemek için **${prefix}isim-özel girişbot**\n` +
                `• Bir __botu__ kayıt ettikten sonraki ismini düzenlemek için **${prefix}isim-özel kayıtbot** yazabilirsiniz`
        }
    },
    isimler: {
        missingDatas: "Etiketlediğiniz kişi daha önceden hiç kayıt edilmediği için tablo gösterilemiyor",
        registrar: "Kayıt eden",
        embedDescription({
            userId,
            length
        }) {
            return `**• <@${userId}> adlı kişinin toplam __${length}__ tane isim geçmişi bulundu**`
        }
    },
    isimzorunlu: {
        optionName: "İsim zorunluluğu",
        enter(prefix) {
            return `• İsim zorunluluğu ayarını açmak için **${prefix}isimzorunlu aç**\n` +
                `• Kapatmak için ise **${prefix}isimzorunlu kapat** yazabilirsiniz`
        }
    },
    istatistik: {
        buttonLabels: {
            invite: "Beni davet et",
            vote: "Bana oy ver",
            support: "Destek sunucum"
        },
        loading(points) {
            return `${EMOJIS.loading} **Veriler alınıyor, lütfen biraz bekleyin${points}**`;
        },
        lastReboot(timestamp) {
            return `⏲️ **Son yeniden başlatma:** <t:${timestamp}:F> - <t:${timestamp}:R>`;
        },
        botInformation: {
            name: "BOT BİLGİLERİ",
            value({
                clientUsername,
                id,
                createdTimestamp,
                usedMemory,
                usedRamPercent
            }) {
                return `✏️ **Kullanıcı adım:** ${clientUsername}\n` +
                    `🆔 **Discord ID:** ${id}\n` +
                    `📅 **Kuruluş tarihim:** <t:${createdTimestamp}:F>\n` +
                    `🎚️ **RAM kullanımı:** ${usedMemory} - %${usedRamPercent}`;
            }
        },
        delayInformation: {
            name: "GECİKME BİLGİLERİ",
            value({
                wsPing,
                messageSendPing,
                messageEditPing,
                databasePing
            }) {
                return `📡 **Botun ana gecikmesi:** ${wsPing} ms\n` +
                    `📨 **Mesaj gecikmesi:** ${messageSendPing} ms\n` +
                    `📄 **Mesaj düzenleme gecikmesi:** ${messageEditPing} ms\n` +
                    `📁 **Veritabanı gecikmesi:** ${databasePing} ms`;
            }
        },
        developers: {
            name: "GELİŞTİRİCİLERİM",
            value(ownerDisplayName) {
                return `👑 **${ownerDisplayName ?? "silinmiş_kullanıcı"} - ${ownerId}** (Yapımcı)`;
            }
        },
        serverInformation: {
            name: "SUNUCU BİLGİLERİ",
            value({
                guildsCount,
                usersCount,
                channelsCount,
                rolesCount
            }) {
                return `💻 **Sunucu sayısı:** ${guildsCount}\n` +
                    `👥 **Kullanıcı sayısı:** ${usersCount}\n` +
                    `${EMOJIS.channel} **Kanal sayısı:** ${channelsCount}\n` +
                    `${EMOJIS.role} **Rol sayısı:** ${rolesCount}`;
            }
        },
        versions: {
            name: "SÜRÜMLER",
            value({
                nodeVersion,
                discordVersion,
                databaseVersion,
                botVersion
            }) {
                return `🎛️ **Node.js sürümü:** ${nodeVersion}\n` +
                    `🔨 **Discord.js sürümü:** v${discordVersion}\n` +
                    `📒 **Veritabanı sürümü:** v${databaseVersion}\n` +
                    `${EMOJIS.alisa} **Alisa sürümü:** v${botVersion}`;
            }
        },
        vdsInformation: {
            name: "VDS BİLGİLERİ",
            value({
                vdsName,
                operatingSystemVersion,
                cpuModel,
                totalRam,
                freeRam
            }) {
                return `📝 **VDS adı:** ${vdsName}\n` +
                    `🖥️ **İşletim sistmei sürümü:** ${operatingSystemVersion}\n` +
                    `🎞️ **CPU:** ${cpuModel}\n` +
                    `🔋 **Toplam ram:** ${totalRam} (**Boş:** ${freeRam})`;
            }
        }
    },
    jail: {
        already: "Bu kişi zaten jailde",
        jailed({
            memberId,
            reason
        }) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişi __**${reason || "Sebep belirtilmemiş"}**__  sebebiyle jail'e atıldı!`
        },
        embed: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId,
                reason
            }) {
                return `**🔇 <@${memberId}> adlı üye Jail'e atıldı**\n\n` +
                    `🧰 **JAIL'E ATAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **JAIL'E ATILAN KİŞİ**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Verilen rol:** <@&${jailRoleId}>\n` +
                    `**• Sebebi:** ${reason || "Sebep belirtilmemiş"}`
            }
        }
    },
    jailson: {
        cantShow: {
            user: "Etiketlediğiniz kişi daha önceden hiç Jail'e atılmadığı için tablo gösterilemiyor",
            guild: "Bu sunucuda daha önce hiç kimse Jail'e atılmadığı için tablo gösterilemiyor"
        },
        total: {
            user(userId) {
                return `<@${userId}> adlı kişinin toplamda`
            },
            guild: "Bu sunucuda toplam"
        },
        embed: {
            title({
                text,
                length
            }) {
                return `**• ${text} __${length}__ jail bilgisi bulundu**`
            },
            description({
                length,
                index,
                isTempJailed,
                isJailed,
                authorId,
                user,
                timestamp,
                reason,
                duration
            }) {
                return `• \`#${length - index}\` ${isTempJailed ? "⏰ " : ""}${isJailed ? "📥" : "📤"} <@${authorId}> ${user ? `<@${user.id}> ` : ""}| <t:${timestamp}:F>${isJailed ?
                    `\n└> **Sebebi:** ${Util.truncatedString(reason || "Sebep belirtilmemiş", 50)}`
                    : ""
                    }${isTempJailed ?
                        `\n└> **Süre:** ${duration}`
                        : ""
                    }`
            }
        }
    },
    kayıtayar: {
        on: {
            already: "Kayıt ayarım zaten __**açık**__ durumda yani tüm kayıt işlemlerini yapabilirsiniz",
            success: "Kayıt ayarım başarıyla açıldı bundan sonra tüm kayıt işlemlerini yapabilirsiniz"
        },
        off: {
            already: "Kayıt ayarım zaten __**kapalı**__ durumda yani hiçbir kayıt işlemi yapamazsınız",
            success: "Kayıt ayarım başarıyla kapatıldı bundan sonra hiçbir kayıt işlemi yapamazsınız"
        },
        enter(prefix) {
            return `• Kayıt ayarımı açmak için **${prefix}kayıtayar aç**\n\n` +
                `• Kapatmak için ise **${prefix}kayıtayar kapat** yazabilirsiniz`
        }
    },
    kayıtbilgi: {
        roleNotSet: "Rol ayarlanmamış ❗",
        channelNotSet: "Kanal ayarlanmamış ❗",
        on: "Açık",
        off: "Kapalı",
        set: "Ayarlanmış",
        notSet: "Ayarlanmamış ❗",
        fieldsName: {
            roles: "ROLLER",
            channels: "KANALLAR",
            others: "DİĞERLERİ"
        },
        registerType: {
            member: "Üyeli kayıt 👤",
            gender: "Cinsiyete göre kayıt 👫",
            string: "Kayıt türü",
            setting: "Kayıt ayarı"
        },
        registerSettings: {
            can: "Kayıt yapabilirsiniz",
            cant: "Kayıt yapamazsınız",
        },
        roles: {
            member: "Üyelere verilecek rol(ler)",
            boy: "Erkeklere verilecek rol(ler)",
            girl: "Kızlara verilecek rol(ler)",
            bot: "Botlara verilecek rol(ler)",
            registerAuth: "Üyeleri kayıt eden yetkili",
            unregister: "Üyeleri kayıt ettikten sonra alınacak rol"
        },
        channels: {
            register: "Kayıt kanalı",
            afterRegister: "Kayıt sonrası hoşgeldin mesajı atılacak kanal",
            log: "Kayıt log kanalı",
        },
        others: {
            tag: {
                string: "Sunucuya özel tag",
                notSet: "Tag ayarlanmamış ❗"
            },
            symbol: {
                string: "İsimlerin arasına koyulacak sembol",
                notSet: "Sembol ayarlanmamış ❗"
            },
            mentionAuth: "Sunucuya birisi katıldığında yetkili rolü etiketleme",
            botAuto: "Botları otomatik kayıt etme",
            autoCorrect: "İsimleri otomatik düzeltme",
            ageRequired: "Yaş zorunluluğu",
            nameRequired: "İsim zorunluluğu",
            customLoginMessage: "Özelleştirilmiş giriş mesajı",
            customAfterRegisterMessage: "Özelleştirilmiş kayıt sonrası mesaj",
            autoName: "Oto isim",
            membersName: "Kullanıcının ismi",
            afterRegisterName: "Birisini kayıt ettikten sonra şöyle gözükecek"
        }
    },
    kayıtsıfırla: {
        embed: {
            title: "Dikkat",
            description(prefix) {
                return `Tüm kayıt bilgilerinizi sıfırlamak istediğinizden emin misiniz. Sıfırlamadan önce **${prefix}kayıt-bilgi** yazarak kayıt ayarlarınızı gözden geçirebilirsiniz\n\n` +
                    `• **NOT!!** Şu anda sileceğini şeyler sunucunun tagı, sembolü, düzenlenecek isimler, özel mesajlar ve rol ve kanal ID'leridir. Son kayıtlar gibi şeyler silinmeyecektir\n\n` +
                    `• Eğer silmek istiyorsanız **evet**, istemiyorsanız **hayır** yazınız`
            },
            footer: "Cevap vermek için 45 saniyeniz vardır"
        },
        success: "• Başarıyla bu sunucudaki kayıt bilgilerinizi sıfırladım",
        cancel: "• İşlem iptal edilmiştir"
    },
    kayıtsız: {
        already: "Heyy, dur bakalım orada! Bu kişi zaten kayıtsıza atılmış durumda",
        success(memberId) {
            return `• ⚒️ <@${memberId}> adlı kişiden tüm rolleri alıp başarıyla kayıtsız rolünü verdim`
        },
        successButton({
            authorId,
            memberId
        }) {
            return `• ⚒️ <@${authorId}>, <@${memberId}> adlı kişiden tüm rolleri alıp başarıyla kayıtsız rolünü verdim`
        }
    },
    kayıtsızlar: {
        nooneHasUnregistered: "Sunucuda hiç kimse kayıtsız değil yey!",
        unregisters: "Kayıtsız üyeler",
        unregister: "Kayıtsız"
    },
    kayıttür: {
        member: {
            already: "Kayıt türüm zaten __**Üyeli kayıt**__ durumda",
            success: `Kayıt türüm başarıyla "Üyeli kayıt" oldu!`
        },
        gender: {
            already: "Kayıt türüm zaten __**Cinsiyet**__ durumda",
            success: `Kayıt türüm başarıyla "Cinsiyet" oldu!`
        },
        enter(prefix) {
            return `• Kayıt türünü "Üyeli kayıt" yapmak için **${prefix}kayıttür üye**\n\n` +
                `• "Cinsiyet" yapmak için ise **${prefix}kayıttür cinsiyet** yazabilirsiniz`
        }
    },
    kick: {
        successKick({
            authorName,
            reason
        }) {
            return `Atan: ${authorName} | Sebebi: ${reason || "Sebep belirtilmemiş"}`
        },
        successMsg({
            userName,
            userId,
            penaltyNumber
        }) {
            return `${EMOJIS.yes} **${userName} - (${userId})** başarıyla sunucudan atıldı, tadını çıkar 🥳${penaltyNumber ? ` **Ceza numarası:** \`#${penaltyNumber}\`` : ""}`
        },
        embed: {
            description({
                userId,
                authorId,
                authorDisplayName,
                userDisplayName,
                reason,
                penaltyNumber,
                kickAt
            }) {
                return `**👟 <@${userId}> adlı üye olarak sunucudan atıldı**\n\n` +
                    `🧰 **ATAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Ban tarihi:** <t:${kickAt}:F> - <t:${kickAt}:R>\n\n` +
                    `👤 **Atılma tarihi**\n` +
                    `**• Adı:** <@${userId}> - ${userDisplayName}\n` +
                    `**• ATILAN ÜYE:** ${reason || "Sebep belirtilmemiş"}` +
                    (penaltyNumber ?
                        `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                        "")
            }
        },
        error(error) {
            return "Atmak istediğiniz üyeyi sunucudan atamadım :(\n\n" +
                "**Sebebi:**" +
                `• ${error}`
        }
    },
    kişilog: {
        noData: "Etiketlediğiniz kişiye daha önceden hiçbir işlem yapılmadığı için tablo gösterilemiyor",
        typeToText(input) {
            return {
                unregister: `⚒️ <@${input.authorId}> tarafından __kayıtsıza__ atıldı`,
                changeName: `📝 <@${input.authorId}> tarafından **${input.newName}** olarak ismi değiştirildi`,
                changeRoles: `⚒️ <@${input.authorId}> tarafından cinsiyeti **${input.to == "boy" ? `Erkeğe ${EMOJIS.boy}` : `Kıza ${EMOJIS.girl}`}** çevrildi`,
                jail: `${EMOJIS.jail} <@${input.authorId}> tarafından __jaile__ atıldı`,
                unjail: `${EMOJIS.party} <@${input.authorId}> tarafından Jail'den çıkarıldı`,
                tempjail: `⏰ ${input.isJailed ? `Jail'e ${Time.duration(input.duration, language)} süreyle` : "Jail'den çıkarıldı"} atıldı`,
                mute: `🔇 <@${input.authorId}> tarafından **${Time.duration(input.duration, language)}** süreyle susturuldu`,
                unmute: `🔊 <@${input.authorId}> tarafından susturulması kaldırıldı`,
                joinGuild: `📥 Sunucuya giriş yaptı`,
                leaveGuild: `📤 Sunucudan ayrıldı`,
                suspicious: `⛔ <@${input.authorId}> tarafından __şüpheliye__ atıldı`,
                ban: `${EMOJIS.ban} <@${input.authorId}> tarafından __**${input.reason || "Belirtilmemiş"}**__ sebebiyle yasaklandı`,
                unban: `${EMOJIS.eat} <@${input.authorId}> tarafından yasağı kaldırıldı`,
                kick: `${EMOJIS.f} <@${input.authorId}> tarafından __**${input.reason || "Belirtilmemiş"}**__ sebebiyle atıldı`,
                register: {
                    boy: `${EMOJIS.boy} <@${input.authorId}> tarafından **Erkek** olarak kayıt edildi`,
                    girl: `${EMOJIS.girl} <@${input.authorId}> tarafından **Kız** olarak kayıt edildi`,
                    member: `${EMOJIS.member} <@${input.authorId}> tarafından **Üye** olarak kayıt edildi`,
                    bot: `${EMOJIS.bot} <@${input.authorId}> tarafından **Bot** olarak kayıt edildi`
                }[input.gender]
            }[input.type];
        },
        description({
            userId,
            length,
        }) {
            return `**• <@${userId}> kişisinin toplamda __${length}__ adet log kaydı bulundu**`
        }
    },
    komut: {
        enter: "Lütfen bir komut adı giriniz!",
        notFound(commandName) {
            return `**${commandName}** adlı komutu bulamadım, lütfen komutun adını doğru yazdığınızdan emin olunuz`
        },
        commandInfo({
            name,
            aliases,
            cooldown,
            description,
            category,
            usage,
            ownerOnly,
            isPremium,
            categoryEmoji,
            language
        }) {
            return `**‼️ Komutun kullanımında gösterilen [] işareti "isteğe bağlı", <> işareti ise "zorunlu" anlamına geliyor**\n\n` +
                `✏️ **Komutun adı:** ${name[language]}\n` +
                `⏳ **Komutun bekleme süresi:** ${cooldown} saniye\n` +
                `📝 **Komutun açıklaması:** ${description[language]}\n` +
                `${categoryEmoji} **Komutun kategorisi:** ${category[language]}\n\n` +
                `📍 **Komutun kullanımı:** ${usage}\n` +
                `🌐 **Komutun diğer kullanım şekilleri:** ${aliases}\n\n` +
                `👑 **Komut sahibe özel mi:** ${ownerOnly ? "Evet" : "Hayır"}\n` +
                `${EMOJIS.premiumCommands} **Komut premium komutu mu:** ${isPremium ? "Evet" : "Hayır"}`
        }
    },
    kullanıcıbilgi: {
        isBot(bot) {
            return bot ? `🤖 **Üye bot mu:** Evet` : `👤 **Üye bot mu:** Hayır`;
        },
        presenceInfos: {
            statusValue({
                statusEmoji,
                statusText,
                from,
                activity
            }) {
                return `${statusEmoji} **Durumu:** ${statusText}\n` +
                    `❓ **Nereden bağlanıyor:** ${from}\n` +
                    `📌 **Aktivitesi:** ${activity}`
            },
            activities: {
                playing(game) {
                    return `${game} oynuyor`
                },
                listening(platform, music) {
                    return `${platform} - ${music} dinliyor`
                },
                watching(movie) {
                    return `${movie} izliyor`
                },
                streaming(stream, url) {
                    return `[${stream}](${url}) yayını yapıyor`
                },
                userOffline: "Üye çevrimdışı olduğu için aktivitesi gösterilemiyor"
            },
            from: {
                net: "İnternetten",
                mobile: "Mobil cihazdan",
                desktop: "Bilgisayardan",
                unknown: "Bilinmiyor"
            },
            statusText: {
                online: "Çevrimiçi",
                idle: "Boşta",
                dnd: "Rahatsız etmeyin",
                offline: "Çevrimdışı"
            },
        },
        guildInfos: {
            joined(timestamp) {
                return `📆 **Sunucuya katılma tarihi:** <t:${timestamp}:F> - <t:${timestamp}:R>`;
            },
            boosted(timestamp) {
                return `${EMOJIS.boostUsers} **Sunucuya boost bastığı tarih:** <t:${timestamp}:F> - <t:${timestamp}:R>`;
            },
            highestRole(roleId) {
                return `💎 **Sunucudaki en yüksek rolü:** <@&${roleId}>`
            },
            nickname(nickname) {
                return `✏️ **Sunucudaki adı:** ${nickname ?? "Sunucudaki adı yok"}`
            },
            currentChannel(channelId) {
                return `🔊 **Şu anda bulunduğu kanal:** <#${channelId}>`
            },
            titles: {
                basic: "TEMEL BİLGİLERİ",
                guild: "SUNUCU BİLGİLERİ",
                status: "DURUMU",
                photos: "FOTOĞRAFLAR",
                roles: "ROLLERİ"
            },
            photos: {
                profile: "Profil fotoğrafı",
                guildProfile: "Sunucu profil fotoğrafı",
                banner: "Banner"
            },
            basicValue({
                memberId,
                isUserBot,
                createdTimestamp
            }) {
                return `🆔 **Üyenin ID'si:** ${memberId}\n` +
                    `${isUserBot}\n` +
                    `📅 **Hesabı oluşturma tarihi:** <t:${createdTimestamp}:F> - <t:${createdTimestamp}:R>`
            },
            roles: "ROLLERİ",
            moreRoles: "rol daha"
        }
    },
    kur: {
        allErrors: {
            cancel: `❗ İşlem iptal edilmiştir`,
            numberOfRemainingAttempts(numberOfRemain) {
                return `‼️ Lütfen soruları düzgün cevaplayınız - __*( **${numberOfRemain}** adet hakkınız kaldı )*__`;
            },
            maxRole: `${EMOJIS.no} Hey hey heyyy, sence de biraz fazla rol etiketlemedin mi? Lütfen daha az rol etiketleyip tekrar deneyiniz`,
            dontKnow: `• B-Bunu nasıl yapacağımı bilmiyorum...\n`,
        },
        allRegisterMessages: {
            registerChannel: `${EMOJIS.channel} Kayıtlar hangi kanalda yapılacak. Lütfen bir kanal etiketleyiniz`,
            afterRegisterChannel: `${EMOJIS.channel} Kayıt sonrası kanal hangi kanal olacak. Kayıt sonrası kanalının sohbet kanalı olması önerilir. Eğer kayıt sonrası kanalını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen bir kanal etiketleyiniz`,
            registerLogChannel: `${EMOJIS.channel} Kayıt log kanalı hangi kanal olacak. Eğer kayıt log kanalını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen bir kanal etiketleyiniz`,
            registerAuthRole: `${EMOJIS.role} Üyeleri kayıt eden yetkili rolü hangi rol olacak. Lütfen bir rol etiketleyiniz`,
            unregisterRole: `${EMOJIS.role} Üyeleri kayıt ettikten sonra hangi rol alınacak veya sunucuya katılınca ona hangi rolü vereceğim. Kısaca kayıtsız rolü ne olacak. Lütfen bir rol etiketleyiniz`,
            registerType: `❓ Kayıt türünüz **Üye** mi yoksa **Cinsiyet** mi olacak?`,
            memberRoles: `${EMOJIS.member} Üyelere hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz`,
            girlRoles: `${EMOJIS.girl} Kızlara hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz`,
            boyRoles: `${EMOJIS.boy} Erkeklere hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz`,
            botRoles: `${EMOJIS.bot} Botlara hangi rol(ler) verilecek. Eğer ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen rol(leri) etiketleyiniz`,
            tag(exampleName) {
                return `📝 İsimlerin başına koyulacak tag ne olsun. Eğer tag ayarlamak istemiyorsanız \`geç\` yazabilirsiniz\n` +
                    `• Eğer tagı **♫** olarak ayarladıysanız şöyle gözükecek **${exampleName}**`;
            },
            symbol(exampleName) {
                return `📝 İsimlerin arasına koyulacak sembol ne olsun. Eğer sembol ayarlamak istemiyorsanız \`geç\` yazabilirsiniz\n` +
                    `‼️ Semboller botların isimlerine koyulmayacaktır \n` +
                    `• Eğer sembolü **|** olarak ayarladıysanız şöyle gözükecek **${exampleName}**`;
            },
            guildAddName(exampleName) {
                return `📝 Birisi sunucuya girince onun kullanıcı adı ne olsun. Eğer kullanıcı adını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz\n` +
                    `‼️ Oto isim botların isimlerine koyulmayacaktır\n` +
                    `• Eğer oto ismi **<tag> <isim>** olarak ayarladıysanız şöyle gözükecek **${exampleName}**`;
            }
        },
        already: "Kayıt kur işlemi devam ederken tekrar kayıt kur işlemini başlatamazsın",
        cancelAndClose: `• İşlemi iptal etmek için **iptal** veya **kapat**\n` +
            `• Eğer önceki soruya dönmek isterseniz **geri** yazabilirsiniz`,
        usersName: "Kullanıcının adı"
    },
    kurallar: {
        embed: {
            author: "Alisa kuralları",
            description: `**[Alisa'yı](${botInviteLink}) kullanmaya başlamadan önce aşağıdaki kuralları okumanız ve kabul etmeniz gerekir.**\n\n` +
                `🌐 **Genel Kullanım Kuralları**\n` +
                `• Alisa'nın komutlarını diğer kullanıcılara zarar verme veya rahatsızlık verme amacıyla kullanmayın\n` +
                `• Alisa'yı kopyalamak, çoğaltmak veya adına sahte hesaplar açmak yasaktır\n` +
                `• Herhangi bir sorunuz veya yardım talebiniz olduğunda **[Destek Sunucumuza](${discordInviteLink})** ulaşabilirsiniz\n\n` +
                `🚫 **Spam ve Flood Yapmak Yasaktır**\n` +
                `├> Aynı komutu sürekli tekrarlamak veya hızlı bir şekilde aynı komuta basmak spam olarak değerlendirilir\n` +
                `├> Botun butonlarını hızlıca tıklayıp botu spama düşürmek yasaktır\n` +
                `└> Spam yapan kullanıcılar, otomatik olarak uyarılabilir ve geçici ya da kalıcı olarak engellenebilir\n\n` +
                `🔒 **Bot Güvenliği ve Açıkları**\n` +
                `• Alisa'nın sistemini bozacak, manipüle edecek veya açıklarını kötüye kullanacak eylemler yasaktır\n` +
                `• Bu tür durumlar, Alisa'nın işleyişini bozacağı gibi, diğer kullanıcıların deneyimini olumsuz etkiler\n` +
                `• Açık bulanlar, lütfen durumu destek sunucusunda yöneticilere bildirerek çözüm sürecine katkıda bulunsun\n\n` +
                `⚠️ **Diğer Önemli Kurallar**\n` +
                `• Alisa'nın komutları eğlenceli, yardımcı ve adil bir kullanım sunacak şekilde tasarlanmıştır\n` +
                `• Başka bir kullanıcının deneyimini olumsuz etkileyecek şekilde komutları kötüye kullanmaktan kaçının\n` +
                `• Bu kurallara uymayanlar, Alisa tarafından otomatik olarak cezalandırılabilir\n\n` +
                `**Botu kullanan herkes bu kuralları okumuş ve kabul etmiş sayılır! Keyifli kullanımlar dileriz!**\n\n` +
                `||*Gülüşün aynı yıldızlar gibi bir o kadar parlak ve bir o kadar güzel... 💖*||`
        }
    },
    kilit: {
        already: "Bu kanal zaten kilitli",
        success(channelId) {
            return `• 🔒 <#${channelId}> kanalı başarıyla kilitlendi!`
        }
    },
    kilitaç: {
        already: "Bu kanal zaten kilitli değil",
        success(channelId) {
            return `• 🔓 <#${channelId}> kanalının kilidi başarıyla açıldı!`
        }
    },
    mesajliste: {
        embedDescription({
            authorMessageCount,
            authorPosition
        }) {
            return `• Sunucuya mesaj atan bütün kişiler\n` +
                `• Sen  **${authorPosition}.** sıradasın! (**__${authorMessageCount}__ mesaj**) 🎉`
        }
    },
    mute: {
        enter({
            prefix,
            memberId
        }) {
            return `Lütfen bir süre giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}mute <@${memberId}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n` +
                `• ${prefix}mute <@${memberId}> 30 dakika`
        },
        wrongTime: "Lütfen en az 1 saniye en fazla 27 gün arasında bir zaman giriniz",
        successMute({
            authorDisplayName,
            muteTime,
            reason
        }) {
            return `Susturan: ${authorDisplayName} | Süre: ${muteTime} | Sebebi: ${reason}`
        },
        successMsg({
            memberId,
            msToHumanize,
            reason,
            penaltyNumber
        }) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişi **${msToHumanize}** boyunca __**${reason || "Sebep belirtilmemiş"}**__ sebebinden yazı ve ses kanallarından men edildi!${penaltyNumber ? ` **Ceza numarası:** \`#${penaltyNumber}\`` : ""}`
        },
        embedMute: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                muteAt,
                memberDisplayName,
                reason,
                msToHumanize,
                muteOpenAt,
                penaltyNumber
            }) {
                return `**🔇 <@${memberId}> adlı üye __geçici__ olarak susturuldu**\n\n` +
                    `🧰 **SUSTURAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Mute tarihi:** <t:${muteAt}:F> - <t:${muteAt}:R>\n\n` +
                    `👤 **SUSTURULAN ÜYE**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Susturulma sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                    `**• Susturulma süresi:** ${msToHumanize}\n` +
                    `**• Susturulmanın açılacağı tarih:** <t:${muteOpenAt}:F> - <t:${muteOpenAt}:R>` +
                    (penaltyNumber ?
                        `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                        "")
            }
        },
        unmute(memberId) {
            return `• <@${memberId}> adlı kişinin susturulması başarıyla kaldırıldı!`
        },
        embedUnmute: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                muteAt,
                memberDisplayName,
                reason,
                msToHumanize,
                penaltyNumber
            }) {
                return `**🔊 <@${memberId}> adlı üyenin susturulması kaldırıldı**\n\n` +
                    `🧰 **SUSTURMAYI AÇAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **SUSTURULMASI AÇILAN ÜYE**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Susturulma sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                    `**• Susturulma süresi:** ${msToHumanize}\n` +
                    `**• Susturulmanın atıldığı tarih:** <t:${muteAt}:F> - <t:${muteAt}:R>` +
                    (penaltyNumber ?
                        `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                        "")
            },
        }
    },
    otocevap: {
        sendMessage: "Şimdi ise kullanıcı bu mesajı yazdığında benim yazacağım yazı ne olacak??",
        success: {
            description: "Oto mesajınız başarıyla ayarlandı! Mesajın nasıl kullanılacağını aşağıdaki örnekte verdim",
            send: "Kullanıcının atacağı mesaj",
            trigger: "Benim atacağım mesaj"
        },
        restart: {
            description: "Botun yeniden başlatılması nedeniyle önceki kullandığınız **Otomatik cevap ayarlama** komutu tekrar başlatıldı\n\n",
            trigger: "Şimdi lütfen tetikleyici mesajı yazınız",
            send: "Şimdi ise kullanıcı bu mesajı yazdığında benim yazacağım yazı ne olacak??"
        },
        set: {
            trigger: 'Lütfen tetiklenecek mesajı yazınız\n\n**• Eğer bunun ne anlama geldiğini bilmiyorsanız: mesela birisi "selam" yazdığında botun "as" yazmasını istiyorsanız tetiklenecek mesaja "selam" yazınız**'
        },
        remove: {
            trigger(prefix) {
                return `Lütfen bir **tetikleyici** mesaj verisi giriniz\n\n` +
                    `**Örnek:**\n` +
                    `• ${prefix}otocevap çıkar selam\n` +
                    `• ${prefix}otocevap çıkar sa`
            },
            noData: "Girdiğiniz veriyle ilgili hiçbir otocevap verisi bulunamadı",
            success(message) {
                return `**${message}** adlı otocevap verisi başarıyla kaldırıldı`
            }
        },
        list: {
            noData: "Bu sunucuda hiç otocevap verisi olmadığı için tablo gösterilemiyor",
            description(length) {
                return `• Botta şu anda __${length}__ tane otocevap verisi bulunuyor`
            },
            timestamp: "Eklenme tarihi"
        },
        enter(prefix) {
            return `Lütfen bir seçenek giriniz\n\n` +
                `**🗒️ Girilebilir seçenekler**\n` +
                `**• ${prefix}otocevap ekle =>** Yeni bir otocevap verisi ekler\n` +
                `**• ${prefix}otocevap çıkar =>** Belirliten otocevap verisini kaldırır\n` +
                `**• ${prefix}otocevap liste =>** Bütün otocevap listesini gösterir`
        }
    },
    otodüzeltme: {
        optionName: "Otomatik düzeltme",
        enter(prefix) {
            return `• İsimleri otomatik düzeltmeyi açmak için **${prefix}otodüzeltme aç**\n` +
                `• Kapatmak için ise **${prefix}otodüzeltme kapat** yazabilirsiniz`
        }
    },
    otoşüpheli: {
        optionName: "Oto şüpheli",
        enter(prefix) {
            return `• Oto şüpheliyi açmak için **${prefix}otoşüpheli aç**\n` +
                `• Kapatmak için ise **${prefix}otoşüpheli kapat** yazabilirsiniz`
        }
    },
    oy: {
        voteMessage(link) {
            return `[Buraya](${link} "Bana oy vereceksin değil mi?") tıklayarak bana oy verebilirsinizzzz!!!`
        }
    },
    öneri: {
        enterMessage: "Lütfen bot hakkındaki önerilerinizi yazınız",
        success: "💬 **Öneri mesajınız alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**"
    },
    özel: {
        anothers: "Heyy dur bakalım orada! Şu anda başka bir yetkili özel mesajı ayarlıyor",
        cancel: "İşlem iptal edilmiştir",
        resets: {
            already: `Özelleştirilmiş giriş mesajı zaten ayarlı değil`,
            success: `${EMOJIS.yes} Özelleştirilmiş giriş mesajı başarıyla sıfırlandı`
        },
        tooMuchCharacter(maxLength) {
            return `Karakter sayısı çok fazla! Mesajınız **${maxLength}** karakterden küçük olmalıdır!`
        },
        success(prefix) {
            return `${EMOJIS.yes} Özelleştirilmiş giriş mesajı başarıyla ayarlandı. Nasıl göründüğüne bakmak için **${prefix}fake** yazabilirsiniz`
        },
        embed: {
            title: "Şimdi düşünme zamanı",
            description({
                guildName,
                registerAuthRoleId,
                authorId,
                authorDisplayName,
                memberCount,
                memberCountEmojis,
                createdTimestampSecond,
                createdTimestampString,
                security
            }) {
                return `• İptal etmek için **iptal**\n` +
                    `• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n` +
                    `**Giriş mesajının kutusuz olmasını istiyorsanız yazacağın mesajın başına <kutusuz> yazman yeterli!**\n\n` +
                    `**Değişkenler**\n` +
                    `**• <sunucuAdı>** => Sunucu adını yazar - ( ${guildName} ) \n` +
                    `**• <rol>** => Yetkili rolünü etiketler - ( ${registerAuthRoleId ? `<@&${registerAuthRoleId}>` : "__**ROL AYARLI DEĞİL**__"} )\n` +
                    `**• <üye>** => Gelen kişiyi etiketler - ( <@${authorId}> )\n` +
                    `**• <üyeİsim>** => Gelen kişinin adını yazar - ( ${authorDisplayName} )\n` +
                    `**• <üyeID>** => Gelen kişinin ID'sini yazar - ( ${authorId} )\n` +
                    `**• <toplam>** => Sunucunun toplam üye sayısını yazar - ( ${memberCount} )\n` +
                    `**• <emojiToplam>** => Sunucunun toplam üye sayısını emojili halde yazar - ( ${memberCountEmojis} )\n` +
                    `**• <tarih>** => Hesabın kuruluş tarihini yazar - ( <t:${createdTimestampSecond}:F> )\n` +
                    `**• <tarih2>** => Hesabın kuruluş tarihini yazar - ( <t:${createdTimestampSecond}:R> )\n` +
                    `**• <tarih3>** => Hesabın kuruluş tarihini yazar - ( ${createdTimestampString} )\n` +
                    `**• <güvenlik>** => Güvenli olup olmadığını gösterir - ( ${security} )`
            },
            footer: "Cevap vermek için 16 dakikanız vardır"
        }
    },
    partner: {
        partner: "Partner yetkilisi",
        noMember: "Bu sunucuda partner rolüne sahip hiçbir üye bulunmuyor",
        allPartner: "Bütün partner yetkilileri",
        partnerRole: "Bütün partner rolleri",
        notifNoGone: "*• Yukarıda etiketlenen **rollere ve üyelere** bildirim __gitmedi__*",
        nooneHasRole: "Şeyyy.. Hiç kimse yetkili rolüne sahip değil şapşik şey seni",
        enterFull(prefix) {
            return `• Partnersi rolünü ayarlamak için **${prefix}partner ayarla**\n` +
                `• Partner rolünü sıfırlamak için **${prefix}partner sıfırla**\n` +
                `• Bütün yetkili yetkililerini etiketlemek için **${prefix}partner etiket**\n` +
                `• Bütün yetkili yetkililerini bildirim gitmeden görmek için **${prefix}partner gör**\n` +
                `• Partner rolünü görmek için **${prefix}partner rol** yazabilirsiniz`
        }
    },
    pp: {
        openInBrowser: "Tarayıcıda aç"
    },
    premium: {
        options(prefix) {
            return `• **${prefix}pre kullan <kod> =>** Yetkililerden alınan resmi bir premium kodunu kullanmanızı sağlar\n` +
                `• **${prefix}pre değiştir <kod> <sunucuId> =>** Bir sunucunun premium özelliklerini başka bir sunucuya aktarmanızı sağlar\n` +
                `• **${prefix}pre süre =>** Bu sunucunun kanal premium süresini gösterir\n` +
                `• **${prefix}pre özellikler =>** Premium'a özel olan özellikleri görmek için kullanılır\n` +
                `• **${prefix}pre fiyat =>** Premium fiyatlarını görmek için kullanılır`
        },
        enter(options) {
            return `Lütfen bir seçenek giriniz\n\n` +
                `**🗒️ Girilebilir seçenekler**\n` +
                `${options}`
        },
        noCode({
            prefix,
            randomCode,
        }) {
            return `Lütfen yetkililerden aldığınız premium komutunu giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}pre kullan ${randomCode}`
        },
        noCodeFound(premiumCode) {
            return `**${premiumCode}** koduna karşılık gelen premium kodunu bulamadım!\n\n` +
                `• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[Destek Sunucuma](${discordInviteLink})__ gelip yetkililerden destek alabilirsiniz`
        },
        notOwner(premiumAuthorId) {
            return `Bu premium kodunu sadece satın alan kişi kullanabilir (<@${premiumAuthorId}>) şapşik şey seni :(`;
        },
        codeWorked(guildName) {
            return `Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${guildName} sunucu artık __çok ama çok özel avantajlara sahipp__!!`;
        },
        use: {
            codeAlreadyUsed({
                premiumCode,
                guildName,
                prefix
            }) {
                return `**${premiumCode}** koduna karşılık gelen premium kodu zaten bir sunucuda (${guildName}) kullanılıyor\n\n` +
                    `• Eğer premiumunuzu başka bir sunucuya aktarmak istiyorsanız o sunucuya gidiniz ve **${prefix}pre değiştir** yazınız`
            },
            guildAlreadyHasPremium(guildName) {
                return `Şeyyy... ${guildName} sunucusunda zaten bir premium var şapşik şey seni :(`;
            },
            codeIsExpired(guildName) {
                return `• Heyy bakıyorum ki ${guildName} sunucunun premiumu bitmiş gibi görünüyor :(\n\n` +
                    `• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n` +
                    `• ${discordInviteLink}`;
            }
        },
        change: {
            codeIsNotUsed({
                prefix,
                premiumCode,
                randomCode
            }) {
                return `**${premiumCode}** adlı premium kodu zaten hiçbir sunucuda kullanılmamış\n\n` +
                    `• Eğer premium kodunu kullanmak istiyorsanız **${prefix}pre kullan** yazabilirsiniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}pre kullan ${randomCode}`
            },
            enterGuildId: "Premium özelliklerini aktaracağınız sunucunun ID'sini giriniz",
            guildAlreadyUsesPremium(guildName) {
                return `Girdiğiniz premium kodu zaten ${guildName} sunucuda kullanılıyor`;
            },
            guildAlreadyHasPremium(guildName) {
                return `Şeyyy... **${guildName}** sunucusunda zaten bir premium var şapşik şey seni :(`;
            }
        },
        time: {
            noPremium: "Bu sunucuya tanımlanmış herhangi bir premium bulunmuyor :(",
            premiumNeverEnds: "Bu sunucudaki premium **ASLA** bitmeyecek oleyy!! 🎉",
            premiumEndsAt(expiresTimestampInSecond) {
                return `Bu sunucudaki premium **<t:${expiresTimestampInSecond}:F> - <t:${expiresTimestampInSecond}:R>** tarihinde bitecek\n` +
                    `Yani __${Time.duration(expiresTimestampInSecond, language, { toNow: true })}__ sonra bitecek`;
            }
        },
        features: {
            description(prefix) {
                return `• Fiyat bilgisini öğrenmek için **${prefix}pre fiyat** yazabilirsiniz\n\n` +
                    `• Heyy görüyorum ki premium almayı düşünüyorsun o halde tam da doğru yere geldin\n\n` +
                    `__**• Hemen sana premium özelliklerini kısaca anlatıyım**__\n` +
                    ` ├> Hiçbir komutta bekleme süresi olmadan istediğiniz gibi kullanabilirsiniz\n` +
                    ` ├> Premium'a özel bir sürü komutla beraber sunucunuzu daha güzel bir yer haline getirebilirsiniz\n` +
                    ` ├> Bota gelecek özellikleri diğer kullanıcılardan daha önce görebilirsiniz\n` +
                    ` ├> Premiumunuz bittikten sonra hiçbir veriniz silinmez ve yeniden premium aldığınızda hiçbir şey ayarlamadan kullanabilirsiniz\n` +
                    ` ├> Destek sunucumda özel bir role sahip olursunuz :3\n` +
                    ` └> Ve eğer 1 hafta içinde beğenmezseniz paranız anında iade edilir!\n\n` +
                    `• Eğer premium almak istiyorsanız __**[Destek Sunucuma](${discordInviteLink})**__ gelip bilet açmanız yeterlidir\n\n` +
                    `• Ve en önemlisi *seni seviyorum..* 💗`
            }
        },
        price: {
            description({
                prefix,
                premium
            }) {
                return `${premium ? "• Heyyy görüyorum ki bu sunucuda premium zaten aktif edilmiş durumda!\n\n" : ""}` +
                    `• Premium özelliklerini öğrenmek için **${prefix}pre özellikler** yazabilirsiniz\n\n` +
                    `• Eğer 1 hafta içinde beğenmezseniz paraniz iade!\n\n` +
                    `• **1 aylık =>** __50__ Türk Lirası 💵\n` +
                    `• **3 aylık =>** __120__ Türk Lirası 💵\n` +
                    `• **6 aylık =>** __200__ Türk Lirası 💵\n` +
                    `• **Sınırsız =>** __500__ Türk Lirası 💵\n\n` +
                    `• Ödeme olarak sadece **Papara ve IBAN** kabul ediyoruz\n\n` +
                    `• Eğer premium almak istiyorsanız __**[Destek Sunucuma](${discordInviteLink})**__ gelip bilet açmanız yeterlidir`
            }
        }
    },
    prefix: {
        enter(prefix) {
            return `Lütfen yeni prefixini yazınız\n\n` +
                `**Örnek:**\n` +
                `• ${prefix}prefix a!` +
                `• ${prefix}prefix sıfırla (prefixi varsayılan değere **(${defaultPrefix})** sıfırlar)`
        },
        samePrefix: "Botun prefixi zaten değiştirmeye çalıştığınız prefixle aynı şapşik şey seni :)",
        noLongerThan5: "Prefixiniz uzunluğunuz 5'den uzun olamaz",
        embed: {
            description(newPrefix) {
                return newPrefix == defaultPrefix ?
                    `Prefixiniz başarıyla varsayılan değere **(${defaultPrefix})** sıfırlandı!` :
                    `Prefixiniz başarıyla **${newPrefix}** olarak değiştirildi!`
            },
            field: {
                name: "Örnek",
                value({
                    newPrefix,
                    userTag
                }) {
                    return `\`\`\`css\n` +
                        `${newPrefix}yardım\n` +
                        `${newPrefix}prefix\n` +
                        `${newPrefix}destek\n` +
                        `@${userTag} yardım\n\`\`\``
                }
            }
        }
    },
    rank: {
        botError: "Botların rankı olmaz :)",
        rankMessages: {
            author: {
                yourRank: "Rankın",
                congratulations() {
                    return "Sen ulaşılabilecek en yüksek ranktasın"
                },
                youNeedThis: "yapmalısın"
            },
            other: {
                yourRank: "Rankı",
                congratulations(userId) {
                    return `<@${userId}> adlı kişi ulaşılabilecek en yüksek rankta`
                },
                youNeedThis: "yapması gerekiyor"
            },
            noRank(rank) {
                return `${rank} yok`
            },
            toReach({
                nextRank,
                moreRegisterEmoji,
                doIt
            }) {
                return `**${nextRank}** rankına ulaşmak için ${moreRegisterEmoji} kayıt daha ${doIt}`
            }
        }
    },
    rankrol: {
        enter(prefix) {
            return `• Yeni bir rol eklemek için **${prefix}rankrol ekle**\n` +
                `• Eklenilen rolü çıkarmak için **${prefix}rankrol çıkar**\n` +
                `• Eklenilen rolü değiştirmek için **${prefix}rankrol değiştir**\n` +
                `• Rolleri listelemek için **${prefix}rankrol liste**\n` +
                `• Hepsini kaldırmak için ise **${prefix}rankrol sıfırla** yazabilirsinix`
        },
        enterAdd(prefix) {
            return `Lütfen bir rol ve kaçıncı kayıtta verileceğini belirtiniz (Girilen sayı 1-9999 arasında olmalıdır)\n\n` +
                `**Örnek:**\n` +
                `• ${prefix}rankrol ekle @rol 5\n` +
                `• ${prefix}rankrol ekle 100 @Süper Kayıtçı`
        },
        enterRemove(prefix) {
            return `Lütfen kaldırmak istediğiniz rolü belirtiniz (Girilen sayı 1-9999 arasında olmalıdır)\n\n` +
                `**Örnek:**\n` +
                `• ${prefix}rankrol çıkar @rol\n` +
                `• ${prefix}rankrol çıkar 100`
        },
        enterChange(prefix) {
            return `Lütfen değiştirmek istediğiniz rolü belirtiniz (Girilen sayı 1-9999 arasında olmalıdır)\n\n` +
                `**Örnek:**\n` +
                `• ${prefix}rankrol değiştir @rol 5\n` +
                `• ${prefix}rankrol değiştir 100 @Süper Kayıtçı`
        },
        roleAlreadyExists(rankCount) {
            return `Girdiğiniz rol zaten daha önce eklenmiş durumda (${rankCount}. kayıt sayısına veriliyor)`
        },
        roleIsAlreadySame: "Girdiğiniz rol zaten aynı",
        negativeNumber: "Negatif bir sayı giremezsiniz",
        numberAlreadyExists(rankRoleId) {
            return `Girdiğiniz sayıya ulaşan kişiye zaten <@&${rankRoleId}> rolü veriliyor`
        },
        successAdd({
            rankCount,
            rankRoleId
        }) {
            return `**${rankCount}.** kayıt sayısına ulaşan kişilere <@&${rankRoleId}> rolü verilecek`
        },
        successRemove(rankRoleId) {
            return `<@&${rankRoleId}> rolü başarıyla kaldırıldı`
        },
        successChange({
            rankCount,
            rankRoleId
        }) {
            return `**${rankCount}.** kayıt sayısına ulaşan kişilere artık <@&${rankRoleId}> rolü verilecek`
        },
        successReset: "Bütün rank rolleri başarıyla sıfırlandı",
        noNumberOrRoleData: "Girdiğiniz sayıyla veya roller eşleşen bir veri bulunamadı",
        noNumberData: "Girdiğiniz sayıyla eşleşen bir veri bulunamadı",
        noData: "Bu sunucuda hiç rank rolü bulunmuyor",
    },
    rolal: {
        noRole: "Lütfen bir rol veya rolleri etiketleyiniz",
        noRoleToGive: "Kişi etiketlediğiniz rollerin hiçbirine sahip değil",
        boosterRole: "Etiketlediğiniz rollerden biri sunucuya boost basan kişilere verilen rol"
    },
    rolver: {
        noRole: "Lütfen bir rol veya rolleri etiketleyiniz",
        noRoleToGive: "Kişi etiketlediğiniz rollerin hepsine sahip",
        boosterRole: "Etiketlediğiniz rollerden biri sunucuya boost basan kişilere verilen rol"
    },
    say: {
        error({
            prefix,
            hasAdmin
        }) {
            return `Şeyyy... Bu sunucuda **${prefix}say** komutunda gösterilecek hiçbir şey __ayarlanmamış__` +
                (
                    hasAdmin ?
                        `\n\n• Eğer say ayarlarını değiştirmek isterseniz **${prefix}say-ayarlar** yazabilirsiniz` :
                        ""
                )
        },
        serverInformation: {
            name: "__Sunucu bilgileri__",
            value({
                datas: {
                    registerType,
                    total,
                    online,
                    registered,
                    boy,
                    girl,
                    unregister,
                    voice,
                    vip,
                    jail,
                    boostMembers,
                    boostCount,
                    numberToFormat
                },
                openOrCloseDatas
            }) {
                const result = [];

                if (openOrCloseDatas.total) result.push(`Sunucuda ${numberToFormat(total)} üye bulunuyor`);
                if (openOrCloseDatas.status) result.push(`${numberToFormat(total)} üyeden ${numberToFormat(online)} kişi çevrimiçi`);
                if (openOrCloseDatas.registered) result.push((registerType == "member" ?
                    `${numberToFormat(registered)} kayıtlı üye` :
                    `${numberToFormat(boy)} erkek üye, ${numberToFormat(girl)} kız üye`) +
                    ` ve ${numberToFormat(unregister)} kayıtsız üye bulunuyor`
                );
                if (openOrCloseDatas.voice) result.push(`Sesli kanallarda ${numberToFormat(voice)} üye bulunuyor`);
                if (openOrCloseDatas.boostCount) result.push(`Sunucuda ${numberToFormat(boostCount)} boost ve ${numberToFormat(boostMembers)} boost basan üye bulunuyor`);
                if (openOrCloseDatas.vip) result.push(`${numberToFormat(vip)} vip üye bulunuyor`);
                if (openOrCloseDatas.jail) result.push(`${numberToFormat(jail)} kişi jailde`);

                return result;
            }
        },
        authInformation: {
            name: "__Yetkili bilgileri__",
            value({
                datas: {
                    registerAuth,
                    jailAuth,
                    vipAuth,
                    banAuth,
                    kickAuth,
                    muteAuth,
                    numberToFormat
                },
                openOrCloseDatas
            }) {
                const result = [];

                if (openOrCloseDatas.registerAuth) result.push(`Sunucuda ${numberToFormat(registerAuth)} kayıt yetkilisi bulunuyor`);
                if (openOrCloseDatas.jailAuth) result.push(`Sunucuda ${numberToFormat(jailAuth)} jail yetkilisi bulunuyor`);
                if (openOrCloseDatas.vipAuth) result.push(`Sunucuda ${numberToFormat(vipAuth)} vip yetkilisi bulunuyor`);
                if (openOrCloseDatas.banAuth) result.push(`Sunucuda ${numberToFormat(banAuth)} ban yetkilisi bulunuyor`);
                if (openOrCloseDatas.kickAuth) result.push(`Sunucuda ${numberToFormat(kickAuth)} kick yetkilisi bulunuyor`);
                if (openOrCloseDatas.muteAuth) result.push(`Sunucuda ${numberToFormat(muteAuth)} mute yetkilisi bulunuyor`);

                return result;
            }
        },
        description(prefix) {
            return `**• Say ayarlarını değiştirmek için __${prefix}say-ayarlar__ yazabilirsiniz**`
        }
    },
    "say-ayarlar": {
        options({
            prefix,
            registerType
        }) {
            return `**• ${prefix}say-ayarlar [emojili/emojisiz]**\n\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] toplam =>** Sunucudaki üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] durum =>** Sunucudaki online üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] üyeler =>** Sunucuda kaç ${registerType == "member" ? "üye" : "erkek, kız"} ve kayıtsız üye olduğunu gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] taglıüye =>** Sunucudaki taglı üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] sesliüye =>** Sesli kanallarda kaç kişi olduğunu gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] boost =>** Sunucuda kaç boost ve kaç kişinin boost bastığını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] vipüye =>** Sunucudaki vip üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] kayıtyetkili =>** Sunucuda kayıt yetkilisi rolüne sahip üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] jailüyeler =>** Sunucudaki jail rolüne sahip üye sayısınını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] jailyetkili =>** Sunucuda jail yetkilisi rolüne sahip üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] banyetkili =>** Sunucuda ban yetkilisi rolüne sahip üye sayısını gösterir\n` +
                `**• ${prefix}say-ayarlar [ekle/çıkar] kickyetkili =>** Sunucuda kick yetkilisi rolüne sahip üye sayısını gösterir`
        },
        dataToString: {
            total: "Sunucudaki toplam üye sayısı",
            registered: "Kayıtlı ve kayıtsız üye sayısı",
            tagged: "Taglı üye sayısı",
            voice: "Sesdeki üye sayısı",
            boostCount: "Sunucudaki boost sayısı",
            vip: "Vip üye sayısı",
            registerAuth: "Kayıt yetkilisi üye sayısı",
            jail: "Jail üye sayısı",
            jailAuth: "Jail yetkilisi üye sayısı",
            vipAuth: "Vip yetkilisi üye sayısı",
            banAuth: "Ban yetkili üye sayısı",
            kickAuth: "Kick yetkili üye sayısı",
            muteAuth: "Mute yetkili üye sayısı",
            status: "Sunucudaki online üye sayısı",
        },
        enterOption(options) {
            return `Lütfen bir seçenek giriniz\n\n` +
                `**🗒️ Girilebilir seçenekler**\n` +
                `${options}`;
        },
        add: {
            alreadyShow({
                prefix,
                data
            }) {
                return `**${prefix}say** komutunda yazdığınız __${data}nı__ zaten gösteriyorum`
            },
            show({
                prefix,
                data,
                showCommands
            }) {
                return `**${prefix}say** komutunda artık __${data}__ da gösteriyoruumm!!\n\n` +
                    `**Say komutunda gösterilecek veriler**\n` +
                    `• ${showCommands}`
            }
        },
        remove: {
            notShow({
                prefix,
                data
            }) {
                return `**${prefix}say** komutunda yazdığınız __${data}nı__ zaten göstermiyorum`
            },
            show({
                prefix,
                data,
                showCommands
            }) {
                return `Artık **${prefix}say** komutunda __${data}__ göstermiyorum!!\n\n` +
                    `**Say komutunda gösterilecek veriler**\n` +
                    `• ${showCommands}`
            }
        },
        emoji: {
            alreadyEmoji(prefix) {
                return `Bu sunucuda **${prefix}say** emoji ayarım zaten __emojili__ durumda`;
            },
            successEmoji(prefix) {
                return `Bu sunucuda **${prefix}say** komutum artık __emoji__ durumda!`;
            },
            alreadyNoEmoji(prefix) {
                return `Bu sunucuda **${prefix}say** emoji ayarım zaten __emojisiz__ durumda`;
            },
            successNoEmoji(prefix) {
                return `Bu sunucuda **${prefix}say** komutum artık __emojisiz__ durumda!`;
            }
        }
    },
    sembol: {
        enter(prefix) {
            return `• Sembolü ayarlamak için **${prefix}sembol <Sembolünüz>**\n\n` +
                `• Sıfırlamak için ise **${prefix}sembol sıfırla** yazabilirsiniz`
        },
        alreadyReset: "İsimlerin arasına konacak sembol zaten sıfırlanmış durumda",
        successReset: "İsimlerin arasına konacak sembol başarıyla sıfırlandı",
        maxError(maxLength) {
            return `Sembol uzunluğunuz en fazla **${maxLength}** karakter olabilir`
        },
        sameSymbol: "İsimlerin arasına konacak sembol zaten yazdığınız sembolle aynı",
        success({
            symbol,
            example
        }) {
            return `İsimlerin arasına konacak sembol başarıyla **${symbol}** olarak ayarlandı\n\n` +
                `**Örnek:**\n` +
                `${example}`
        }
    },
    seskanal: {
        remove: {
            already: "Zaten daha önceden katılmam için bir ses kanalı belirlememişsiniz",
            success: "Ses kanalı başarıyla kaldırıldı"
        },
        toSet(prefix) {
            return `Lütfen bir ses kanalını etiketleyiniz, kanal ID'si giriniz\n\n` +
                `• Eğer oluşturduğunuz bir ses kanalını kaldırmak istiyorsanız **${prefix}seskanal kaldır** yazabilirsiniz`;
        },
        set: {
            dontHavePermission: "Etiketlediğiniz kanala benim katılma yetkim yok :(",
            success(voiceChannelId) {
                return `📥 <#${voiceChannelId}> kanalına başarıyla giriş yaptım!`;
            }
        }
    },
    sesliste: {
        embedDescription({
            authorDuration,
            authorPosition
        }) {
            return `• Sese giren bütün kişiler kişiler\n` +
                `• Sen  **${authorPosition}.** sıradasın! (**__${authorDuration}__**) 🎉`
        }
    },
    ship: {
        noMember: "Uhh... Burada senden başka kimse yok gibi görünüyor... Ya da senden başka kimse bu kanalı göremiyor gibi görünüyor... İkisi de birbirinden kötü...",
        randomMessages: {
            0: [
                "Bu ilişki hiçbir zaman olmaz...",
                "Düşmanlar gibi birbirinize bakıyorsunuz >:(",
                "Bu ilişki olmaz, olamaz, O-LA-MAZ!",
                "Keşke birbirinizi hiç görmeseydiniz...",
                "Birbiriniz için yaratılmamışsınız :(",
                "Bu tam bir facia... Kaçın, kaçın!",
                "Bu iki kişiyi yanyana görmek bile zor...",
                "N'olur bir daha denemeyin... Bu imkansız."
            ],
            1: [
                "Arada bir şeyler var gibi amaa...",
                "Hımm, biraz daha yakınlaşabilirsiniz.",
                "Olabilir dee, olmayabilir de...",
                "Zamanla bir şeyler olabilir ama çok zor.",
                "Belki de hiç başlamamalısınız... Neyse.",
                "Birbirinizi pek sevmiyor gibisiniz."
            ],
            2: [
                "Bu ilişki olabilir gibi, dikkat dikkat!",
                "Birbirinize uygun olabilirsiniz, bir şans verin yaa!",
                "Belki de birbirinizi sevebilirsiniz, kim bilir?",
                "Bir şeyler mi var aranızda? Hadi deneyin!",
                "Ufak bir çekim var ama bu yetmeyebilir :/",
                "Denemeye değer gibi duruyor."
            ],
            3: [
                "Fena değil ama eksik bir şeyler var gibi.",
                "Aranızdaki kıvılcım biraz zayıııf.",
                "Sanki biraz soğuk mu kalmış bu ilişki?",
                "Zamanla belki daha iyi olur, ama şu an için meh.",
                "Azıcık ilerleme var ama ümitlenme.",
                "İlk adımı atmak zor olabilir, denemekten zarar gelmez."
            ],
            4: [
                "Yavaş yavaş ısınıyor gibi... Hadi bakalım!",
                "Potansiyel var ama biraz daha çaba gerek gibi.",
                "Daha iyi olabilir ama ümit var, devam edin.",
                "Kıvılcımlar yavaş yavaş belirginleşmeye başladı.",
                "Az biraz ışık var ama yolu uzun.",
                "Hadi bakalım, çabalarınız sonuç verebilir."
            ],
            5: [
                "Bu ilişki dengede, ne iyi ne kötü!",
                "Pek bir duygu yok ama yine de umut var!",
                "Potansiyel var ama biraz çaba gerekecek...",
                "Ortalarda bir yerdeyiz, zamanla göreceğiz.",
                "Yarı yarıya! Olabilir de olmayabilir de.",
                "50/50! Şansınıza bağlı :)"
            ],
            6: [
                "Bu ilişki umut veriyor! Hadi bakalım!",
                "Birbirinize oldukça yakınsınız, devamkeee!",
                "Aranızda bir çekim var! Hissediyorum!",
                "Bu ilişki gelişebilir, biraz daha çaba gösterin.",
                "Yolun yarısına geldiniz, devam!",
                "Birbirinize yakınsınız ama daha da iyisi olabilir."
            ],
            7: [
                "Bu ilişki çok iyi görünüyor, oley!",
                "Birbirinizi tamamlıyorsunuz gibi, yaşasın!",
                "Kıvılcımlar havada uçuşuyor!",
                "Aranızdaki bağ oldukça kuvvetli! Devam edin!",
                "Neredeyse harikasınız, bu iş olacak gibi!",
                "Bu ilişki baya sağlam, tam gaz devam!"
            ],
            8: [
                "Harika bir çift olabilirsiniz! Oleyyy!",
                "Birbiriniz için yaratılmış gibisiniz, müthişsiniz!",
                "Bu ilişki çok güçlü, keep going!",
                "Tam anlamıyla birbirinizi bulmuşsunuz, muhteşem!",
                "Harika bir uyum var! Devam edin!",
                "Bu ilişki tam gaz ilerliyor!"
            ],
            9: [
                "Bu ilişki tam anlamıyla mükemmel!",
                "Birbirinize sanki bağlısınız, kopmayın sakın!",
                "Aranızda inanılmaz bir uyum var, devam edin!",
                "Tam anlamıyla mükemmel bir çift!",
                "Yıldızlar bu ilişki için parlıyor!",
                "Bu ilişki çok sağlam, harikasınız!"
            ],
            10: [
                "Bu ilişki kusursuz, TAM anlamıyla mükemmel!",
                "Sizi kimse ayıramaz, süpersiniz!",
                "Birbiriniz için yaratılmışsınız, muhteşem!",
                "Bu ilişkide kimya var! Harika bir çift!",
                "Sonsuza kadar birlikte olun, mükemmelsiniz!",
                "Birlikte EN iyisisiniz! Her şey kusursuz!"
            ],
            self: [
                "Bu seninle olan en mükemmel ilişki, zaten başka biri olamazdı! Sen harikasın! 💖",
                "Kendinle olan bu uyum, adeta kusursuz! Seninle her şey mükemmel! 🌟",
                "Kimse senin kadar mükemmel olamaz, kendinle harika bir çift oldun! 🔥",
                "Sen ve sen. Daha iyi bir kombinasyon olabilir mi? Tabii ki hayır! 😎",
                "Kendinle bu ilişki, adeta bir efsane! Sen bir numarasın! 🏆",
                "Dünyada seninle sen kadar uyumlu başka bir çift olamaz, bu kesin! 🌈",
                "Kendine bu kadar mükemmel uyan başka kim olabilir ki? Tam anlamıyla kusursuzsun! 💯",
                "Her zaman en iyisi sensin! Kendinle olan bu uyum, adeta yıldızlar kadar parlak! ✨",
                "Süper bir çift olmuşsunuz! Kendine bu kadar yakışmak ancak senin işin olabilir! 🌟",
                "Bu ilişki, tam anlamıyla 10/10! Kimse seninle sen kadar mükemmel olamaz! 💪"
            ]
        },
        embed: {
            title: "Ship sonucu",
            content: {
                you(authorId) {
                    return `<@${authorId}>, kendinle olan uyumunu mu ölçmek istedin?`
                },
                other({
                    authorId,
                    memberId
                }) {
                    return `<@${authorId}> ve <@${memberId}>, aranızdaki uyumunuzu mu ölçmek istediniz?`
                }
            },
            description: {
                you({
                    randomMessage,
                    randomHearts
                }) {
                    return `• **Kendin ile** arandaki uyum: **1000000**/10\n\n` +
                        `• **${randomMessage}**\n` +
                        `${randomHearts}`
                },
                other({
                    authorOrMemberTag,
                    memberTag,
                    randomShip,
                    randomMessage,
                    shipResult
                }) {
                    return `• **${authorOrMemberTag}** ve **${memberTag}** arasındaki uyum: **${randomShip}**/10\n\n` +
                        `• **${randomMessage}**\n` +
                        `${shipResult}`
                }
            },
            footer: {
                you: "Kendini her zaman sev <3",
                other: "Her ne olursa olsun ben sizleri seviyorum <3"
            }
        }
    },
    sıfırla: {
        confirmationMessage: "Bütün verileri (AFK sistemi hariç) sıfırlamak istediğinizden emin misiniz?",
        dataResetSuccess: "• Bu sunucudaki **TÜM** verileriniz başarıyla sıfırlandı",
        transactionCanceled: "• İşlem iptal edildi",
        notOwner: "Bu komutu kullanabilmek için **sunucu sahibi** olmalısınız şapşik şey seni :(",
        attentionEmbed: {
            title: "DİKKAT!!",
            description: "• Tüm kayıtları, set rollerini ve kanalları, kayıt geçmişini, hapis bilgilerini ve ayarları ve **HER ŞEYİ** sıfırlamak/silmek istediğinizden emin misiniz? \n\n• Eğer silmek istiyorsanız **evet** yazın, istemiyorsanız **hayır** yazın\n\n**Dikkat!!** Bu işlem kalıcıdır ve geri alınamaz! Lütfen iyice düşünün...",
            footer: "Cevap vermek için 2 dakikanız var"
        }
    },
    sıra: {
        rank: {
            author({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} **<@${userId}> ${Util.toHumanize(total || 0, language)} Kayıt sayın • ${Util.getUserRank(total, language) || "Rankın yok"}**`
            },
            alisa({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} ${EMOJIS.alisa} <@${userId}> **${Util.toHumanize(total || 0, language)}** Kayıt sayım **•** Botların rankı olmaz :)`
            },
            user({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} <@${userId}> ${Util.toHumanize(total || 0, language)} Kayıt sayısı **•** ${Util.getUserRank(total, language) || "Rank yok"}`
            }
        },
        noRecord: "Bu sunucuda daha önce hiç kimse kayıt edilmediği için tablo gösterilemiyor",
        embedDescription({
            length,
            userRank
        }) {
            return `**📈 Sunucunun kayıt sıralaması!** ${userRank ? `\n**👑 Sen ${length} kişi içinden ${userRank}. sıradasın**` : ""}`
        }
    },
    sil: {
        enter(prefix) {
            return `Lütfen geçerli bir __sayı__ giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}sil 15\n` +
                `• ${prefix}sil 500`
        },
        zeroError: "0 tane mesajı nasıl siliyim akıllım :)",
        maxError(max) {
            return `Girdiğiniz sayı değeri __${max}__ sayısından küçük olmalıdır!`
        },
        deleting: "Mesajlar siliniyor...",
        successDelete({
            authorId,
            deleteCount
        }) {
            return `• <@${authorId}>, __**${deleteCount}**__ adet mesaj başarıyla silindi!`
        },
        successButError({
            authorId,
            deleteCount
        }) {
            return `• <@${authorId}>, __**${deleteCount}**__ adet mesaj başarıyla silindi fakat daha önceki mesajları silmeye iznim yok :(`
        }
    },
    snipe: {
        noData: {
            channel: "Bu kanalda daha önce hiç mesaj silinmediği için mesaj bilgisi bulunamıyor",
            user: "Bu kullanıcının daha önce hiç mesaj silinmediği için mesaj bilgisi bulunamıyor"
        },
        messageUnknown: "> *Mesaj bilinmiyor???*",
        data: {
            image: "Resim",
            video: "Video",
            audio: "Ses",
            text: "Metin",
            font: "Font",
            others: "Diğer"
        },
        titles: {
            content: "Mesaj İçeriği",
            description({
                snipeAuthor,
                extraInformation,
                createdTimestamp,
                deletedTimestamp
            }) {
                return `• **Mesajın sahibi:** <@${snipeAuthor}>${extraInformation ?
                    (`\n\n**Mesajda şu içerikler vardı:**\n` +
                        `${extraInformation}`) :
                    ""}\n\n` +
                    `• **Mesajın yazılma zamanı <t:${createdTimestamp}:R>**\n` +
                    `• **Mesajın silinme zamanı <t:${deletedTimestamp}:R>**`
            }
        }
    },
    sonkayıtlar: {
        noRecords: "Etiketlediğiniz kişi daha önceden hiç kayıt yapmadığı için tablo gösterilemiyor",
        noRecordsUser: "Bu sunucuda daha önce hiç kayıt yapılmadığı için tablo gösterilemiyor",
        totalUser(userId) {
            return `<@${userId}> adlı kişinin toplamda`
        },
        totalGuild: "Bu sunucuda toplam",
        recordFound: "adet kayıt bulundu"
    },
    spotify: {
        botError: "Gerçekten botların istatistiklerine bakmayı düşünmedin değil mi?",
        offline(memberId) {
            return `• <@${memberId}> adlı kişi şu anda çevrimdışı olduğu için durumunu göremiyorum`
        },
        notListening(memberId) {
            return `• <@${memberId}> adlı kişi şu anda spotify dinlemiyor`
        },
        embed: {
            description(memberId) {
                return `• <@${memberId}> adlı kişinin dinlediği müzik`
            },
            fields: {
                names: {
                    musicName: "🎵 Müzik ismi",
                    artistsNames(artists) {
                        return `👥 ${artists.length > 1 ? "Sanatçıların" : "Sanatçının"} ismi${artists.length > 1 ? ` (${artists.length})` : ""}`
                    },
                    albumName: "📝 Albümün adı",
                    duration: "⏰ Müziğin süresi",
                }
            }
        }
    },
    statayar: {
        on: {
            already: "İstatistik sistemi bu sunucuda zaten etkin",
            success: "İstatistik sistemi bu sunucuda başarıyla etkinleştirildi"
        },
        off: {
            already: "İstatistik sistemi bu sunucuda zaten devre dışı",
            attentionEmbed: {
                title: "DİKKAT!!",
                description: `• Bu sunucudaki istatistik sistemini devre dışı bırakmak istediğinizden emin misiniz? Bunu yaparsanız, tüm istatistik verileri silinir ve geri yüklenemez\n\n` +
                    `• Devre dışı bırakmak istiyorsanız, **evet** yazın, istemiyorsanız, **hayır** yazın\n\n` +
                    `**Dikkat!!** Bu işlem kalıcıdır ve geri alınamaz! Lütfen dikkatlice düşünün...`,
                footer: "Yanıtlamak için 2 dakikanız var"
            },
            success: "İstatistik sistemi bu sunucuda başarıyla devre dışı bırakıldı"
        },
        enter(prefix) {
            return `• İstatistik sistemini etkinleştirmek için **${prefix}statayar aç**\n` +
                `• Kapatmak için ise **${prefix}statayar kapat** yazabilirsiniz`
        }
    },
    sunucubilgi: {
        basicInformation({
            guildId,
            createdTimestampWithSeconds,
            defaultMessageNotifications
        }) {
            return [
                `🆔 **Sunucu ID'si:** ${guildId}`,
                `📅 **Sunucu kuruluş tarihi:** <t:${createdTimestampWithSeconds}:F> - <t:${createdTimestampWithSeconds}:R>`,
                `🔔 **Sunucu varsayılan mesaj bildirimleri:** ${defaultMessageNotifications == GuildDefaultMessageNotifications.AllMessages ? "Tüm mesajlar 📬" : `Sadece etiketler ${EMOJIS.role}`}`
            ];
        },
        vanityData(data) {
            return `✉️ **Sunucunun özel daveti:** https://discord.gg/${data.code} - (${data.uses})`;
        },
        afkChannel({
            afkChannelId,
            afkTimeout
        }) {
            return `🔇 **AFK kanalı:** <#${afkChannelId}> (${afkTimeout})`;
        },
        rulesChannel(rulesChannelId) {
            return `${EMOJIS.rules} **Kurallar kanalı:** <#${rulesChannelId}>`;
        },
        owner(ownerId) {
            return `👑 **Sunucu sahibi:** <@${ownerId}> - (${ownerId})`;
        },
        titles: {
            basicInformation: "TEMEL BİLGİLER",
            channels: "KANALLAR",
            members: "ÜYELER",
            status: "DURUMLAR",
            emojis: "EMOJİLER",
            boost: "BOOST BİLGİLERİ",
            photos: "FOTOĞRAFLAR",
            roles: "ROLLER"
        },
        statusCount: {
            online: "Çevrimiçi",
            idle: "Boşta",
            dnd: "Rahatsız etmeyin",
            offline: "Çevrimdışı"
        },
        channelsCount: {
            text: "Yazı kanalı",
            voice: "Ses kanalı",
            category: "Kategori",
            others: "Diğer kanallar"
        },
        membersCount: {
            members: "Üye sayısı",
            bots: "Bot sayısı"
        },
        emojisCount: {
            notanimated: "Animasyonsuz emojiler",
            animated: "Animasyonlu emojiler"
        },
        boost: {
            users: "Boost basan kişi sayısı",
            count: "Basılan boost sayısı",
            level: "Boost seviyesi"
        },
        photos: {
            profile: "Profil fotoğrafı",
            banner: "Banner",
            splash: "Davet arka planı",
            discoverySplash: "Keşfetme arka planı"
        },
        moreRole: "daha rol"
    },
    sunucutoplam: {
        top3Register: {
            author({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} **<@${userId}> ${Util.toHumanize(total || 0, language)} Kayıt sayın • ${Util.getUserRank(total, language) || "Rankın yok"}**`
            },
            alisa({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} ${EMOJIS.alisa} <@${userId}> **${Util.toHumanize(total || 0, language)}** Kayıt sayım **•** Botların rankı olmaz :)`
            },
            user({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} <@${userId}> ${Util.toHumanize(total || 0, language)} Kayıt sayısı **•** ${Util.getUserRank(total, language) || "Rank yok"}`
            }
        },
        recorded: {
            title: "KAYIT EDİLEN",
        },
        registrationActivity: {
            title: "SUNUCUNUN KAYIT AKTİVİTESİ",
            last1Hour: "Son 1 saat",
            last1Day: "Son 1 gün",
            last1Week: "Son 1 hafta",
            last1Month: "Son 1 ay"
        },
        last5Records: "Son 5 kayıt",
        top3RegisteredPeople: "En fazla kayıt yapan 3 kişi"
    },
    şüpheli: {
        alreadySuspect: "Heyy, dur bakalım orada! Bu kişi zaten şüpheliye atılmış durumda",
        success({
            memberId,
            authorId
        }) {
            return `• ⛔ <@${memberId}> adlı kişi <@${authorId}> tarafından şüpheliye atıldı!`
        }
    },
    şüphelizaman: {
        alreadyReset: "Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli süre sıfırlanmış durumda",
        successReset: "Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli süre başarıyla sıfırlandı",
        enter(prefix) {
            return `Lütfen bir süre giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}şüphelizaman 1 gün 5 saat 6 dakika 30 saniye\n` +
                `• ${prefix}şüphelizaman 3 hafta`
        },
        success(suspiciousTime) {
            return `Bundan sonra hesabı **${suspiciousTime}** içinde açılan kişiler şüpheli olarak gözükecektir`
        }
    },
    tag: {
        noTag: "Bu sunucuda tag ayarlanmamış durumda",
        tagNoSet(prefix) {
            return `• Sunucuda tag ayarlı değil. Ayarlamak için **${prefix}tagayarla** \`tagınız\` yazabilirsiniz`;
        }
    },
    tagayarla: {
        enter(prefix) {
            return `• Tag ayarlamak için **${prefix}tagayarla <Tagınız>**\n\n` +
                `• Sıfırlamak için ise **${prefix}tagayarla sıfırla** yazabilirsiniz`
        },
        alreadyReset: "Üyelere ekleyeceğim tag zaten sıfırlanmış durumda",
        successReset: "Üyelere ekleyeceğim tag başarıyla sıfırlandı",
        maxError(maxLength) {
            return `Tag uzunluğunuz en fazla **${maxLength}** karakter olabilir`
        },
        sameTag: "Suncunun tagı zaten yazdığınız tagla aynı",
        success({
            tag,
            example
        }) {
            return `Üyelerin isimlerine ekleyeceğim tag başarıyla **${tag}** olarak ayarlandı\n\n` +
                `**Örnek:**\n` +
                `${example}`
        }
    },
    tempjail: {
        jailRole: "jail rolü",
        already: "Etiketlediğiniz kişi zaten jailde",
        enterTime({
            prefix,
            memberId
        }) {
            return `Lütfen bir süre giriniz\n\n` +
                `**Örnek**\n` +
                `• ${prefix}tempjail <@${memberId}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n` +
                `• ${prefix}tempjail <@${memberId}> 30 dakika`
        },
        jailed({
            memberId,
            reason,
            msToHumanize
        }) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişi **${msToHumanize}** boyunca __**${reason || "Sebep belirtilmemiş"}**__ sebebinden Jail'e atıldı!`
        },
        embed: {
            descriptionJailed({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId,
                reason,
                jailOpenAt
            }) {
                return `**🔇 <@${memberId}> adlı üye __geçici__ olarak Jail'e atıldı**\n\n` +
                    `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **JAIL'E ATILAN KİŞİ**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Verilen rol:** <@&${jailRoleId}>\n` +
                    `**• Sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                    `**• Jail rolünün alınacağı tarih:** <t:${jailOpenAt}:F> - <t:${jailOpenAt}:R>`
            },
            descriptionUnjailed({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId,
                reason,
                jailedAt
            }) {
                return `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **JAIL'DEN ÇIKARILAN KİŞİ**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Alınan rol:** <@&${jailRoleId}>\n` +
                    `**• Sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                    `**• Jail' e atıldığı tarih:** <t:${jailedAt}:F> - <t:${jailedAt}:R>`
            }
        },
        successRemove(memberId) {
            return `• <@${memberId}> adlı kişinin Jail rolü başarıyla kaldırıldı!`
        },
        errorGiveRole({
            memberId,
            error
        }) {
            return `• <@${memberId}> adlı kişiyi jail'den çıkarırken bir hata oluştu!\n\n` +
                `**Hata:**\n` +
                `\`\`\`js\n` +
                `${error}\`\`\``
        }
    },
    test: {
        embedDescription: "• Veriler kontrol ediliyor, lütfen biraz bekleyiniz...",
        registerOff: "• Kayıt ayarım kapalı durumda, hiçbir kayıt işlemini yapamazsınız!",
        notSet: {
            unregister: "• Kayıtsız üyelere verilecek rol ayarlanmamış!",
            member: "• Üyelere verilecek rol ayarlanmamış!",
            boy: "• Erkeklere verilecek rol ayarlanmamış!",
            girl: "• Kızlara verilecek rol ayarlanmamış!",
            bot: "• Botlara verilecek rol ayarlanmamış!",
            registerAuth: "• Üyeleri kayıt eden yetkili rolü ayarlanmamış!",
            registerChannel: "• Kayıtların yapılacağı kanal ayarlanmamış!",
            afterRegisterChannel: "• Kayıt sonrasında üye için hoşgeldin mesajı atılacak kanal ayarlanmamış!",
            registerLogChannel: "• Kayıt log kanalı ayarlanmamış!",
        },
        permission: {
            manageNicknames: "• Benim isimleri düzenleme yetkim yok",
            manageRoles: "• Benim rolleri düzenleme yetkim yok",
            administrator: "• Botun düzgün çalışması için bana yönetici yetkisi verdiğinizden emin olunuz",
            registerChannel: "• Kayıt kanalına mesaj atabilme yetkim yok",
            afterRegisterChannel: "• Kayıt sonrasında üye için hoşgeldin mesajı atılacak kanalına mesaj atabilme yetkim yok",
            registerLogChannel: "• Kayıt log kanalına mesaj atabilme yetkim yok",
        },
        rolesAreHigher(roleIds) {
            return `• [${roleIds}] adlı roller benim rolümün sırasından yüksek olduğu için bu rolleri başkalarına veremem`
        },
        fieldsNames: {
            permissions: "🧰 YETKİ HATALARI",
            roles: `${EMOJIS.role} ROL HATALARI`,
            channels: `${EMOJIS.channel} KANAL HATALARI`,
            recommend: "💬 YAPILMASI ÖNERİLEN"
        },
        successEmbed: {
            title: `${EMOJIS.crazy} İşte buuu!!!`,
            description: `Bot bu sunucuda kusursuz çalışıyor (tıpkı senin gibi...), kayıt işlemlerini gönül rahatlığıyla yapabilirsiniz!`,
            footer: "Sizleri seviyorum <3"
        },
        failEmbed: {
            title: "Sanki biraz yapılması gereken şeyler var gibi?",
            footer: "Sizleri seviyorum <3"
        }
    },
    tümisimler: {
        noData: "Etiketlediğiniz kişi daha önceden hiç kayıt edilmediği için tablo gösterilemiyor",
        description({
            userId,
            length
        }) {
            return `**• <@${userId}> adlı kişinin toplam __${length}__ tane isim geçmişi bulundu**`
        }
    },
    unban: {
        enter(prefix) {
            return `• Lütfen geçerli bir ID giriniz\n\n` +
                `**Örnek:**\n` +
                `• ${prefix}unban 1234567890123456`
        },
        errorPull: "Sunucunun yasaklı listesini çekerken bir hata oluştu! Lütfen daha sonra tekrar deneyiniz",
        already: "Etiketlediğiniz üye zaten sunucudan yasaklanmamış",
        success({
            userName,
            userId
        }) {
            return `${EMOJIS.yes} **${userName} - (${userId})** adlı kişinin sunucudan yasağı başarıyla kaldırıldı`
        },
        embed: {
            description({
                userId,
                authorId,
                authorDisplayName,
                unbanAt,
                userDisplayName
            }) {
                return `**${EMOJIS.party} <@${userId}> adlı üyeni yasaklanması kaldırıldı**\n\n` +
                    `🧰 **BANLANMASINI AÇAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Banı açtığı tarih:** <t:${unbanAt}:F> - <t:${unbanAt}:R>\n\n` +
                    `👤 **BANLANMASI AÇILAN ÜYE**\n` +
                    `**• Adı:** <@${userId}> - ${userDisplayName}`
            }
        },
        error(error) {
            return "Yasaklamasını kaldırmak istediğiniz üyenin yasağını açarken bir hata oluştu :(\n\n" +
                "**Sebebi:**" +
                `• ${error}`
        }
    },
    unjail: {
        notJailed: "Bu kişi zaten jail'de değil",
        unjailed(memberId) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişi jail'den çıkarıldı!`
        },
        embed: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId
            }) {
                return `**🔊 <@${memberId}> adlı üye jail'den çıkarıldı**\n\n` +
                    `🧰 **JAIL'DEN ÇIKARAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **JAIL'DEN ÇIKARILAN KİŞİ**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Verilen rol:** <@&${jailRoleId}>`
            }
        }
    },
    unmute: {
        already: "Etiketlediğiniz kişi zaten susturulmamış",
        successUnmute(authorTag) {
            return `Muteyi kaldıran yetkili: ${authorTag}`
        },
        successMsg(memberId) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişinin susturulması başarıyla kaldırıldı!`
        },
        embed: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                unmuteAt,
                memberDisplayName
            }) {
                return `**🔊 <@${memberId}> adlı üyenin susturulması kaldırıldı**\n\n` +
                    `🧰 **SUSTURMAYI AÇAN YETKİLİ**\n` +
                    `**• Adı:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Susturmayı açtığı tarihi:** <t:${unmuteAt}:F> - <t:${unmuteAt}:R>\n\n` +
                    `👤 **SUSTURULMASI AÇILAN ÜYE**\n` +
                    `**• Adı:** <@${memberId}> - ${memberDisplayName}`
            }
        }
    },
    vip: {
        hasVipRole: "Etiketlediğiniz kişide zaten vip rolü bulunuyor",
        hasNoVipRole: "Etiketlediğiniz kişide zaten vip rolü bulunmuyor",
        successGive(memberId) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişiye vip rolü başarıyla verildi!`
        },
        successRemove(memberId) {
            return `${EMOJIS.yes} <@${memberId}> adlı kişiden vip rolü başarıyla alındı!`
        },
        infoMessage(prefix) {
            return `• Bir kişiye vip rolünü vermek için **${prefix}vip @kişi**\n` +
                `• Bir kişiden vip rolünü almak için **${prefix}vip al @kişi**\n` +
                `• Vip rolünü ayarlamak için **${prefix}vip rol @rol**\n` +
                `• Vip yetkili rolünü ayarlamak için **${prefix}vip yetkili @rol** yazabilirsiniz`
        }
    },
    yardım: {
        nothingSelected: "Hiçbir şey seçilmedi...",
        commandNotFound: "Komut bulunamadı",
        links: {
            myLinks: "Bağlantılarım",
            inviteMe: "Beni davet et",
            voteMe: "Oy ver",
            supportServer: "Destek sunucum"
        }
    },
    yaşsınır: {
        alreadyReset: "Yaş sınırı zaten sıfırlanmış durumda",
        successReset: "Yaş sınırı başarıyla sıfırlandı",
        enter(prefix) {
            return `• Yaş sınırını ayarlamak için **${prefix}yaşsınır <yaş>**\n` +
                `• Sıfırlamak için ise **${prefix}yaşsınır sıfırla** yazabilirsiniz\n\n` +
                `**Örnek:**\n` +
                `• ${prefix}yaşsınır 18\n` +
                `• ${prefix}yaşsınır 10`
        },
        notValid: "Lütfen 0-100 arasında bir sayı giriniz",
        successSet(age) {
            return `Yaş sınırı başarıyla **${age}** olarak ayarlandı. Bu yaşın altındaki kişilerin kayıt edilmesine izin vermeyeceğim`
        }
    },
    yaşzorunlu: {
        optionName: "Yaş zorunluluğu",
        enter(prefix) {
            return `• Yaş zorunluluğu ayarını açmak için **${prefix}yaşzorunlu aç**\n` +
                `• Kapatmak için ise **${prefix}yaşzorunlu kapat** yazabilirsiniz`
        }
    },
    yazdır: {
        enter: "Lütfen yazmamı istediğiniz mesajı yazınız\n\n**• Heyy eğer bir mesajı alıntılamamı istiyorsanız __komutu kullanırken mesajı alıntılaman__ yeterlii. Aşağıya bir tane görsel bıraktım oraya bi göz at bence :3**",
        success: "Mesajınız başarıyla yazdırıldı"
    },
    yetkiler: {
        hasAllPermissions(userId) {
            return `• <@${userId}> bütün yetkilere sahip!`;
        },
        hasAllPermissionsRole(roleId) {
            return `• <@&${roleId}> bütün yetkilere sahip!`;
        },
        permissionsData: {
            CreateInstantInvite: "Davet oluşturma",
            KickMembers: "Üyeleri atma",
            BanMembers: "Üyeleri banlama",
            ManageChannels: "Kanalları yönetme",
            ManageGuild: "Sunucuyu yönetme",
            ViewAuditLog: "Denetim kaydını görüntüleme",
            SendTTSMessages: "Sesli mesaj gönderme",
            ManageMessages: "Mesajları yönetme",
            EmbedLinks: "Gömülü bağlantı gönderme",
            AttachFiles: "Dosya gönderme",
            ReadMessageHistory: "Mesaj geçmişini görüntüleme",
            MentionEveryone: "@everyone ve @here atabilme",
            ViewGuildInsights: "Sunucunun istatistiklerini görüntüleme",
            MuteMembers: "Üyeleri susturma",
            DeafenMembers: "Üyeleri sağırlaştırma",
            MoveMembers: "Üyeleri taşıma",
            ChangeNickname: "Kullanıcı adını değiştirme",
            ManageNicknames: "Kullanıcı adlarını yönetme",
            ManageRoles: "Rolleri yönetme",
            ManageWebhooks: "Webhookları yönetme",
            ManageEmojisAndStickers: "Emoji ve sticklerleri yönetme",
            ManageEvents: "Etkinlikleri yönetme",
            ManageThreads: "Başlıkları yönetme",
            CreatePublicThreads: "Herkese açık başlık oluşturma",
            ModerateMembers: "Üyelere zaman aşımı uygulama",
        },
        titles: {
            guildPermissions: "SUNUCU İZİNLERİ",
            channelPermissions: "KANAL İZİNLERİ",
            memberPermissions: "ÜYE İZİNLERİ"
        }
    },
    yetkili: {
        authorized: "Yetkililer",
        noMember: "Bu sunucuda yetkili rolüne sahip hiçbir üye bulunmuyor",
        allAuthorized: "Bütün yetkililer",
        allAuthorizedRoles: "Bütün yetkili rolleri",
        notifNoGone: "*• Yukarıda etiketlenen **rollere ve üyelere** bildirim __gitmedi__*",
        nooneHasRole: "Şeyyy.. Hiç kimse yetkili rolüne sahip değil şapşik şey seni",
        enterFull(prefix) {
            return `• Yetkilisi rollerini ayarlamak için **${prefix}yetkili ayarla**\n` +
                `• Yetkili rollerini sıfırlamak için **${prefix}yetkili sıfırla**\n` +
                `• Bütün yetkili yetkililerini etiketlemek için **${prefix}yetkili etiket**\n` +
                `• Bütün yetkili yetkililerini bildirim gitmeden görmek için **${prefix}yetkili gör**\n` +
                `• Yetkili rolünü görmek için **${prefix}yetkili rol** yazabilirsiniz`
        }
    },
    yetkilibilgi: {
        botError: "Botların kayıt sayısına bakmayı gerçekten düşünmüyorsun değil mi?",
        rankMessages: {
            author: {
                firstAndLastRegister(registerInfo) {
                    return `👤 **Kayıt ettiğin kişi:** <@${registerInfo.memberId}>\n` +
                        `${EMOJIS.role} **Verdiğin rol(ler):** ${registerInfo.roles}\n` +
                        `⏲️ **Tarihi:** <t:${Math.round(registerInfo.timestamp)}:F>`
                },
                guildRank({
                    usersGuildRank,
                    fromPeople
                }) {
                    return `\n📈 **Sunucu sıralaman:** ${usersGuildRank == 0 ?
                        `Sıralaman yok` :
                        `${usersGuildRank}. sıradasın`
                        } *(${fromPeople} kişi içinden)*`
                },
                rank(totalCount) {
                    return `🔰 **Rankın:** ${Util.getUserRank(totalCount) || "Rankın yok"}`
                },
                registers: {
                    all: "Kayıt ettiklerin",
                    info({
                        registerType,
                        memberCount,
                        boyCount,
                        girlCount,
                        botCount
                    }) {
                        return `**${registerType == "member" ?
                            `${EMOJIS.member} Üye:** ${memberCount}` :
                            (`${EMOJIS.boy} Erkek:** ${boyCount}\n` +
                                `**${EMOJIS.girl} Kız:** ${girlCount}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${botCount}`
                    },
                    activity: "Kayıt etkinliğin",
                    first: "Kayıt ettiğin ilk kişi",
                    last: "Kayıt ettiğin son kişi",
                    lastRegisters: "Son 5 kaydın"
                },
                footer: "Seni seviyorum <3"
            },
            alisa: {
                firstAndLastRegister(registerInfo) {
                    return `👤 **Kayıt ettiğim kişi:** <@${registerInfo.memberId}>\n` +
                        `${EMOJIS.role} **Verdiğim rol(ler):** ${registerInfo.roles}\n` +
                        `⏲️ **Tarihi:** <t:${Math.round(registerInfo.timestamp)}:F>`
                },
                guildRank({
                    usersGuildRank,
                    fromPeople
                }) {
                    return `\n📈 **Sunucu sıralamam:** ${usersGuildRank == 0 ?
                        `Sıralamam yok` :
                        `${usersGuildRank}. sıradayım`
                        } *(${fromPeople} kişi içinden)*`
                },
                rank() {
                    return `🔰 **Rankım:** Botların rankı olmaz :)`
                },
                registers: {
                    all: "Kayıt ettiklerim",
                    info({
                        botCount
                    }) {
                        return `**${EMOJIS.bot} Bot:** ${botCount}`
                    },
                    activity: "Kayıt etkinliğim",
                    first: "Kayıt ettiğim ilk kişi",
                    last: "Kayıt ettiğim son kişi",
                    lastRegisters: "Son 5 kaydım"
                },
                footer: "Sizleri seviyorum <3"
            },
            user: {
                firstAndLastRegister(registerInfo) {
                    return `👤 **Kayıt ettiği kişi:** <@${registerInfo.memberId}>\n` +
                        `${EMOJIS.role} **Verdiği rol(ler):** ${registerInfo.roles}\n` +
                        `⏲️ **Tarihi:** <t:${Math.round(registerInfo.timestamp)}:F>`
                },
                guildRank({
                    usersGuildRank,
                    fromPeople
                }) {
                    return `\n📈 **Sunucu sıralaması:** ${usersGuildRank == 0 ?
                        `Sıralaması yok` :
                        `${usersGuildRank}. sırada`
                        } *(${fromPeople} kişi içinden)*`
                },
                rank(totalCount) {
                    return `🔰 **Rankı:** ${Util.getUserRank(totalCount) || "Rankı yok"}`
                },
                registers: {
                    all: "Kayıt ettikleri",
                    info({
                        registerType,
                        memberCount,
                        boyCount,
                        girlCount,
                        botCount
                    }) {
                        return `**${registerType == "member" ?
                            `${EMOJIS.member} Üye:** ${memberCount}` :
                            (`${EMOJIS.boy} Erkek:** ${boyCount}\n` +
                                `**${EMOJIS.girl} Kız:** ${girlCount}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${botCount}`
                    },
                    activity: "Kayıt etkinliği",
                    first: "Kayıt ettiği ilk kişi",
                    last: "Kayıt ettiği son kişi",
                    lastRegisters: "Son 5 kaydı"
                },
                footer: "Seni seviyorum <3"
            },
            last: {
                onehour: "Son 1 saat",
                oneday: "Son 1 gün",
                oneweek: "Son 1 hafta",
                onemonth: "Son 1 ay"
            }
        }
    },
    yetkilietiket: {
        optionName: "Yetkili etiketleme",
        enter(prefix) {
            return `• Sunucuya birisi katıldığında yetkili rolü etiketlemeyi açmak için **${prefix}yetkilietiket aç**\n` +
                `• Kapatmak için ise **${prefix}yetkilietiket kapat** yazabilirsiniz`
        }
    },
    zengin: {
        owner: "Sunucu sahibinin ismini değiştiremem :(",
        higherRole: "Sizin rolünüzün sırası benim rolümün sırasından yüksek olduğu için sizin isminizi değiştiremem",
        enter: "Lütfen yeni isminizi yazınız",
        longName: "Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz ve tekrar deneyiniz",
        success(name) {
            return `• Sunucudaki isminiz başarıyla **${name}** olarak değiştirildi`
        }
    },

};

module.exports = allMessages;