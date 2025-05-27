"use strict";
const {
    AttachmentBuilder,
    MessageFlags
} = require("discord.js");
const allPhotos = { // Kullanıcılara yardımcı olmak için resimler eklendi
    tr: {
        member: new AttachmentBuilder("https://i.hizliresim.com/emr7apu.png", {
            name: "ornek_kullanim.png",
            description: "Komutun nasıl kullanılacağına dair örnek"
        }),
        suspicious: new AttachmentBuilder("https://i.hizliresim.com/befowjp.png", {
            name: "ornek_kullanim.png",
            description: "Komutun nasıl kullanılacağına dair örnek"
        }),
        again: new AttachmentBuilder("https://i.hizliresim.com/6vnmf5k.png", {
            name: "ornek_kullanim.png",
            description: "Komutun nasıl kullanılacağına dair örnek"
        }),
        boy: new AttachmentBuilder("https://i.hizliresim.com/isk8bbl.png", {
            name: "ornek_kullanim.png",
            description: "Komutun nasıl kullanılacağına dair örnek"
        }),
        girl: new AttachmentBuilder("https://i.hizliresim.com/6w8153u.png", {
            name: "ornek_kullanim.png",
            description: "Komutun nasıl kullanılacağına dair örnek"
        }),
        bot: new AttachmentBuilder("https://i.hizliresim.com/nmntmn8.png", {
            name: "ornek_kullanim.png",
            description: "Komutun nasıl kullanılacağına dair örnek"
        }),
    },
    en: {
        member: new AttachmentBuilder("https://i.hizliresim.com/emr7apu.png", {
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
        })
    },
};
const allMessages = {
    tr: {
        boyContent(authorId) {
            return `• <@${authorId}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ (ve eğer gerekiyorsa yaşını)** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`
        },
        girlContent(authorId) {
            return `• <@${authorId}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ (ve eğer gerekiyorsa yaşını)** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`
        },
        memberContent(authorId) {
            return `• <@${authorId}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ (ve eğer gerekiyorsa yaşını)** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`
        },
        botContent({
            authorId,
            prefix
        }) {
            return `• <@${authorId}>, bu butona tıklayarak botu hızlı bir şekilde kayıt edebilirsiniz (Eğer botun ismini değiştirmek isterseniz **${prefix}n <bot ID'si> <yeni ismi>** şeklinde yazarak değiştirebilirsiniz)`
        },
        suspiciousContent(authorId) {
            return `• <@${authorId}>, bu butona tıklayarak güvensiz olduğunu anladığınız bir hesabı şüpheli'ye atabilirsiniz`
        },
        againContent(authorId) {
            return `• <@${authorId}>, bu butona tıklayarak bu sunucuda daha önceden kayıt olmuş bir kişiyi aynı isimle hızlı bir şekilde tekrardan kayıt edebilirsiniz`
        },
    },
    en: {
        boyContent(authorId) {
            return `• <@${authorId}>, After clicking this button, write **ONLY THE NAME (and if necessary, the age)** of the person to be registered as a message. So simply click on the button and write your name and that's it`
        },
        girlContent(authorId) {
            return `• <@${authorId}>, After clicking this button, write **ONLY THE NAME (and if necessary, the age)** of the person to be registered as a message. So simply click on the button and write your name and that's it`
        },
        memberContent(authorId) {
            return `• <@${authorId}>, After clicking this button, write **ONLY THE NAME (and if necessary, the age)** of the person to be registered as a message. So simply click on the button and write your name and that's it`
        },
        botContent({
            authorId,
            prefix
        }) {
            return `• <@${authorId}> ,You can quickly register the bot by clicking this button (If you want to change the name of the bot, you can change it by typing **${prefix}n <bot ID> <new name>**)`
        },
        suspiciousContent(authorId) {
            return `• <@${authorId}>, By clicking this button, you can assign an account that you understand to be unsafe to suspect`
        },
        againContent(authorId) {
            return `• <@${authorId}>, By clicking this button, you can quickly re-register a person who has already registered on this server with the same name`
        },
    }
}

module.exports = {
    name: "fakeRegister", // Butonun ismi
    id: "fake", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Butonla nasıl kayıt yapılacağını gösterir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        splitCustomId,
        authorId,
    }) {

        // Mesajda gösterilecek mesajı ve resmi çek
        const [_, type] = splitCustomId;
        const examplePhotos = allPhotos[guildDatabase.language];
        const messages = allMessages[guildDatabase.language];
        const contentAndFiles = {
            boy: {
                content: messages.boyContent(authorId),
                file: examplePhotos.boy
            },
            girl: {
                content: messages.boyContent(authorId),
                file: examplePhotos.girl
            },
            member: {
                content: messages.boyContent(authorId),
                file: examplePhotos.member
            },
            bot: {
                content: messages.botContent({
                    authorId,
                    prefix: guildDatabase.prefix
                }),
                file: examplePhotos.bot
            },
            suspicious: {
                content: messages.suspiciousContent(authorId),
                file: examplePhotos.suspicious
            },
            again: {
                content: messages.againContent(authorId),
                file: examplePhotos.again
            },
        }[type];

        return int.reply({
            content: contentAndFiles.content,
            files: [
                contentAndFiles.file
            ],
            flags: MessageFlags.Ephemeral
        })
    },
};