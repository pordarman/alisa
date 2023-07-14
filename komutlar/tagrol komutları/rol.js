const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "tagrol rol",
    aliases: ["tagrol-rol"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            let tagroldb = msg.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
            if (args[0] === "sıfırla") {
                if (!tagroldb.rol) return hata('Tagrol rolü zaten sıfırlanmış durumda')
                delete tagroldb.rol
                hata('Tagrol rolü başarıyla sıfırlandı', "b")
                db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
                return;
            }
            const rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Tag rolü ayarlamak için **${prefix}tagrol-rol @rol**\n\n• Sıfırlamak için ise **${prefix}tagrol-rol sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (tagroldb.rol === rolid) return hata('Etiketlediğiniz rol zaten tag alan üyelere verilecek olan rol')
            if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem! Lütfen başka bir rol etiketleyiniz`)
         
            tagroldb.rol = rolid
            hata('Bundan sonra tag alan kişilere <@&' + rolid + '> adlı rolü vereceğim ', "b")
            db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


