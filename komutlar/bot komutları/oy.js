const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "oy",
    aliases: ["oy", "vote", "oyver"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            const yazlar = ["C-cidden bana oy mu vereceksiiinnn ay rüyadayım heralde çok mutluyuumm", "Aşağıdaki linke tıklayarak bana oy verebilirsiiinnn", "İşte adam gibi adam beeee", "Bugün aldığım en güzel istek olabilir <3", "Senin için bir oy olabilir ama benim için tam bir başyapıt", "Aramızda kalsın ama senin oy'un bir başka oluyor", "*Pişt pişt aşağıdaki linke gel sana bir şey göstereceğim*", "Heyy duydum ki bana oy veriyormuşsuunn :3", "Az çok demeyelim boş geçmeyelim lütfen", "Ne verirsen elinle o gider seninle abimm", "Sence ben güzel miyim? Eğer evet dediysen oy ver, eğer hayır dediysen yine oy ver *öhm lütfen*", "Beni sevdin miiii :333", "Muaahh <333", "Seni seviyorum..."]
            msg.reply({ content: yazlar[Math.floor(Math.random() * yazlar.length)], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Oy ver").setStyle(5).setURL(`https://top.gg/bot/${msg.client.user.id}/vote`))] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}