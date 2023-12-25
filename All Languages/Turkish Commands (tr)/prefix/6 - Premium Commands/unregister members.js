"use strict";
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıtsızlar", // Komutun ismi
    id: "kayıtsızlar", // Komutun ID'si
    cooldown: 60, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıtsızlar",
        "kayıtsızüye",
        "kayıtsızüyeler"
    ],
    description: "Bütün kayıtsız üyeleri etiketler", // Komutun açıklaması
    category: "Premium komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıtsızlar", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
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

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kayıtsız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );

        const allMembers = await Util.getMembers(msg);

        const unregisteredMembers = allMembers.filter(member => member["_roles"].includes(unregisterRoleId));

        // Eğer hiç kimsede kayıtsız rolü yoksa
        if (unregisteredMembers.size == 0) return msg.reply(`• Bu sunucuda kimse kayıtsız değil oley!`);

        // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
        const arrayMembers = Util.splitMessage({
            arrayString: unregisteredMembers.map(member => `<@${member.id}>`),
            firstString: `• <@&${unregisterRoleId}>\n\n• **Kayıtsızlar (__${Util.toHumanize(unregisteredMembers.size, language)}__)**\n`,
            joinString: " | ",
            limit: 2000
        });

        // Bütün sayfaları teker teker mesaj olarak gönder
        for (let i = 0; i < arrayMembers.length; ++i) {
            await msg.channel.send(arrayMembers[i]);

            // 500 milisaniye bekle
            await Util.wait(500)
        }

    },
};