const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    aliases: ["rolsuz", "rolsüz"],
    name: "rolsüz",
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let yetkilirolid = guildDatabase.kayıt.yetkili
            if (yetkilirolid) {
                if (!msgMember.roles.cache.has(yetkilirolid) && !msgMember.permissions.has("Administrator")) return hata(`<@&${yetkilirolid}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has("Administrator")) return hata(`Yönetici`, "yetki")
            
            if (["rolver", "ver", "ekle", "rolekle"].includes(args[0])) {
                if (!guildMe.permissions.has("ManageRoles")) return hata("Rolleri Yönet", "yetkibot")
                let rol = msg.mentions.roles.first() || guild.roles.cache.get(args[1] || guildDatabase.kayıt.kayıtsız)
                if (!rol) return hata(`Bu komutu kullanmak için ya bir rol etiketleyiniz ya da sunucuda kayıtsız rolünü ayarlayınız`)
                if (rol.position >= guildMe.roles.highest.position) return hata(`${rol.id == guildDatabase.kayıt.kayıtsız ? "Bu sunucudaki kayıtsız rolü " : "Etiketlediğiniz rol "}benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                let members = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && a.roles.cache.size == 1)
                    , size = members.size
                if (size == 0) return msg.reply({ content: `• Bu sunucuda hiç kimse rolsüz değil oley!` }).catch(err => { })
                let sure = Time.duration(size * 1200)
                    , pp = msg.client.user.displayAvatarURL()
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Rolsüzlere rol ver`, iconURL: pp })
                    .addFields(
                        {
                            name: "Bilgileri",
                            value: `**📋 Verilecek kişi sayısı:**  ${size}\n**🙋 Kalan kişi sayısı:**  ${size}\n**📥 Verilecek rol:**  <@&${rol.id}>\n**⏲️ Tahmini süre:**  ${sure}\n**📊 İşlem yüzdesi:**  %0`
                        },
                        {
                            name: "Kalan kişiler (" + size + ")",
                            value: members.map(a => `<@${a.id}>`).slice(0, 40).join(" | ")
                        }
                    )
                    .setColor("Blue")
                    .setThumbnail(pp)
                    .setTimestamp()
                msg.reply({ embeds: [embed] }).then(message => {
                    let i = 0
                    , date = Date.now()
                    members.forEach(async (uye) => {
                        await Time.wait(350)
                        await uye.roles.add(rol).then(() => {
                            let kl = guildDatabase.kl[uye.id] || []
                            kl.unshift({ type: "ka", author: msg.author.id, timestamp: Date.now() })
                            guildDatabase.kl[uye.id] = kl
                            i++
                            if (i == size) return message.edit({ embeds: [embed.setDescription("**• İşlem bitti!**").setFields({ name: "Bilgileri", value: `**📋 Verilen kişi sayısı:**  ${size}\n**🙋 Kalan kişi sayısı:**  0\n**📥 Verilen rol:**  <@&${rol.id}>\n**⏲️ Tahmini süre:**  0 saniye\n**📊 İşlem yüzdesi:**  %100` })] })
                            else if (Date.now() - 1500 > date) {
                                date = Date.now()
                                message.edit({ embeds: [embed.setFields({ name: "Bilgileri", value: `**📋 Verilecek kişi sayısı:**  ${size}\n**🙋 Kalan kişi sayısı:**  ${size - i}\n**📥 Verilecek rol:**  <@&${rol.id}>\n**⏲️ Tahmini süre:**  ${Time.duration((size - i) * 1200)}\n**📊 İşlem yüzdesi:**  %${(i / size * 100).toFixed(2)}`, name: "Kalan kişiler (" + members.size + ")", value: members.map(a => `<@${a.id}>`).slice(40).join(" | ") })] })
                            }
                            members.delete(uye.id)
                        }).catch(err => { })
                    })
                })
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            let members = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && a.roles.cache.size == 1)
            if (members.size == 0) return msg.reply({ content: `• Bu sunucuda hiç kimse rolsüz değil oley!` }).catch(err => { })
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Rolsüzleri bul`, iconURL: msg.client.user.displayAvatarURL() })
                .setDescription(`• Bu sunucuda rolleri olmayan toplam **${members.size}** kişi bulunuyor\n\n• Rolsüz kişilere rol vermek için **${prefix}rolsüz ver @rol** ${guildDatabase.kayıt.kayıtsız ? `ya da kayıtsız rolü vermek için **${prefix}rolsüz ver** ` : ""}yazabilirsiniz`)
                .setColor("Blue")
                .setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}