const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "öneri",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            let filtre
            if (int.customId.replace("öneri", "") == "r") filtre = false
            else filtre = true
            let dosyaOneri = alisa.öneri
                , dboneri = dosyaOneri[int.message.id] || { k: [], r: [] }
                , embed = int.message.embeds[0].data
                , fields = []
                , newembed = new EmbedBuilder()
                    .setTitle("💬 Bir yeni öneri var")
                    .setDescription(embed.description)
                    .setImage(embed.image?.url)
                    .setColor("#41b6cc")
                    .setFooter({ text: `${int.client.user.id} teşekkür eder..` })
                , gelsin = dboneri.k.length
                , gelmesin = dboneri.r.length
            if (filtre) {
                let kabul
                    , reddet
                    , ir = dboneri.r.indexOf(int.user.id)
                    , ik = dboneri.k.indexOf(int.user.id)
                if (ik != -1) {
                    dboneri.k.splice(ik, 1)
                    kabul = gelsin - 1
                } else {
                    dboneri.k.push(int.user.id)
                    kabul = gelsin + 1
                }
                fields.push({ name: `${ayarlar.emoji.p} Gelsin diye kişi sayısı`, value: kabul.toLocaleString().replace(/\./, ","), inline: true })
                if (ir != -1) {
                    dboneri.r.splice(ir, 1)
                    reddet = gelmesin - 1
                } else reddet = gelmesin
                fields.push({ name: `${ayarlar.emoji.np} Gelmesin diye kişi sayısı`, value: reddet.toLocaleString().replace(/\./, ","), inline: true })
            } else {
                let kabul
                    , reddet
                    , ik = dboneri.k.indexOf(int.user.id)
                    , ir = dboneri.r.indexOf(int.user.id)
                if (ik != -1) {
                    dboneri.k.splice(ik, 1)
                    kabul = gelsin - 1
                } else kabul = gelsin
                fields.push({ name: `${ayarlar.emoji.p} Gelsin diye kişi sayısı`, value: kabul.toLocaleString().replace(/\./, ","), inline: true })
                if (ir != -1) {
                    dboneri.r.splice(ir, 1)
                    reddet = gelmesin - 1
                } else {
                    dboneri.r.push(int.user.id)
                    reddet = gelmesin + 1
                }
                fields.push({ name: `${ayarlar.emoji.np} Gelmesin diye kişi sayısı`, value: reddet.toLocaleString().replace(/\./, ","), inline: true })
            }
            newembed.addFields(
                {
                    name: "BİLGİLERİ",
                    value: embed.fields.find(a => a.name == "BİLGİLERİ").value
                },
                {
                    name: "ÖNERİ",
                    value: embed.fields.find(a => a.name == "ÖNERİ").value
                },
                ...fields
            )
            dosyaOneri[int.message.id] = dboneri
            int.message.edit({ embeds: [newembed] }).catch(err => { })
            db.yaz("öneri", dosyaOneri, "alisa", "diğerleri")
            return;
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}