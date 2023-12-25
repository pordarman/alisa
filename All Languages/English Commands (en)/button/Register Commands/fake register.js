"use strict";
const {
    AttachmentBuilder
} = require("discord.js");
const examplePhotos = { // Kullanıcılara yardımcı olmak için resimler eklendi
    normal: new AttachmentBuilder("https://i.hizliresim.com/emr7apu.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    }),
    suspicious: new AttachmentBuilder("https://i.hizliresim.com/befowjp.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    }),
    again: new AttachmentBuilder("https://i.hizliresim.com/6vnmf5k.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    }),
    boy: new AttachmentBuilder("https://i.hizliresim.com/isk8bbl.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    }),
    girl: new AttachmentBuilder("https://i.hizliresim.com/6w8153u.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    }),
    bot: new AttachmentBuilder("https://i.hizliresim.com/nmntmn8.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    }),
}

module.exports = {
    name: "fakeRegister", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Butonla nasıl kayıt yapılacağını gösterir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        customId,
        authorId,
    }) {

        // Mesajda gösterilecek mesajı ve resmi çek
        const [_, type] = customId.split("-");
        const contentAndFiles = {
            boy: {
                content: `• <@${authorId}>, After clicking this button, write **ONLY THE NAME** of the person to be registered as a message. So simply click on the button and write your name and that's it`,
                file: examplePhotos.boy
            },
            girl: {
                content: `• <@${authorId}>, After clicking this button, write **ONLY THE NAME** of the person to be registered as a message. So simply click on the button and write your name and that's it`,
                file: examplePhotos.girl
            },
            normal: {
                content: `• <@${authorId}>, After clicking this button, write **ONLY THE NAME** of the person to be registered as a message. So simply click on the button and write your name and that's it`,
                file: examplePhotos.normal
            },
            bot: {
                content: `• <@${authorId}> ,You can quickly register the bot by clicking this button (If you want to change the name of the bot, you can change it by typing **${guildDatabase.prefix}n <bot ID> <new name>**)`,
                file: examplePhotos.bot
            },
            suspicious: {
                content: `• <@${authorId}>, By clicking this button, you can assign an account that you understand to be unsafe to suspect`,
                file: examplePhotos.suspicious
            },
            again: {
                content: `• <@${authorId}>, By clicking this button, you can quickly re-register a person who has already registered on this server with the same name`,
                file: examplePhotos.again
            },
        }[type];

        return int.reply({
            content: contentAndFiles.content,
            files: [
                contentAndFiles.file
            ],
            ephemeral: true
        })
    },
};