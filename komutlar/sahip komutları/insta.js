const fetch = require("node-fetch")
const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    kod: ["i", "insta", "instagram"],
    name: "insta",
    no: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let kullanıcıAdı = args[0]
            if (!kullanıcıAdı) return msg.reply({ content: `Lütfen bir kullanıcı adı giriniz` }).catch(err => { })
            const instagramFetch = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${kullanıcıAdı}`, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "tr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                    "sec-ch-ua": "\"Microsoft Edge\";v=\"105\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"105\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "sec-gpc": "1",
                    "x-asbd-id": "198387",
                    "x-csrftoken": "8Fte9fLuZEqy8bz8o8Jr6QMT1OAqZ0Cd",
                    "x-ig-app-id": "936619743392459",
                    "x-ig-www-claim": "hmac.AR2LEbxqM1B8nI343iz9MDa21vqkk0jHGy2whCWY9IA5sauR",
                    "x-instagram-ajax": "1006223955",
                    "cookie": "ig_nrcb=1; mid=YxEIbwALAAH1pRyO-ew2pQomD6ma; ig_did=19505470-51DB-409E-B62B-E001C8780A03; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=6791106647; datr=rggRY53WSwZgW0Q1QulKq1b3; dpr=0.8999999761581421; shbid=\"16541\\0546791106647\\0541694966105:01f710e4acc4dfa00008db84ce5aa4ef6bbd8a3a8d8218430056336ea8d4a0ca260ac89a\"; shbts=\"1663430105\\0546791106647\\0541694966105:01f70bdc204fbeb353a741a4766f8df30e884a3e731b3d9bec5a8e46f7ae2c889b0137de\"; csrftoken=8Fte9fLuZEqy8bz8o8Jr6QMT1OAqZ0Cd; sessionid=6791106647%3AB3Y8azah27n8rU%3A8%3AAYe8l70C4qY6o-lXvrHOyl3N1Tiwo73Azah-1mP7LQ; fbsr_124024574287414=GuK-p9k_Y8k84xPLGtSVM0GVWzf5o9CUdIrJ3ZtQ11M.eyJ1c2VyX2lkIjoiMTAwMDAwNTY3ODE1MTEzIiwiY29kZSI6IkFRQUpXSkdFRGxFZGRocEhfdzB6c2JIYnhTcHVNaEJRSHBwX2dMOWJvSTdPeUFTdmcxOUZvU1NHTTU1bmphMTlnS3ZpS0pJRzJIaU9zSTVXQlFhUkx3Wkw0SEJWTlBqM1dER0liaThPTTFsWTJMODUtWHhJWG9kNkxQTmFvMjAwcTgzaTZyQk5BZmN0MUE5OWRNUmI1SlRPSzhaYXgySm5DMlVtdjNOeTBqVEtDWnh3MklkN2VYbDJoMHZTWTN4QXZKZ3Y4dElnVzRWdEYtTzlDY3JtV2E4Ui10NUVsMGVTOThjc1VyWGhiVVFPTU93TlJkR0tTQjRidlQ3UW1qQjRKSlBKNWNENTNEc3luNW8wS0NoanhILUtuR09JRGRMOUZPcms5OTl4Y3AxTEx6WjVsVHpGQzF4eUVNM2g1eHVBTWxhUV9VNGxkZGlyNGtqN2licV9BRGJiIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUU0dVg5TDB4VVkyd2xTMFZaQkdxSTdRQW82dmEyaVpDc0Rjdk8xV3NaQlBaQ1cxcGIxZEdFRFpBcHZINHpLbWFlZURaQ0haQkFRU0ZkWDFHbkw4VXRpaGhuVXhpa0JYU3ZIcUZKS3FOWDZsTDB4UVRDMTlxclhRQUlQWkNCTlZ1S1VEOE4xeU9hWkNEWVVaQXBaQzF3YXBVRHdhM05tNnAzdGJaQVE5b0plMXY5QWsiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTY2MzU5NzAyNX0; rur=\"ASH\\0546791106647\\0541695133126:01f716aaf5765ef949f55ad596f06b4359f9b0cb50315a0948c4426c5e5587442c4bab21\"",
                    "Referer": "https://www.instagram.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            }).then(a => a.json()).catch(err => { })
            console.log(instagramFetch)
            if (!instagramFetch) return msg.reply({ content: `Girdiğiniz kullanıcı adı ile ilgili bir instagram kullanıcısı bulamadım! ` }).catch(err => { })
            if (!instagramFetch?.data?.user) return msg.reply({ content: `Kullanıcı çekilirken bir hata oluştu!` }).catch(err => { })
            let user = instagramFetch.data.user
                , pp = user.profile_pic_url_hd
                , embed = new EmbedBuilder()
                    .setAuthor({ name: user.full_name, iconURL: pp })
                    .setThumbnail(pp)
                    .setDescription(`**${user.biography || " "}\n\n__Hesap bilgileri__\n• Hesabın adı:**  [${kullanıcıAdı}](https://www.instagram.com/${kullanıcıAdı})\n**• Hesabın uzun adı:**  ${user.full_name}\n**• Hesabın ID'si:**  ${user.id}\n\n**• Hesap gizli mi:**  ${user.is_private ? "Evet" : "Hayır"}\n**• Hesap doğrulanmış mı:**  ${user.is_verified ? "Evet" : "Hayır"}\n**• Hesap profesyonel hesap mı:**  ${user.is_professional_account ? "Evet" : "Hayır"}\n**• Hesap iş hesabı mı:**  ${user.is_business_account ? "Evet" : "Hayır"}\n\n**• Biyografindeki web sitesi:**  ${user.external_url ? `__[Buraya tıkla](${user.external_url})__` : `~~[Buraya tıkla]~~`}`)
                    .setColor("Random")
                    .setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
            console.log(e)
        }
    }
}