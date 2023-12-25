"use strict";
const {
    AttachmentBuilder
} = require("discord.js");
const examplePhotos = { // Kullanıcılara yardımcı olmak için resimler eklendi
    normal: new AttachmentBuilder("https://i.hizliresim.com/emr7apu.png", {
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
}
const Util = require("../../../../Helpers/Util");

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
        alisa,
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        // Mesajda gösterilecek mesajı ve resmi çek
        const [_, type] = customId.split("-");
        const contentAndFiles = {
            boy: {
                content: `• <@${authorId}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`,
                file: examplePhotos.boy
            },
            girl: {
                content: `• <@${authorId}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`,
                file: examplePhotos.girl
            },
            normal: {
                content: `• <@${authorId}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`,
                file: examplePhotos.normal
            },
            bot: {
                content: `• <@${authorId}>, bu butona tıklayarak botu hızlı bir şekilde kayıt edebilirsiniz (Eğer botun ismini değiştirmek isterseniz **${guildDatabase.prefix}n <bot ID'si> <yeni ismi>** şeklinde yazarak değiştirebilirsiniz)`,
                file: examplePhotos.bot
            },
            suspicious: {
                content: `• <@${authorId}>, bu butona tıklayarak güvensiz olduğunu anladığınız bir hesabı şüpheli'ye atabilirsiniz`,
                file: examplePhotos.suspicious
            },
            again: {
                content: `• <@${authorId}>, bu butona tıklayarak bu sunucuda daha önceden kayıt olmuş bir kişiyi aynı isimle hızlı bir şekilde tekrardan kayıt edebilirsiniz`,
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