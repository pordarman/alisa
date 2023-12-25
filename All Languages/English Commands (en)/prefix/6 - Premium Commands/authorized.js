"use strict";
const { EmbedBuilder } = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");
const {
    EMOJIS
} = require("../../../../settings.json");

module.exports = {
    name: "authorized", // Komutun ismi
    id: "yetkili", // Komutun ID'si
    cooldown: 5, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "authorized"
    ],
    description: "Sets the server's authoritative roles", // Komutun açıklaması
    category: "Premium commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>authorized <Option>", // Komutun kullanım şekli
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

        // Eğer komutu kullanan kişide "Yönetici" yetkisi yoksa
        if (!msgMember.permissions.has("Administrator")) {
            const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

            // Eğer sunucuda yetkili rolleri ayarlanmamışsa
            if (authorizedRoleIds.length == 0) return msg.react(EMOJIS.no);

            // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
            const allMembers = await Util.getMembers(msg);
            const authorizedMembers = allMembers.filter(member => {
                if (member.user.bot) return false;
                const memberRolesSet = new Set(member["_roles"]);
                return authorizedRoleIds.some(roleId => memberRolesSet.has(roleId));
            });

            // Eğer hiç kimsede yetkili rolü yoksa
            if (authorizedMembers.size == 0) return msg.react(EMOJIS.no);

            // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
            const arrayMembers = Util.splitMessage({
                arrayString: authorizedMembers.map(member => `<@${member.id}>`),
                firstString: `• ${authorizedRoleIds.map(roleId => `<@&${roleId}>`).join(", ")}\n\n• **Authorities (__${Util.toHumanize(authorizedMembers.size, language)}__)**\n`,
                joinString: " | ",
                limit: 2000
            });

            // Bütün sayfaları teker teker mesaj olarak gönder
            for (let i = 0; i < arrayMembers.length; ++i) {
                await msg.channel.send({
                    content: arrayMembers[i],
                    allowedMentions: {
                        roles: [],
                        users: []
                    }
                });

                // 500 milisaniye bekle
                await Util.wait(500)
            }

            // En sonda ise rollere ve kullanıcılara bildirim gitmediğini belirten mesaj gönder
            return msg.channel.send(`*• Notification to **roles and members** tagged above __not gone__*`);
        }

        switch (args[0]?.toLocaleLowerCase(language)) {
            // Eğer rolleri ayarlamak istiyorsa
            case "setrole":
            case "setroles": {

                // Rolü ayarla
                const allRoles = Util.fetchRoles(msg);
                if (allRoles.size == 0) return errorEmbed(
                    `• To set authority roles set **${prefix}${this.name} @role @role @role**\n\n` +
                    `• To reset, you can type **${prefix}${this.name} reset**`,
                    "warn"
                );

                // Eğer rollerin içinde bot rolü varsa hata döndür
                if (allRoles.some(role => role.managed)) return errorEmbed(`I cannot give roles created by bots to others`);

                // Eğer çok fazla rol etiketlemişse hata döndür
                if (allRoles.size > Util.MAX.mentionRoleForAuthorized) return errorEmbed(`Hey hey heyyy don't you think you tagged too many roles? You can set up to **${Util.MAX.mentionRoleForAuthorized}** roles`);

                // Database'ye kaydet
                guildDatabase.premium.authorizedRoleIds = allRoles.map(role => role.id);
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(
                    `Authority roles successfully set to [${allRoles.map(role => `<@&${role.id}>`).join(" | ")}]`,
                    "success"
                );
            }

            // Eğer yetkili rollerini sıfırlamak istiyorsa
            case "reset": {
                // Eğer zaten sıfırlanmış ise
                if (guildDatabase.premium.authorizedRoleIds.length == 0) return errorEmbed("Authorized roles have already been reset");

                guildDatabase.premium.authorizedRoleIds = [];
                database.writeFile(guildDatabase, guildId);
                return errorEmbed("Authority roles have been successfully reset", "success");
            }

            // Eğer bütün üyeleri etiket atmadan görmek istiyorsa
            case "view":
            case "see": {
                const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

                // Eğer rol ayarlanmamışsa hata döndür
                if (authorizedRoleIds.length == 0) return errorEmbed(
                    `No authority role is set on this server\n\n` +
                    `• To set it, you can type **${prefix}${this.name} set @role**`
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(msg);
                const authorizedMembers = allMembers.filter(member => {
                    if (member.user.bot) return false;
                    const memberRolesSet = new Set(member["_roles"]);
                    return authorizedRoleIds.some(roleId => memberRolesSet.has(roleId));
                });

                // Eğer hiç kimsede yetkili rolü yoksa
                if (authorizedMembers.size == 0) return errorEmbed("Wellyy.. No one has the authority role, you stupid thing")

                // Şimdi üyelerin ID'lerini discord embed karakter limitine göre (4096) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: authorizedMembers.map(member => `<@${member.id}>`),
                    firstString: `• ${authorizedRoleIds.map(roleId => `<@&${roleId}>`).join(", ")}\n\n• **Authorities (__${Util.toHumanize(authorizedMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 4096
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("All authorities")
                                .setDescription(arrayMembers[i])
                                .setColor("Blue")
                        ]
                    });

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }

            }

                break;

            // Eğer bütün üyelere etiket atarak görmek istiyorsa
            case "tag": {
                const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

                // Eğer rol ayarlanmamışsa hata döndür
                if (authorizedRoleIds.length == 0) return errorEmbed(
                    `No authority roles are set on this server\n\n` +
                    `• To set it, you can type **${prefix}${this.name} set @role**`
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(msg);
                const authorizedMembers = allMembers.filter(member => {
                    if (member.user.bot) return false;
                    const memberRolesSet = new Set(member["_roles"]);
                    return authorizedRoleIds.some(roleId => memberRolesSet.has(roleId));
                });

                // Eğer hiç kimsede yetkili rolü yoksa
                if (authorizedMembers.size == 0) return errorEmbed("Wellyy.. No one has the authority role, you stupid thing")

                // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: authorizedMembers.map(member => `<@${member.id}>`),
                    firstString: `• ${authorizedRoleIds.map(roleId => `<@&${roleId}>`).join(", ")}\n\n• **Authorities (__${Util.toHumanize(authorizedMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 2000
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send(arrayMembers[i]);

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }
            }

                break;

            // Eğer ayarlanan rolleri görmek istiyorsa
            case "rol":
            case "role":
            case "roles": {
                const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

                // Eğer rol ayarlanmamışsa hata döndür
                if (authorizedRoleIds.length == 0) return errorEmbed(
                    `No authority roles are set on this server\n\n` +
                    `• To set it, you can type **${prefix}${this.name} set @role**`
                );

                return msg.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**• All authority roles (${Util.toHumanize(authorizedRoleIds.length, length)})**\n\n` +
                                `• ${authorizedRoleIds.map(roleId => `<@&${roleId}>`).join(" | ")}`
                            )
                            .setColor("Blue")
                    ]
                })
            }

            // Eğer hiçbir şey yazmamışsa bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• To set the partner authority role, you can type **${prefix}${this.name} set**\n` +
                    `• To reset the partner role, you can type **${prefix}${this.name} reset**\n` +
                    `• To tag all partner officials, you can write **${prefix}${this.name} tag**\n` +
                    `• To see all partner officials without being notified, you can type **${prefix}${this.name} view**\n` +
                    `• To see the partner authority role, you can type **${prefix}${this.name} role**`,
                    "warn",
                    30 * 1000 // Bu mesajı 30 saniye boyunca göster
                );
        }

    },
};