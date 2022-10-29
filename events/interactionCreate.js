const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, TextInputBuilder, ModalBuilder, BaseInteraction } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {BaseInteraction} int 
     */
    async run(int) {
        let sahipid = int.user.id
            , alisa = db.buldosya("alisa", "diğerleri")
        let karaliste = alisa.kl[sahipid]
        if (karaliste && (karaliste.sure ? karaliste.sure > Date.now() : true) && !ayarlar.sahipler.includes(sahipid)) {
            if (karaliste.sure) return;
            if (!karaliste.isSee) {
                int.reply({ content: `• Üzgünüm, botun __bazı__ kurallarını ihlal ederek botun komutlarına erişim iznin kaldırıldı :(\n• Bundan sonra botun hiçbir komutlarına erişemeyeceksin...\n\n**• Eğer bir hata yaptığımızı düşünüyorsan botun destek sunucusuna gelip neden ban yediğini sorgulayabilirsin**\n• ${ayarlar.discord}`, ephemeral: true }).then(() => {
                    karaliste.isSee = true
                    db.yazdosya(alisa, "alisa", "diğerleri")
                }).catch(err => { })
            }
            return;
        }
        let sunucuid = int.guildId
        if (int.isChatInputCommand()) {
            let komut = int.client.slash.get(int.commandName)
            if (!komut) return;
            alisa.kullanımlar[komut.name].slash += 1
            let kisivarmıdatabasede2 = alisa.kisiler[sahipid] || 0
            kisivarmıdatabasede2 += 1
            alisa.kisiler[sahipid] = kisivarmıdatabasede2
            let sunucuvarmıdatabasede2 = alisa.skullanımlar[sunucuid] || 0
            sunucuvarmıdatabasede2 += 1
            alisa.skullanımlar[sunucuid] = sunucuvarmıdatabasede2
            db.yazdosya(alisa, "alisa", "diğerleri")
            async function slashHataMesaj(yazı, x = false) {
                const embed = new EmbedBuilder()
                switch (x) {
                    case false:
                        embed.setDescription(`${ayarlar.emoji.np} ${yazı}`).setColor("Red")
                        break;
                    case true:
                        embed.setDescription(`• ${yazı}`).setColor("Red")
                        break;
                    case "b":
                        return int.reply({ embeds: [embed.setDescription(`• ${yazı} ${ayarlar.emoji.p}`).setColor("Green")] }).catch(err => { })
                    case "yetki":
                        embed.setDescription(`${ayarlar.emoji.np} Bu komutu kullanabilmek için **${yazı}** yetkisine sahip olmalısın şapşik şey seni :(`).setColor("Red")
                        break;
                    case "yetkibot":
                        embed.setDescription(`${ayarlar.emoji.np} Bu komutu kullanabilmek için __benim__ **${yazı}** yetkisine sahip olmam lazım şapşik şey seni :(`).setColor("Red")
                        break;
                }
                return int.reply({ embeds: [embed], ephemeral: true }).catch(err => { })
            }
            try {
                return komut.run({ int, sunucudb: int.client.s(sunucuid), alisa, hata: slashHataMesaj, sunucuid, guild: int.guild })
            } catch (e) {

            }
        }
        if (int.isButton()) {
            if (int.customId.startsWith("NOT_")) return;
            let komut = int.client.butonlar.find(a => a.name == int.customId || int.customId.startsWith(a.name))
            if (!komut) return;
            async function slashHataMesaj(yazı, x = false) {
                const embed = new EmbedBuilder()
                switch (x) {
                    case false:
                        embed.setDescription(`${ayarlar.emoji.np} ${yazı}`).setColor("Red")
                        break;
                    case true:
                        embed.setDescription(`• ${yazı}`).setColor("Red")
                        break;
                    case "yetki":
                        embed.setDescription(`${ayarlar.emoji.np} Bu komutu kullanabilmek için **${yazı}** yetkisine sahip olmalısın şapşik şey seni :(`).setColor("Red")
                        break;
                    case "yetkibot":
                        embed.setDescription(`${ayarlar.emoji.np} Bu komutu kullanabilmek için __benim__ **${yazı}** yetkisine sahip olmam lazım şapşik şey seni :(`).setColor("Red")
                        break;
                }
                return int.reply({ embeds: [embed], ephemeral: true }).catch(err => { })
            }
            try {
                return komut.run({ int, sunucudb: int.client.s(sunucuid), alisa, hata: slashHataMesaj, sunucuid, guild: int.guild })
            } catch (e) {

            }
        }
        if (int.isSelectMenu()) {
            let komut = int.client.butonlar.find(a => int.values.find(ins => ins.startsWith(a.name)))
            if (!komut) return;
            try {
                return komut.run({ int, sunucudb: int.client.s(sunucuid), alisa, sunucuid, guild: int.guild })
            } catch (e) {

            }
        }
    }
}