"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kickyetkili", // Komutun ismi
    id: "kickyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kickyetkili",
        "kickyetkilirolü",
        "kickauth",
    ],
    description: "Kick yetkili rolü ayarlarsınız", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kickyetkili <@rol veya Rol ID'si>", // Komutun kullanım şekli
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
        const roleIds = guildDatabase.moderation.roleIds;

        // Eğer ayarlanan kick rolünü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.kickAuth) return errorEmbed("Kick yetkili rolü zaten sıfırlanmış durumda");

            roleIds.kickAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Kick yetkili rolü başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• Kick yetkili rolünü ayarlamak için **${prefix}${this.name} @rol**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`Etiketlediğiniz rol bot rolüdür. Lütfen başka bir rol etiketleyiniz`);

        // Eğer etiketlediği rol kick yetkili rolüyle aynıysa hata döndür
        if (role.id == roleIds.kickAuth) return errorEmbed("Kick yetkili rolü zaten etiketlediğiniz rolle aynı");

        roleIds.kickAuth = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra kişileri sadece <@&${role.id}> rolüne sahip olanlar veya Üyeleri atma yetkisine sahip olanlar atabilecek`,
            "success"
        );

    },
};