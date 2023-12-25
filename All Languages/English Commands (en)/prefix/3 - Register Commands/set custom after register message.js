"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder, AttachmentBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "customafterregister", // Komutun ismi
    id: "günlüközel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "customafterregister",
        "afterregistermessage",
    ],
    description: "Allows you to customize the post-registration message", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>customafterregister", // Komutun kullanım şekli
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
                .then(async messages => {
                    delete guildDatabase.waitMessageCommands.customAfterRegister;
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
                            if (!guildDatabase.register.customAfterRegister) return message.reply("Customized message after registration is not already set");

                            // Database'ye kaydet
                            guildDatabase.register.customAfterRegister = {
                                content: "",
                                image: "",
                                isEmbed: false,
                            }
                            database.writeFile(guildDatabase, guildId);

                            return message.reply(`${EMOJIS.yes} Customized message after registration successfully reset`);
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
                            guildDatabase.register.customAfterRegister = {
                                content: newString,
                                image,
                                isEmbed,
                            };
                            database.writeFile(guildDatabase, guildId);

                            await message.reply(
                                `${EMOJIS.yes} Customized message after registration has been set successfully\n\n` +
                                `**It will look like this**`
                            );


                            const messageContent = Util.customMessages.afterRegisterMessage({
                                message: newString,
                                language,
                                memberId: clientUser.id,
                                recreateMemberName: recreateClientName,
                                givenRolesString: "__**GIVEN ROLES**__ (Those with this role will not be notified)",
                                memberCount: guild.memberCount,
                                authorId,
                                recreateAuthorName: recreateAuthorName,
                                guildTag,
                                toHumanizeRegisterCount: "888"
                            });

                            const allMessages = Util.afterRegisterMessages[language].normal

                            return msg.reply(
                                isEmbed ?
                                    // Eğer mesajı embed olarak ayarlamışlarsa
                                    {
                                        content: allMessages.replace("<m>", `<@${clientUser.id}>`),
                                        embeds: [
                                            new EmbedBuilder()
                                                .setTitle(`Welcome aboard ${recreateClientName} ${EMOJIS.hi}`)
                                                .setDescription(messageContent)
                                                .setThumbnail(msg.client.user.displayAvatarURL())
                                                .setImage(image ?? null)
                                                .setColor("Random")
                                                .setTimestamp()
                                        ]
                                    } :
                                    // Eğer kutusuz olarak ayarlamışlarsa
                                    {
                                        content: messageContent,
                                        files: image ?
                                            [new AttachmentBuilder(image)] :
                                            [],
                                        allowedMentions: {
                                            roles: [],
                                            users: [clientUser.id]
                                        }
                                    }
                            )
                        }
                    }

                    // Eğer işlemi sıfırladıysa
                })
                // Eğer mesaj atmadıysa
                .catch(() => {
                    msg.reply(`⏰ <@${authorId}>, your time is up!`);

                    delete guildDatabase.waitMessageCommands.customAfterRegister;
                    database.writeFile(guildDatabase, guildId);
                });
        }

        const guildTag = guildDatabase.register.tag;
        const clientUser = msg.client.user;
        const recreateClientName = Util.recreateString(clientUser.displayName);
        const recreateAuthorName = Util.recreateString(msg.author.displayName);

        // Eğer bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır
        if (extras) return await waitMessage();

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "yetki");

        // Eğer bu komut şu anda çalışıyorsa
        if (guildDatabase.waitMessageCommands.customAfterRegister) return errorEmbed(`Hey, wait there! Another official is currently setting the private message!`);

        const NOW_TIME = Date.now();
        // Eğer bot yeniden başlarsa gerekli verileri database'ye yazdır
        guildDatabase.waitMessageCommands.customAfterRegister = {
            commandName: this.name,
            channelId: msg.channelId,
            messageId: msg.id,
            authorId,
            timestamp: NOW_TIME
        };
        database.writeFile(guildDatabase, guildId);

        const embed = new EmbedBuilder()
            .setTitle("Now is the time to think")
            .setDescription(
                `• To cancel **cancel**\n` +
                `• To reset, you can type **reset**\n\n` +
                `**If you want your post-registration message to be unboxed, just write <unboxed> at the beginning of your message!**\n\n` +
                `**Variables**\n` +
                `**• <member>** => Tags registered person - ( <@${clientUser.id}> )\n` +
                `**• <memberName>** => Writes the name of the registered person - ( ${recreateClientName} )\n` +
                `**• <memberId>** => Writes the registered person's ID - ( ${clientUser.id} )\n` +
                `**• <role>** => Tags the given role (those with this role will not be notified) - ( @Roles )\n` +
                `**• <tag>** => Writes the tag(s) of the server - ( ${guildTag || "**NO TAG**"} )\n` +
                `**• <total>** => Writes the number of people on the server - ( ${Util.toHumanize(guild.memberCount, language)} )\n` +
                `**• <emojiTotal>** => Writes the number of people on the server with emojis - ( ${Util.stringToEmojis(guild.memberCount)} )\n` +
                `**• <auth>** => Tags Registrar - ( <@${authorId}> )\n` +
                `**• <authName>** => Writes the entire name of the Registrar - ( ${recreateAuthorName} )\n` +
                `**• <authId>** => Writes the ID of the Registrar - ( ${authorId} )\n` +
                `**• <registercount>** => Writes the number of records of the Registrar - ( 888 )`
            )
            .setImage("https://i.hizliresim.com/dbe56m0.png")
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