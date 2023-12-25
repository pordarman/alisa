"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "isim", // Komutun ismi
    id: "isim", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "isim",
        "i",
        "ismideğiştir",
        "isimdeğiştir",
        "changename",
        "name",
        "n"
    ],
    description: "Kullanıcının ismini değiştirmeye yarar", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>isim <@kişi veya Kişi ID'si> <Yeni ismi>", // Komutun kullanım şekli
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
        language
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        const content = args.join(" ");

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);
        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer sunucu sahibinin ismini değiştirmeye çalışıyorsa 
        if (memberId === guild.ownerId) return errorEmbed(`Sunucu sahibinin ismini değiştiremem şapşik şey seni :(`);

        // Eğer kendi ismini değiştirmeye çalışıyorsa ve yetkisi yoksa
        if (memberId === authorId && !msgMember.permissions.has("ChangeNickname")) return errorEmbed(`Kendi ismini değiştiremezsin şapşik şey seni :(`);

        // Eğer etiketlediği kişinin rolünün sırası bottan yüksekse hata döndür
        const highestRole = guildMe.roles.highest;
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= highestRole.position && memberId !== guildMe.id) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        // Eğer kendi rolünün üstünde bir kişiyi değiştirmeye çalışıyorsa
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId !== guild.ownerId && memberId !== authorId) return errorEmbed(`Etiketlediğiniz kişinin sizin rolünüzden yüksek o yüzden onun ismini değiştiremezsiniz`);

        const guildTag = guildDatabase.register.tag;
        const customName = guildDatabase.register.customNames[member.user.bot ? "registerBot" : "register"];
        let memberName = content.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").trim();

        // Eğer kullanıcının ismini girmemişse hata döndür
        if (!memberName) return errorEmbed(
            `Lütfen ismini değiştireceğiniz kişinin ismini giriniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}i ${memberId} Fearless Crazy 20\n` +
            `• ${prefix}i <@${memberId}> Fearless Crazy 20\n` +
            `• ${prefix}i Fearless Crazy 20 <@${memberId}>`
        );

        let inputAge;

        // Eğer bir kişinin ismini değiştirmeye çalışıyorsa
        if (!member.user.bot) {

            // Kullanıcının ismindeki yaşı çek
            inputAge = memberName.match(Util.regex.fetchAge);

            // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
            if (!inputAge && guildDatabase.register.isAgeRequired) return errorEmbed("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!");

            // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
            const ageLimit = guildDatabase.register.ageLimit ?? -1;
            if (ageLimit > Number(inputAge?.[0])) return errorEmbed(`Heyyy dur bakalım orada! Bu sunucuda **${ageLimit}** yaşından küçükleri kayıt edemezsin!`);

            // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
            if (customName.search(/<(ya[sş]|age)>/) != -1) {
                memberName = memberName.replace(inputAge?.[0], "").replace(/ +/g, " ");
            }
        }
        memberName = Util.customMessages.registerName({
            message: customName,
            memberName,
            guildDatabase,
            inputAge,
            isBot: member.user.bot
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return errorEmbed("Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz");

        // Eğer kişinin ismi yazılan isimle aynıysa
        if (member.nickname === memberName) return errorEmbed(`<@${memberId}> adlı kişinin ismi yazdığınız isimle aynı zaten`);

        // Kullanıcıyı düzenle
        return await member.setNickname(memberName)
            // Eğer düzenleme başarılıysa
            .then(() => {
                msg.react(EMOJIS.yes);

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const NOW_TIME = Date.now();
                userLogs.unshift({
                    type: "changeName",
                    newName: memberName,
                    authorId,
                    timestamp: NOW_TIME
                });
                return database.writeFile(guildDatabase, guildId);

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`• <@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`)

                console.log(err)
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};