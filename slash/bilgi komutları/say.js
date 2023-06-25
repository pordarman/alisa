const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "say",
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Sunucudaki üyeler hakkında bilgiler verir"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            let say = guildDatabase.say
                , veri = say.veri
                , keys = Object.keys(veri)
                , prefix = guildDatabase.prefix || ayarlar.prefix
            if (!keys.length) return hata(`Şeyyy... Bu sunucuda **${prefix}say** komutunda gösterilecek hiçbir şey __ayarlanmamış__${int.member.permissions.has("Administrator") ? `\n\n• Eğer say ayarlarını değiştirmek isterseniz **${prefix}say-ayarlar** yazabilirsiniz` : ""}`)
            let e = say.emoji
                , s
                , kayıt = guildDatabase.kayıt
                , toplamUye = veri.t
                , kayıtlıUyeler = veri.ü
                , taglıUyeler = veri.tag
                , sesliUyeler = veri.sü
                , boost = veri.b
                , vipUyeler = veri.vü
                , jailUyeler = veri.jü
                , kayıtYetkili = veri.ky
                , jailYetkili = veri.jy
                , banYetkili = veri.by
                , kickYetkili = veri.ay
                , addFields = []
                , uyeler = await int.client.getMembers(int)
            if (e) s = (number) => int.client.stringToEmojis(number)
            else s = (number) => `**${number}**`
            if (toplamUye || kayıtlıUyeler || taglıUyeler || sesliUyeler || vipUyeler || jailUyeler || boost) {
                let arrayUye = []
                if (toplamUye) arrayUye.push(`Sunucuda toplam ${s(guild.memberCount)} kişi bulunuyor`)
                if (kayıtlıUyeler) {
                    let kayıtsız = s(kayıt.kayıtsız ? guild.roles.cache.get(kayıt.kayıtsız)?.members?.size : "0")
                    if (guildDatabase.kayıt.secenek) arrayUye.push(`Sunucuda toplam ${s(kayıt.normal ? uyeler.filter(a => kayıt.normal?.every(b => a.roles.cache.has(b))).size : "0")} kayıtlı üye ve ${kayıtsız} kayıtsız üye bulunuyor`)
                    else arrayUye.push(`Sunucuda toplam ${s(kayıt.erkek ? uyeler.filter(a => kayıt.erkek?.every(b => a.roles.cache.has(b))).size : "0")} erkek üye, ${s(kayıt.kız ? uyeler.filter(a => kayıt.kız?.every(b => a.roles.cache.has(b))).size : "0")} kız üye ve ${kayıtsız} kayıtsız üye bulunuyor`)
                }
                if (taglıUyeler) {
                    let tag = kayıt.tag
                        , dis = kayıt.dis
                    arrayUye.push(`Sunucuda toplam ${s(uyeler.filter((member) => (tag ? member.user.username.includes(tag.slice(0, -1)) : false) || (dis ? member.user.discriminator == dis : false)).size.toString())} taglı üye bulunuyor`)
                }
                if (sesliUyeler) arrayUye.push(`Sesli kanallarda toplam ${s(uyeler.filter(a => !a.user.bot && a.voice.channelId).size)} üye bulunuyor`)
                if (boost) arrayUye.push(`Sunucuda toplam ${s(guild.premiumSubscriptionCount)} boost ve ${s(uyeler.filter(a => a.premiumSinceTimestamp).size)} boost basan üye bulunuyor`)
                if (vipUyeler) arrayUye.push(`Sunucuda toplam ${s(kayıt.vrol ? guild.roles.cache.get(kayıt.vrol)?.members?.size : "0")} vip üye bulunuyor`)
                if (jailUyeler) arrayUye.push(`Sunucuda toplam ${s(guildDatabase.jail.rol ? guild.roles.cache.get(guildDatabase.jail.rol)?.members?.size : "0")} kişi jailde`)
                addFields.push({ name: "__Sunucu bilgileri__", value: (e ? arrayUye.map(a => `${ayarlar.emoji.say} **${a}**`) : arrayUye.map(a => `${ayarlar.emoji.say} ${a}`)).join("\n\n") })
            }
            if (kayıtYetkili || jailYetkili || banYetkili || kickYetkili) {
                let arrayYetkili = []
                if (kayıtYetkili) arrayYetkili.push(`Sunucuda toplam ${s(kayıt.yetkili ? guild.roles.cache.get(kayıt.yetkili)?.members?.size : "0")} kayıt yetkilisi bulunuyor`)
                if (jailYetkili) arrayYetkili.push(`Sunucuda toplam ${s(guildDatabase.jail.yetkili ? guild.roles.cache.get(guildDatabase.jail.yetkili)?.members?.size : "0")} jail yetkilisi bulunuyor`)
                if (banYetkili) arrayYetkili.push(`Sunucuda toplam ${s(kayıt.bany ? guild.roles.cache.get(kayıt.bany)?.members?.size : "0")} ban yetkilisi bulunuyor`)
                if (kickYetkili) arrayYetkili.push(`Sunucuda toplam ${s(kayıt.kicky ? guild.roles.cache.get(kayıt.kicky)?.members?.size : "0")} kick yetkilisi bulunuyor`)
                addFields.push({ name: "__Yetkililer__", value: (e ? arrayYetkili.map(a => `${ayarlar.emoji.say} **${a}**`) : arrayYetkili.map(a => `${ayarlar.emoji.say} ${a}`)).join("\n\n") })
            }
            const pp = guild.iconURL()
            const embed = new EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: pp })
                .addFields(...addFields)
                .setColor('#611079')
                .setThumbnail(pp)
                .setTimestamp()
            if (int.member.permissions.has("Administrator")) embed.setDescription(`**• Say ayarlarını değiştirmek için __${prefix}say-ayarlar__ yazabilirsiniz**`)
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}