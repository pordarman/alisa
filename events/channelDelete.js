const { EmbedBuilder, GuildChannel } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "channelDelete",
    /**
     * 
     * @param {GuildChannel} ch 
     */
    async run(ch) {
        try {
            if (!ch.guild || ch.type !== 0) return;

            // Eğer kayıtlı olan bir kanal silinirse bunu sunucu sahibine iletir ve kayıtlı kanalın verisini siler
            let chguildId = ch.guildId
                , guildDatabase = ch.client.guildDatabase(chguildId)
                , kanallar = []
            if (guildDatabase.kayıt.kanal == ch.id) {
                delete guildDatabase.kayıt.kanal
                db.yazdosya(guildDatabase, chguildId)
                kanallar.push(`Kayıt kanalı`)
            }
            if (guildDatabase.kayıt.günlük == ch.id) {
                delete guildDatabase.kayıt.günlük
                db.yazdosya(guildDatabase, chguildId)
                kanallar.push(`Kayıt günlük kanalı`)
            }
            if (guildDatabase.kayıt.log == ch.id) {
                delete guildDatabase.kayıt.log
                db.yazdosya(guildDatabase, chguildId)
                kanallar.push(`Kayıt log kanalı`)
            }
            let tagroldb = ch.client.tagrolDatabase(chguildId)
            if (tagroldb.kanal == ch.id) {
                delete tagroldb.kanal
                db.yaz(chguildId, tagroldb, "tag rol", "diğerleri")
                kanallar.push(`Tagrol kanalı`)
            }
            if (tagroldb.log == ch.id) {
                delete tagroldb.log
                db.yaz(chguildId, tagroldb, "tag rol", "diğerleri")
                kanallar.push(`Tagrol log kanalı`)
            }
            if (guildDatabase.jail.log == ch.id) {
                delete guildDatabase.jail.log
                db.yazdosya(guildDatabase, chguildId)
                kanallar.push(`Jail log kanalı`)
            }
            if (kanallar.length) {
                kanallar = kanallar.join(", ")
                let lastindex = kanallar.lastIndexOf(",")
                    , kanall
                if (lastindex == -1) kanall = kanallar
                else kanall = kanallar.slice(0, lastindex) + " ve " + kanallar.slice(lastindex + 2)
                const embed = new EmbedBuilder()
                    .setTitle("Bilgilendirme")
                    .setDescription(`• **${ch.guild.name} - (${chguildId})** sunucusundaki __${kanall}__ olan **#${ch.name}** adlı kanal silinmiştir. Lütfen başka bir kanal ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                (await ch.client.fetchUserForce(ch.guild.ownerId))?.send({ embeds: [embed] }).catch(err => { });
            }
        } catch (e) {

        }
    }
}