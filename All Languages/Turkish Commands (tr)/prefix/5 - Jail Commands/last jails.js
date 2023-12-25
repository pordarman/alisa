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
const Time = require("../../../../Helpers/Time.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "jailson", // Komutun ismi
    id: "jailson", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "jailson",
        "jail-son",
        "jaillast"
    ],
    description: "Sunucunun son Jail'e atılanları gösterir", // Komutun açıklaması
    category: "Jail komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>jailson [@kişi veya Kişi ID'si]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef.js").exportsRunCommands} params
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
        const authorizedRoleId = guildDatabase.jail.authRoleId;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]);

        let lastJails = guildDatabase.jail.last;

        // Eğer bir kişiyi etiketlemişse son kayıtları sadece onun yaptığı kayıtları göster
        if (user) {
            lastJails = lastJails.filter(({ memberId: userId }) => userId == user.id);
        }

        const length = lastJails.length;

        // Eğer kullanıcı daha önceden hiç kayıt etmemişse hata döndür
        if (!length) return errorEmbed(
            user ?
                "Etiketlediğiniz kişi daha önceden hiç Jail'e atılmadığı için tablo gösterilemiyor" :
                "Bu sunucuda daha önce hiç kimse Jail'e atılmadığı için tablo gösterilemiyor"
        );

        const JAILS_PER_PAGE = 8,
            MAX_PAGE_NUMBER = Math.ceil(length / JAILS_PER_PAGE),
            LENGTH_TO_HUMANIZE = Util.toHumanize(length, language);

        let authorName;
        let image;
        // Eğer kişiyi etiketlemişse
        if (user) {
            authorName = user.displayName;
            image = user.displayAvatarURL();
        } else {
            authorName = guild.name;
            image = guild.iconURL();
        }

        // Eğer mesaj belirli bir karakter sınırının üstündeyse mesajı ayır
        function truncatedString(string, maxLength) {
            if (string.length <= maxLength) return string;

            let truncated = string.slice(0, maxLength);

            // Eğer kelimenin tam sonuna geldiyse olduğu gibi döndür
            if (
                !/[a-zA-ZığüşçöİĞÜŞÖÇ]/.test(string[maxLength])
            ) return `${truncated}...`;

            const lastSpaceIndex = truncated.lastIndexOf(" ");
            if (lastSpaceIndex !== -1) {
                truncated = truncated.slice(0, lastSpaceIndex).trim();
            }

            return `${truncated}...`;
        }

        // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
        const pages = new Map();

        // Sayfada gözükecek son jail verilerini database'den çekme fonksiyonu
        function getJails(pageNum, limit) {
            const startIndex = (pageNum - 1) * limit
            const resultArray = [];

            for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
                try {
                    let {
                        authorId,
                        isJailed,
                        isTempJailed,
                        duration,
                        timestamp,
                        reason,
                    } = lastJails[index];

                    // Milisaniyeyi saniyeye çevirme
                    timestamp = Math.round(timestamp / 1000);

                    resultArray.push(
                        // Eğer kullanıcı bir kişiyi etiketlemişse farklı bir yazı, etiketlememişse farklı bir yazı döndür
                        `• \`#${length - index}\` ${isTempJailed ? "⏰ " : ""}${isJailed ? "📥" : "📤"} <@${authorId}> ${user ? `<@${memberId}> ` : ""}| <t:${timestamp}:F>${isJailed ?
                            `\n└> **Sebebi:** ${truncatedString(reason || "Sebep belirtilmemiş", 50)}`
                            : ""
                        }${isTempJailed ?
                            `\n└> **Süre:** ${Time.duration(duration, language)}`
                            : ""
                        }`
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
            return pages.get(pageNum) ?? getJails(pageNum, JAILS_PER_PAGE)
        }

        let pageNumber = 1;

        // Eğer bir kişiyi etiketlemişse farklı bir yazı, etiketlememişse farklı bir yazı döndür
        let embedDescription = user ? `<@${user.id}> adlı kişinin toplamda` : "Bu sunucuda toplam";

        // Girilen sayfa numarasına göre embed'i düzenleme fonksiyonu
        function createEmbed(pageNum) {
            const page = getPage(pageNum);
            return new EmbedBuilder()
                .setAuthor({
                    name: authorName,
                    iconURL: image
                })
                .setDescription(
                    `**• ${embedDescription} __${LENGTH_TO_HUMANIZE}__ jail bilgisi bulundu\n\n` +
                    (page.join("\n\n") || "• Burada gösterilecek hiç bir şey yok...") +
                    "**"
                )
                .setThumbnail(image)
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