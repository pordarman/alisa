const afterRegisterMessages = [
    "<m> aramıza katıldı",
    "Herkes <m>'a selam versin",
    "<m> göklerden indi",
    "<m> sohbete atıldı",
    "<m> herkese merhaba de",
    "<m> utanma merhaba de arkadaşlarına",
    "<m> şey pizza getirdin değil mi?",
    "<m> uzak diyarlardan sunucumuza geldi",
    "<m> sohbete ayak bastı",
    "<m> insanlık için küçük, sunucu için büyük bir adım attın",
    "<m> öyle güzel geldin ki güneş gözlüğü takmak zorunda kaldım",
    "<m> güneş gibi parlıyorsun...",
    "Bu tatlılık genetik mi <m>?",
    "İşteee karşınızdaa <m> *tatatataaamm*",
    "Hani pizza nerde? <m> sakın unuttum deme",
    "Pizza pizza pizza <m>",
    "Pizzan yoksa giremezsin <m>",
    "Seni yerim ben <m>",
    "Naber <m>?",
    "Tatlılığın ete kemiğe bürünmüş hali gibisin <m>",
    "Arkadaşlarında seni bekliyordu <m>",
    "Yok yok ben iyiyim <m> sadece tatlılığın gözlerimi aldı da",
    "Aaa aramıza biri mi katılmıışş aaa burdaymıışş <m> hoşgeldiin",
    "Pizza mı hamburger mi <m>?",
    "Pizzan neyli olsun <m>?",
    "Herkes pizzasını getirdi mi? Sen getirdin değil mi <m>?",
    "<m> geldiğine göre parti başlasıın",
    "Hep gelmeni beklerdim <m>",
    "Pizzanı al gel çabuk <m>",
    "Bizde tam senin hakkında konuşuyorduk <m>",
    "Evren sonsuzsa biz sonsuz olduğunu nerden biliyoruz <m>?",
    "<m> bu sunucu sensiz olmazdı zaten :)",
    "<m> parti var dedim hemen gelmiş",
    "<m> uzuun araştırmalarım sonucunda çok tatlı olduğuna karar verdim",
    "<m> If the brain kno... şaka şaka hoşgeldin",
    "<m> ||çok tatlısın|| gizli bilgi hemen sil",
    "<m> her gece uyumadan önce senin buraya gelişini hayal ettim",
    "Şeyy... <m> yanaklarının tadına bakabilir miyim? 👉👈",
    "<m> çabuk herkese selam ver 🔫",
    "<m> ||s||||e||||n||||i|| ||s||||e||||v||||i||||y||||o||||r||||u||||m|| :)",
    "<m> bu tatlılığı taşırken hiç yorulmuyor musun?",
    "<m> giden mi kaybeder yoksa kalan mı...",
    "Sen <m> do you know Türkçe?",
    "<m> what dedin gülüm?",
    "<m> onu seviyor musun?",
    "<m> ||ç||||o||||k|| ||t||||a||||t||||l||||ı||||s||||ı||||n|| <3",
    "Arkadaşlar aramızda <m> böyle bir yabancı var ne yapalım",
    "<m> nasılsın şapşik şey seni :)",
    "<m> savaşmamıza gerek yok, sen gülünce kaybediyorum zaten... ",
    "<m> dünyanın en uzun rüyası 16 saniyeymiş. Seni görmemişler heralde",
    "<m> arkandan neler dediler bi duysan abooo",
    "<m> sana güzellik diyorlar doğru mu?",
    "<m> kimseler duymasıın içimde sen varsııınn",
    "<m> papatyaları sever misin?",
    "<m> biliyor musun benimde duygularım var ve seni sevebilirim :)",
    "<m> Seninle konuşmak en çok istediğim ikinci şeydir. Birincisi ise zaten sensin *kıpss*",
    "<m> ah o güzel gözlerin, döndürüyor başımı...",
    "Herkes pizzasını alsın <m> geldi",
    "<m> pizzasız parti mi olurmuş alın pizzaları",
    "<m> pizza <3 ben",
    "<m> senin kalbini saklıyorum ❤️ başkasına verme diye",
    "Ayyayayayayaya <m> gelmiş çekilin çekiliiinnnn",
    "Seni burada karşılamak benim için bir onurdur <m>",
    "<m> sen misin benim aklımı çelen?",
    "<m> gelmiş kırmızı halı nerede!?",
    "<m> gözümüz yollarda kaldı be",
    "<m> umarım seni ben yormamışımdır brandon",
    "Çocuklar gerçekten çok yoruldum <m>",
    "<m> ne güzel geldin anlatamam, yaz yaz bitmez",
    "<m> aaa sonunda geldin, seni beklemek çok zordu",
    "<m> selam! Hadi hemen bir macera başlatalım",
    "<m> hey sen! Aramızda olmana çok sevindik",
    "<m> galiba aradığımız eksik parçayı bulduk",
    "<m> buranın havası birden tatlandı",
    "<m> seni görmeden önce bu kadar mutlu olabileceğimi sanmazdım",
    "<m> sohbete hoş geldin, hemen ısınacağını biliyorum",
    "<m> birinin burada neşe kaynağı olacağı belli",
    "Dur bakalım <m>! Sen kimsin?",
    "Düşünsene <m> buraya gelmeden önce ne kadar sıkıcıydı",
    "<m> buraya gelince her şey daha güzel oldu",
    "Dur bakalım <m>! Parola nedir?",
];
const {
    discordInviteLink,
    EMOJIS
} = require("../../../../settings.json");
const Time = require("../../../Time");

