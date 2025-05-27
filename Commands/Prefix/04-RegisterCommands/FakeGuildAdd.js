"use strict";
const {
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "fake",
        en: "fake"
    },
    id: "fake", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "fake",
            "fakelogin",
            "fakegiriş"
        ],
        en: [
            "fake",
            "fakelogin"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucuya sanki birisi girmiş gibi hoşgeldin mesajı atar",
        en: "It sends a welcome message as if someone has logged into the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>fake [@kişi veya Kişi ID'si]",
        en: "<px>fake [@user or User ID]"
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
        guildDatabase,
        guildMe,
        guild,
        msgMember,
        args,
        language,
        errorEmbed,
    }) {
        const {
            permissions: permissionMessages,
            others: otherMessages,
            guildMemberAdd: guildMemberAddMessages
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const messages = otherMessages.events.guildMemberAdd;

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || guildMe.user;

        const userId = user.id;
        const createdTimestamp = user.createdTimestamp;
        const createdTimestampSecond = Util.msToSecond(createdTimestamp);
        const memberAvatar = user.displayAvatarURL();

        const registerAuthId = guildDatabase.register.roleIds.registerAuth;
        const customLoginMessage = guildDatabase.register.customLogin;
        const toHumanize = Util.toHumanize(guild.memberCount, language);
        let messageEmbed;

        const NOW_TIME = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const TWO_WEEKS = ONE_DAY * 7 * 2;
        const ONE_MONTH = ONE_DAY * 30;

        // Eğer kullanıcı botsa
        const security = user.bot ? `Bot ${EMOJIS.bot}` :
            // Eğer kullanıcı hesabını son 2 hafta içinde açmışsa
            createdTimestamp > (NOW_TIME - TWO_WEEKS) ?
                `${messages.security.unsafe} ${EMOJIS.unsafe}` :
                // Eğer son 1 ay içinde açmışsa
                createdTimestamp > (NOW_TIME - ONE_MONTH) ?
                    `${messages.security.suspicious} ${EMOJIS.suspicious}` :
                    // Eğer 1 aydan daha da önce açmışsa
                    `${messages.security.safe} ${EMOJIS.safe}`;

        // Mesajda oluşabilecek bütün butonlar
        const messageComponents = [];
        const registerButtons = new ActionRowBuilder();

        // Eğer kayıt türü "Üyeli kayıt" ise
        if (guildDatabase.register.type == "member") {
            registerButtons.addComponents(
                // Üye buton
                new ButtonBuilder()
                    .setLabel(messages.buttonLabels.member)
                    .setEmoji(EMOJIS.member)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("fakeRegister-member")
            )
        }
        // Eğer kayıt türü "Cinsiyet" ise
        else {
            registerButtons.addComponents(
                // Erkek buton
                new ButtonBuilder()
                    .setLabel(messages.buttonLabels.boy)
                    .setEmoji(EMOJIS.boy)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("fakeRegister-boy"),
                // Kız buton
                new ButtonBuilder()
                    .setLabel(messages.buttonLabels.girl)
                    .setEmoji(EMOJIS.girl)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("fakeRegister-girl")
            )
        }

        // Şüpheli ve yeniden kayıt butonu
        registerButtons.addComponents(
            // Şüpheli butonu
            new ButtonBuilder()
                .setLabel(messages.buttonLabels.suspicious)
                .setEmoji("⛔")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("fakeRegister-suspicious"),
            // Yeniden kayıt butonu
            new ButtonBuilder()
                .setLabel(messages.buttonLabels.again)
                .setEmoji("🔁")
                .setStyle(ButtonStyle.Success)
                .setCustomId("fakeRegister-again")
        );

        messageComponents.push(registerButtons);

        // Bot olarak kayıt et seçeneğini de farklı bir actionRow'a ekle
        messageComponents.push(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(messages.buttonLabels.bot)
                        .setEmoji(EMOJIS.bot)
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`fakeRegister-bot`)
                )
        )

        const recreateName = Util.escapeMarkdown(user.displayName)

        // Eğer özel giriş mesajı varsa
        if (customLoginMessage.content.length > 0) {
            const loginMessage = Util.customMessages.guildAddMessage({
                message: customLoginMessage.content,
                language,
                guildName: guild.name,
                userId,
                recreateName,
                toHumanize,
                authRoleString: registerAuthId ? `<@&${registerAuthId}>` : messages.roleNotSetted,
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
                return msg.reply({
                    content: loginMessage,
                    components: messageComponents,
                    allowedMentions: {
                        roles: [],
                        users: [],
                        repliedUser: true
                    }
                });
            }

            messageEmbed = new EmbedBuilder()
                .setDescription(loginMessage)
                .setImage(customLoginMessage.image || null)
                .setThumbnail(memberAvatar)
                .setColor("Random")
                .setTimestamp();

            // Eğer kullanıcı botsa
            if (user.bot) {
                messageEmbed
                    .setTitle(`${messages.welcomeEmbed.bot.welcome.welcome} ${EMOJIS.hi}`)
            }
            // Eğer bot değilse
            else {
                messageEmbed
                    .setTitle(`${guildDatabase.register.prevNamesOfMembers[userId] ? messages.welcomeEmbed.member.again : messages.welcomeEmbed.member.welcome} ${recreateName} ${EMOJIS.hi}`)
                    .setFooter({
                        text: `${messages.welcomeEmbed.member.embed.footer} ${user.displayName}?`
                    });
            }

        }
        // Eğer özel giriş mesajı ayarlanmamışsa
        else {
            const embed = new EmbedBuilder()
                .setThumbnail(memberAvatar)
                .setColor("Random")
                .setTimestamp();

            // Eğer kullanıcı botsa
            if (user.bot) {
                embed
                    .setTitle(`${messages.welcomeEmbed.bot.welcome.welcome} ${EMOJIS.hi}`)
                    .setDescription(
                        messages.welcomeEmbed.bot.welcome.embed.description({
                            guildName: guild.name,
                            toHumanize,
                            createdTimestampSecond
                        })
                    );
            }
            // Eğer bot değilse
            else {
                embed
                    .setTitle(`${guildDatabase.register.prevNamesOfMembers[userId] ? messages.welcomeEmbed.member.again : messages.welcomeEmbed.member.welcome} ${recreateName} ${EMOJIS.hi}`)
                    .setDescription(
                        messages.welcomeEmbed.member.embed.description({
                            guildName: guild.name,
                            toHumanize,
                            createdTimestampSecond,
                            security
                        })
                    )
                    .setFooter({
                        text: `${messages.welcomeEmbed.member.embed.footer} ${user.displayName}?`
                    });
            }

            messageEmbed = embed;
        }

        // Mesajı gönder
        return msg.reply({
            content: `${(registerAuthId && guildDatabase.register.isAuthroizedNotificationOn) ? `<@&${registerAuthId}>, ` : ""}${Util.random(guildMemberAddMessages(user.id))}`,
            embeds: [messageEmbed],
            components: messageComponents
        });

    },
};