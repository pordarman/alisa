const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const DiscordVoice = require('@discordjs/voice')
module.exports = {
    name: "ses",
    data: new SlashCommandBuilder()
        .setName("ses")
        .setDescription("Botu istediğiniz ses kanalına giriş yapmasını sağlar")
        .addSubcommand(subcommand => subcommand.setName("kanal").setDescription("Kanalı etiketle").addChannelOption(a => a.addChannelTypes(2).setName("kanal").setDescription("Bir ses kanalını etiketleyiniz").setRequired(true)))
        .addSubcommand(a => a.setName("kaldır").setDescription("Botu ses kanalından çıkarır")),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            
            if (int.options.getSubcommand(false) == "kanal") {
                const kanal = int.options.getChannel("kanal", true)
                if (!kanal.joinable) return hata(`Etiketlediğiniz kanala benim katılma yetkim yok :(`)
                DiscordVoice.joinVoiceChannel({ channelId: kanal.id, guildId: guildId, adapterCreator: guild.voiceAdapterCreator, selfDeaf: true, selfMute: true })
                int.reply(`📥 <#${kanal.id}> kanalına giriş yaptım!`).catch(err => { })
                return db.yaz(guildId, kanal.id, "ses", "diğerleri")
            }
            if (!db.bul(guildId, "ses", "diğerleri")) return hata(`Zaten daha önceden katılmam için bir ses kanalı belirlememişsiniz`)
            int.guild.members.me.voice.disconnect().catch(err => { })
            hata(`Artık bundan sonra bir ses kanalına girmeyeceğim`, "b")
            db.sil(guildId, "ses", "diğerleri")
            return;
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}