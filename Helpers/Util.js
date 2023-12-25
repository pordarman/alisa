const {
    EMOJIS,
    rankNumbers,
    shardCount,
    webhookLinks,
    discordInviteLink
} = require("../settings.json");
const {
    afterRegister
} = require("../messages.json");
const {
    Message,
    User,
    GuildMember,
    Client,
    Guild,
    Collection,
    Role,
    GuildChannel,
    WebhookClient
} = require("discord.js");
const database = require("./Database");
const Time = require("./Time");

/**
 * @typedef {Object} GuildObject
 * @property {Guild} guild
 */

/**
 * Binary Search Algoritmasını kullanarak findIndex fonksiyonunu çalıştırır
 * @param {Array<Number>} array 
 * @param {Number} number 
 * @returns {Number}
 */
function bsFindIndex(array, number) {
    let startIndex = 0,
        endIndex = array.length
    while (startIndex < endIndex) {
        if (endIndex - startIndex <= 3) {
            for (let index = endIndex - 1; index >= startIndex; --index) {
                if (array[index] <= number) {
                    return index + 1;
                }
            }
        }
        const middleIndex = Math.floor((endIndex + startIndex) / 2);
        if (array[middleIndex] === number) {
            return middleIndex + 1;
        } else if (array[middleIndex] > number) {
            endIndex = middleIndex
        } else {
            startIndex = middleIndex + 1
        }
    }
    return startIndex;
}

// Rank sayılarına göre rankları önbelleğe kaydet
const languageObject = {};
for (const language in EMOJIS.allRanks) {
    const allRanks = EMOJIS.allRanks[language];

    const rankMaps = new Map()
    for (let i = 0; i < allRanks.length; i++) {
        rankMaps.set(rankNumbers[i], EMOJIS.allRanks[i]);
    }

    languageObject[language] = rankMaps
}

const MAX_NUMBER_IN_TIMEOUT = 2 ** 31 - 1;

const allWebhooks = {};
for (const url in webhookLinks) {
    let webhook;

    try {
        webhook = new WebhookClient({
            url: webhookLinks[url]
        });
    } catch (_) {
        webhook = {
            send() { }
        }
    }
    allWebhooks[url] = webhook;
}

/**
 * @typedef {Object} WebHooksObject
 * @property {WebhookClient} error
 * @property {WebhookClient} shard
 * @property {WebhookClient} ready
 * @property {WebhookClient} guildCreate
 * @property {WebhookClient} guildDelete
 * @property {WebhookClient} reportBug
 * @property {WebhookClient} suggestion
 */

// Bazı işlevsel fonksiyonları burada tutuyoruz ki hem düzenlemesi hem de bulunması kolay olsun
class Util {

    /**
     * Bir webhook oluşturur
     * @param {String} url 
     * @returns {WebhookClient}
     */
    createWebhook(url) {
        try {
            return new WebhookClient({
                url
            });
        } catch (_) {
            return {
                send() { }
            };
        }
    }

    /**
     * Bütün webhookların toplandığı yer
     * @returns {WebHooksObject}
     */
    get webhooks() {
        return allWebhooks
    }


    /**
     * Sunucudaki roller ve kanallar kontrol edilirken gösterilecek mesajlar
     */
    get rolesAndChannelMessages() {
        return {

            tr: {
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
                normal: {
                    all: "Üye rollerinin hepsi",
                    some: "Üye rollerinden bazıları",
                    single: "Üye rolü"
                },
                bot: {
                    all: "Bot rollerinin hepsi",
                    some: "Bot rollerinden bazıları",
                    single: "Bot rolü"
                },
                auth: {
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
                embed: {
                    title: "Bilgilendirme",
                    channelDescription({
                        guild,
                        guildId,
                        informationMessage,
                        channel
                    }) {
                        return `• **${guild.name} - (${guildId})** sunucusundaki __${informationMessage}__ olan **#${channel.name}** adlı kanal silinmiştir. Lütfen başka bir kanal ayarlayınız`
                    },
                    roleDescription({
                        guild,
                        guildId,
                        informationMessage,
                        role
                    }) {
                        return `• **${guild.name} - (${guildId})** sunucusundaki __${informationMessage}__ olan **@${role.name}** adlı rol silinmiştir. Lütfen başka bir rol ayarlayınız`
                    },
                    roleAndChannelDescription({
                        guild,
                        guildId,
                        informationMessage,
                    }) {
                        return `• **${guild.name} - (${guildId})** sunucusundaki daha önceden kayıtlı olan __${informationMessage}__ silinmiştir. Lütfen başka bir rol veya kanal ayarlayınız`
                    },
                    and: "ve",
                }
            },

            en: {
                unregister: "Unregistered role",
                registerAuth: "Authority role",
                boy: {
                    all: "All boy roles",
                    some: "Some of the boy roles",
                    single: "Boy role"
                },
                girl: {
                    all: "All girl roles",
                    some: "Some of the girl roles",
                    single: "Girl role"
                },
                normal: {
                    all: "All member roles",
                    some: "Some of the member roles",
                    single: "Member role"
                },
                bot: {
                    all: "All bot roles",
                    some: "Some of the bot roles",
                    single: "Bot role"
                },
                auth: {
                    all: "All authorized roles",
                    some: "Some of the authorized roles",
                    single: "Authorized role"
                },
                partner: "Partner role",
                suspicious: "Suspicious role",
                registerChannel: "Registration channel",
                afterRegisterChannel: "After registration channel",
                registerLogChannel: "Register log channel",
                moderationLogChannel: "Moderation log channel",
                voice: "Voice channel",
                jailRole: "Jail role",
                jailAuthRole: "Jail authorized role",
                jailLogChannel: "Jail log channel",
                vipRole: "Vip role",
                vipAuthRole: "Vip authorized role",
                muteAuthRole: "Mute authorized role",
                banAuthRole: "Ban authorized role",
                kickAuthRole: "Kick authorized role",
                embed: {
                    title: "Information",
                    channelDescription({
                        guild,
                        guildId,
                        informationMessage,
                        channel
                    }) {
                        return `• The channel named **#${channel.name}**, which is __${informationMessage}__ on server **${guild.name} - (${guildId})**, has been deleted. Please set another channel`
                    },
                    roleDescription({
                        guild,
                        guildId,
                        informationMessage,
                        role
                    }) {
                        return `• The role **@${role.name}** from server **${guild.name} - (${guildId})** __${informationMessage}__ has been deleted. Please set another role`
                    },
                    roleAndChannelDescription({
                        guild,
                        guildId,
                        informationMessage,
                    }) {
                        return `• The previously registered __${informationMessage}__ on server **${guild.name} - (${guildId})** has been deleted. Please set another role or channel`
                    },
                    and: "and",
                }
            }
        }
    }


    /**
     * Özel isimleri ve özel giriş mesajlarını düzenler
     */
    get customMessages() {
        const that = this;
        return {

            registerName({
                message,
                memberName,
                guildDatabase,
                inputAge,
                isBot,
                defaultObject = {}
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = element.slice(1, -1).toLocaleLowerCase(guildDatabase.language);
                    switch (keyName) {
                        case "tag":
                            return guildDatabase.register.tag || defaultObject.tag || "";

                        case "isim":
                        case "name":
                            return that.registerCase(memberName, guildDatabase, defaultObject);

                        case "yaş":
                        case "yas":
                        case "age":
                            return isBot ? element : inputAge?.[0] ?? "";

                        default:
                            return element;
                    }
                }).trim();
            },

            unregisterName({
                message,
                guildDatabase,
                name
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = element.slice(1, -1).toLocaleLowerCase(guildDatabase.language);
                    switch (keyName) {
                        case "tag":
                            return guildDatabase.register.tag || "";

                        case "isim":
                        case "name":
                            return name;

                        default:
                            return element;
                    }
                }).trim()
            },

            afterRegisterMessage({
                message,
                language,
                memberId,
                recreateMemberName,
                givenRolesString,
                memberCount,
                authorId,
                recreateAuthorName,
                guildTag,
                toHumanizeRegisterCount
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = that.removeTurkishChars(
                        element.slice(1, -1).toLocaleLowerCase(language)
                    ).replace(/[^a-z0-9]/g, "") // Bütün harf olmayan verileri kaldır
                    switch (keyName) {
                        case "uye":
                        case "member":
                            return `<@${memberId}>`;

                        case "uyeisim":
                        case "membername":
                            return recreateMemberName;

                        case "uyeid":
                        case "memberid":
                            return memberId;

                        case "rol":
                        case "role":
                            return givenRolesString;

                        case "total":
                        case "toplam":
                            return that.toHumanize(memberCount, language);

                        case "emojitotal":
                        case "emojitoplam":
                            return that.stringToEmojis(memberCount);

                        case "yetkili":
                        case "auth":
                            return `<@${authorId}>`;

                        case "yetkiliisim":
                        case "authname":
                            return recreateAuthorName;

                        case "yetkiliid":
                        case "authid":
                            return authorId;

                        case "tag":
                        case "tags":
                            return guildTag || {
                                tr: "**TAG YOK**",
                                en: "**NO TAG**"
                            }[language];

                        case "kayittoplam":
                        case "registercount":
                            return toHumanizeRegisterCount;

                        default:
                            return element;
                    }
                });
            },

