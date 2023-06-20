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
            let chsunucuid = ch.guildId
                , sunucudb = ch.client.guildDatabase(chsunucuid)
                , kanallar = []
            if (sunucudb.kayıt.kanal == ch.id) {
                delete sunucudb.kayıt.kanal
                db.yazdosya(sunucudb, chsunucuid)
                kanallar.push(`Kayıt kanalı`)
            }
            if (sunucudb.kayıt.günlük == ch.id) {
                delete sunucudb.kayıt.günlük
                db.yazdosya(sunucudb, chsunucuid)
                kanallar.push(`Kayıt günlük kanalı`)
            }
            if (sunucudb.kayıt.log == ch.id) {
                delete sunucudb.kayıt.log
                db.yazdosya(sunucudb, chsunucuid)
                kanallar.push(`Kayıt log kanalı`)
            }
            let tagroldb = ch.client.tagrolDatabase(chsunucuid)
            if (tagroldb.kanal == ch.id) {
                delete tagroldb.kanal
                db.yaz(chsunucuid, tagroldb, "tag rol", "diğerleri")
                kanallar.push(`Tagrol kanalı`)
            }
            if (tagroldb.log == ch.id) {
                delete tagroldb.log
                db.yaz(chsunucuid, tagroldb, "tag rol", "diğerleri")
                kanallar.push(`Tagrol log kanalı`)
            }
            if (sunucudb.jail.log == ch.id) {
                delete sunucudb.jail.log
                db.yazdosya(sunucudb, chsunucuid)
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
                    .setDescription(`• **${ch.guild.name} - (${chsunucuid})** sunucusundaki __${kanall}__ olan **#${ch.name}** adlı kanal silinmiştir. Lütfen başka bir kanal ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                (await ch.client.fetchUserForce(ch.guild.ownerId))?.send({ embeds: [embed] }).catch(err => { });
            }
        } catch (e) {

        }
    }
}