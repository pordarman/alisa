"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    guildMemberAdd
} = require("../../../../messages.json");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "fake", // Komutun ismi
    id: "fake", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "fake",
        "fakelogin"
    ],
    description: "It sends a welcome message as if someone has logged into the server", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>fake [@user or User ID]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guild,
        args,
        errorEmbed,
        language,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || guildMe.user;

        const userId = user.id;
        const createdTimestamp = user.createdTimestamp;
        const createdTimestampSecond = Math.round(createdTimestamp / 1000);
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
                `Unsafe ${EMOJIS.unsafe}` :
                // Eğer son 1 ay içinde açmışsa
                createdTimestamp > (NOW_TIME - ONE_MONTH) ?
                    `Supicious ${EMOJIS.suspicious}` :
                    // Eğer 1 aydan daha da önce açmışsa
                    `Save ${EMOJIS.safe}`;

        // Mesajda oluşabilecek bütün butonlar
        const messageComponents = [];
        const registerButtons = new ActionRowBuilder();

        // Eğer kayıt türü "Normal Kayıt" ise
        if (guildDatabase.register.type == "normal") {
            registerButtons.addComponents(
                // Üye buton
                new ButtonBuilder()
                    .setLabel("Register as a member")
                    .setEmoji(EMOJIS.normal)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("fakeRegister-normal")
            )
        }
        // Eğer kayıt türü "Cinsiyet" ise
        else {
            registerButtons.addComponents(
                // Erkek buton
                new ButtonBuilder()
                    .setLabel("Register as a boy")
                    .setEmoji(EMOJIS.boy)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("fakeRegister-boy"),
                // Kız buton
                new ButtonBuilder()
                    .setLabel("Register as a girl")
                    .setEmoji(EMOJIS.girl)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("fakeRegister-girl")
            )
        }

        // Şüpheli ve yeniden kayıt butonu
        registerButtons.addComponents(
            // Şüpheli butonu
            new ButtonBuilder()
                .setLabel("Kick suspicious")
                .setEmoji("⛔")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("fakeRegister-suspicious"),
            // Yeniden kayıt butonu
            new ButtonBuilder()
                .setLabel("Re-register")
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
                        .setLabel("Register as a bot")
                        .setEmoji(EMOJIS.bot)
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`fakeRegister-bot`)
                )
        )

        const recreateName = Util.recreateString(user.displayName)

        // Eğer özel giriş mesajı varsa
        if (customLoginMessage.content.length > 0) {
            const loginMessage = Util.customMessages.guildAddMessage({
                message: customLoginMessage.content,
                language,
                guild,
                userId,
                recreateName,
                toHumanize,
                authRoleString: registerAuthId ? `<@&${registerAuthId}>` : "__**ROLE IS NOT SET**__",
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
                .setImage(customLoginMessage.image ?? null)
                .setThumbnail(memberAvatar)
                .setColor("Random")
                .setTimestamp();

            // Eğer kullanıcı botsa
            if (user.bot) {
                messageEmbed
                    .setTitle(`Welcome Bot ${EMOJIS.hi}`)
            }
            // Eğer bot değilse
            else {
                messageEmbed
                    .setTitle(`${guildDatabase.register.prevNamesOfMembers[userId] ? "Welcome Again" : "Welcome"} ${recreateName} ${EMOJIS.hi}`)
                    .setFooter({
                        text: `How are you ${user.displayName}?`
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
                    .setTitle(`Welcome Bot ${EMOJIS.hi}`)
                    .setDescription(
                        `**${EMOJIS.crazy} \`${guild.name}\` Welcome to our server, bot!!\n\n` +
                        `${EMOJIS.woah} With you, we become exactly ${toHumanize} person\n\n` +
                        `${EMOJIS.kiss} I hope you can be a good help to the server, I love you\n\n` +
                        `> Your account was created on <t:${createdTimestampSecond}:F>\n` +
                        `> Account Bot ${EMOJIS.bot}**`
                    );
            }
            // Eğer bot değilse
            else {
                embed
                    .setTitle(`${guildDatabase.register.prevNamesOfMembers[userId] ? "Welcome Again" : "Welcome"} ${recreateName} ${EMOJIS.hi}`)
                    .setDescription(
                        `**${EMOJIS.crazy} Welcome to our server named \`${guild.name}\`!!\n\n` +
                        `${EMOJIS.woah} With you, we become exactly ${toHumanize} person\n\n` +
                        `${EMOJIS.drink} Authorities will register you shortly. Please have some patience\n\n` +
                        `> Your account was created on <t:${createdTimestampSecond}:F>\n` +
                        `> Account ${security}**`
                    )
                    .setFooter({
                        text: `How are you ${user.displayName}?`
                    });
            }

            messageEmbed = embed;
        }

        // Mesajı gönder
        return msg.reply({
            content: `${registerAuthId ? `<@&${registerAuthId}>, ` : ""}${guildMemberAdd[language][Math.floor(Math.random() * guildMemberAdd[language].length)].replace("<m>", `<@${userId}>`)}`,
            embeds: [
                messageEmbed
            ],
            components: messageComponents
        });

    },
};