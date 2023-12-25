"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "yetkilirol", // Komutun ismi
    id: "yetkilirol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yetkilirol",
        "authrole",
        "authorizedrole"
    ],
    description: "Yetkili rolünü ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yetkilirol <@rol veya Rol ID'si>", // Komutun kullanım şekli
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
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan kayıtsız rolünü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.registerAuth) return errorEmbed("Kayıt yetkili rolü zaten sıfırlanmış durumda");

            roleIds.registerAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Kayıt yetkili rolü başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• Kayıt yetkili rolünü ayarlamak için **${prefix}${this.name} @rol**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );
        const rolId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (roleIds.registerAuth === rolId) return errorEmbed("Kayıt yetkili rolü zaten etiketlediğiniz rolle aynı");

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`Etiketlediğiniz rol bir bot rolü. Lütfen başka bir rol etiketleyiniz`);

        // Eğer rol başka bir role daha aitse hata döndür
        if (roleIds.boy.includes(rolId)) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
        if (roleIds.girl.includes(rolId)) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki kızlara verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
        if (roleIds.normal.includes(rolId)) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
        if (roleIds.bot.includes(rolId)) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki botlara verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
        if (roleIds.unregister == rolId) return errorEmbed(`Etiketlediğiniz rol bu sunucudaki kayıtsız rolü. Lütfen başka bir rol etiketleyiniz`);

        roleIds.registerAuth = rolId;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra üyeleri sadece **Yönetici** yetkisine veya <@&${rolId}> rolüne sahip kişiler kayıt edebilecektir`,
            "success"
        );

    },
};