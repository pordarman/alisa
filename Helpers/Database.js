const fs = require("fs");
const {
    prefix: defaultPrefix
} = require("../settings.json");

const databasePath = __dirname.replace(/\w+$/, "Database\\Guilds");
const othersPath = __dirname.replace(/\w+$/, "Database\\Others");

class Database {


    get defaultGuildDatabase() {
        return {
            prefix: defaultPrefix, // Sunucunun varsayılan prefixi
            language: "tr", // Sunucunun dili

            register: { // Kayıt verileri

                authorizedInfos: {}, // Kayıt yapan yetkili verileri

                roleIds: { // Rol ID'leri

                    boy: [], // Erkek rolü ID'leri
                    girl: [], // Kız rolü ID'leri
                    normal: [], // Üye rolü ID'leri
                    bot: [], // Bot rolü ID'leri
                    registerAuth: "", // Yetkili rol ID'si
                    unregister: "" // Kayıtsız üye ID'si
                },
                channelIds: { // Kanal ID'leri

                    register: "", // Kayıt kanalı ID'si
                    log: "", // Kayıt log kanalı ID'si
                    afterRegister: "", // Kayıt sonrası atılacak kanal ID'si
                },
                type: "gender", // Kayıtın türü
                isRegisterOff: false, // Kaydın kapalı olup olmadığı
                isAutoRegisterForBot: true, // Botların otomatik kayıt yapılıp yapılmadığı
                isAutoCorrectOn: true, // İsim düzeltmesi
                isAgeRequire: false, // Yaş girmenin zorunlu olup olmadığı
                lastRegisters: [], // Son yapılan kayıtlar
                customNames: { // Özel isimler

                    register: "<tag> <name>", // Kayıt yapılırken düzenelecek isim
                    registerBot: "<tag> <name>", // Bot kayıt yapılırken düzenelecek isim
                    guildAdd: "<tag> <name>", // Kullanıcı sunucuya giriş yapınca düzenlenecek isim
                    guildAddBot: "<tag> <name>", // Bot sunucuya giriş yapınca düzenlenecek isim
                },
                customLogin: { // Özel giriş mesajı
                    content: "",
                    image: "",
                    isEmbed: false,
                },
                customAfterRegister: { // Özel kayıt sonrası mesajı
                    content: "",
                    image: "",
                    isEmbed: false,
                },
                prevNamesOfMembers: {}, // Üyelerin önceki isimleri
            },

            moderation: { // Moderasyon verileri

                nowMutedMembers: {}, // Şu anda susturulmuş üyeler ve süresinin açılmasını bekleyen üyeler
                penaltyNumber: 1, // Ceza numarası

                roleIds: { // Rol ID'leri

                    banAuth: "", // Ban yetkili rol ID'si
                    kickAuth: "", // Kick yetkili rol ID'si
                    muteAuth: "", // Mute yetkili rol ID'si
                },

                channelIds: { // Kanal ID'leri

                    modLog: "" // Moderasyon log kanalı ID'si
                }
            },

            roleIds: { // Rol ID'leri

                vip: "", // VIP rol ID'si
                vipAuth: "", // VIP yetkili rol ID'si
            },

            channelIds: { // Kanal ID'leri

                voice: "", // Botun katılacağı ses kanalı ID'si
            },

            suspicious: { // Şüpheli verileri

                autoSuspicious: false, // Otomatik olarak şüpheliye atılıp atılmayacağı
                role: "" // Şüpheli kişilere verilecek rol ID'si
            },

            waitMessageCommands: { // Mesaj bekleyen komut verilerini burda tutuyoruz

                buttonRegister: {}, // Butonla kayıt edilen üyeler
                changeName: {}, // Butonla ismi düzenlenen üyeler
            },

            snipe: {}, // Snipe verileri

            jail: { // Jail verileri

                nowJailedMembers: {}, // Şu anda Jail'e atılmış ve süresinin açılmasını bekleyen üyeler
                roleId: "", // Jail rol ID'si
                authRoleId: "", // Jail yetkili rol ID'si
                logChannelId: "", // Jail log kanalı ID'si
                userLogs: {}, // Jail kullanıcı verileri
                last: [], // Jaile atılan son kişiler
                prevRoles: {}, // Jaile atılan kullanıcıların rol verileri
            },
            premium: { // Premium verileri

                partnerRoleId: "", // Partner rol ID'si
                authorizedRoleIds: [], // Yetkili rol ID'leri
            },

            userLogs: {}, // Kullanıcının verileri

            autoResponse: {}, // Otomatik cevap verileri

            countCommandSettings: {
                datas: {
                    total: true,
                    registered: true,
                    tagged: true,
                    voice: true,
                    boostCount: true,
                    vip: false,
                    jail: false,
                    registerAuth: false,
                    jailAuth: false,
                    vipAuth: false,
                    banAuth: false,
                    kickAuth: false,
                    muteAuth: false
                },
                isEmoji: true
            },
            afk: {}
        }
    }

    /**
     * 
     * MAIN METHOTS
     * 
     */

    /**
     * .json formatındaki dosyayı JSON formatında döndürür
     * @param {String} fileName - Dosyanın adı
     * @param {"database"|"other"} filePath - Dosyanın yolu
     * @returns {Object}
     */

    getFile(fileName, filePath = "database") {
        try {
            const file = JSON.parse(
                fs.readFileSync(`${(filePath == "database" ? databasePath : othersPath)}\\${fileName}.json`, "utf-8")
            );
            return file;
        } catch (error) {
            // Eğer sunucu databasesini çekmeye çalışıyorsa ve öyle bir database yoksa sunucu ID'sine göre database oluştur
            if (error.errno == -4058 && filePath == "database") {
                this.writeFile(this.defaultGuildDatabase, fileName, filePath);
                return this.defaultGuildDatabase;
            }
            console.error(error);
            return false;
        }
    }



    /**
     * .json formatındaki dosyayı girdiğiniz veri ile değiştirir
     * @param {Object} newData - Yazılacak dosyanın verisi
     * @param {String} fileName - Dosyanın adı
     * @param {"database"|"other"} filePath - Dosyanın yolu
     * @returns 
     */
    writeFile(newData, fileName, filePath = "database") {
        try {
            fs.writeFileSync(
                `${(filePath == "database" ? databasePath : othersPath)}\\${fileName}.json`,
                JSON.stringify(newData, null, 4)
            );
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }


}


module.exports = new Database();