const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    aliases: "y",
    name: "yadd",
    owner: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let tip = args[0]
                , sec = args[1]
            if (!tip || !sec) return hata(`Lütfen komutu aşağıdaki gibi kullanınız\n\n**Örnek**\n• ${prefix}y [add/remove/change] [kod/yenilik/hata] <mesajınız>`)
            switch (tip) {
                case "r":
                case "remove":
                case "ç":
                case "çıkar":
                case "çıkart": {
                    let cikarilacakSayi = args[2]
                    if (!Time.isNumber(cikarilacakSayi)) return hata(`Lütfen geçerli bir sayı değeri giriniz`)
                    let cikarilacakSey
                    sw1: switch (sec) {
                        case "kod":
                        case "ko":
                        case "k":
                            cikarilacakSey = "k"
                            break sw1
                        case "yenilik":
                        case "y":
                        case "yeni":
                            cikarilacakSey = "y"
                            break sw1
                        case "hata":
                        case "h":
                            cikarilacakSey = "h"
                            break sw1
                        default:
                            return hata(`Lütfen geçerli bir seçenek giriniz **[kod/yenilik/hata]**`)
                    }
                    alisa.yenilik[cikarilacakSey] = alisa.yenilik[cikarilacakSey].slice(0, -cikarilacakSayi)
                }
                    break;
                case "e":
                case "ekle":
                case "a":
                case "add": {
                    let eklenecekSey
                    sw2: switch (sec) {
                        case "kod":
                        case "ko":
                        case "k":
                            eklenecekSey = "k"
                            break sw2
                        case "yenilik":
                        case "y":
                        case "yeni":
                            eklenecekSey = "y"
                            break sw2
                        case "hata":
                        case "h":
                            eklenecekSey = "h"
                            break sw2
                        default:
                            return hata(`Lütfen geçerli bir seçenek giriniz **[kod/yenilik/hata]**`)
                    }
                    let mesaj = args.slice(2).join(" ")
                    if (!mesaj) return hata(`Lütfen bir mesaj giriniz`)
                    alisa.yenilik[eklenecekSey].unshift(mesaj)
                    alisa.yenilik.ts = Time.msToDate()
                }
                    break;
                case "c":
                case "change":
                case "d":
                case "değiştir":
                case "ch": {
                    let degistirilecekSayi = args[2]
                    if (!Time.isNumber(degistirilecekSayi)) return hata(`Lütfen geçerli bir sayı değeri giriniz`)
                    let degistirilecekSey
                    sw1: switch (sec) {
                        case "kod":
                        case "ko":
                        case "k":
                            degistirilecekSey = "k"
                            break sw1
                        case "yenilik":
                        case "y":
                        case "yeni":
                            degistirilecekSey = "y"
                            break sw1
                        case "hata":
                        case "h":
                            degistirilecekSey = "h"
                            break sw1
                        default:
                            return hata(`Lütfen geçerli bir seçenek giriniz **[kod/yenilik/hata]**`)
                    }
                    if (alisa.yenilik[degistirilecekSey].length < degistirilecekSayi) return hata(`Lütfen daha küçük bir sayı girmeyi deneyiniz`)
                    let mesaj = args.slice(3).join(" ")
                    if (!mesaj) return hata(`Lütfen bir mesaj giriniz`)
                    alisa.yenilik[degistirilecekSey][degistirilecekSayi - 1] = mesaj
                }
                    break;
                default:
                    return hata(`Lütfen geçerli bir seçenek giriniz **[add/remove/change]**`)
            }
            msg.react(ayarlar.p).catch(err => { })
            db.yazdosya(alisa, "alisa", "diğerleri")
        } catch (e) {
            msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
            console.log(e)
        }
    }
}