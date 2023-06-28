const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "unban",
    aliases: ["unban"],
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let banYetkili = guildDatabase.kayıt.bany
            if (banYetkili) {
                if (!msgMember.roles.cache.has(banYetkili) && !msgMember.permissions.has('BanMembers')) return hata(`<@&${banYetkili}> rolüne **veya** Üyeleri Yasakla`, "yetki")
            } else if (!msgMember.permissions.has('BanMembers')) return hata("Üyeleri Yasakla", "yetki")
            if (!guildMe.permissions.has("BanMembers")) return hata("Üyeleri Yasakla", "yetkibot")
            const member = msg.content.slice(msg.content.search(/(?<= *unban ).+/i))
            if (!member) return hata(`Lütfen yasaklanmasının kaldırılmasını istediğiniz kişinin ID\'sini, tag\'ını veya kullanıcı adını giriniz\n**BüYüK kÜçÜk HaRfLeRe DuYaRlIdIr**`)
            const uye = (await guild.bans.fetch()).find(a => [a.user.id, `<@!${a.user.id}>`, `<@${a.user.id}>`, a.user.tag, a.user.username].includes(member))
            if (!uye) return hata(`Yazdığınız ID veya isimle yasaklanmış bir üye bulamadım`)

            // Üyenin sunucudaki banını kaldırma
            await guild.members.unban(uye.user.id).then(member => {
                msg.reply({ content: `${ayarlar.emoji.p} **${uye.user.tag} - (${uye.user.id})** adlı kişinin yasaklanması başarıyla kaldırıldı!\n📝 **Yasaklanma sebebi:**  ${uye.reason || "Sebep belirtilmemiş"}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                let modLog = guildDatabase.kayıt.modl
                if (modLog) {
                    let date = (Date.now() / 1000).toFixed(0)
                        , kişininfotografı = member.displayAvatarURL()
                        , array = [
                            `**${ayarlar.emoji.kutlama} <@${member.id}> adlı üyeni yasaklanması kaldırıldı**`,
                            `\n🧰 **BANLANMASINI AÇAN YETKİLİ**`,
                            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                            `**• Banı açtığı tarih:**  <t:${date}:F> - <t:${date}:R>`,
                            `\n👤 **BANLANMASI AÇILAN ÜYE**`,
                            `**• Adı:**  <@${member.id}> - ${member.tag}`,
                            `**• Banlanma sebebi:**  ${uye.reason || "Sebep belirtilmemiş"}`,
                        ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.tag, iconURL: kişininfotografı })
                        .setDescription(array.join("\n"))
                        .setThumbnail(kişininfotografı)
                        .setColor("#b90ebf")
                        .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                        .setTimestamp()
                    guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                }
            }).catch(err => msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```" }).catch(err => { }))
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}