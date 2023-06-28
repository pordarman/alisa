const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    aliases: ["vip"],
    name: "vip",
    cooldown: 5,
    type: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            switch (args[0]?.toLocaleLowerCase()) {
                case "role":
                case "viprol":
                case "vrol":
                case "rol": {

                    // Kontroller
                    if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")


                    if (args[1] === "sıfırla") {
                        if (!guildDatabase.kayıt.vrol) return hata("Vip rolü zaten sıfırlanmış durumda")
                        delete guildDatabase.kayıt.vrol
                        hata("Vip rolü başarıyla sıfırlandı", "b")
                        db.yazdosya(guildDatabase, guildId)
                        return;
                    }
                    const rol = msg.client.fetchRole(args.join(" "), msg)
                    if (!rol) return hata(`Vip rolü ayarlamak için **${prefix}vip rol @rol**\n\• Sıfırlamak için ise **${prefix}vip rol sıfırla** yazabilirsiniz`, "ne")
                    const rolid = rol.id
                    if (guildDatabase.kayıt.vrol === rolid) return hata("Vip rolü zaten etiketlediğiniz rolle aynı")
                    if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
                    if (rolid == guildDatabase.kayıt.vyetkili) return hata(`Etiketlediğiniz rol bu sunucudaki vip yetkili rolü. Lütfen başka bir rol etiketleyiniz`)
                    
                    guildDatabase.kayıt.vrol = rolid
                    hata(`Vip rolü başarıyla <@&${rolid}> olarak ayarlandı`, "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }
                case "vipyetkilirol":
                case "yetkilirol":
                case "yetkili": {

                    // Kontroller
                    if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")


                    if (args[1] === "sıfırla") {
                        if (!guildDatabase.kayıt.vyetkili) return hata("Vip yetkili rolü zaten sıfırlanmış durumda")
                        delete guildDatabase.kayıt.vyetkili
                        hata("Vip yetkili rolü başarıyla sıfırlandı", "b")
                        db.yazdosya(guildDatabase, guildId)
                        return;
                    }
                    const rol = msg.client.fetchRole(args.join(" "), msg)
                    if (!rol) return hata(`Vip yetkili rolü ayarlamak için **${prefix}vip yetkili @rol**\n\n\n• Sıfırlamak için ise **${prefix}vip yetkili sıfırla** yazabilirsiniz`, "ne")
                    const rolidy = rol.id
                    if (guildDatabase.kayıt.vyetkili === rolidy) return hata("Vip rolü zaten etiketlediğiniz rolle aynı")
                    if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
                    if (rolidy == guildDatabase.kayıt.vrol) return hata(`Etiketlediğiniz rol bu sunucudaki vip rolü. Lütfen başka bir rol etiketleyiniz`)
                    
                    guildDatabase.kayıt.vyetkili = rolidy
                    hata("Vip yetkili rolü <@&" + rolidy + "> adlı rol oldu", "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }
                default: {

                    // Kontroller
                    if (!args[0]) return hata(`Bir kişiye vip rolünü vermek için **${prefix}vip @kişi**\n\n• Vip rolünü ayarlamak için **${prefix}vip rol @rol**\n\n• Vip yetkili rolünü ayarlamak için **${prefix}vip yetkili @rol** yazabilirsiniz`)
                    let kayıtyetkili = guildDatabase.kayıt.vyetkili
                    if (kayıtyetkili) {
                        if (!msgMember.roles.cache.has(kayıtyetkili) && !msgMember.permissions.has("Administrator")) return hata(`<@&${kayıtyetkili}> rolüne **veya** Yönetici`, "yetki")
                    } else if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")


                    let viprol = guildDatabase.kayıt.vrol
                    if (!viprol) return hata(`Bu sunucuda herhangi bir vip rolü __ayarlanmamış__${msgMember.permissions.has("Administrator") ? `\n\n• Ayarlamak için **${prefix}vip-rol ayarla @rol** yazabilirsiniz` : ""}`)
                    if (!guildMe.permissions.has("ManageRoles")) return hata("Rolleri Yönet", "yetkibot")
                    const kisi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg)
                    if (!kisi) return hata(Time.isNull(kisi) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\"sini giriniz")
                    if (kisi.bot) return hata("Botlara vip rolünü veremezsin şapşik şey seni :(")
                    if (kisi.roles.cache.has(viprol)) return hata(`Etiketlediğiniz kişide zaten vip rolü bulunuyor`)
                    if (guild.roles.cache.get(viprol).position >= guildMe.roles.highest.position) return hata(`<@&${viprol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                    
                    // Üyeyi VIP üye yapma
                    await kisi.roles.add(viprol).then(() => msg.react(ayarlar.emoji.p).catch(err => { })).catch(err => {
                        if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                        console.log(err)
                        msg.react(ayarlar.emoji.np).catch(err => { })
                        return msg.reply({ content: "Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n" + err + "```" }).catch(err => { })
                    })
                    return;
                }
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}