            guildAddMessage({
                message,
                language,
                guild,
                userId,
                recreateName,
                toHumanize,
                authRoleString,
                createdTimestampSecond,
                createdTimestamp,
                security
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = that.removeTurkishChars(
                        element.slice(1, -1).toLocaleLowerCase(language)
                    ).replace(/[^a-z0-9]/g, "") // Bütün harf olmayan verileri kaldır
                    switch (keyName) {
                        case "sunucuadi":
                        case "guildname":
                            return guild.name;

                        case "uye":
                        case "member":
                            return `<@${userId}>`;

                        case "uyeisim":
                        case "membername":
                            return recreateName;

                        case "uyeid":
                        case "memberid":
                        case "userid":
                            return userId;

                        case "toplam":
                        case "total":
                            return toHumanize;

                        case "emojitoplam":
                        case "emojitotal":
                            return that.stringToEmojis(toHumanize);

                        case "rol":
                        case "role":
                            return authRoleString;

                        case "tarih":
                        case "date":
                            return `<t:${createdTimestampSecond}:F>`;

                        case "tarih2":
                        case "date2":
                            return `<t:${createdTimestampSecond}:R>`;

                        case "tarih3":
                        case "date3":
                            return Time.toDateString(createdTimestamp, language);

                        case "security":
                        case "guvenlik":
                            return security;

                        default:
                            return element;
                    }

                }).trim()
            }

        }
    }


    /**
     * Kayıt sonrası mesajlarda yazılacak bütün yazıları gösterir
     */
    get afterRegisterMessages() {
        return {
            tr: { // Türkçe kayıt mesajları
                boy: [
                    ...afterRegister.tr,
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
                    `<m> sana yakışıklı diyorlar doğru mu?`
                ],
                girl: [
                    ...afterRegister.tr,
                    `<m> gözümü alan bu güzellik ne böyle`,
                    `Güzelliğin ete kemiğe bürünmüş hali gibisin <m>`,
                    `Güzellik diyince akla sen geliyorsun <m>`,
                    `Yok yok ben iyiyim <m> sadece güzelliğin gözlerimi aldı da`,
                    `<m> uzuun araştırmalarım sonucunda çok güzel olduğuna karar verdim`,
                    `<m> pardon güzellik salonuna mı geldim`,
                    `<m> pardon hanımefendi güzellik yarışmasına katılmayı hiç düşündünüz mü?`,
                    `<m> bu güzelliği taşırken hiç yorulmuyor musun?`,
                    `<m> hanımefendi müsadenizle size yürüyeceğim`,
                    "Şeyy <m> senden Bi ricam var. Nikah masasında ayağımı çiğner misin?"
                ],
                normal: afterRegister.tr
            },
            en: { // İngilizce kayıt mesajları
                boy: [
                    ...afterRegister.en,
                    `You are as charismatic as they say <m>`,
                    `<m> A handsome man has joined us`,
                    'You are like charisma incarnate <m>',
                    'When I say man, you come to mind <m>',
                    "No, no, I'm fine <m> It's just that your handsomeness caught my eyes",
                    '<m> After much research, I decided that he is very handsome',
                    `<m> excuse me, did I come to the charisma hall?`,
                    `<m> Excuse me sir, have you ever thought of participating in a handsomeness contest?`,
                    `<m> Don't you ever get tired while carrying this handsome man?`,
                    `<m> sir, with your permission, I will walk to you`,
                    `<m> They call you handsome, is it true?`
                ],
                girl: [
                    ...afterRegister.en,
                    '<m> What is this beauty that catches my eye?',
                    'You are like beauty incarnate <m>',
                    'When I say beauty, you come to mind <m>',
                    "No, no, I'm fine <m> It's just that your beauty caught my eyes",
                    '<m> After much research, I decided that it is very beautiful',
                    `<m> excuse me, did I come to the beauty salon?`,
                    `<m> Excuse me, ma'am, have you ever thought of participating in a beauty contest?`,
                    `<m> Don't you ever get tired while carrying this beauty?`,
                    `<m> Madam, with your permission, I will walk to you`,
                    "Well <m> I have a request from you. Will you trample my foot at the wedding table?"
                ],
                normal: afterRegister.en
            }
        }
    }


    /**
     * Event dosyalarında gözükecek bütün mesajlar
     */
    get eventMessages() {
        const that = this;

        return {
            messageOrInteractionCreate: { // Birisi mesaj attığında veya bir interaction kullandığında çağırılacak veri

                tr: {
                    afk: {
                        authorIsBack(authorId, startedTimestamp) {
                            return `• <@${authorId}>, geri geldi! Artık AFK değil! Tam olarak **${Time.duration(Date.now() - startedTimestamp, "tr")}** AFK idin`
                        },
                        memberIsAfk(user, afkData) {
                            return `‼️ Hey hey heyyy, <@${user.id}> adlı kişi **${afkData.reason || "Sebep belirtilmemiş"}** sebebinden AFK! • <t:${Math.round(afkData.timestamp / 1000)}:R>`
                        }
                    },
                    thankYouMessage: {
                        title: "Teşekkürler",
                        description(guildMe, prefix) {
                            return `• Beni bu sunucuda **<t:${Math.round(guildMe.joinedTimestamp / 1000)}:F>** tarihinden beri kullandığınız için teşekkürler\n` +
                                `• Bu sunucudaki dilim **Türkçe 🇹🇷**\n` +
                                `• Bu sunucudaki prefixim **${prefix}** veya <@${guildMe.id}>\n` +
                                `• Yardım menüsüne **${prefix}yardım** veya **<@${guildMe.id}>yardım** yazarak ulaşabilirsiniz\n` +
                                `• Eğer yardıma ihtiyacınız varsa **${prefix}destek** yazabilirsiniz`
                        },
                        footer: "İyi ki varsınız <3",
                        buttons: {
                            inviteMe: "Beni davet et",
                            supportGuild: "Destek sunucum",
                            voteMe: "Bana oy ver"
                        }
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
                    commandErrorOwner(error) {
                        return `**‼️ Bir hata oluştu!\n\n` +
                            error.stack
                                .split("\n", 6)
                                .map(line => `• ${line}`)
                                .join("\n") +
                            "**"
                    }
                },

                en: {
                    afk: {
                        authorIsBack(authorId, startedTimestamp) {
                            return `• <@${authorId}>, is back! Not AFK anymore! You were AFK for exactly **${Time.duration(Date.now() - startedTimestamp, "en")}**`
                        },
                        memberIsAfk(user, afkData) {
                            return `‼️ Hey hey heyyy, <@${user.id}> is AFK for **${afkData.reason || "No reason stated"}**! • <t:${Math.round(afkData.timestamp / 1000)}:R>`
                        }
                    },
                    thankYouMessage: {
                        title: "Thank you",
                        description(guildMe, prefix) {
                            return `• Thank you for using me on this server since **<t:${Math.round(guildMe.joinedTimestamp / 1000)}:F>**\n` +
                                `• My language on this server is **English 🇬🇧**\n` +
                                `• My prefix on this server is **${prefix}** or <@${guildMe.id}>\n` +
                                `• You can access the help menu by typing **${prefix}help** or **<@${guildMe.id}>help**\n` +
                                `• If you need help, you can write **${prefix}support**`
                        },
                        footer: "I'm glad to have you <3",
                        buttons: {
                            inviteMe: "Invite me",
                            supportGuild: "My support server",
                            voteMe: "Vote me"
                        }
                    },
                    bannedFromBot(reason) {
                        return `• Sorry, you have been denied access to the bot's commands by violating __some__ rules of the bot :(\n` +
                            `• From now on you will not be able to access any commands of the bot\n` +
                            `**• The reason you got banned from the bot:** __${reason}__\n` +
                            `**• If you think we made a mistake, you can come to the bot's support server and ask why it got banned**\n` +
                            `• ${discordInviteLink}`
                    },
                    embedLinkError: "‼️ Warning! In order to use the bot, the bot must first have 'Embed link' permission",
                    care: "🛠️ This command is currently in maintenance mode, please try again later",
                    premium(prefix) {
                        return `${EMOJIS.premiumCommands} This command is only for premium users. If you want to buy premium, you can write **${prefix}premium**`
                    },
                    waitCommand(ms) {
                        return `⏰ You must wait ** ${(ms / 1000).toFixed(1)} seconds ** to use this command`
                    },
                    waitChannel: "❗ This channel is very challenging for me, please use my commands a little slower :(",
                    errorEmbed: {
                        errorTitle: "Error",
                        memberPermissionError(permission) {
                            return `• You must have **${permission}** to use this command, you stupid thing`
                        },
                        botPermissionError(permission) {
                            return `• You stupid thing that __I have __ **${permission}** to use this command`
                        },
                        warn: "Missing command",
                        success: "Successful"
                    },
                    commandError(authorId) {
                        return `**‼️ <@${authorId}> An error occurred in the command! Please try again later!**`
                    },
                    commandErrorOwner(error) {
                        return `**‼️ An error occurred in the command!\n\n` +
                            error.stack
                                .split("\n", 6)
                                .map(line => `• ${line}`)
                                .join("\n") +
                            "**"
                    }
                }

            },


            guildMemberAdd: { // Birisi sunucuya katıldığında çağırılacak veri

                tr: {
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
                        normal: "Üye olarak kayıt et",
                        boy: "Erkek olarak kayıt et",
                        girl: "Kız olarak kayıt et",
                        bot: "Bot olarak kayıt et",
                        again: "Yeniden kayıt et",
                        suspicious: "Şüpheliye at"
                    },
                    roleNotSetted: "ROL AYARLI DEĞİL",
                    welcomeEmbed: {
                        member: {
                            again: "Tekrar Hoşgeldin",
                            welcome: "Hoşgeldin",
                            embed: {
                                description({
                                    guild,
                                    toHumanize,
                                    createdTimestampSecond,
                                    security
                                }) {
                                    return `**${EMOJIS.crazy} \`${guild.name}\` adlı sunucumuza hoşgeldiniizz!!\n\n` +
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
                                        guild,
                                        toHumanize,
                                        createdTimestampSecond,
                                    }) {
                                        return `**${EMOJIS.crazy} \`${guild.name}\` adlı sunucumuza hoşgeldin bot!!\n\n` +
                                            `${EMOJIS.woah} Seninle beraber tam olarak ${toHumanize} kişi olduukkk\n\n` +
                                            `${EMOJIS.kiss} Umarım sunucuya iyi bir faydan dokunur seni seviyorum\n\n` +
                                            `> Hesabın <t:${createdTimestampSecond}:F> tarihinde kurulmuş\n` +
                                            `> Hesap Bot ${EMOJIS.bot}**`
                                    }
                                }
                            },
                            register: {
                                registerEmbed: {
                                    description: `**• Bot otomatik olarak kayıt edildi ${EMOJIS.yes}**`,
                                    fileds({
                                        authorId,
                                        toHumanizeRegisterCount,
                                        memberId,
                                        recreateName,
                                        botRolesString
                                    }) {
                                        return {
                                            name: "`Kayıt yapan`",
                                            value: `> 👤 **Adı:** <@${authorId}>\n` +
                                                `> 🔰 **Rankı:** Botların rankı olmaz :)\n` +
                                                `> 📈 **Kayıt sayısı:** ${toHumanizeRegisterCount}`,
                                            inline: true
                                        },
                                        {
                                            name: "`Kayıt edilen`",
                                            value: `> 👤 **Adı:** <@${memberId}>\n` +
                                                `> 📝 **Yeni ismi:** \`${recreateName}\`\n` +
                                                `> ${EMOJIS.role} **Verilen rol(ler):** ${botRolesString}`,
                                            inline: true
                                        }
                                    },
                                    footer: "Kayıt sistemi"
                                },
                                logEmbed: {
                                    description({
                                        guildDatabase,
                                        user,
                                        memberId,
                                        authorId,
                                        toHumanizeRegisterCount,
                                        NOW_TIME_IN_SECOND,
                                        recreateName,
                                        botRolesString
                                    }) {
                                        return `**• Sunucuda toplam ${that.toHumanize(guildDatabase.register.lastRegisters.length, "tr")} kişi kayıt edildi!**\n\n` +
                                            `🧰 **KAYIT EDEN YETKİLİ**\n` +
                                            `**• Adı:** <@${authorId}> - ${that.recreateString(user.client.user.displayName)}\n` +
                                            `**• Kayıt sayısı:** ${toHumanizeRegisterCount}\n` +
                                            `**• Nasıl kayıt etti:** Otomatik\n` +
                                            `**• Kayıt zamanı:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                            `👤 **KAYIT EDİLEN ÜYE**\n` +
                                            `**• Adı:** <@${memberId}> - ${that.recreateString(user.displayName)}\n` +
                                            `**• Verilen rol(ler):** ${botRolesString}\n` +
                                            `**• Yeni ismi:** ${recreateName}\n` +
                                            `**• Kayıt şekli:** Bot ${EMOJIS.bot}`
                                    },
                                    footer: "Log sistemi"
                                },
                                noBotRole: `Bu sunucuda herhangi bir bot rolü ayarlanmadığı için botu otomatik olarak kayıt edemedim`
                            }
                        }
                    },
                    security: {
                        unsafe: "Güvensiz",
                        suspicious: "Şüpheli",
                        safe: "Güvenli",
                        openAt(createdTimestamp) {
                            return `kişinin hesabı **${Time.duration(createdTimestamp, "tr", true)}** içinde açıldığı`
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

                en: {
                    permissionsErrors: {
                        manageRoles: `• I do not have **Manage Roles** authority!`,
                        manageNicknames: `• I do not have **Manage Nicknames** authority!`,
                        suspiciousRole(roleId) {
                            return `• The rank of the suspicious role <@&${roleId}> is higher than the rank of my role!`
                        },
                        errorGivingSuspiciousRole(memberId, roleId) {
                            return `• An error occurred when assigning the suspicious role <@&${roleId}> to <@${memberId}>! Please make sure that I am given **Administrator** authority and that you are at the top of my role`
                        },
                        unregisterRole(roleId) {
                            return `• The rank of the unregistered role <@&${roleId}> is higher than the rank of my role!`
                        },
                        errorGivingUnregisterRole(memberId, roleId) {
                            return `• An error occurred when assigning the unregistered role <@&${roleId}> to <@${memberId}>! Please make sure that I am given **Administrator** authority and that you are at the top of my role`
                        },
                        memberAboveFromMe(memberId) {
                            return `• <@${memberId}>'s role rank is higher than my role rank!`
                        },
                        errorGivingRole(memberId) {
                            return `• An error occurred while editing the roles and name of <@${memberId}>! Please make sure that I am given **Administrator** authority and that you are at the top of my role`
                        }
                    },
                    errorEmbed: {
                        errorTitle: "Error",
                        reasons: "REASONS",
                        information: "Information"
                    },
                    buttonLabels: {
                        normal: "Register as a member",
                        boy: "Register as male",
                        girl: "Register as a girl",
                        bot: "Register as bot",
                        again: "Re-register",
                        suspicious: "Kick suspicious"
                    },
                    roleNotSetted: "ROLE IS NOT SET",
                    welcomeEmbed: {
                        member: {
                            again: "Welcome Back",
                            welcome: "Welcome",
                            embed: {
                                description({
                                    guild,
                                    toHumanize,
                                    createdTimestampSecond,
                                    security
                                }) {
                                    return `**${EMOJIS.crazy} Welcome to our server named \`${guild.name}\`!!\n\n` +
                                        `${EMOJIS.woah} With you, we become exactly ${toHumanize} person\n\n` +
                                        `${EMOJIS.drink} Authorities will register you shortly. Please have some patience\n\n` +
                                        `> Your account was created on <t:${createdTimestampSecond}:F>\n` +
                                        `> Account ${security}**`
                                },
                                footer: "How are you"
                            }
                        },
                        bot: {
                            welcome: {
                                welcome: "Welcome Bot",
                                embed: {
                                    description({
                                        guild,
                                        toHumanize,
                                        createdTimestampSecond,
                                    }) {
                                        return `**${EMOJIS.crazy} \`${guild.name}\` Welcome to our server, bot!!\n\n` +
                                            `${EMOJIS.woah} With you, we become exactly ${toHumanize} person\n\n` +
                                            `${EMOJIS.kiss} I hope you can be a good help to the server, I love you\n\n` +
                                            `> Your account was created on <t:${createdTimestampSecond}:F>\n` +
                                            `> Account Bot ${EMOJIS.bot}**`
                                    }
                                }
                            },
                            register: {
                                registerEmbed: {
                                    description: `**• Bot automatically registered ${EMOJIS.yes}**`,
                                    fileds({
                                        authorId,
                                        toHumanizeRegisterCount,
                                        memberId,
                                        recreateName,
                                        botRolesString
                                    }) {
                                        return {
                                            name: "`Registered by`",
                                            value: `> 👤 **Name:** <@${authorId}>\n` +
                                                `> 🔰 **Rank:** Bots do not have a rank :)\n` +
                                                `> 📈 **Number of registrations:** ${toHumanizeRegisterCount}`,
                                            inline: true
                                        },
                                        {
                                            name: "`Registered`",
                                            value: `> 👤 **Name:** <@${memberId}>\n` +
                                                `> 📝 **New name:** \`${recreateName}\`\n` +
                                                `> ${EMOJIS.role} **Given role(s):** ${botRolesString}`,
                                            inline: true
                                        }
                                    },
                                    footer: "Registration system"
                                },
                                logEmbed: {
                                    description({
                                        guildDatabase,
                                        user,
                                        memberId,
                                        authorId,
                                        toHumanizeRegisterCount,
                                        NOW_TIME_IN_SECOND,
                                        recreateName,
                                        botRolesString
                                    }) {
                                        return `**• A total of ${that.toHumanize(guildDatabase.register.lastRegisters.length, "tr")} people have been registered on the server!**\n\n` +
                                            `🧰 **REGISTER AUTHORITY**\n` +
                                            `**• Name:** <@${authorId}> - ${that.recreateString(user.client.user.displayName)}\n` +
                                            `**• Number of registrations:** ${toHumanizeRegisterCount}\n` +
                                            `**• How saved:** Automatic\n` +
                                            `**• Recording time:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                            `👤 **REGISTERED MEMBER**\n` +
                                            `**• Name:** <@${memberId}> - ${that.recreateString(user.displayName)}\n` +
                                            `**• Given role(s):** ${botRolesString}\n` +
                                            `**• New name:** ${recreateName}\n` +
                                            `**• Registration type:** Bot ${EMOJIS.bot}`
                                    },
                                    footer: "Log system"
                                },
                                noBotRole: `I could not automatically register the bot because no bot role was set on this server`
                            }
                        }
                    },
                    security: {
                        unsafe: "Unsafe",
                        suspicious: "Suspicious",
                        safe: "Safe",
                        openAt(createdTimestamp) {
                            return `the person's account was opened in **${Time.duration(createdTimestamp, "en", true)}**`
                        },
                        accountIs(security) {
                            return `because the person is **${security}**`
                        }
                    },
                    suspicious: {
                        kickMember(memberId, message) {
                            return `• Kicked to Suspect for ${message} named <@${memberId}>!`
                        },
                        noRole(memberId) {
                            return `• <@${memberId}>'s account is suspicious, but since no __suspicious role__ is set on this server, I couldn't assign him as suspect!`
                        }
                    }
                }
            },

            guildCreate: { // Birisi Alisa'yı sunucuya eklediğinde çağırılacak veri

                tr: {
                    description({
                        guild,
                        prefix
                    }) {
                        return `• Beni **${guild.name}** adlı sunucunuza eklediğiniz için teşekkürleeerr <3 sizi asla yüz üstü bırakmayacağım bundan emin olabilirsiniz\n\n` +
                            `*• By the way, if you want to use the bot in **English**, you can write **${prefix}lang en**!*\n\n` +
                            `• Şimdi kısaca kendimden bahsetmek gerekirse ben her public sunucuda olması gereken botlardan sadece birisiyim. İçimde birçok özelliğim ve sistemim bulunuyor\n\n` +
                            `**__İşte birkaç özelliğim__**\n` +
                            ` ├> Butonlu kayıt sistemi\n` +
                            ` ├> Gelişmiş özelleştirilmiş giriş mesajı\n` +
                            ` ├> Kayıt edilirken düzenlenecek ismi dilediğiniz gibi özelleştirebilme\n` +
                            ` ├> Gelişmiş son kayıt ve Jail sistemi\n` +
                            ` ├> Botun istediğiniz ses kanalına girmesini sağlayıp üyeleri karşılama\n` +
                            ` └> İstediğiniz zaman tüm her şeyi sıfırlama ve çok daha fazlası!\n\n` +
                            `• Benimle ilgili gelişmeleri takip etmek için **${prefix}yenilik** yazman yeterli\n\n` +
                            `• Artık yeni gelen premium sistemi sayesinde premiumlara özel bir sürü yeni komutlar eklendi! Premium hakkında daha fazla bilgi almak isterseniz **${prefix}pre** yazabilirsiniz\n\n` +
                            `*• Diğer botlardan 5 kat daha hızlı!*\n\n` +
                            `• Eğer herhangi bir sorun olduğunda **${prefix}destek** yazarak veya [Destek Sunucuma](${discordInviteLink}) gelerek yardım alabilirsiniz!\n\n` +
                            `**SENİN BOTUN SENİN KURALLARIN**`
                    },
                    footer: "Pişt pişt seni seviyorum <3"
                },

                en: {
                    description({
                        guild,
                        prefix
                    }) {
                        return `• Thank you for adding me to your server **${guild.name}** <3 you can be sure that I will never let you down\n\n` +
                            `*• Bu arada botu **Türkçe** dilinde kullanmak istiyorsanız **${prefix}lang tr** yazabilirsiniz!*\n\n` +
                            `• Now, to briefly talk about myself, I am just one of the bots that should be on every public server. I have many features and systems inside\n\n` +
                            `**__Here are a few of my features__**\n` +
                            ` ├> Button registration system\n` +
                            ` ├> Advanced customized login message\n` +
                            ` ├> Ability to customize the name to be edited when registering as you wish\n` +
                            ` ├> Advanced last save and Jail system\n` +
                            ` ├> Make the bot enter the voice channel you want and welcome the members\n` +
                            ` └> Reset everything anytime and much more!\n\n` +
                            `• To follow the developments about me, just write **${prefix}innovation**\n\n` +
                            `• Thanks to the new premium system, many new commands specific to premiums have been added! If you want to get more information about Premium, you can write **${prefix}pre**\n\n` +
                            `*• 5x faster than other bots!*\n\n` +
                            `• If you have any problems, you can get help by typing **${prefix}support** or coming to my [Support Server](${discordInviteLink})!\n\n` +
                            `**YOUR BOT, YOUR RULES**`
                    },
                    footer: "Pst pst I love you <3"
                }

            }
        }
    }


    /**
     * Mesaj beklemeli mesajlarda gözükecek bütün mesajlar
     */
    get waitMessages() {
        return {

            tr: {
                register: `Bot yeniden başlatıldığı için daha önceden kullandığınız **Kullanıcıyı kayıt etme** komutu tekrardan başlatılmıştır\n\n` +
                    `• Lütfen **sadece** kullanıcının ismini giriniz`,
                chaneName: `Bot yeniden başlatıldığı için daha önceden kullandığınız **Kullanıcının ismini değiştirme** komutu tekrardan başlatılmıştır\n\n` +
                    `• Lütfen **sadece** kullanıcının ismini giriniz`,
                deleteAll: `Bot yeniden başlatıldığı için daha önceden kullandığınız **Bütün verileri silme** komutu tekrardan başlatılmıştır\n\n` +
                    `• Eğer bütün verilerinizi silmek istiyorsanız **evet** istemiyorsanız **hayır** yazınız`,
                deleteRegister: `Bot yeniden başlatıldığı için daha önceden kullandığınız **Kayıt verilerini silme** komutu tekrardan başlatılmıştır\n\n` +
                    `• Eğer kayıt verilerinizi silmek istiyorsanız **evet** istemiyorsanız **hayır** yazınız`
            },

            en: {
                register: `Since the bot has been restarted, the **Register user** command you used before has been started again\n\n` +
                    `• Please **only** enter the user's name`,
                chaneName: `Since the bot has been restarted, the **Change the user's name** command you used before has been started again\n\n` +
                    `• Please **only** enter the user's name`,
                deleteAll: `Since the bot has been restarted, the **Delete all data** command you used before has been started again\n\n` +
                    `• If you want to delete all your data, write **yes**, if not, write **no**`,
                deleteRegister: `Since the bot has been restarted, the **Delete registration data** command you used before has been started again\n\n` +
                    `• If you want to delete your registration data, write **yes**, if not, write **no**`
            }
        }
    }

    /**
     * Bütün RegExp ifadelerini gösterir
     */
    get regex() {
        return {
            fetchAge: /(?<=(\s|(?<!.)))[1-9](\d)?(?!\S)/,
            fetchURL: /(https?:\/\/(www\.)?|www\.)[\w-_]+\.[\w-_]+(\/[\w-_@.]+)*(\?[\w-_=&@.]+)?\/?/i
        }
    }


    /**
     * Bütün maximum değerleri döndürür (mesela en fazla kaç rol etiketleyebilirsin, mesaj en fazla kaç karakterli olacak vs.)
     */
    get MAX() {
        return {
            usernameLength: 32,
            mentionRoleForRegister: 10,
            mentionRoleForAuthorized: 250,
            showRoleInInfo: 30,
            customMessageLength: {
                embed: 4000,
                message: 1750
            },
            symbolLength: 5,
            tagLength: 10,
            errorForSetup: 10,
            messageDeleteCount: 1000,
            discordDeleteCount: 100,
            contentForSnipe: 1000,
            membersForSid: 40,
        }
    }


    /**
     * Yardım komutunda gösterilecek emojileri ve açıklamalar
     */
    get helpCommandHelper() {
        return {
            tr: { // Türkçe komut isimleri
                "Tüm komutlar": {
                    emoji: EMOJIS.allCommands,
                    description: "Tüm komutları gösterir"
                },
                "Bot komutları": {
                    emoji: EMOJIS.botCommands,
                    description: "Bot komutlarını gösterir"
                },
                "Moderasyon komutları": {
                    emoji: EMOJIS.moderationCommands,
                    description: "Moderasyon komutlarını gösterir"
                },
                "Ekstra komutlar": {
                    emoji: EMOJIS.extraCommands,
                    description: "Ekstra komutlarını gösterir"
                },
                "Jail komutları": {
                    emoji: EMOJIS.jailCommands,
                    description: "Jail komutlarını gösterir"
                },
                "Kayıt komutları": {
                    emoji: EMOJIS.registerCommands,
                    description: "Kayıt komutlarını gösterir"
                },
                "Bilgi komutları": {
                    emoji: EMOJIS.informationCommands,
                    description: "Bilgi komutlarını gösterir"
                },
                "Premium komutları": {
                    emoji: EMOJIS.premiumCommands,
                    description: "Premium komutlarını gösterir"
                },
                "Sahip komutları": {
                    emoji: "👑",
                    description: "Sahip komutlarını gösterir"
                }
            },
            en: { // İngilizce komut isimleri
                "All commands": {
                    emoji: EMOJIS.allCommands,
                    description: "Shows all commands"
                },
                "Bot commands": {
                    emoji: EMOJIS.botCommands,
                    description: "Shows bot commands"
                },
                "Moderation commands": {
                    emoji: EMOJIS.moderationCommands,
                    description: "Shows moderation commands"
                },
                "Extra commands": {
                    emoji: EMOJIS.extraCommands,
                    description: "Shows extra commands"
                },
                "Jail commands": {
                    emoji: EMOJIS.jailCommands,
                    description: "Shows jail commands"
                },
                "Register commands": {
                    emoji: EMOJIS.registerCommands,
                    description: "Shows recording commands"
                },
                "Information commands": {
                    emoji: EMOJIS.informationCommands,
                    description: "Shows information commands"
                },
                "Premium commands": {
                    emoji: EMOJIS.premiumCommands,
                    description: "Shows premium commands"
                },
                "Owner commands": {
                    emoji: "👑",
                    description: "Shows owner commands"
                }
            }
        };
    }


    /**
     * Girilen string değerindeki bütün türkçe karakterlerini kaldırır
     * @param {String} string 
     * @returns {String}
     */
    removeTurkishChars(string) {
        const turkishToEnglishObject = {
            ç: "c",
            ş: "s",
            ü: "u",
            ı: "i",
            ö: "o",
            ğ: "g"
        }
        return string.replace(/[çşüöğı]/g, (match) => turkishToEnglishObject[match]);
    }


    /**
     * Girilen sayı değerini ingilizce olarak sıraya dönüştürür (1st, 2nd gibi)
     * @param {Number} number 
     * @returns {String}
     */
    numberToRank(number) {
        const ranks = ["", "1st", "2nd", "3rd"];
        return ranks[number] ?? `${number}th`
    }


    /**
     * ID'si girilen sunucunun sunucu verisini döndürür
     * @param {Client} client 
     * @param {String} guildId 
     * @returns {import("../typedef").guildDatabaseObject}
     */
    getGuildData(client, guildId) {
        // Eğer önbellekte varsa önbellektekini döndür
        const cacheData = client.guildDatabase[guildId];
        if (cacheData) return cacheData;

        // Eğer önbellekte yoksa önbelleğe kaydet ve döndür
        const fileData = database.getFile(guildId);
        client.guildDatabase[guildId] = fileData;
        return fileData;
    }


    /**
     * Sunucudaki silinen rol ve kanalları kontrol eder eğer silinen kanal varsa döndürür
     * @param {Guild} guild 
     * @param {import("../typedef").guildDatabaseObject} guildDatabase 
     * @returns {Array<String>}
     */
    checkGuildData(guild, guildDatabase) {
        try {
            // Sunucunun verilerini kontrol et ve eğer bazı roller veya kanallar silinmişse databaseden verileri sil ve sunucu sahibine bilgilendirme mesajı gönder
            const {
                register: {
                    roleIds: {
                        boy: boyRoleIds,
                        girl: girlRoleIds,
                        normal: normalRoleIds,
                        bot: botRoleIds,
                        registerAuth: registerAuthRoleId,
                        unregister: unregisterRoleId,
                    },
                    channelIds: {
                        register: registerChannelId,
                        afterRegister: afterRegisterChannelId,
                        log: logChannelId,
                    }
                },
                moderation: {
                    roleIds: {
                        banAuth: banAuthRoleId,
                        kickAuth: kickAuthRoleId,
                        muteAuth: muteAuthRoleId,
                    },
                    channelIds: {
                        modLog: modLogChannelId,
                    }
                },
                jail: {
                    roleId: jailRoleId,
                    authRoleId: jailAuthRoleId,
                    log: jailLogChannelId,
                },
                roleIds: {
                    vip: vipRoleId,
                    vipAuth: vipAuthRoleId
                },
                channelIds: {
                    voice: voiceChannelId,
                },
                suspicious: {
                    role: suspiciousRoleId
                },
                premium: {
                    authorizedRoleIds,
                    partnerRoleId
                },
                language
            } = guildDatabase;

            // Dizide gösterilecek mesajların hangi dilde olduğunu çek
            const allMessages = this.rolesAndChannelMessages[language];

            // Silinen verileri bir diziye aktar
            const deletedRoleAndChannels = [];

            // Sunucunun ses kanalı silinmiş mi kontrol et
            if (voiceChannelId && !guild.channels.cache.has(voiceChannelId)) {
                guildDatabase.channelIds.voice = "";
                deletedRoleAndChannels.push(allMessages.voice);
            }

            // Kayıtsız rolü silinmiş mi kontrol et
            if (unregisterRoleId && !guild.roles.cache.has(unregisterRoleId)) {
                guildDatabase.register.roleIds.unregister = "";
                deletedRoleAndChannels.push(allMessages.unregister);
            }

            // Yetkili rolü silinmiş mi kontrol et
            if (registerAuthRoleId && !guild.roles.cache.has(registerAuthRoleId)) {
                guildDatabase.register.roleIds.registerAuth = "";
                deletedRoleAndChannels.push(allMessages.registerAuth);
            }

            // Erkek rolleri silinmiş mi kontrol et
            const newBoyRoles = boyRoleIds.filter(rolId => guild.roles.cache.has(rolId));
            if (boyRoleIds.length != newBoyRoles.length) {
                guildDatabase.register.roleIds.boy = newBoyRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newBoyRoles.length == 0 ?
                        allMessages.boy.all :
                        // Eğer bazıları silinmişse
                        allMessages.boy.some
                );
            }


            // Kız rolleri silinmiş mi kontrol et
            const newGirlRoles = girlRoleIds.filter(rolId => guild.roles.cache.has(rolId));
            if (girlRoleIds.length != newGirlRoles.length) {
                guildDatabase.register.roleIds.girl = newGirlRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newGirlRoles.length == 0 ?
                        allMessages.girl.all :
                        // Eğer bazıları silinmişse
                        allMessages.girl.some
                );
            }

            // Üye rolleri silinmiş mi kontrol et
            const newNormalRoles = normalRoleIds.filter(rolId => guild.roles.cache.has(rolId));
            if (normalRoleIds.length != newNormalRoles.length) {
                guildDatabase.register.roleIds.normal = newNormalRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newNormalRoles.length == 0 ?
                        allMessages.normal.all :
                        // Eğer bazıları silinmişse
                        allMessages.normal.some
                );
            }

            // Bot rolleri silinmiş mi kontrol et
            const newBotRoles = botRoleIds.filter(rolId => guild.roles.cache.has(rolId));
            if (botRoleIds.length != newBotRoles.length) {
                guildDatabase.register.roleIds.bot = newBotRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newBotRoles.length == 0 ?
                        allMessages.bot.all :
                        // Eğer bazıları silinmişse
                        allMessages.bot.some
                );
            }

            // Şüpheli rolü silinmiş mi kontrol et
            if (suspiciousRoleId && !guild.roles.cache.has(suspiciousRoleId)) {
                guildDatabase.suspicious.roleId = "";
                deletedRoleAndChannels.push(allMessages.suspicious);
            }


            // Kayıt kanalı silinmiş mi kontrol et
            if (registerChannelId && !guild.channels.cache.has(registerChannelId)) {
                guildDatabase.register.channelIds.register = "";
                deletedRoleAndChannels.push(allMessages.registerChannel);
            }

            // Kayıt sonrası kanal silinmiş mi kontrol et
            if (afterRegisterChannelId && !guild.channels.cache.has(afterRegisterChannelId)) {
                guildDatabase.register.channelIds.afterRegister = "";
                deletedRoleAndChannels.push(allMessages.afterRegisterChannel);
            }

            // Kayıt log kanalı silinmiş mi kontrol et
            if (logChannelId && !guild.channels.cache.has(logChannelId)) {
                guildDatabase.register.channelIds.log = "";
                deletedRoleAndChannels.push(allMessages.registerLogChannel);
            }

            // Moderasyon log kanalı silinmiş mi kontrol et
            if (modLogChannelId && !guild.channels.cache.has(modLogChannelId)) {
                guildDatabase.moderation.channelIds.modLog = "";
                deletedRoleAndChannels.push(allMessages.moderationLogChannel);
            }

            // Jail rolü silinmiş mi kontrol et
            if (jailRoleId && !guild.roles.cache.has(jailRoleId)) {
                guildDatabase.jail.roleId = "";
                deletedRoleAndChannels.push(allMessages.jailRole);
            }

            // Jail yetkili rolü silinmiş mi kontrol et
            if (jailAuthRoleId && !guild.roles.cache.has(jailAuthRoleId)) {
                guildDatabase.jail.authRoleId = "";
                deletedRoleAndChannels.push(allMessages.jailAuthRole);
            }

            // Jail log kanalı silinmiş mi kontrol et
            if (jailLogChannelId && !guild.channels.cache.has(jailLogChannelId)) {
                guildDatabase.jail.logChannelId = "";
                deletedRoleAndChannels.push(allMessages.jailLogChannel);
            }

            // Vip rolü silinmiş mi kontrol et
            if (vipRoleId && !guild.roles.cache.has(vipRoleId)) {
                guildDatabase.roleIds.vip = "";
                deletedRoleAndChannels.push(allMessages.vipRole);
            }

            // Vip yetkili rolü silinmiş mi kontrol et
            if (vipAuthRoleId && !guild.roles.cache.has(vipAuthRoleId)) {
                guildDatabase.roleIds.vipAuth = "";
                deletedRoleAndChannels.push(allMessages.vipAuthRole);
            }


            // Ban yetkili rolü silinmiş mi kontrol et
            if (banAuthRoleId && !guild.roles.cache.has(banAuthRoleId)) {
                guildDatabase.moderation.roleIds.banAuth = "";
                deletedRoleAndChannels.push(allMessages.banAuthRole);
            }

            // Kick yetkili rolü silinmiş mi kontrol et
            if (kickAuthRoleId && !guild.roles.cache.has(kickAuthRoleId)) {
                guildDatabase.moderation.roleIds.kickAuth = "";
                deletedRoleAndChannels.push(allMessages.kickAuthRole);
            }

            // Mute yetkili rolü silinmiş mi kontrol et
            if (muteAuthRoleId && !guild.roles.cache.has(muteAuthRoleId)) {
                guildDatabase.moderation.roleIds.muteAuth = "";
                deletedRoleAndChannels.push(allMessages.muteAuthRole);
            }

            // Yetkili rolleri silinmiş mi kontrol et
            const newAuthRoles = authorizedRoleIds.filter(rolId => guild.roles.cache.has(rolId));
            if (authorizedRoleIds.length != newAuthRoles.length) {
                guildDatabase.premium.authorizedRoleIds = newAuthRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newAuthRoles.length == 0 ?
                        allMessages.auth.all :
                        // Eğer bazıları silinmişse
                        allMessages.auth.some
                );
            }

            // Partner yetkili rolü silinmiş mi kontrol et
            if (partnerRoleId && !guild.roles.cache.has(partnerRoleId)) {
                guildDatabase.premium.partnerRoleId = "";
                deletedRoleAndChannels.push(allMessages.partner);
            }

            // Silinen kontrol et
            return deletedRoleAndChannels
        }
        // Eğer bir hata oluşursa hatayı göster
        catch (error) {
            console.log(guildDatabase);
            console.log(error);
        }
    }


    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya aitse bu fonksiyonu kullan
     * @param {Client} client
     * @param {String} userId 
     * @returns {Promise<User>}
     */
    async fetchUserForce(client, userId) {
        // Bütün shardlarda kullanıcıyı kontrol et
        try {
            const findUserWithShard = await client.shard.broadcastEval(
                (clientParam, userIdParam) => clientParam.users.cache.get(userIdParam),
                {
                    context: userId
                }
            );
            const user = findUserWithShard.find((a) => a);

            // Eğer kullanıcı diğer shardlarda bulunduysa kullanıcı döndür
            if (user) return new User(client, user);
        } catch (e) { }

        // Eğer kullanıcı bulunamadıysa fetch metodunu kullanarak kullanıyı döndür
        return await client.users.fetch(userId).catch(() => { });
    }


    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya ait değilse bu fonksiyonu kullan
     * @param {Client} client
     * @param {String} content 
     * @returns {Promise<User>}
     */
    async fetchUser(client, content) {
        // Eğer girilen değer bir string değilse undefined döndür
        if (typeof content != "string") return undefined;

        const userId = content.match(/\d{17,20}/);

        // Eğer ID bulunamadıysa undefined döndür
        if (!userId) return undefined;

        return await this.fetchUserForce(client, userId[0]) || null;
    }


    /**
     * Girilen sunucudaki bütün üyeleri döndürür
     * @param {GuildObject} param0 
     * @returns {Promise<Collection<String, GuildMember>>}
     */
    async getMembers({ guild }) {
        const cache = guild.members.cache;
        return guild.memberCount == cache.size ?
            cache :
            await guild.members.fetch().catch(() => { });
    }

    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya aitse bu fonksiyonu kullan
     * @param {Message} message 
     * @param {String} userId 
     * @returns {Promise<GuildMember>}
     */
    async fetchMemberForce(message, userId) {
        const allMembers = await this.getMembers(message);
        return allMembers.get(userId);
    }


    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya ait değilse bu fonksiyonu kullan
     * @param {Message} message 
     * @param {String} content 
     * @returns {Promise<GuildMember>}
     */
    async fetchMember(message, content) {
        // Eğer girilen değer bir string değilse undefined döndür
        if (typeof content != "string") return undefined;

        const memberId = content.match(/\d{17,20}/);

        // Eğer ID bulunamadıysa undefined döndür
        if (!memberId) return undefined;

        return await this.fetchMemberForce(message, memberId[0]) || null;
    };


    /**
     * Sunucunun shardını döndürür
     * @param {String} guildId 
     * @returns {Number}
     */
    shardId(guildId) {
        return Number(BigInt(guildId) >> 22n) % shardCount;
    }


    /**
     * Mesajda yazılan ilk rolü çeker
     * @param {Message} message 
     * @returns {Role}
     */
    fetchRole(message) {
        // Eğer rolü etiketlemişse rolü döndür
        const role = message.mentions.roles.first();
        if (role) return role;

        const matchId = message.content.match(/\d{17,20}/);
        return matchId ?
            message.guild.roles.cache.get(matchId[0]) :
            undefined;
    };


    /**
     * Mesajda yazılan bütün rolleri çeker
     * @param {Message} message 
     * @returns {Collection<String, Role>}
     */
    fetchRoles(message) {
        const rolesMap = new Collection();

        // Mesajdaki rol ID'lerini çek
        const roleIds = message.content.match(/\d{17,20}/g);

        // Eğer hiç rol ID'si girilmemişse
        if (!roleIds) return rolesMap;

        for (let i = 0; i < roleIds.length; i++) {
            const rolId = roleIds[i];
            const role = message.guild.roles.cache.get(rolId);

            // Eğer rol yoksa döngüyü geç
            if (!role) continue;

            rolesMap.set(rolId, role);
        }
        return rolesMap;
    };

    /**
     * Mesajda yazılan ilk kanalı çeker
     * @param {Message} message 
     * @returns {GuildChannel}
     */
    fetchChannel(message) {
        // Eğer kanalı etiketlemişse rolü döndür
        const channel = message.mentions.channels.first();
        if (channel) return channel;

        const matchId = message.content.match(/\d{17,20}/);
        return matchId ?
            message.guild.channels.cache.get(matchId[0]) :
            undefined;
    };


    /**
     * Bot rolünü veya en yüksek rolü döndürür
     * @param {GuildMember} member 
     * @returns {Role}
     */
    getBotOrHighestRole(member) {
        const highestObject = {
            role: null,
            position: -1
        };
        const roles = [...member["_roles"], member.guild.id];

        // Bütün rollerde gez ve en yüksek rolü bul
        for (let i = 0; i < roles.length; i++) {
            const role = member.guild.roles.cache.get(roles[i]);

            // Eğer rol bot rolüyse direkt döndür
            if (role.managed) return role;

            if (role.position > highestObject.position) {
                highestObject.role = role;
                highestObject.position = role.position;
            }
        };

        return highestObject.role;
    }


    /**
     * Girilen ID'deki sunucunun ismini döndürür
     * @param {Client} client 
     * @param {String} guildId 
     * @param {"tr"|"en"} language
     * @param {Boolean} convertDiscordFormat - Eğer değer true ise Discord formatına dönüştürür (**{guildId}** ID'ye sahip)
     * @returns {Promise<String|undefined>}
     */
    async getGuildNameOrId(client, guildId, language, convertDiscordFormat = true) {
        const allLanguages = {
            tr(guildId) {
                return `**${guildId}** ID'ye sahip`;
            },
            en(guildId) {
                return `Server with ID **${guildId}**`;
            },
        }
        try {
            const guild = await client.shard.broadcastEval(
                (clientParam, guildIdParam) => clientParam.guilds.cache.get(guildIdParam),
                {
                    context: guildId,
                    shard: this.shardId(guildId)
                }
            );
            if (guild) return convertDiscordFormat ? `**${guild.name}**` : guild.name;
        } catch (e) { }
        return convertDiscordFormat ? allLanguages[language](guildId) : undefined;
    };


    /**
     * Eğer botun kodlarında bir hata varsa belirtilen kanala mesaj atar
     * @param {Error} error 
     * @param {String} dirname 
     * @returns {Promise<Boolean>}
     */
    async error(error, dirname) {
        console.log(error);
        this.webhooks.error.send(
            `**${dirname.replace(/^.+Alisa\\/, "")}** adlı komut dosyamda bir hata oluştu!\n` +
            `\`\`\`js\n` +
            `${error}\`\`\``
        );
    };


    /**
     * Girilen ID'deki sunucuyu döndürür. **Fakat döndürülen veriyi JSON olarak döndürür, yani hiçbir kanala mesaj atamaz ve üyeleri görüntüleyemezsiniz!**
     * @param {Client} client 
     * @param {String} guildId 
     * @returns {Promise<Object>}
     */
    async getGuild(client, guildId) {
        try {
            return await client.shard.broadcastEval(
                (clientParam, guildIdParam) => clientParam.guilds.cache.get(guildIdParam),
                {
                    context: guildId,
                    shard: this.shardId(guildId)
                }
            );
        } catch (e) {
            return undefined;
        }
    };



    /**
     * Bu fonksiyon sınırsız bir şekilde setTimeout fonksiyonunu çalıştırır
     * @param {() => any} functionParam 
     * @param {Number} milisecond 
     * @returns {() => void}
     */
    setTimeout(functionParam, milisecond) {
        // Yeni bir fonksiyon daha oluşturuyoruz
        function mySetTimeout(functionParam, milisecond, callback) {
            // Eğer girilen değer bir maximum değerden fazlaysa bu fonksiyonu tekrar çağır
            let timeout = milisecond >= MAX_NUMBER_IN_TIMEOUT ?
                setTimeout(() => {
                    callback(timeout);
                    return mySetTimeout(functionParam, milisecond - MAX_NUMBER_IN_TIMEOUT, callback);
                }, MAX_NUMBER_IN_TIMEOUT) :
                setTimeout(functionParam, milisecond);

            callback(timeout);
        }
        // Bir değişken oluşturuyoruz ve bu değişkeni sürekli değiştirerek şu anda çalışan setTimeout fonksiyonunun verisini tutuyoruz
        let timeout;
        mySetTimeout(
            functionParam,
            milisecond,
            (newTimeout) => timeout = newTimeout
        );

        // En sonunda ise bu timeout işlemini bitirmek için yeni bir fonksiyon daha oluşturuyoruz
        return function () {
            return clearTimeout(timeout);
        };
    };


    /**
     * Mesajı belirli bir süre sonra siler
     * @param {Message} message 
     * @param {Number} time 
     */
    async waitAndDeleteMessage(message, time) {
        await this.wait(time);
        message.delete();
    }


    /**
     * ID'leri girilen sunucuların ID'lerini döndürür
     * @param {Client} client 
     * @param {Array<String>} guildIds
     * @returns {Promise<Object>}
     */
    async getGuildNames(client, guildIds) {
        // Sunucuların shard ID'lerini kaydet ve shardlarda sunucuyu bul
        const allShards = {};
        for (let i = 0; i < guildIds.length; ++i) {
            const guildId = guildIds[i];

            const shardId = this.shardId(guildId);
            allShards[shardId] ??= [];
            allShards[shardId].push(guildId);
        }

        // Bütün shardlarda dön ve sunucuların isimlerini döndür
        const allGuildNamesArray = await Promise.all(
            Object.entries(allShards).map(async ([shardId, guildIds]) =>
                await client.shard.broadcastEval(
                    (clientParam, guildIds) => {
                        // Bütün sunucuların ismini döndür
                        return guildIds.reduce(
                            (object, guildId) => ({ ...object, [guildId]: clientParam.guilds.cache.get(guildId)?.name }),
                            {}
                        )
                    },
                    {
                        context: guildIds,
                        shard: Number(shardId)
                    }
                )
            )
        );

        return allGuildNamesArray.reduce(
            (object, currObject) => ({ ...object, ...currObject }),
            {}
        );
    }


    /**
     * Şu anki kayıt sayısına göre bir rank döndürür. Eğer rank döndürürse kullanıcının rank atladığını gösterir
     * @param {Number} registerCount 
     * @param {"tr"|"en"} language
     * @returns {String|undefined}
     */
    checkUserRank(registerCount, language) {
        return languageObject[language].get(registerCount);
    }


    /**
     * Kullanıcının şu anki rankını gösterir
     * @param {Number} registerCount 
     * @returns {String}
     */
    getUserRank(registerCount, language) {
        const index = bsFindIndex(rankNumbers, registerCount);
        return EMOJIS.allRanks[language][index - 1];
    }


    /**
     * Discordda bazı karakterler özel karakter olduğu için onların başına "\" getirerek etkisiz hale getiriyoruz
     * @param {String} string 
     * @returns {String}
     */
    recreateString(string) {
        return string.replace(/([_~|*`>])/g, "\\$1")
    }

    /**
     * Kayıt yapılırken kullanıcının isminin baş harflerini büyük yapma fonksiyonu
     * @param {String} str 
     * @param {import("../typedef").guildDatabaseObject} guildDatabase 
     * @param {"tr"|"en"} language
     * @returns {String}
     */
    registerCase(str, guildDatabase, defaultObject = {}) {
        // Eğer otodüzeltme kapalıysa
        if (!guildDatabase.register.isAutoCorrectOn) {
            const symbol = guildDatabase.register.symbol || defaultObject.symbol;
            return symbol ? str.replace(/ /g, ` ${symbol} `) : str;
        }

        // Bütün kelimeleri bul ve hepsinin ilk harfini otomatik olarak büyük yap
        str = str.replace(/[a-zA-ZöçşıüğÖÇŞİÜĞ]+/g, word => word[0].toLocaleUpperCase(guildDatabase.language) + word.slice(1).toLocaleLowerCase(guildDatabase.language));

        const symbol = guildDatabase.register.symbol || defaultObject.symbol;
        return symbol ? str.replace(/ /g, ` ${symbol} `) : str;
    }


    /**
     * Sayıları insanların okuyabileceği bir şekilde geri döndürür
     * @param {Number} number 
     * @param {"en"|"tr"} language
     * @returns {String}
     */
    toHumanize(number, language = "tr") {
        try {
            return number?.toLocaleString(language) || number
        } catch (_) {
            return number;
        }
    }


    /**
     * Girilen sayı değerini emojili bir halde geri döndürür
     * @param {Number} number 
     * @returns {String}
     */
    stringToEmojis(number) {
        let resultStr = "";
        const numberToString = String(number);
        for (let i = 0; i < numberToString.length; i++) {
            const char = numberToString[i];
            resultStr += EMOJIS.numbers[char];
        }
        return resultStr;
    }


    /**
     * Girilen dizideki verileri en fazla girilen değerdeki karakter uzunluğuna göre birleştirerek geri döndürür
     * @param {{arrayString: Array<String>, firstString: String, joinString: String, limit: Number}} param0 
     * @returns {Array<String>}
     */
    splitMessage({
        arrayString,
        firstString = "",
        joinString = " ",
        limit = 1024
    }) {
        let resultArray = [];

        let isFirst = true;

        // Eğer eklenecek veri ilk veriyse firstString ifadesini başına ekle
        function addFirstString(str) {
            if (!isFirst) return str;

            isFirst = false;
            return `${firstString}${str}`;
        }

        // Stringe yazı ekleme
        function addString(str, add) {
            return addFirstString(str.length > 0 ? `${str}${joinString}${add}` : add);
        }

        let resultStr = "";
        for (let i = 0; i < arrayString.length; ++i) {
            const newString = addString(resultStr, arrayString[i]);

            // Eğer yeni dizinin uzunluğu limiti geçiyorsa
            if (newString.length > limit) {
                // Eğer verinin uzunluğu 0'dan fazlaysa döndürlecek diziye ekle
                if (resultStr.length > 0) {
                    resultArray.push(resultStr);
                }
                resultStr = arrayString[i].length > limit ? "" : arrayString[i];
            }
            // Eğer geçmiyorsa şu anki string verisiyle değiştir
            else {
                resultStr = newString;
            }
        }

        // Eğer döngü bitmesine rağmen hala veri varsa diziye ekle
        if (resultStr.length > 0 && limit >= resultStr.length) {
            resultArray.push(resultStr);
        }

        return resultArray;
    }


    /**
     * Belirtilen süre boyunca kodu durdurur
     * @param {Number} milisecond 
     * @returns {Promise<Boolean>}
     */
    async wait(milisecond) {
        return new Promise((resolve) =>
            this.setTimeout(() => {
                return resolve(true);
            }, milisecond)
        );
    }

}


module.exports = new Util();