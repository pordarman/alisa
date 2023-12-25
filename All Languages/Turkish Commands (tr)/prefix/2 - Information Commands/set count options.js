"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "say-ayarlar", // Komutun ismi
    id: "say-ayarlar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "say-ayarlar",
        "sayayarlar",
        "countsetting",
        "countsettings"
    ],
    description: "Say komutunda gösterilecek verileri değiştirisiniz", // Komutun açıklaması
    category: "Bilgi komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>say-ayarlar <ekle veya çıkar> <veri>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Eğer bir şeyi yanlış girdiyse bilgilendirme mesajı için kullanılacak mesaj
        const options = `**• ${prefix}${this.name} [emojili/emojisiz]**\n\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] toplam =>** Sunucudaki üye sayısını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] üyeler =>** Sunucuda kaç ${guildDatabase.register.type == "normal" ? "üye" : "erkek, kız"} ve kayıtsız üye olduğunu gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] taglıüye =>** Sunucudaki taglı üye sayısını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] sesliüye =>** Sesli kanallarda kaç kişi olduğunu gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] boost =>** Sunucuda kaç boost ve kaç kişinin boost bastığını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] vipüye =>** Sunucudaki vip üye sayısını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] kayıtyetkili =>** Sunucuda kayıt yetkilisi rolüne sahip üye sayısını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] jailüyeler =>** Sunucudaki jail rolüne sahip üye sayısınını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] jailyetkili =>** Sunucuda jail yetkilisi rolüne sahip üye sayısını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] banyetkili =>** Sunucuda ban yetkilisi rolüne sahip üye sayısını gösterir\n` +
            `**• ${prefix}${this.name} [ekle/çıkar] kickyetkili =>** Sunucuda kick yetkilisi rolüne sahip üye sayısını gösterir`;

        const {
            datas,
            isEmoji
        } = guildDatabase.countCommandSettings;

        const dataToString = {
            total: "Sunucudaki toplam üye sayısı",
            registered: "Kayıtlı ve kayıtsız üye sayısı",
            tagged: "Taglı üye sayısı",
            voice: "Sesdeki üye sayısı",
            boostCount: "Sunucudaki boost sayısı",
            vip: "Vip üye sayısı",
            registerAuth: "Kayıt yetkilisi üye sayısı",
            jail: "Jail üye sayısı",
            jailAuth: "Jail yetkilisi üye sayısı",
            vipAuth: "Vip yetkilisi üye sayısı",
            banAuth: "Ban yetkili üye sayısı",
            kickAuth: "Kick yetkili üye sayısı",
            muteAuth: "Mute yetkili üye sayısı"
        };

        // Girilen veriye göre hangi seçeneği değiştireceğini gösteren fonksiyon
        function codeFromText(text) {
            switch (text) {

                case "toplam":
                case "total":
                case "membercount":
                    return "total";

                case "üyeler":
                case "uyeler":
                case "üye":
                case "uye":
                    return "registered";

                case "taglıüye":
                case "tagliuye":
                case "tag":
                    return "tagged";

                case "sesliüye":
                case "sesliuye":
                case "sesli":
                case "ses":
                    return "voice";

                case "boost":
                    return "boostCount";

                case "vipüye":
                case "vipuye":
                case "vip":
                    return "vip";

                case "kayıtyetkili":
                case "kayıt":
                case "kayıtyetkilisi":
                    return "registerAuth";

                case "jailüyeler":
                case "jailuyeler":
                case "jail":
                case "jaildekiler":
                    return "jail";

                case "jailyetkili":
                case "jailyetkilisi":
                    return "jailAuth";

                case "vipyetkili":
                case "vipyetkilisi":
                    return "vipAuth";

                case "banyetkili":
                case "ban":
                case "banyetkilisi":
                    return "banAuth";

                case "kickyetkili":
                case "kick":
                case "kickyetkilisi":
                    return "kickAuth";

                case "mute":
                case "muteyetkilisi":
                case "muteyetkili":
                    return "muteAuth";

            }
        }

        // Say komutunda gösterilecek verileri döndüren fonksiyon
        function showInfosInCountCommand(datas) {
            let resultArray = [];

            for (const key in datas) {

                // Eğer değer "false" ise döngüyü geç
                if (!datas[key]) continue;

                resultArray.push(
                    dataToString[key]
                )
            }
            return resultArray;
        }

        // Hangi veriyi ekleyip çıkacağını belirten switch
        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer veri ekleyecekse
            case "ekle":
            case "add":
            case "e": {
                let addType = codeFromText(args[1]?.toLocaleLowerCase(language));

                // Eğer bir şey döndürülmemişse
                if (!addType) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
                    "warn",
                    45 * 1000 // Mesajı 45 saniye boyunca göster
                );

                // Eğer veriyi zaten gösteriyorsa
                if (datas[addType]) return errorEmbed(`**${prefix}say** komutunda yazdığınız __${dataToString[addType]}nı__ zaten gösteriyorum`);

                // Database'ye kaydet
                datas[addType] = true
                database.writeFile(guildDatabase, guildId);

                // Say komutunda hangi verilerin gösterileceğini gösteren fonksiyon
                const showCommands = showInfosInCountCommand(datas);

                return errorEmbed(
                    `**${prefix}say** komutunda artık __${dataToString[addType]}__ da gösteriyoruumm!!\n\n` +
                    `**Say komutunda gösterilecek veriler**\n` +
                    `• ${showCommands.join("\n• ")}`,
                    "success"
                );
            }

            // Eğer bir veriyi çıkartacaksa
            case "çıkar":
            case "kaldır":
            case "ç":
            case "k":
            case "çıkart": {
                let removeType = codeFromText(args[1]?.toLocaleLowerCase(language));

                // Eğer bir şey döndürülmemişse
                if (!removeType) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
                    "warn",
                    45 * 1000 // Mesajı 45 saniye boyunca göster
                );

                // Eğer veriyi zaten göstermiyorsa
                if (!datas[removeType]) return errorEmbed(`**${prefix}say** komutunda yazdığınız __${dataToString[removeType]}nı__ zaten göstermiyorum`);

                // Database'ye kaydet
                datas[removeType] = false;
                database.writeFile(guildDatabase, guildId);

                // Say komutunda hangi verilerin gösterileceğini gösteren fonksiyon
                const showCommands = showInfosInCountCommand(datas);

                return errorEmbed(
                    `**${prefix}say** komutunda artık __${dataToString[removeType]}__ göstermiyorum!!\n\n` +
                    `**Say komutunda gösterilecek veriler**\n` +
                    `• ${showCommands.join("\n• ")}`,
                    "success"
                );
            }

            // Eğer komutu emojili yapmak istiyorsa
            case "emojili": {
                // Eğer zaten emojili ise
                if (isEmoji) return errorEmbed(`Bu sunucuda **${prefix}say** emoji ayarım zaten __emojili__ durumda`);

                // Database'ye kaydet
                guildDatabase.countCommandSettings.isEmoji = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Bu sunucudaki **${prefix}say** komutum artık __emojili__ halde!`, "success");
            }

            // Eğer emojisiz yapmak istiyorsa
            case "emojisiz": {
                // Eğer zaten emojili ise
                if (!isEmoji) return errorEmbed(`Bu sunucuda **${prefix}say** emoji ayarım zaten __emojisiz__ durumda`);

                // Database'ye kaydet
                guildDatabase.countCommandSettings.isEmoji = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Bu sunucudaki **${prefix}say** komutum artık __emojisiz__ halde!`, "success");
            }

            // Eğer geçersiz bir veri girmişse
            default:
                return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
                    "warn",
                    45 * 1000 // Mesajı 45 saniye boyunca göster
                );
        }

    },
};