const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "şüpheli rol",
    kod: ["supheli-rol", "şüpheli-rol", "suphelirol", "şüpheli-rol"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            if (args[0] === "sıfırla") {
                if (!sunucudb.kayıt.otosrol) return hata('Şüpheli rolü zaten sıfırlanmış durumda')
                delete sunucudb.kayıt.otosrol
                hata('Şüpheli rolü başarıyla sıfırlandı', "b")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }
            let rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Şüpheli rolü ayarlamak için **${prefix}şüpheli-rol @rol**\n\n• Sıfırlamak için ise **${prefix}şüpheli-rol sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (sunucudb.kayıt.otosrol === rolid) return hata('Etiketlediğiniz rol zaten şüpheli üyelere verilecek olan rol')
            if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem! Lütfen başka bir rol etiketleyiniz`)
            sunucudb.kayıt.otosrol = rolid
            hata('Bundan sonra şüpheli olan kişilere <@&' + rolid + '> adlı rolü verilecek ', "b")
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