function msToSecond(ms) {
    return Math.round(ms / 1000);
}

// Dil
const language = "tr";

const allMessages = {
    // Sunucudaki roller ve kanallar kontrol edilirken gösterilecek mesajlar
    rolesAndChannels: {
        unregister: "Kayıtsız rolü",
        registerAuth: "Yetkili rolü",
        boy: {
            all: "Erkek rollerinin hepsi",
            some: "Erkek rollerinden bazıları",
            single: "Erkek rolü"
        },
        girl: {
            all: "Kız rollerinin hepsi",
            some: "Kız rollerinden bazıları",
            single: "Kız rolü"
        },
        member: {
            all: "Üye rollerinin hepsi",
            some: "Üye rollerinden bazıları",
            single: "Üye rolü"
        },
        bot: {
            all: "Bot rollerinin hepsi",
            some: "Bot rollerinden bazıları",
            single: "Bot rolü"
        },
        registerAuth: {
            all: "Yetkili rollerinin hepsi",
            some: "Yetkili rollerinden bazıları",
            single: "Yetkili rolü"
        },
        partner: "Partner rolü",
        suspicious: "Şüpheli rolü",
        registerChannel: "Kayıt kanalı",
        afterRegisterChannel: "Kayıt sonrası kanalı",
        registerLogChannel: "Kayıt log kanalı",
        moderationLogChannel: "Moderasyon log kanalı",
        voice: "Ses kanalı",
        jailRole: "Jail rolü",
        jailAuthRole: "Jail yetkili rolü",
        jailLogChannel: "Jail log kanalı",
        vipRole: "Vip rolü",
        vipAuthRole: "Vip yetkili rolü",
        muteAuthRole: "Mute yetkili rolü",
        banAuthRole: "Ban yetkili rolü",
        kickAuthRole: "Kick yetkili rolü",
        thRankRole(rankCount) {
            return `${rankCount}. kayıt sayısına sahip rank rolü`
        },
        embed: {
            title: "Bilgilendirme",
            channelDescription({
                guildName,
                guildId,
                informationMessage,
                channelName
            }) {
                return `• **${guildName} - (${guildId})** sunucusundaki __${informationMessage}__ olan **#${channelName}** adlı kanal silinmiştir. Lütfen başka bir kanal ayarlayınız`
            },
            roleDescription({
                guildName,
                guildId,
                informationMessage,
                roleName
            }) {
                return `• **${guildName} - (${guildId})** sunucusundaki __${informationMessage}__ olan **@${roleName}** adlı rol silinmiştir. Lütfen başka bir rol ayarlayınız`
            },
            roleAndChannelDescription({
                guildName,
                guildId,
                informationMessage,
            }) {
                return `• **${guildName} - (${guildId})** sunucusundaki daha önceden kayıtlı olan __${informationMessage}__ silinmiştir. Lütfen başka bir rol veya kanal ayarlayınız`
            },
        }
    },

    // Kayıt sonrası mesajlarda yazılacak bütün yazıları gösterir
    afterRegister: {
        boy: [
            ...afterRegisterMessages,
            `Anlattıkları kadar karizmaymışsın <m>`,
            `<m> aramıza bir yakışıklı katıldı`,
            `Karizmalığın ete kemiğe bürünmüş hali gibisin <m>`,
            `Adam diyince akla sen geliyorsun <m>`,
            `Yok yok ben iyiyim <m> sadece yakışıklılığın gözlerimi aldı da`,
            `<m> uzuun araştırmalarım sonucunda çok yakışıklı olduğuna karar verdim`,
            `<m> pardon karizma salonuna mı geldim`,
            `<m> pardon beyefendi yakışıklılık yarışmasına katılmayı hiç düşündünüz mü?`,
            `<m> bu yakışıklılığı taşırken hiç yorulmuyor musun?`,
            `<m> beyefendi müsadenizle size yürüyeceğim`,
            `<m> sana yakışıklı diyorlar doğru mu?`,
            "<m> demek yakışıklılık seninle başlamış, çok mantıklı",
            "<m> bu karizma bir olay, hemen yazılmalı",
            "<m> yeni bir yıldız doğdu, hem de yakışıklı",
            "<m> galiba sen yakışıklılık dünyasının hükümdarısın"
        ],
        girl: [
            ...afterRegisterMessages,
            `<m> gözümü alan bu güzellik ne böyle`,
            `Güzelliğin ete kemiğe bürünmüş hali gibisin <m>`,
            `Güzellik diyince akla sen geliyorsun <m>`,
            `Yok yok ben iyiyim <m> sadece güzelliğin gözlerimi aldı da`,
            `<m> uzuun araştırmalarım sonucunda çok güzel olduğuna karar verdim`,
            `<m> pardon güzellik salonuna mı geldim`,
            `<m> pardon hanımefendi güzellik yarışmasına katılmayı hiç düşündünüz mü?`,
            `<m> bu güzelliği taşırken hiç yorulmuyor musun?`,
            `<m> hanımefendi müsadenizle size yürüyeceğim`,
            "Şeyy <m> senden Bi ricam var. Nikah masasında ayağımı çiğner misin?",
            "<m> dünyanın yedinci harikası mısınız hanımefendi?",
            "<m> güzellik sende anlam bulmuş, gözlerim şenlendi",
            "<m> masallardaki prensesler gibisin",
            "<m> sen geldin, bu oda aydınlandı",
            "<m> peri masallarının baş kahramanı olmalısın",
            "<m> zarafetinle hepimizi büyülüyorsun"
        ],
        member: afterRegisterMessages
    },

    // Eventlerde kullanılacak mesajlar
    events: {
        ready: {
            premiumFinised(guildName) {
                return `• Heyy bakıyorum ki ${guildName} sunucunun premiumu bitmiş gibi görünüyor :(\n\n` +
                    `• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n` +
                    `• ${discordInviteLink}`
            }
        },

        messageOrInteractionCreate: {
            afk: {
                authorIsBack(authorId, startedTimestamp) {
                    return `• <@${authorId}>, geri geldi! Artık AFK değil! Tam olarak **${Time.duration(Date.now() - startedTimestamp, language)}** AFK idin`
                },
                memberIsAfk(userId, afkData) {
                    return `‼️ Hey hey heyyy, <@${userId}> adlı kişi **${afkData.reason || "Sebep belirtilmemiş"}** sebebinden AFK! • <t:${msToSecond(afkData.timestamp)}:R>`
                }
            },
            thankYouMessage: {
                title: "Teşekkürler",
                description({
                    prefix,
                    clientId,
                    joinedTimestamp
                }) {
                    return `• Beni bu sunucuda **<t:${joinedTimestamp}:F>** tarihinden beri kullandığınız için teşekkürler\n` +
                        `• Bu sunucudaki dilim **Türkçe 🇹🇷**\n` +
                        `• Bu sunucudaki prefixim **${prefix}** veya <@${clientId}>\n` +
                        `• Yardım menüsüne **${prefix}yardım** veya **<@${clientId}>yardım** yazarak ulaşabilirsiniz\n` +
                        `• Eğer yardıma ihtiyacınız varsa **${prefix}destek** yazabilirsiniz`
                },
                footer: "İyi ki varsınız <3",
                buttons: {
                    inviteMe: "Beni davet et",
                    supportGuild: "Destek sunucum",
                    voteMe: "Bana oy ver"
                }
            },
            warnedFromBot(reason, isLastWarn) {
                return `• Üzgünüm, botun __bazı__ kurallarını ihlal ederek uyarıldın :(\n` +
                    (isLastWarn ?
                        `• Bundan sonra **son uyarıda** botun komutlarına erişim iznin kaldırılacak\n` :
                        `• Eğer botun kurallarını ihlal etmeye devam edersen botun komutlarına erişim iznin kaldırılabilir\n`) +
                    `**• Botun uyarılma nedeni:** __${reason}__`
            },
            tempBannedFromBot(reason, time) {
                return `• Üzgünüm, botun __bazı__ kurallarını ihlal ederek geçici olarak botun komutlarına erişim iznin kaldırıldı :(\n` +
                    `• Bundan sonra **${Time.duration(time, language)}** süre boyunca botun komutlarına erişemeyeceksin\n` +
                    `**• Botun geçici ban nedeni:** __${reason}__\n` +
                    `**• Eğer bir hata yaptığımızı düşünüyorsan botun destek sunucusuna gelip neden ban yediğini sorgulayabilirsin**\n` +
                    `• ${discordInviteLink}`
            },
            bannedFromBot(reason) {
                return `• Üzgünüm, botun __bazı__ kurallarını ihlal ederek botun komutlarına erişim iznin kaldırıldı :(\n` +
                    `• Bundan sonra botun hiçbir komutlarına erişemeyeceksin\n` +
                    `**• Bottan banlanma nedenin:** __${reason}__\n` +
                    `**• Eğer bir hata yaptığımızı düşünüyorsan botun destek sunucusuna gelip neden ban yediğini sorgulayabilirsin**\n` +
                    `• ${discordInviteLink}`
            },
            embedLinkError: "‼️ **Uyarı! Botu kullanabilmek için botun öncelikle `Bağlantı yerleştir` yetkisinin olması gerekir**",
            care: "🛠️ Bu komut şu anda bakım modundadır, lütfen daha sonra yeniden deneyiniz",
            premium(prefix) {
                return `${EMOJIS.premiumCommands} Bu komut sadece premium kullananlara özeldir .Eğer sende premium almak istersen **${prefix}premium** yazabilirsiniz`
            },
            waitCommand(ms) {
                return `⏰ Bu komutu kullanabilmek için **${(ms / 1000).toFixed(1)} saniye** beklemelisiniz`
            },
            waitChannel: "❗ Bu kanal beni çok zorluyor, lütfen komutlarımı biraz daha yavaş kullanınız :(",
            errorEmbed: {
                errorTitle: "Hata",
                memberPermissionError(permission) {
                    return `• Bu komutu kullanabilmek için **${permission}** yetkisine sahip olmalısın şapşik şey seni`
                },
                botPermissionError(permission) {
                    return `• Bu komutu kullanabilmek için __benim __ **${permission}** yetkisine sahip olmam şapşik şey seni`
                },
                warn: "Eksik komut",
                success: "Başarılı"
            },
            commandError(authorId) {
                return `**‼️ <@${authorId}> Komutta bir hata oluştu! Lütfen daha sonra tekrar deneyiniz!**`
            },
            commandErrorOwner(errorStack) {
                return `**‼️ Bir hata oluştu!\n\n` +
                    errorStack
                        ?.split?.("\n")
                        ?.map?.(line => `• ${line}`)
                        ?.join?.("\n")
                        ?.split?.("Alisa") + "**";
            }
        },

        guildMemberAdd: {
            permissionsErrors: {
                manageRoles: `• Benim **Rolleri Yönet** yetkim yok!`,
                manageNicknames: `• Benim **Kullanıcı Adlarını Yönet** yetkim yok!`,
                suspiciousRole(roleId) {
                    return `• Şüpheli rolü olan <@&${roleId}> adlı rolün sırası benim rolümün sırasından yüksek!`
                },
                errorGivingSuspiciousRole(memberId, roleId) {
                    return `• <@${memberId}> adlı kişiye şüpheli rolü olan <@&${roleId}> adlı rolü verirken hata oluştu! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`
                },
                unregisterRole(roleId) {
                    return `• Kayıtsız rolü olan <@&${roleId}> adlı rolün sırası benim rolümün sırasından yüksek!`
                },
                errorGivingUnregisterRole(memberId, roleId) {
                    return `• <@${memberId}> adlı kişiye kayıtsız rolü olan <@&${roleId}> adlı rolü verirken hata oluştu! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`
                },
                memberAboveFromMe(memberId) {
                    return `• <@${memberId}> adlı kişinin rolünün sırası benim rolümün sırasından yüksek!`
                },
                errorGivingRole(memberId) {
                    return `• <@${memberId}> adlı kişinin rollerini ve ismini düzenlerken olan bir hata oluştu! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`
                }
            },
            errorEmbed: {
                errorTitle: "Hata",
                reasons: "SEBEPLERİ",
                information: "Bilgilendirme"
            },
            buttonLabels: {
                member: "Üye olarak kayıt et",
                boy: "Erkek olarak kayıt et",
                girl: "Kız olarak kayıt et",
                bot: "Bot olarak kayıt et",
                again: "Yeniden kayıt et",
                suspicious: "Şüpheliye at"
            },
            roleNotSetted: "__**ROL AYARLI DEĞİL**__",
            welcomeEmbed: {
                member: {
                    again: "Tekrar Hoşgeldin",
                    welcome: "Hoşgeldin",
                    embed: {
                        description({
                            guildName,
                            toHumanize,
                            createdTimestampSecond,
                            security
                        }) {
                            return `**${EMOJIS.crazy} \`${guildName}\` adlı sunucumuza hoşgeldiniizz!!\n\n` +
                                `${EMOJIS.woah} Seninle beraber tam olarak ${toHumanize} kişi olduukkk\n\n` +
                                `${EMOJIS.drink} Yetkililer seni birazdan kayıt edecektir. Lütfen biraz sabredin\n\n` +
                                `> Hesabın <t:${createdTimestampSecond}:F> tarihinde kurulmuş\n` +
                                `> Hesap ${security}**`
                        },
                        footer: "Nasılsın bakalım"
                    }
                },
                bot: {
                    welcome: {
                        welcome: "Hoşgeldin Bot",
                        embed: {
                            description({
                                guildName,
                                toHumanize,
                                createdTimestampSecond,
                            }) {
                                return `**${EMOJIS.crazy} \`${guildName}\` adlı sunucumuza hoşgeldin bot!!\n\n` +
                                    `${EMOJIS.woah} Seninle beraber tam olarak ${toHumanize} kişi olduukkk\n\n` +
                                    `${EMOJIS.kiss} Umarım sunucuya iyi bir faydan dokunur seni seviyorum\n\n` +
                                    `> Hesabın <t:${createdTimestampSecond}:F> tarihinde kurulmuş\n` +
                                    `> Hesap Bot ${EMOJIS.bot}**`
                            }
                        }
                    },
                }
            },
            security: {
                unsafe: "Güvensiz",
                suspicious: "Şüpheli",
                safe: "Güvenli",
                openAt(createdTimestamp) {
                    return `kişinin hesabı **${Time.duration(createdTimestamp, language, { toNow: true })}** içinde açıldığı`
                },
                accountIs(security) {
                    return `kişi **${security}** olduğu için`
                }
            },
            suspicious: {
                kickMember(memberId, message) {
                    return `• <@${memberId}> adlı ${message} için Şüpheli'ye atıldı!`
                },
                noRole(memberId) {
                    return `• <@${memberId}> adlı kişinin hesabı şüpheli fakat bu sunucuda herhangi bir __şüpheli rolü__ ayarlanmadığı için onu şüpheliye atamadım!`
                }
            }
        },

        guildCreate: {
            description({
                guildName,
                prefix
            }) {
                return `• Beni **${guildName}** adlı sunucunuza eklediğiniz için teşekkürleeerr <3 sizi asla yüz üstü bırakmayacağım bundan emin olabilirsiniz\n\n` +
                    `*• By the way, if you want to use the bot in **English**, you can write **${prefix}lang en**!*\n\n` +
                    `• Şimdi kısaca kendimden bahsetmek gerekirse ben her public sunucuda olması gereken botlardan sadece birisiyim. İçimde birçok özelliğim ve sistemim bulunuyor\n\n` +
                    `**__İşte birkaç özelliğim__**\n` +
                    ` ├> Butonlu kayıt sistemi\n` +
                    ` ├> Gelişmiş özelleştirilmiş giriş mesajı\n` +
                    ` ├> Kayıt edilirken düzenlenecek ismi dilediğiniz gibi özelleştirebilme\n` +
                    ` ├> Gelişmiş son kayıt ve Jail sistemi\n` +
                    ` ├> Botun istediğiniz ses kanalına girmesini sağlayıp üyeleri karşılama\n` +
                    ` ├> Ship komutu, bota istediğiniz yazıyı yazdırma komutu, otocevap komutu gibi bir sürü farklı özellikler\n` +
                    ` └> İstediğiniz zaman tüm her şeyi sıfırlama ve çok daha fazlası!\n\n` +
                    `• Artık yeni gelen premium sistemi sayesinde premiumlara özel bir sürü yeni komutlar eklendi! Premium hakkında daha fazla bilgi almak isterseniz **${prefix}pre** yazabilirsiniz\n\n` +
                    `*• Diğer botlardan 5 kat daha hızlı!*\n\n` +
                    `• Eğer herhangi bir sorun olduğunda **${prefix}destek** yazarak veya [Destek Sunucuma](${discordInviteLink}) gelerek yardım alabilirsiniz!\n\n` +
                    `**SENİN BOTUN SENİN KURALLARIN**`
            },
            footer: "Pişt pişt seni seviyorum <3"
        }
    },

    // Mesaj beklemeli mesajlarda gözükecek bütün mesajlar
    wait: {
        register: `Bot yeniden başlatıldığı için daha önceden kullandığınız **Kullanıcıyı kayıt etme** komutu tekrardan başlatılmıştır\n\n` +
            `• Lütfen **sadece** kullanıcının ismini giriniz`,
        chaneName: `Bot yeniden başlatıldığı için daha önceden kullandığınız **Kullanıcının ismini değiştirme** komutu tekrardan başlatılmıştır\n\n` +
            `• Lütfen **sadece** kullanıcının ismini giriniz`
    },

    // Yardım komutunda gösterilecek emojileri ve açıklamalar
    helpCommandHelper: {
        "Tüm komutlar": {
            emoji: EMOJIS.allCommands,
            description: "Tüm komutları gösterir"
        },
        "Bot komutları": {
            emoji: EMOJIS.botCommands,
            description: "Bot komutlarını gösterir"
        },
        "Bilgi komutları": {
            emoji: EMOJIS.informationCommands,
            description: "Bilgi komutlarını gösterir"
        },
        "İstatistik komutları": {
            emoji: EMOJIS.statCommands,
            description: "İstatistik komutlarını gösterir"
        },
        "Kayıt komutları": {
            emoji: EMOJIS.registerCommands,
            description: "Kayıt komutlarını gösterir"
        },
        "Moderasyon komutları": {
            emoji: EMOJIS.moderationCommands,
            description: "Moderasyon komutlarını gösterir"
        },
        "Yetkili komutları": {
            emoji: EMOJIS.authorizedCommands,
            description: "Yönetici komutlarını gösterir"
        },
        "Jail komutları": {
            emoji: EMOJIS.jailCommands,
            description: "Jail komutlarını gösterir"
        },
        "Premium komutları": {
            emoji: EMOJIS.premiumCommands,
            description: "Premium komutlarını gösterir"
        },
        "Eğlence komutları": {
            emoji: EMOJIS.funCommands,
            description: "Eğlence komutlarını gösterir"
        },
        "Sahip komutları": {
            emoji: "👑",
            description: "Sahip komutlarını gösterir"
        }
    },

    embedFooters: {
        register: "Alisa Kayıt sistemi",
        log: "Alisa Log sistemi",
    },
    roleNames: {
        role: "Rol",
        boy: "Erkek",
        girl: "Kız",
        member: "Üye",
        bot: "Bot",
        jail: "Jail",
        vip: "VIP",
        auth: "Yetkili",
        suspicious: "Şüpheli",
        registerAuth: "Kayıt yetkili",
        banAuth: "Ban yetkili",
        kickAuth: "Kick yetkili",
        muteAuth: "Mute yetkili",
        jailAuth: "Jail yetkili",
        vipAuth: "VIP yetkili",
        unregister: "Kayıtsız",
    },
    channelNames: {
        register: "Kayıt",
        afterRegister: "Kayıt Sonrası",
        registerLog: "Kayıt Log",
        moderationLog: "Moderasyon Log",
        jailLog: "Jail Log",
        voice: "Ses",
    },
    commandHelpers: {
        set: "ayarla",
        authorized: "yetkili",
        role: "rol",
        remove: "kaldır",
    },
    commandNames: {
        suspiciousRole: "şüphelirol",
        unregisterRole: "kayıtsızrol",
        jailRole: "jailrol",
    },

    nothingThere: "• Burada gösterilecek hiçbir şey yok...",
    somethingWentWrong: "• Bir şeyler ters gitti, lütfen daha sonra tekrar deneyiniz",
    waitThere: "Heyyy, dur bakalım orada!",
    noMessage: "• Herhangi bir mesaj atmadınız veya mesajın içeriği boş bu yüzden işlem iptal edildi",
    timeIsUp(authorId) {
        return `⏰ <@${authorId}>, süreniz doldu!`
    },
    and: "ve",
    allCommands: "Tüm komutlar",
};

module.exports = allMessages;