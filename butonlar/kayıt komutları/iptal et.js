const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "KAYIT_İŞLEMİNİ_İPTAL_ET_",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        let idler = int.customId.replace(this.name, "")
            , split = idler.split("-")
            , id = split[0]
            , memberid = split[1]
        try {
            if (id != int.user.id) return hata(`<:${int.component.emoji.name}:${int.component.emoji.id}> Butonunu yalnızca kayıt işlemini gerçekleştiren kişi (<@${id}>) kullanabilir`)
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}