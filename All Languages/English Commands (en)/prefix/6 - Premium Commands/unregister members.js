"use strict";
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "unregistermembers", // Komutun ismi
    id: "kayıtsızlar", // Komutun ID'si
    cooldown: 60, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "unregistermembers",
        "unregistermember"
    ],
    description: "Tags all unregistered members", // Komutun açıklaması
    category: "Premium commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unregistermembers", // Komutun kullanım şekli
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
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            `Unregister role is __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it you can type **${prefix}unregister-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        const allMembers = await Util.getMembers(msg);

        const unregisteredMembers = allMembers.filter(member => member["_roles"].includes(unregisterRoleId));

        // Eğer hiç kimsede kayıtsız rolü yoksa
        if (unregisteredMembers.size == 0) return msg.reply(`• No one is unregistered on this server yey!`);

        // Şimdi üyelerin ID'lerini discord karakter limitine göre (1024) göre düzenle ve mesaj olarak gönder
        const arrayMembers = Util.splitMessage({
            arrayString: unregisteredMembers.map(member => `<@${member.id}>`),
            firstString: `• <@&${unregisterRoleId}>\n\n• **Unregistered members (__${Util.toHumanize(unregisteredMembers.size, language)}__)**\n`,
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