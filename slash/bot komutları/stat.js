const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, version } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const os = require("os")
module.exports = {
    name: "stat",
    data: new SlashCommandBuilder()
        .setName("istatistik")
        .setDescription("Botun linklerini gösterir"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const zaman = Date.now()
            let ben = int.client.user
                , tümram = os.totalmem()
                , boştaolanram = os.freemem()
                , kullanılanram = tümram - boştaolanram
                , yüzde = (kullanılanram / tümram * 100).toFixed(2)
                , toplamram = (tümram / 1024 / 1024).toFixed(0)
                , shard = await int.client.shard.broadcastEval((client) => ({ sunucu: client.guilds.cache.size, kanal: client.channels.cache.size, kullanıcı: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0), rol: client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0), ramkullanımı: process.memoryUsage().heapUsed }))
                , ramkullanımı = (shard.reduce((acc, shards) => acc + shards.ramkullanımı, 0) / 1024 / 1024).toFixed(1)
                , sunucu = shard.map(a => a.sunucu).reduce((acc, guild) => acc + guild, 0)
                , kanal = shard.map(a => a.kanal).reduce((acc, kanal) => acc + kanal, 0)
                , kullanıcı = shard.map(a => a.kullanıcı).reduce((acc, kullanıcı) => acc + kullanıcı, 0)
                , rol = shard.map(a => a.rol).reduce((acc, rol) => acc + rol, 0)
                , dugme = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Beni davet et").setEmoji("💌").setStyle(5).setURL(ayarlar.davet)).addComponents(new ButtonBuilder().setEmoji("💗").setLabel("Oy ver").setURL(`https://top.gg/bot/${msg.client.user.id}/vote`).setStyle(5)).addComponents(new ButtonBuilder().setStyle(5).setLabel("Destek sunucum").setEmoji("🎉").setURL(ayarlar.discord))
            if (ayarlar.web) dugme.addComponents(new ButtonBuilder().setLabel("Web sitesi").setEmoji("💯").setStyle(5).setURL(ayarlar.web))
            let embed = new EmbedBuilder()
                .setAuthor({ name: ben.username, iconURL: ben.displayAvatarURL() })
                .setDescription(`⏲️ **Son yeniden başlatma:**  <t:${(int.client.readyTimestamp / 1000).toFixed(0)}:F> - <t:${(int.client.readyTimestamp / 1000).toFixed(0)}:R>`)
                .addFields(
                    {
                        name: "BOT BİLGİLERİ",
                        value: `✏️ **Kullanıcı adım:**  ${ben.tag}\n🆔 **Discord ID:**  ${int.client.user.id}\n📅 **Kuruluş tarihim:**  <t:${(int.client.user.createdTimestamp / 1000).toFixed(0)}:F>\n🎚️ **Ram kullanımı:**  ${ramkullanımı} mb - %${yüzde}`,
                        inline: true
                    },
                    {
                        name: "GECİKME BİLGİLERİM",
                        value: `📡 **Botun ana gecikmesi:**  ${int.client.ws.ping} ms\n📨 **Mesaj gecikmesi:**  ${(int.createdTimestamp - zaman)} ms\n📁 **Database gecikmesi:**  ${db.ping()} ms`,
                        inline: true
                    },
                    {
                        name: "GELİŞTİRİCİLERİM",
                        value: `👑 **${(await int.client.fetchUserForce(ayarlar.sahip))?.tag || "Deleted User#0000"} - ${ayarlar.sahip}** (Yapımcı)`
                    },
                    {
                        name: "SUNUCU BİLGİLERİ",
                        value: `💻 **Sunucu sayısı:**  ${sunucu.toLocaleString().replace(/\./g, ",")}\n👥 **Kullanıcı sayısı:**  ${kullanıcı.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.kanal} **Kanal sayısı:**  ${kanal.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.rol} **Rol sayısı:**  ${rol.toLocaleString().replace(/\./g, ",")}`,
                        inline: true
                    },
                    {
                        name: "VERSİYONLAR",
                        value: `🎛️ **Node.js versiyon:**  ${process.version}\n🔨 **Discord.js versiyon:**  v${version}\n📒 **Database versiyon:**  v${ayarlar.database}\n${ayarlar.emoji.pp} **${int.client.user.username} versiyon:**  ${ayarlar.versiyon}`,
                        inline: true
                    },
                    {
                        name: "VDS BİLGİLERİ",
                        value: `📝 **VDS adı:**  ${int.client.user.username} Bot VDS\n🖥️ **Windows sürümü:**  Windows 10 (64 bit)\n🎞️ **CPU:**  ${os.cpus().map(i => i.model)[0]}\n🔋 **Toplam ram:**  ${toplamram} mb (**Serbest:** ${(boştaolanram / 1024 / 1024).toFixed(0)} mb)`
                    }
                )
                .setColor("#1536d8")
                .setTimestamp()
            int.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}