const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "rolleri al",
    data: new SlashCommandBuilder()
        .setName("kayıtsız")
        .setDescription("Etiketlediğiniz üyenin tüm rollerini alır ve kayıtsıza atar")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let yetkili = guildDatabase.kayıt.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            const prefix = guildDatabase.prefix || ayarlar.prefix
            if (guildDatabase.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata('Rolleri Yönet', "yetkibot")
            if (!guildMe.permissions.has('ManageNicknames')) return hata('Kullanıcı Adlarını Yönet', "yetkibot")
            let kayıtsizrolid = guildDatabase.kayıt.kayıtsız
            if (!kayıtsizrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            const kişi = int.options.getMember("üye", false)
            if (!kişi) return hata('Lütfen birisini etiketleyiniz')
            if (kişi.user.bot) return hata('Bu komut botlarda kullanılamaz')
            if (int.user.id === kişi.id) return hata('Bu komutu kendinde kullanamazsın şapşik şey seni :)')
            if (kişi.roles.highest.position >= intMember.roles.highest.position && int.user.id !== guild.ownerId) return hata('Kendi rolünden yüksek birisini kayıtsız yapamazsın')
            if (kişi.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            if (guild.roles.cache.get(kayıtsizrolid)?.position >= guildMe.roles.highest.position) return hata('Kayıtsız rolünün sırası benim benim rolümün sırasından yüksek olduğu için hiçbir işlem yapamadım')
            let rol
            if (guildDatabase.kayıt.secenek) rol = guildDatabase.kayıt.normal || []
            else rol = [...(guildDatabase.kayıt.erkek || []), ...(guildDatabase.kayıt.kız || [])]
            if (kişi.roles.cache.has(kayıtsizrolid) && !rol.some(a => kişi.roles.cache.has(a))) return hata('Etiketlediğiniz kişi zaten kayıtsız alınmış durumda')
            
            let kontroltag = guildDatabase.kayıt.tag, girişisim = guildDatabase.kayıt.isimler.giris, isim
            if (girişisim) isim = girişisim.replace(/<tag>/g, (kontroltag ? kontroltag.slice(0, -1) : "")).replace(/<isim>/g, kişi.user.username)
            else isim = `${kontroltag || ""}${kişi.user.username}`;
            (async () => {

                // Üyeyi kayıtsız yapma
                await kişi.edit({ roles: [kayıtsizrolid], nick: isim.slice(0, 32) }).then(() => {
                    let kl = guildDatabase.kl[kişi.id] || []
                    kl.unshift({ type: "ka", author: int.user.id, timestamp: Date.now() })
                    guildDatabase.kl[kişi.id] = kl
                    int.reply({ content: `• <@${kişi.user.id}> adlı kişiden tüm rolleri alıp başarıyla kayıtsız rolünü verdim`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }).catch(err => {
                    if (err?.code == 50013) return hata(`<@${kişi.id}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                    console.log(err)
                    return hata('Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```")
                })
            })()
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}