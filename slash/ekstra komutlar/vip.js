const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "vip",
    data: new SlashCommandBuilder()
        .setName("vip")
        .setDescription("Vip ile ilgili komutları görürsünüz")
        .addSubcommandGroup(subcommand => subcommand.setName('rol').setDescription('Vip rolünü ayarlar veya sıfırlarsınız').addSubcommand(sun => sun.setName("ayarla").setDescription("Vip rolünü ayarla").addRoleOption(role => role.setName("rol").setDescription("Rolü etiketle").setRequired(true))).addSubcommand(a => a.setName("sıfırla").setDescription("Vip rolünü sıfırla")))
        .addSubcommandGroup(subcommand => subcommand.setName('yetkili').setDescription('Vip yetkili rolünü ayarlar veya sıfırlarsınız').addSubcommand(sun => sun.setName("rol").setDescription("Vip yetkili rolünü ayarla").addRoleOption(role => role.setName("rol").setDescription("Rolü etiketle").setRequired(true))).addSubcommand(a => a.setName("sıfırla").setDescription("Vip yetkili rolünü sıfırla")))
        .addSubcommand(subcommand => subcommand.setName('ver').setDescription('Etiketlediğiniz üyeye Vip rolünü verirsiniz').addUserOption(user => user.setName("üye").setDescription("Üyeyi etiketle").setRequired(true))),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let option = int.options.getSubcommandGroup(false)
            , intMember = int.member
            , guildMe = int.guild.members.me
            switch (option) {
                case "rol": {
                    let rol = int.options.getSubcommand(false)
                    if (rol == "ayarla") {

                        // Kontroller
                        if (!intMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
                        const rol = int.options.getRole("rol", false)
                        const rolid = rol.id
                        if (sunucudb.kayıt.vrol === rolid) return hata('Vip rolü zaten etiketlediğiniz rolle aynı')
                        if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
                        if (rolid == sunucudb.kayıt.vyetkili) return hata(`Etiketlediğiniz rol bu sunucudaki vip yetkili rolü. Lütfen başka bir rol etiketleyiniz`)
                       
                        sunucudb.kayıt.vrol = rolid
                        db.yazdosya(sunucudb, sunucuid)
                        return hata(`Vip rolü başarıyla <@&${rolid}> olarak ayarlandı`, "b")
                    }
                    if (!sunucudb.kayıt.vrol) return hata('Vip rolü zaten sıfırlanmış durumda')
                  
                    delete sunucudb.kayıt.vrol
                    db.yazdosya(sunucudb, sunucuid)
                    return hata('Vip rolü başarıyla sıfırlandı', "b")
                }
                case "yetkili": {
                    let rol = int.options.getSubcommand(false)
                    if (rol == "rol") {

                        // Kontroller
                        if (!intMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
                        const rol = int.options.getRole("rol", false)
                        const rolid = rol.id
                        if (sunucudb.kayıt.vyetkili === rolid) return hata('Vip yetkili rolü zaten etiketlediğiniz rolle aynı')
                        if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
                        if (rolid == sunucudb.kayıt.vrol) return hata(`Etiketlediğiniz rol bu sunucudaki vip rolü. Lütfen başka bir rol etiketleyiniz`)
                      
                        sunucudb.kayıt.vyetkili = rolid
                        db.yazdosya(sunucudb, sunucuid)
                        return hata(`Vip yetkili rolü başarıyla <@&${rolid}> olarak ayarlandı`, "b")
                    }
                    if (!sunucudb.kayıt.vyetkili) return hata('Vip yetkili rolü zaten sıfırlanmış durumda')
                    delete sunucudb.kayıt.vyetkili
                    db.yazdosya(sunucudb, sunucuid)
                    return hata('Vip yetkili rolü başarıyla sıfırlandı', "b")
                }

                default:

                // Kontroller
                    let kayıtyetkili = sunucudb.kayıt.vyetkili
                    , prefix = sunucudb.prefix || ayarlar.prefix
                    if (kayıtyetkili) {
                        if (!intMember.roles.cache.has(kayıtyetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${kayıtyetkili}> rolüne **veya** Yönetici`, "yetki")
                    } else if (!intMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
                    let viprol = sunucudb.kayıt.vrol
                    if (!viprol) return hata(`Bu sunucuda herhangi bir vip rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}vip-rol ayarla @rol** yazabilirsiniz` : ""}`)
                    if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
                    const kisi = int.options.getMember("üye", true)
                    if (kisi.bot) return hata("Botlara vip rolünü veremezsin şapşik şey seni :(")
                    if (kisi.roles.cache.has(viprol)) return hata(`Etiketlediğiniz kişide zaten vip rolü bulunuyor`)
                    if (guild.roles.cache.get(viprol).position >= guildMe.roles.highest.position) return hata(`<@&${viprol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                    
                    // Üyeyi VIP üye yapma
                    await kisi.roles.add(viprol).then(() => hata(`<@${kisi.id}> adlı kişiye vip rolü başarıyla verildi`, "b")).catch(err => {
                        if (err?.code == 50013) return hata(`<@${kisi.id}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                        console.log(err)
                        return int.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```" }).catch(err => { })
                    })
                    break;
            }
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}