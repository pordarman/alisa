"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kızrol", // Komutun ismi
    id: "kızrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kızrol",
        "kız-rol",
        "kız-rol-ayarla",
        "kızrolayarla",
        "girlrole",
        "girl-role",
        "setgirlrole",
        "set-girl-role"
    ],
    description: "Kız rollerini ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kızrol <@roller veya Rollerin ID'leri>", // Komutun kullanım şekli
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

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(
            `Kayıt türüm __**Normal Kayıt**__ olarak ayarlı\n\n` +
            `• Eğer kız ve erkek olarak kaydetmek isterseniz **${prefix}kayıttür cinsiyet** yazabilirsiniz`
        );

        const content = args.join(" ");
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan kız rolünü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (roleIds.girl.length == 0) return errorEmbed("Kızlara verilecek roller zaten sıfırlanmış durumda");

            roleIds.girl = [];
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Kızlara verilecek roller başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const allRoles = Util.fetchRoles(msg);
        if (allRoles.size == 0) return errorEmbed(
            `• Kız rollerini ayarlamak için **${prefix}${this.name} @rol @rol @rol**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer rollerin içinde bot rolü varsa hata döndür
        if (allRoles.some(role => role.managed)) return errorEmbed(`Botların oluşturduğu rolleri başkalarına veremem`);

        // Eğer rollerin içinde kayıtsız rolü varsa hata döndür
        const unregisterRoleId = roleIds.unregister
        if (allRoles.has(unregisterRoleId)) return errorEmbed(`Etiketlediğiniz [<@&${unregisterRoleId}>] adlı rol bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`);

        // Eğer rollerin içinde yetkili rolü varsa hata döndür
        const authorizedRoleId = roleIds.registerAuth
        if (allRoles.has(authorizedRoleId)) return errorEmbed(`Etiketlediğiniz [<@&${authorizedRoleId}>] adlı rol bu sunucudaki üyeleri kayıt eden rol. Lütfen başka bir rol etiketleyiniz`);

        // Eğer çok fazla rol etiketlemişse hata döndür
        if (allRoles.size > Util.MAX.mentionRoleForRegister) return errorEmbed(`Hey hey heyyy sence de biraz fazla rol etiketlemedin mi? En fazla **${Util.MAX.mentionRoleForRegister}** tane rol ayarlayabilirsin`);

        // Bazı rollerin sırası botun rollerinden üstteyse hata döndür
        const highestRole = guildMe.roles.highest;
        const rolesAboveFromMe = allRoles.filter(role => role.position >= highestRole.position);
        if (rolesAboveFromMe.size != 0) return errorEmbed(`Etiketlediğiniz [${rolesAboveFromMe.map(role => `<@&${role.id}>`).join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`)

        roleIds.girl = allRoles.map(role => role.id);
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra kızlara [${allRoles.map(role => `<@&${role.id}>`).join(" | ")}] adlı rol(leri) vereceğim`,
            "success"
        );

    },
};