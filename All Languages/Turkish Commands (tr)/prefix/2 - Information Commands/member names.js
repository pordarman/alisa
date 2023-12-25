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
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "isimler", // Komutun ismi
    id: "isimler", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "isimler",
        "names"
    ],
    description: "Kullanıcının daha önceki isimlerini gösterir", // Komutun açıklaması
    category: "Bilgi komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>isimler <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
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

        const prevNames = guildDatabase.register.prevNamesOfMembers[user.id];

        // Eğer kullanıcı daha önceden hiç kayıt edilmemişse hata döndür
        if (!prevNames) return errorEmbed("Etiketlediğiniz kişi daha önceden hiç kayıt edilmediği için tablo gösterilemiyor");

        const NAMES_PER_PAGE = 10,
            length = prevNames.length,
            MAX_PAGE_NUMBER = Math.ceil(length / NAMES_PER_PAGE),
            LENGTH_TO_HUMANIZE = Util.toHumanize(length, language);

        const userAvatar = user.displayAvatarURL();

        // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
        const pages = new Map();

        // Embed mesajında gözükecek emojileri çekme objesi
        const textToEmoji = {
            boy: EMOJIS.boy,
            girl: EMOJIS.girl,
            normal: EMOJIS.normal,
            bot: EMOJIS.bot
        }

        // Sayfada gözükecek isimleri database'den çekme fonksiyonu
        function getNames(pageNum, limit) {
            const startIndex = (pageNum - 1) * limit
            const resultArray = [];
            for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
                try {
                    let {
                        gender,
                        name,
                        roles,
                        authorId,
                        timestamp
                    } = prevNames[index];

                    // Milisaniyeyi saniyeye çevirme
                    timestamp = Math.round(timestamp / 1000);

                    resultArray.push(
                        `• \`#${length - index}\` ${textToEmoji[gender]} **${Util.recreateString(name)}** (${roles}) (**Kayıt eden:** <@${authorId}>) - <t:${timestamp}:F>`
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
            return pages.get(pageNum) ?? getNames(pageNum, NAMES_PER_PAGE)
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
                    `**• <@${user.id}> adlı kişinin toplam __${LENGTH_TO_HUMANIZE}__ tane isim geçmişi bulundu**\n\n` +
                    `${page.join("\n\n") || "• Burada gösterilecek hiçbir şey yok..."}`
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
        const leftButton = new ButtonBuilder()
            .setEmoji(EMOJIS.leftArrow)
            .setCustomId("COMMAND_BUTTON_LEFT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == 1);

        const deleteButton = new ButtonBuilder()
            .setEmoji(EMOJIS.delete)
            .setCustomId("COMMAND_BUTTON_DELETE")
            .setStyle(ButtonStyle.Danger)

        const rightButton = new ButtonBuilder()
            .setEmoji(EMOJIS.rightArrow)
            .setCustomId("COMMAND_BUTTON_RIGHT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == MAX_PAGE_NUMBER);

        // Her yerde yeni bir ActionRowBuilder oluşturmak yerine hepsini bu fonksiyondan çekeceğiz
        function createRowBuilder() {
            return new ActionRowBuilder()
                .addComponents(
                    leftButton,
                    deleteButton,
                    rightButton,
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

                case "COMMAND_BUTTON_LEFT":
                    // Sağ okları yeniden aktif et    
                    rightButton.setDisabled(false);

                    // Kaç sayfa geriye gideceğini hesapla
                    pageNumber = Math.max(1, pageNumber - 1);

                    // Eğer en başa geldiysek sol okları deaktif et
                    if (pageNumber == 1) {
                        leftButton.setDisabled(true);
                    }
                    break;

                default:
                    // Sol okları yeniden aktif et    
                    leftButton.setDisabled(false);

                    // Kaç sayfa ileriye gideceğini hesapla
                    pageNumber = Math.min(MAX_PAGE_NUMBER, pageNumber + 1);

                    // Eğer en sona geldiysek sağ okları deaktif et
                    if (pageNumber == MAX_PAGE_NUMBER) {
                        rightButton.setDisabled(true);
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
            leftButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            deleteButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            rightButton
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