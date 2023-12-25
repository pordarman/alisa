"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "şüphelirol", // Komutun ismi
    id: "şüphelirol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "şüphelirol",
        "şüpheli-rol",
        "suspiciousrole",
        "suspicious-role"
    ],
    description: "Şüpheli rolünü ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>şüphelirol <@rol veya Rol ID'si>", // Komutun kullanım şekli
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

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const content = args.join(" ");
        const suspicious = guildDatabase.suspicious;

        // Eğer ayarlanan kayıtsız rolünü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!suspicious.roleId) return errorEmbed("Şüpheli rolü zaten sıfırlanmış durumda");

            suspicious.roleId = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Şüpheli rolü başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• Şüpheli rolünü ayarlamak için **${prefix}${this.name} @rol**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );
        const rolId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (suspicious.roleId === rolId) return errorEmbed("Şüpheli rolü zaten etiketlediğiniz rolle aynı");

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`Etiketlediğiniz rol bir bot rolü. Lütfen başka bir rol etiketleyiniz`);

        suspicious.roleId = rolId;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra üyeleri sadece **Yönetici** yetkisine veya <@&${rolId}> rolüne sahip kişiler şüpheliye atabilecektir`,
            "success"
        );

    },
};