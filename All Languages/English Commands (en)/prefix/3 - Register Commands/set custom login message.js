"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "custom", // Komutun ismi
    id: "özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "custom",
        "customregister",
        "customregistermessage",
        "custom-register",
        "custom-register-message",
    ],
    description: "Lets you customize the login message", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>custom", // Komutun kullanım şekli
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
        guildId,
        guild,
        authorId,
        prefix,
        errorEmbed,
        extras,
        language,
    }) {

        // Bu fonksiyonu bot yeniden başlatıldıktan sonra da kullanacağımız için bir fonksiyon şeklinde yapıyoruz
        async function waitMessage() {
            // Mesaj atmasını bekle
            await msg.channel?.awaitMessages({
                filter: message => message.author.id === authorId,
                max: 1,
                time: 1000 * 60 * 8 // 8 dakika
            })
                // Eğer mesaj attıysa
                .then(messages => {
                    delete guildDatabase.waitMessageCommands.customLogin;
                    database.writeFile(guildDatabase, guildId);

                    const message = messages.first();

                    // Mesajın başındaki ve sonundaki boşlukları kaldır
                    message.content = message.content.trim();

                    // Eğer hiçbir yazı girmemişse
                    if (message.content.length == 0) return message.reply("Like you should have written a message, what are you saying??");

                    switch (message.content.toLocaleLowerCase(language)) {
                        // Eğer işlemi iptal ettiyse
                        case "cancel":
                            return message.reply("The transaction has been canceled");

                        // Eğer ayarlanan veriyi sıfırlamak istiyorsa
                        case "reset": {
                            // Eğer zaten sıfırlanmışsa
                            if (!guildDatabase.register.customLogin) return message.reply("Customized login message is not already set");

                            // Database'ye kaydet
                            guildDatabase.register.customLogin = {
                                content: "",
                                image: "",
                                isEmbed: false,
                            }
                            database.writeFile(guildDatabase, guildId);

                            return message.reply(`${EMOJIS.yes} Customized login message reset successfully`);
                        }

                        // Eğer bir şeyler ayarlamak istiyorsa
                        default: {

                            // Mesajın kutulu mu kutusuz mu olacağını kontrol etmek için yeni bir string oluşturacağız
                            // Ve ikisi arasında karakter farkı varsa "kutulu", yoksa "kutusuz" olduğunu ayarlayacağız
                            let newString = message.content.replace(/<\/?(unboxed)>/g, "");
                            const isEmbed = message.content.length == newString.length;
                            const maxLength = isEmbed ? Util.MAX.customMessageLength.embed : Util.MAX.customMessageLength.message;

                            // Eğer mesajda çok fazla karakter varsa
                            if (message.content.length > maxLength) return message.reply(
                                `There are too many characters! Your message must be less than **${maxLength}** characters!`
                            );

                            // Mesajdan resmi çek
                            let image = message.attachments.find(({ contentType }) => /^(video|image)/.test(contentType))?.url;

                            // Eğer resim yoksa URL'yi çekmeye çalış
                            if (!image) {
                                image = message.content.match(Util.regex.fetchURL)?.[0];

                                // Eğer URL'yi çektiyse mesajdan URL'yi kaldır
                                if (image) {
                                    newString.replace(image, "");
                                }
                            }

                            // Mesajın başındaki ve sonundaki \n karakterlerini kaldır
                            newString = newString.replace(/(^(\n)+|(\n)+$)/g, "");

                            // Database'ye kaydet
                            guildDatabase.register.customLogin = {
                                content: newString,
                                image,
                                isEmbed,
                            };
                            database.writeFile(guildDatabase, guildId);

                            return message.reply(`${EMOJIS.yes} The customized login message has been set successfully. You can type **${prefix}fake** to see how it looks`);
                        }
                    }

                    // Eğer işlemi sıfırladıysa
                })
                // Eğer mesaj atmadıysa
                .catch(() => {
                    msg.reply(`⏰ <@${authorId}>, your time is up!`);

                    delete guildDatabase.waitMessageCommands.customLogin;
                    database.writeFile(guildDatabase, guildId);
                });
        }

        // Eğer bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır
        if (extras) return await waitMessage();

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "yetki");

        // Eğer bu komut şu anda çalışıyorsa
        if (guildDatabase.waitMessageCommands.customLogin) return errorEmbed(`Hey, wait there! Another official is currently setting the private message!`);

        const NOW_TIME = Date.now();
        // Eğer bot yeniden başlarsa gerekli verileri database'ye yazdır
        guildDatabase.waitMessageCommands.customLogin = {
            commandName: this.name,
            channelId: msg.channelId,
            messageId: msg.id,
            authorId,
            timestamp: NOW_TIME
        };
        database.writeFile(guildDatabase, guildId);

        const createdTimestamp = msg.author.createdTimestamp;
        const createdTimestampSecond = Math.round(createdTimestamp / 1000);

        const TWO_WEEKS = 1000 * 60 * 60 * 24 * 7 * 2;
        const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
        // Eğer kullanıcı hesabını son 2 hafta içinde açmışsa
        const security = createdTimestamp > (NOW_TIME - TWO_WEEKS) ?
            `Unsafe ${EMOJIS.unsafe}` :
            // Eğer son 1 ay içinde açmışsa
            createdTimestamp > (NOW_TIME - ONE_MONTH) ?
                `Suspicious ${EMOJIS.suspicious}` :
                // Eğer 1 aydan daha da önce açmışsa
                `Safe ${EMOJIS.safe}`;

        const registerAuthRoleId = guildDatabase.register.roleIds.registerAuth;

        const embed = new EmbedBuilder()
            .setTitle("Now is the time to think")
            .setDescription(
                `• To cancel **cancel**\n` +
                `• To reset, you can type **reset**\n\n` +
                `**If you want your intro message to be unboxed, just write <unboxed> at the beginning of your message!**\n\n` +
                `**Variables**\n` +
                `**• <guildName>** => Writes the server name - ( ${guild.name} ) \n` +
                `**• <role>** => Tags the authority role - ( ${registerAuthRoleId ? `<@&${registerAuthRoleId}>` : "__**ROLE NOT SET**__"} )\n` +
                `**• <member>** => Tags the incoming person - ( <@${authorId}> )\n` +
                `**• <memberName>** => Writes the name of the incoming person - ( ${Util.recreateString(msg.author.displayName)} )\n` +
                `**• <memberId>** => Writes the ID of the incoming person - ( ${authorId} )\n` +
                `**• <total>** => Writes the total number of members of the server - ( ${Util.toHumanize(guild.memberCount, language)} )\n` +
                `**• <emojiTotal>** => Writes the total number of members of the server with emojis - ( ${Util.stringToEmojis(guild.memberCount)} )\n` +
                `**• <date>** => Writes the establishment date of the account - ( <t:${createdTimestampSecond}:F> )\n` +
                `**• <date2>** => Writes the establishment date of the account - ( <t:${createdTimestampSecond}:R> )\n` +
                `**• <date3>** => Writes the establishment date of the account - ( ${Time.toDateString(msg.author.createdTimestamp, language)} )\n` +
                `**• <security>** => Indicates whether it is secure or not - ( ${security} )`
            )
            .setImage("https://i.hizliresim.com/hjv5aum.png")
            .setColor("Blue")
            .setFooter({
                text:
                    "You have 8 minutes to respond"
            });

        msg.reply({
            embeds: [
                embed
            ]
        });
        return await waitMessage()

    },
};