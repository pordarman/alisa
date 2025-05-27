"use strict";
const {
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "ship",
        en: "ship"
    },
    id: "ship", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer kullanımları
        tr: [
            "ship"
        ],
        en: [
            "ship"
        ]
    },
    description: { // Komutun açıklaması
        tr: "İki kişiyi birleştirir ve onların uyumunu gösterir",
        en: "Combines two people and shows their harmony"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Eğlence komutları",
        en: "Fun commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>ship [@kişi veya Kişi ID'si] [@kişi veya Kişi ID'si]",
        en: "<px>ship [@person or Person ID] [@person or Person ID]"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        msgMember,
        guild,
        args,
        language,
        errorEmbed,
    }) {

        let [authorOrMember, member] = await Promise.all([
            Util.fetchMember(guild, args[1]),
            Util.fetchMember(guild, args[0])
        ]);
        if (!authorOrMember) authorOrMember = msgMember;

        const {
            commands: {
                ship: messages
            }
        } = allMessages[language];

        // Eğer kişi etiketlenmezse veya kişi bulunamazsa random bir kişi seçer
        if (!member) {
            const channel = msg.channel;

            member = (await Util.getMembers(guild)).filter(filterMember =>
                filterMember.id != authorOrMember.id &&
                !filterMember.user.bot &&
                channel.permissionsFor(filterMember).has(PermissionFlagsBits.ViewChannel)
            ).random();

            // Eğer kişi bulunamazsa
            if (!member) return errorEmbed(messages.noMember);
        }

        const allRandomMessages = messages.randomMessages;
        const allRandomHearts = ["💗", "❤️‍🔥", "💓", "💖", "💘", "💝"];
        const allRandomColors = {
            0: "#000000",
            1: "DarkButNotBlack",
            2: "DarkRed",
            3: "Red",
            4: "Orange",
            5: "Gold",
            6: "Yellow",
            7: "DarkPurple",
            8: "Purple",
            9: "LuminousVividPink",
            10: "Fuchsia",
            self: "Fuchsia"
        }

        // Kaç tane emoji kullanılacağını belirler
        const shipCount = 10;

        // Eğer kişi kendini etiketlerse
        if (authorOrMember.id === member.id) {
            const randomMessage = Util.random(allRandomMessages.self);
            const randomHeart = Util.random(allRandomHearts);

            const embed = new EmbedBuilder()
                .setTitle(messages.embed.title)
                .setDescription(
                    messages.embed.description.you({
                        randomMessage,
                        randomHearts: randomHeart.repeat(shipCount),
                    })
                )
                .setThumbnail(member.displayAvatarURL())
                .setColor(allRandomColors.self)
                .setFooter({
                    text: messages.embed.footer.you
                });

            return msg.reply({
                content: messages.embed.content.you(authorOrMember.id),
                embeds: [
                    embed
                ]
            })
        }

        const randomShip = Math.floor(Math.random() * (shipCount + 1));
        const randomHeart = Util.random(allRandomHearts);
        const shipResult = randomHeart.repeat(randomShip) + "🖤".repeat(shipCount - randomShip);

        const randomMessage = Util.random(allRandomMessages[randomShip]);

        const embed = new EmbedBuilder()
            .setTitle(messages.embed.title)
            .setDescription(
                messages.embed.description.other({
                    authorOrMemberTag: Util.escapeMarkdown(authorOrMember.user.tag),
                    memberTag: Util.escapeMarkdown(member.user.tag),
                    randomShip,
                    randomMessage,
                    shipResult
                })
            )
            .setThumbnail(member.displayAvatarURL())
            .setColor(allRandomColors[randomShip])
            .setFooter({
                text: messages.embed.footer.other
            });

        return msg.reply({
            content: messages.embed.content.other({
                authorId: authorOrMember.id,
                memberId: member.id
            }),
            embeds: [
                embed
            ],
            allowedMentions: {
                users: [],
                repliedUser: true
            }
        })
    },
};