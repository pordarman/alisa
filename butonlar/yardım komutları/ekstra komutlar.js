const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "ekstra_komutlar",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {

            // Kontroller
            const id = int.customId.replace(this.name, "")
            if (int.user.id != id) return int.reply({ embeds: [new EmbedBuilder().setDescription(`${int.isButton() ? `<:${int.component.emoji.name}:${int.component.emoji.id}> Butonunu` : "Menüyü"} yalnızca yazan kişi (<@${id}>) kullanabilir`).setColor("DarkRed")], ephemeral: true }).catch(err => { })
          
            let [array, baslik] = int.client.allCommands(sunucudb, "e")
                , düğmesağ = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.sagok)
                    .setCustomId("yardım_komutlar_sağok" + int.user.id + "e")
                , düğmesil = new ButtonBuilder()
                    .setStyle(4)
                    .setEmoji(ayarlar.emoji.sil)
                    .setCustomId("sil" + int.user.id)
                , düğmesol = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.solok)
                    .setCustomId("yardım_komutlar_solok" + int.user.id + "e")
                    .setDisabled(true)
                , düğmesaghizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.sagokhizli)
                    .setCustomId("yardım_komutlar_saghizli" + int.user.id + "e")
                , düğmesolhizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.solokhizli)
                    .setCustomId("yardım_komutlar_solhizli" + int.user.id + "e")
                    .setDisabled(true)
                , düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                , sayfa = Math.ceil(array.length / 8)
                , embed = new EmbedBuilder()
                    .setAuthor({ name: int.client.user.tag, iconURL: int.client.user.displayAvatarURL() })
                    .setTitle(baslik)
                    .setDescription(array.slice(0, 8).map((a, i) => `\`#${(i + 1)}\` ${a.content}`).join("\n"))
                    .setThumbnail(int.member.displayAvatarURL())
                    .setColor("#4500a2")
                    .setFooter({ text: `Sayfa 1/${sayfa}` })
            int.update({ embeds: [embed], components: [düğme, int.message.components[2] || int.message.components[1]] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}