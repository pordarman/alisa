const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 30,
    name: "shard",
    aliases: ["shard", "shards"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let shards = await msg.client.shard.broadcastEval(c => {
                return { id: c.shard.ids[0], guildSize: c.guilds.cache.size.toLocaleString().replace(/\./g, ","), channelsSize: c.channels.cache.size.toLocaleString().replace(/\./g, ","), userSize: c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString().replace(/\./g, ","), ping: c.ws.ping, uptime: c.uptime }
            })
            let addFields = []
            shards.slice(0, 9).map((a, i) => {
                addFields.push({ name: `\u200b \u200b \u200b \u200b \u200b \u200b \u200b  __Shard ID #${a.id}__`, value: `• **Sunucu sayısı:**  ${a.guildSize}\n• **Kullanıcı sayısı:**  ${a.userSize}\n• **Kanal sayısı:**  ${a.channelsSize}\n• **Bot gecikmesi:**  ${a.ping}`, inline: true })
            })
            let sayfa = Math.ceil(shards.length / 9)
                , embed = new EmbedBuilder()
                    .setAuthor({ name: msg.client.user.username, iconURL: msg.client.user.displayAvatarURL() })
                    .addFields(...addFields)
                    .setColor("Purple")
                    .setFooter({ text: `Sayfa 1/${sayfa}` })
            if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
            let düğmesağ = new ButtonBuilder()
                .setStyle(1)
                .setEmoji("910989094463606876")
                .setCustomId("NOT_sağok")
                , düğmesil = new ButtonBuilder()
                    .setStyle(4)
                    .setEmoji("910994505304526859")
                    .setCustomId("NOT_sil")
                , düğmesol = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji("910989094190985218")
                    .setCustomId("NOT_solok")
                    .setDisabled(true)
                , düğmesaghizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji("910989094182584351")
                    .setCustomId("NOT_saghizli")
                , düğmesolhizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji("910989094383919114")
                    .setCustomId("NOT_solhizli")
                    .setDisabled(true)
                , düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
            msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
                const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil", "NOT_saghizli", "NOT_solhizli"].includes(i.customId) && i.user.id === msg.author.id
                const clin = a.createMessageComponentCollector({ filter: filter, time: 180 * 1000 })
                let sayfasayısı = 1
                clin.on("collect", async oklar => {
                    const id = oklar.customId
                    if (id == "NOT_sil") return a.delete()
                    if (["NOT_sağok", "NOT_saghizli"].includes(id)) {
                        düğmesol.setDisabled(false)
                        düğmesolhizli.setDisabled(false)
                        if (sayfasayısı == sayfa) return;
                        if (id === "NOT_sağok") sayfasayısı++;
                        else sayfasayısı += 10
                        if (sayfasayısı > sayfa) sayfasayısı = sayfa
                        if (sayfasayısı == sayfa) {
                            düğmesağ.setDisabled(true)
                            düğmesaghizli.setDisabled(true)
                        }
                    } else {
                        düğmesağ.setDisabled(false)
                        düğmesaghizli.setDisabled(false)
                        if (sayfasayısı == 1) return;
                        if (id === "NOT_solok") sayfasayısı--;
                        else sayfasayısı -= 10
                        if (sayfasayısı < 1) sayfasayısı = 1
                        if (sayfasayısı == 1) {
                            düğmesol.setDisabled(true)
                            düğmesolhizli.setDisabled(true)
                        }
                    }
                    let setFields = []
                    shards.slice((sayfasayısı * 9 - 9), (sayfasayısı * 9)).map((a, i) => {
                        setFields.push({ name: `\u200b \u200b \u200b \u200b \u200b \u200b \u200b  __Shard ID #${a.id}__`, value: `• **Sunucu sayısı:**  ${a.guildSize}\n• **Kullanıcı sayısı:**  ${a.userSize}\n• **Kanal sayısı:**  ${a.channelsSize}\n• **Bot gecikmesi:**  ${a.ping}`, inline: true })
                    })
                    embed.setFields(...setFields).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                    a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)] }).catch(err => { })
                })
                clin.on("end", async () => {
                    düğmesağ.setDisabled(true).setStyle(2)
                    düğmesol.setDisabled(true).setStyle(2)
                    düğmesil.setDisabled(true).setStyle(2)
                    düğmesaghizli.setDisabled(true).setStyle(2)
                    düğmesolhizli.setDisabled(true).setStyle(2)
                    const düğmeeditnew = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                    a.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
                })
            }).catch(() => { })
        } catch (e) {
            
        }
    }
}
