const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const DiscordVoice = require('@discordjs/voice')
module.exports = {
    cooldown: 15,
    name: "ses",
    aliases: ["seskatıl", "ses-katıl", "seskanal", "ses-kanal", "voice", "ses"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            
            if (["çıkar", "kaldır"].includes(args[0])) {
                if (!db.bul(guildId, "ses", "diğerleri")) return hata(`Zaten daha önceden katılmam için bir ses kanalı belirlememişsiniz`)
                guildMe.voice.disconnect().catch(err => { })
                hata(`Artık bundan sonra bir ses kanalına girmeyeceğim`, "b")
                db.sil(guildId, "ses", "diğerleri")
                return;
            }
            const kanal = msg.mentions.channels.first() || guild.channels.cache.find(a => a.id == args[0] || a.name.toLocaleLowerCase() == args[0]?.toLocaleLowerCase())
            if (!kanal) return hata(`Lütfen bir ses kanalını etiketleyiniz, kanal ID'si giriniz veya kanalın adını giriniz\n\n• Eğer oluşturduğunuz bir ses kanalını kaldırmak istiyorsanız **${prefix}ses kaldır** yazabilirsiniz`, "ne")
            if (kanal.type !== 2) return hata(`Girdiğiniz kanal bir ses kanalı değil! Lütfen bir ses kanalı etiketleyiniz`)
            if (!kanal.joinable) return hata(`Etiketlediğiniz kanala benim katılma yetkim yok :(`)
            DiscordVoice.joinVoiceChannel({ channelId: kanal.id, guildId: guildId, adapterCreator: guild.voiceAdapterCreator, selfDeaf: true, selfMute: true })
            msg.reply(`📥 <#${kanal.id}> kanalına giriş yaptım!`).catch(err => { })
            msg.react(ayarlar.emoji.p).catch(err => { })
            db.yaz(guildId, kanal.id, "ses", "diğerleri")
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}