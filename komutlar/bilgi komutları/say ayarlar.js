const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 10,
    name: "say ayarlar",
    aliases: ["say-ayar", "say-ayarlar"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            
            let secenekler = [
                `**• ${prefix}say-ayarlar [emojili/emojisiz]**`,
                `\n**• ${prefix}say-ayarlar [ekle/çıkar] toplam =>**  Sunucudaki üye sayısını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] üyeler =>**  Sunucuda kaç ${guildDatabase.kayıt.secenek ? "üye" : "erkek, kız"} ve kayıtsız üye olduğunu gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] taglıüye =>**  Sunucudaki taglı üye sayısını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] sesliüye =>**  Sesli kanallarda kaç kişi olduğunu gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] boost =>**  Sunucuda kaç boost ve kaç kişinin boost bastığını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] vipüye =>**  Sunucudaki vip üye sayısını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] kayıtyetkili =>**  Sunucuda kayıt yetkilisi rolüne sahip üye sayısını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] jailüyeler =>**  Sunucudaki jail rolüne sahip üye sayısınını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] jailyetkili =>**  Sunucuda jail yetkilisi rolüne sahip üye sayısını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] banyetkili =>**  Sunucuda ban yetkilisi rolüne sahip üye sayısını gösterir`,
                `**• ${prefix}say-ayarlar [ekle/çıkar] kickyetkili =>**  Sunucuda kick yetkilisi rolüne sahip üye sayısını gösterir`,
            ]
                , tip = args[1]
                , obj = {
                    t: "Sunucudaki toplam üye sayısını",
                    ü: "Kayıtlı ve kayıtsız üye sayısını",
                    tag: "Taglı üye sayısını",
                    sü: "Sesdeki üye sayısını",
                    b: "Sunucudaki boost sayısını",
                    vü: "Vip üye sayısını",
                    ky: "Kayıt yetkilisi üye sayısını",
                    jü: "Jail rolüne sahip üye sayısını",
                    jy: "Jail yetkilisi üye sayısını",
                    by: "Ban yetkili üye sayısını",
                    ay: "Kick yetkili üye sayısını"
                }
            sw1: switch (args[0]) {
                case "ekle":
                case "add":
                case "e": {
                    let eklenecekSey
                    sw2: switch (tip) {
                        case "toplam":
                            eklenecekSey = "t"
                            break sw2;
                        case "üyeler":
                        case "üye":
                            eklenecekSey = "ü"
                            break sw2;
                        case "taglıüye":
                        case "tag":
                            eklenecekSey = "tag"
                            break sw2;
                        case "sesliüye":
                        case "sesli":
                        case "ses":
                            eklenecekSey = "sü"
                            break sw2;
                        case "boost":
                            eklenecekSey = "b"
                            break sw2;
                        case "vipüye":
                        case "vip":
                            eklenecekSey = "vü"
                            break sw2;
                        case "kayıtyetkili":
                        case "kayıt":
                        case "kayıtyetkilisi":
                            eklenecekSey = "ky"
                            break sw2;
                        case "jailüyeler":
                        case "jail":
                        case "jaildekiler":
                            eklenecekSey = "jü"
                            break sw2;
                        case "jailyetkili":
                        case "jailyetkilisi":
                            eklenecekSey = "jy"
                            break sw2;
                        case "banyetkili":
                        case "ban":
                        case "banyetkilisi":
                            eklenecekSey = "by"
                            break sw2;
                        case "kickyetkili":
                        case "kick":
                        case "kickyetkilisi":
                            eklenecekSey = "ay"
                            break sw2;
                        default:
                            return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${secenekler.join("\n")}`)
                    }
                    if (guildDatabase.say.veri[eklenecekSey]) return hata(`**${prefix}say** komutunda yazdığınız __${obj[eklenecekSey]}__ zaten gösteriyorum`)
                    guildDatabase.say.veri[eklenecekSey] = true
                    hata(`**${prefix}say** komutunda artık __${obj[eklenecekSey]}__ da gösteriyoruumm!!\n\n**Say komutunda gösterilecek veriler**\n• ${Object.keys(guildDatabase.say.veri).map(a => obj[a].replace("sayısını", "sayısı")).join(", ")}`, "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }
                case "çıkar":
                case "kaldır":
                case "ç":
                case "k":
                case "çıkart": {
                    let cikarilacakSey
                    sw3: switch (tip) {
                        case "toplam":
                            cikarilacakSey = "t"
                            break sw3;
                        case "üyeler":
                        case "üye":
                            cikarilacakSey = "ü"
                            break sw3;
                        case "taglıüye":
                        case "tag":
                            cikarilacakSey = "tag"
                            break sw3;
                        case "sesliüye":
                        case "sesli":
                        case "ses":
                            cikarilacakSey = "sü"
                            break sw3;
                        case "boost":
                            cikarilacakSey = "b"
                            break sw3;
                        case "vipüye":
                        case "vip":
                            cikarilacakSey = "vü"
                            break sw3;
                        case "kayıtyetkili":
                        case "kayıt":
                        case "kayıtyetkilisi":
                            cikarilacakSey = "ky"
                            break sw3;
                        case "jailüyeler":
                        case "jail":
                        case "jaildekiler":
                            cikarilacakSey = "jü"
                            break sw3;
                        case "jailyetkili":
                        case "jailyetkilisi":
                            cikarilacakSey = "jy"
                            break sw3;
                        case "banyetkili":
                        case "ban":
                        case "banyetkilisi":
                            cikarilacakSey = "by"
                            break sw3;
                        case "kickyetkili":
                        case "kick":
                        case "kickyetkilisi":
                            cikarilacakSey = "ay"
                            break sw3;
                        default:
                            return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${secenekler.join("\n")}`, "h", 45000)
                    }
                    if (!guildDatabase.say.veri[cikarilacakSey]) return hata(`**${prefix}say** komutunda yazdığınız __${obj[cikarilacakSey]}__ zaten göstermiyorum`)
                    delete guildDatabase.say.veri[cikarilacakSey]
                    hata(`**${prefix}say** komutunda artık __${obj[cikarilacakSey]}__ göstermiyorum\n\n**Say komutunda gösterilecek veriler**\n• ${Object.keys(guildDatabase.say.veri).map(a => obj[a].replace("sayısını", "sayısı")).join(", ")}`, "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }
                case "emojili":
                    if (guildDatabase.say.emoji) return hata(`Bu sunucuda **${prefix}say** emoji ayarım zaten __emojili__ durumda`)
                    guildDatabase.say.emoji = true
                    hata(`Bu sunucudaki **${prefix}say** komutum artık __emojili__ halde!`, "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                case "emojisiz":
                    if (!guildDatabase.say.emoji) return hata(`Bu sunucuda **${prefix}say** emoji ayarım zaten __emojisiz__ durumda`)
                    delete guildDatabase.say.emoji
                    hata(`Bu sunucudaki **${prefix}say** komutum artık __emojisiz__ halde!`, "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                default:
                    return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${secenekler.join("\n")}`, "h", 45000)
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


