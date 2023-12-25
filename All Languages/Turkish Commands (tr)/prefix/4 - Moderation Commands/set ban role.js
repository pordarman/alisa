"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "banyetkili", // Komutun ismi
    id: "banyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "banyetkili",
        "banyetkilirolü",
        "banauth",
    ],
    description: "Ban yetkili rolü ayarlarsınız", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>banyetkili <@rol veya Rol ID'si>", // Komutun kullanım şekli
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

        // Eğer ayarlanan ban rolünü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.banAuth) return errorEmbed("Ban yetkili rolü zaten sıfırlanmış durumda");

            roleIds.banAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Ban yetkili rolü başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• Ban yetkili rolünü ayarlamak için **${prefix}${this.name} @rol**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`Etiketlediğiniz rol bot rolüdür. Lütfen başka bir rol etiketleyiniz`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (role.id == roleIds.banAuth) return errorEmbed("Ban yetkili rolü zaten etiketlediğiniz rolle aynı");

        roleIds.banAuth = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra kişileri sadece <@&${role.id}> rolüne sahip olanlar veya Üyeleri banlama yetkisine sahip olanlar banlayabilecek`,
            "success"
        );

    },
};