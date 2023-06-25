const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "KAYIT_TEST",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            let file
                , content
            switch (int.customId.replace("KAYIT_TEST", "")) {
                case "KIZ":
                    content = `• <@${int.user.id}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`
                    file = int.client.namePhoto.kız
                    break;
                case "ERKEK":
                    content = `• <@${int.user.id}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`
                    file = int.client.namePhoto.erkek
                    break;
                case "ÜYE":
                    content = `• <@${int.user.id}>, bu butona tıkladıktan sonra kayıt edilecek kişinin **SADECE İSMİNİ** mesaj olarak yazınız. Yani kısaca butona tıkla ve ismini yaz bu kadar`
                    file = int.client.namePhoto.üye
                    break;
                case "BOT":
                    content = `• <@${int.user.id}>, bu butona tıklayarak botu hızlı bir şekilde kayıt edebilirsiniz (Eğer botun ismini değiştirmek isterseniz **${guildDatabase.prefix || ayarlar.prefix}n <kişi ID> yeni ismi** şeklinde yazarak değiştirebilirsiniz)`
                    file = int.client.namePhoto.bot
                case "ŞÜPHELİ":
                    content = `• <@${int.user.id}>, bu butona tıklayarak güvensiz olduğunu anladığınız bir hesabı şüpheli'ye atarbilirsiniz`
                    file = int.client.namePhoto.şüpheli
                    break;
                default:
                    content = `• <@${int.user.id}>, bu butona tıklayarak bu sunucuda daha önceden kayıt olmuş bir kişiyi aynı isimle hızlı bir şekilde tekrardan kayıt edebilirsiniz`
                    file = int.client.namePhoto.yeniden
                    break;
            }
            return int.reply({ content, files: [file], ephemeral: true }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}