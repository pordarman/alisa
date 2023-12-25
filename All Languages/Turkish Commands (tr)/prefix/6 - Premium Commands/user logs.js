"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kişilog", // Komutun ismi
    id: "kişilog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kişilog",
        "klog",
        "userlog",
        "userlogs",
        "memberlog",
        "memberlogs"
    ],
    description: "Kullanıcının bütün loglarını gösterir", // Komutun açıklaması
    category: "Premium komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kişilog <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
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

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]);

        // Eğer bir kişiyi etiketlememişse veya ID'sini girmemişse hata döndür
        if (!user) return errorEmbed(
            user === null ?
                "Görünen o ki başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const userLogs = guildDatabase.userLogs[user.id];

        // Eğer kullanıcı daha önceden hiç kayıt edilmemişse hata döndür
        if (!userLogs) return errorEmbed("Etiketlediğiniz kişi daha önceden hiç kayıt edilmediği için tablo gösterilemiyor");

        // Girilen type değerini bir yazıya dönüştürür
        function typeToText(input) {
            switch (input.type) {
                // Eğer kayıtsıza atılmışsa
                case "unregister":
                    return `⚒️ <@${input.authorId}> tarafından __kayıtsıza__ atıldı`;

                // Eğer ismi değiştirilmişse
                case "changeName":
                    return `📝 <@${input.authorId}> tarafından ismi **${input.newName}** olarak değiştirildi`;

                // Eğer cinsiyeti değiştirilmişse
                case "changeRoles":
                    return `⚒️ <@${input.authorId}> tarafından cinsiyeti **${input.to == "boy" ? `Erkeğe ${EMOJIS.boy}` : `Kıza ${EMOJIS.girl}`}** çevrildi`;

                // Eğer Jail'e atılmışsa
                case "jail":
                    return `${EMOJIS.jail} <@${input.authorId}> tarafından __jaile__ atıldı`;

                // Eğer Jail'den çıkarılmışsa
                case "unjail":
                    return `${EMOJIS.party} <@${input.authorId}> tarafından Jail'den çıkarıldı`;

                // Eğer tempjail'e atılmışsa
                case "tempjail":
                    return `⏰ <@${input.authorId}> tarafından ${input.isJailed ? `**${Time.duration(input.duration, language)}** süreyle Jail'e atıldı` : "Jail'den çıkarıldı"}`;

                // Eğer mute atılmışsa
                case "mute":
                    return `🔇 <@${input.authorId}> tarafından **${Time.duration(input.duration, language)}** süreyle susturuldu`;

                // Eğer mutesi açılmışsa
                case "unmute":
                    return `🔊 <@${input.authorId}> tarafından susturulması açıldı`;

                // Eğer sunucuya giriş yapmışsa
                case "joinGuild":
                    return `📥 Sunucuya giriş yaptı`;

                // Eğer sunucudan ayrılmışsa
                case "leaveGuild":
                    return `📤 Sunucudan çıkış yaptı`;

                // Eğer şüpheliye atılmışsa
                case "suspicious":
                    return `⛔ <@${input.authorId}> tarafından __şüpheliye__ atıldı`;

                // Eğer sunucudan banlanmışsa
                case "ban":
                    return `${EMOJIS.ban} <@${input.authorId}> tarafından __**${input.reason || "Sebep belirtilmemiş"}**__ sebebinden banlandı`;

                // Eğer sunucudaki yasaklanması kaldırılmışsa
                case "unban":
                    return `${EMOJIS.eat} <@${input.authorId}> tarafından yasaklanması kaldırıldı`;

                // Eğer sunucudan atılmışsa
                case "kick":
                    return `${EMOJIS.f} <@${input.authorId}> tarafından __**${input.reason || "Sebep belirtilmemiş"}**__ sebebinden kicklandı`;

                // Eğer kayıt yapılmışsa
                case "register":
                    switch (input.gender) {
                        // Eğer erkek olarak kayıt edilmişse
                        case "boy":
                            return `${EMOJIS.boy} <@${input.authorId}> tarafından **Erkek** olarak kayıt edildi`;

                        // Eğer kız olarak kayıt edilmişse
                        case "girl":
                            return `${EMOJIS.girl} <@${input.authorId}> tarafından **Kız** olarak kayıt edildi`;

                        // Eğer üye olarak kayıt edilmişse
                        case "normal":
                            return `${EMOJIS.normal} <@${input.authorId}> tarafından **Üye** olarak kayıt edildi`;

                        // Eğer bot olarak kayıt edilmişse
                        case "bot":
                            return `${EMOJIS.bot} <@${input.authorId}> tarafından **Bot** olarak kayıt edildi`;
                    }
            }
        }

        const LOGS_PER_PAGE = 10,
            length = userLogs.length,
            MAX_PAGE_NUMBER = Math.ceil(length / LOGS_PER_PAGE),
            LENGTH_TO_HUMANIZE = Util.toHumanize(length, language);

        const userAvatar = user.displayAvatarURL();

        // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
        const pages = new Map();

        // Sayfada gözükecek logları database'den çekme fonksiyonu
        function getLogs(pageNum, limit) {
            const startIndex = (pageNum - 1) * limit
            const resultArray = [];
            for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
                try {
                    let userLog = userLogs[index];

                    resultArray.push(
                        `• \`#${length - index}\` ${typeToText(userLog)} - <t:${Math.round(userLog.timestamp / 1000)}:F>`
                    );
                }
                // Eğer olur da bir hata oluşursa döngüyü geç
                catch (__) {
                    continue;
                }
            }
            pages.set(pageNum, resultArray);
            return resultArray
        }
        function getPage(pageNum) {
            return pages.get(pageNum) ?? getLogs(pageNum, LOGS_PER_PAGE)
        }

        let pageNumber = 1;

        // Girilen sayfa numarasına göre embed'i düzenleme fonksiyonu
        function createEmbed(pageNum) {
            const page = getPage(pageNum);
            return new EmbedBuilder()
                .setAuthor({
                    name: user.displayName,
                    iconURL: userAvatar
                })
                .setDescription(
                    `**• <@${user.id}> adlı kişinin toplam __${LENGTH_TO_HUMANIZE}__ tane log geçmişi bulundu**\n\n` +
                    `${page.join("\n") || "• Burada gösterilecek hiçbir şey yok..."}`
                )
                .setThumbnail(userAvatar)
                .setColor("DarkPurple")
                .setFooter({
                    text: `Sayfa ${pageNum}/${MAX_PAGE_NUMBER || 1}`
                })
        };

        const pageEmbed = createEmbed(pageNumber);

        if (MAX_PAGE_NUMBER <= 1) return msg.reply({
            embeds: [
                pageEmbed
            ]
        });

        // Mesaja butonlar ekle ve bu butonlar sayesinde sayfalar arasında geçişler yap
        const fastleftButton = new ButtonBuilder()
            .setEmoji(EMOJIS.leftFastArrow)
            .setCustomId("COMMAND_BUTTON_FASTLEFT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == 1);

        const leftButton = new ButtonBuilder()
            .setEmoji(EMOJIS.leftArrow)
            .setCustomId("COMMAND_BUTTON_LEFT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == 1);

        const deleteButton = new ButtonBuilder()
            .setEmoji(EMOJIS.delete)
            .setCustomId("COMMAND_BUTTON_DELETE")
            .setStyle(ButtonStyle.Danger);

        const rightButton = new ButtonBuilder()
            .setEmoji(EMOJIS.rightArrow)
            .setCustomId("COMMAND_BUTTON_RIGHT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == MAX_PAGE_NUMBER);

        const fastrightButton = new ButtonBuilder()
            .setEmoji(EMOJIS.rightFastArrow)
            .setCustomId("COMMAND_BUTTON_FASTRIGHT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == MAX_PAGE_NUMBER);

        // Her yerde yeni bir ActionRowBuilder oluşturmak yerine hepsini bu fonksiyondan çekeceğiz
        function createRowBuilder() {
            return new ActionRowBuilder()
                .addComponents(
                    fastleftButton,
                    leftButton,
                    deleteButton,
                    rightButton,
                    fastrightButton
                )
        }

        const waitMessage = await msg.reply({
            content: `**• Eğer düğmelere bastığınız halde sayfalar değişmiyorsa lütfen bu mesajı siliniz ve yeni bir tane oluşturunuz**`,
            embeds: [
                pageEmbed
            ],
            components: [
                createRowBuilder()
            ]
        });

        // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
        if (!waitMessage) return;

        const TWO_MINUTES = 1000 * 60 * 2

        const waitComponents = waitMessage.createMessageComponentCollector({
            filter: (button) => button.user.id == authorId,
            time: TWO_MINUTES
        })

        // Eğer butona tıklarsa
        waitComponents.on("collect", (button) => {
            switch (button.customId) {
                case "COMMAND_BUTTON_DELETE":
                    // Mesajı sil
                    return waitMessage.delete();

                case "COMMAND_BUTTON_FASTLEFT":
                case "COMMAND_BUTTON_LEFT":
                    // Sağ okları yeniden aktif et    
                    rightButton.setDisabled(false);
                    fastrightButton.setDisabled(false);

                    // Kaç sayfa geriye gideceğini hesapla
                    pageNumber = Math.max(1, pageNumber - (button.customId == "COMMAND_BUTTON_LEFT" ? 1 : 5));

                    // Eğer en başa geldiysek sol okları deaktif et
                    if (pageNumber == 1) {
                        leftButton.setDisabled(true);
                        fastleftButton.setDisabled(true);
                    }
                    break;
                default:
                    // Sol okları yeniden aktif et    
                    leftButton.setDisabled(false);
                    fastleftButton.setDisabled(false);

                    // Kaç sayfa ileriye gideceğini hesapla
                    pageNumber = Math.min(MAX_PAGE_NUMBER, pageNumber + (button.customId == "COMMAND_BUTTON_RIGHT" ? 1 : 5));

                    // Eğer en sona geldiysek sağ okları deaktif et
                    if (pageNumber == MAX_PAGE_NUMBER) {
                        rightButton.setDisabled(true);
                        fastrightButton.setDisabled(true);
                    }
                    break;
            }

            const pageEmbed = createEmbed(pageNumber);

            return waitMessage.edit({
                embeds: [
                    pageEmbed
                ],
                components: [
                    createRowBuilder()
                ]
            })
        })

        // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
        waitComponents.on("end", () => {
            // Eğer mesaj silinmişse hiçbir şey yapma
            if (
                !msg.channel.messages.cache.has(waitMessage.id)
            ) return;

            // Butonları deaktif et
            fastleftButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            leftButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            deleteButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            rightButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            fastrightButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);

            // Bellekten tasarruf etmek için Map fonksiyonunu temizle
            pages.clear();

            return waitMessage.edit({
                content: `• Bu mesaj artık aktif değildir`,
                components: [
                    createRowBuilder()
                ]
            })
        });

    },
};