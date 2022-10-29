const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "yardım_komutlar_solok",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const id = int.customId.replace(this.name, "").match(/\d+/)[0]
            if (int.user.id != id) return int.reply({ embeds: [new EmbedBuilder().setDescription(`<:${int.component.emoji.name}:${int.component.emoji.id}> Butonunu yalnızca yazan kişi (<@${id}>) kullanabilir`).setColor("DarkRed")], ephemeral: true }).catch(err => { })
            let embeds = int.message.embeds[0]?.footer
            if (!embeds) return;
            let dugme = new ActionRowBuilder()
                , sayı = +embeds.text.match(/\d+(?=\/)/)[0] - 1
                , sayfa = embeds.text.match(/(?<=\/)\d+/)[0]
            int.message.components[0].components.forEach(a => {
                if (sayı == 1 && ["yardım_komutlar_solok", "yardım_komutlar_solhizli"].some(aa => a.data.custom_id.startsWith(aa))) a.data.disabled = true
                else a.data.disabled = false
                dugme.addComponents(a)
            })
            let [array, baslik] = int.client.allCommands(sunucudb, int.customId.match(/(?<=\d)\D+/)[0])
                , embed = new EmbedBuilder()
                    .setAuthor({ name: int.client.user.tag, iconURL: int.client.user.displayAvatarURL() })
                    .setTitle(baslik)
                    .setDescription(array.map((a, i) => `\`#${(i + 1)}\` ${a.content}`).slice((sayı * 8 - 8), (sayı * 8)).join("\n"))
                    .setThumbnail(int.member.displayAvatarURL())
                    .setColor("#4500a2")
                    .setFooter({ text: `Sayfa ${sayı}/${sayfa}` })
            int.update({ embeds: [embed], components: [dugme, int.message.components[2] || int.message.components[1]] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
