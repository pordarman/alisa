const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "oy",
    data: new SlashCommandBuilder()
        .setName("oy")
        .setDescription("Bota oy verebilirsiniz"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const düğme = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Oy ver").setStyle(5).setURL(`https://top.gg/bot/${int.client.user.id}/vote`))
            const yazlar = ["C-cidden bana oy mu vereceksiiinnn ay rüyadayım heralde çok mutluyuumm", "Aşağıdaki linke tıklayarak bana oy verebilirsiiinnn", "İşte adam gibi adam beeee", "Bugün aldığım en güzel istek olabilir <3", "Senin için bir oy olabilir ama benim için tam bir başyapıt", "Aramızda kalsın ama senin oy'un bir başka oluyor", "*Pişt pişt aşağıdaki linke gel sana bir şey göstereceğim*", "Heyy duydum ki bana oy veriyormuşsuunn :3", "Az çok demeyelim boş geçmeyelim lütfen", "Ne verirsen elinle o gider seninle abimm", "Sence ben güzel miyim? Eğer evet dediysen oy ver, eğer hayır dediysen yine oy ver *öhm lütfen*", "Beni sevdin miiii :333", "Muaahh <333", "Seni seviyorum..."]
            int.reply({ content: yazlar[Math.floor(Math.random() * yazlar.length)], components: [düğme] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}