"use strict";
const {
    EmbedBuilder, Embed
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "test", // Komutun ismi
    id: "test", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "test",
        "kayıttest"
    ],
    description: "Birisini kayıt ederken çıkacak hataları önceden gösterir", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>test", // Komutun kullanım şekli
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
        guildMePermissions,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const embed = new EmbedBuilder()
            .setDescription(`• Veriler kontrol ediliyor, lütfen biraz bekleyiniz...`)
            .setColor("Blue");

        // Mesajı at ve kontrol ettikten sonra mesajı düzenle
        const message = await msg.reply({
            embeds: [
                embed
            ]
        });

        // Eğer olur da bir hata oluşursa hiçbir şey döndürme
        if (!message) return;

        const roleErrors = [];
        const channelErrors = [];
        const permissionsErrors = [];

        const suggestions = [];
        const allRoles = [];

        const {
            register: {
                roleIds: {
                    bot: botRoleIds,
                    normal: normalRoleIds,
                    boy: boyRoleIds,
                    girl: girlRoleIds,
                    unregister: unregisterRoleId,
                    registerAuth: registerAuthRoleId,
                },
                channelIds: {
                    register: registerChannelId,
                    afterRegister: afterRegisterChannelId,
                    log: logChannelId,
                },
                isRegisterOff,
                type
            }
        } = guildDatabase;

        // Eğer kayıt ayarı kapalıysa
        if (isRegisterOff) roleErrors.push("• Kayıt ayarım kapalı durumda, hiçbir kayıt işlemini yapamazsınız!");

        // Eğer kayıtsız rolü ayarlanmamışsa
        if (!unregisterRoleId) roleErrors.push("• Kayıtsız üyelere verilecek rol ayarlanmamış!");
        // Eğer ayarlanmışsa bütün rollere rolü ekle
        else {
            allRoles.push(unregisterRoleId)
        }

        // Eğer kayıt türü "Normal Kayıt"i se
        if (type == "normal") {
            // Eğer üye rolü ayarlanmamışsa
            if (normalRoleIds.length == 0) roleErrors.push("• Üyelere verilecek rol ayarlanmamış!")
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...normalRoleIds)
            }
        } else {
            // Eğer erkek rolü ayarlanmamışsa
            if (boyRoleIds.length == 0) roleErrors.push("• Erkeklere verilecek rol ayarlanmamış!")
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...boyRoleIds)
            }

            // Eğer kız rolü ayarlanmamışsa
            if (girlRoleIds.length == 0) roleErrors.push("• Kızlara verilecek rol ayarlanmamış!")
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...girlRoleIds)
            }
        }

        // Eğer botlara verilecek rol ayarlanmamışsa
        if (botRoleIds.length == 0) roleErrors.push("• Botlara verilecek rol ayarlanmamış!")
        // Eğer ayarlanmışsa bütün rollere rolü ekle
        else {
            allRoles.push(...botRoleIds)
        }

        // Eğer botta gerekli yetkiler yoksa
        if (!guildMePermissions.has("ManageNicknames")) permissionsErrors.push("• Benim isimleri düzenleme yetkim yok");
        if (!guildMePermissions.has("ManageRoles")) permissionsErrors.push("• Benim rolleri düzenleme yetkim yok");
        if (!guildMePermissions.has("Administrator")) suggestions.push("• Botun düzgün çalışması için bana yönetici yetkisi verdiğinizden emin olunuz")

        // Eğer kayıt eden yetkili rolü ayarlanmamışsa
        if (!registerAuthRoleId) roleErrors.push("• Üyeleri kayıt eden yetkili rolü ayarlanmamış!");

        // Eğer rollerden bazıları botun rollerinden yüksekse
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = allRoles.filter(roleId => guild.roles.cache.get(roleId).position >= highestRole.position);
        if (roleAboveTheBotRole.length != 0) roleErrors.push(`• [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] adlı roller benim rolümün sırasından yüksek olduğu için bu rolleri başkalarına veremem`);

        // Eğer kayıt kanalı ayarlanmamışsa
        if (!registerChannelId) channelErrors.push("• Kayıtların yapılacağı kanal ayarlanmamış!");
        else {
            const channel = guild.channels.cache.get(registerChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.register = "";
                channelErrors.push("• Kayıtların yapılacağı kanal ayarlanmamış!");
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push("• Kayıt kanalına mesaj atabilme yetkim yok!");
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        // Eğer kayıt sonrası kanal ayarlanmamışsa
        if (!afterRegisterChannelId) suggestions.push("• Kayıt sonrasında üye için hoşgeldin mesajı atılacak kanal ayarlanmamış!");
        else {
            const channel = guild.channels.cache.get(afterRegisterChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.afterRegister = "";
                suggestions.push("• Kayıt sonrasında üye için hoşgeldin mesajı atılacak kanal ayarlanmamış!");
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push("• Kayıt sonrası kanalına mesaj atabilme yetkim yok!");
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        // Eğer kayıt log kanalı ayarlanmamışsa
        if (!logChannelId) suggestions.push("• Kayıt log kanalı ayarlanmamış!");
        else {
            const channel = guild.channels.cache.get(logChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.log = "";
                suggestions.push("• Kayıt log kanalı ayarlanmamış!");
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push("• Kayıt log kanalına mesaj atabilme yetkim yok!");
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        const messageFields = [];

        // Eğer yetki hatası varsa
        if (permissionsErrors.length > 0) messageFields.push({
            name: "🧰 YETKİ HATALARI",
            value: permissionsErrors.join("\n")
        });

        // Eğer rol hatası varsa
        if (roleErrors.length > 0) messageFields.push({
            name: `${EMOJIS.role} ROL HATALARI`,
            value: roleErrors.join("\n")
        });

        // Eğer kanal hatası varsa
        if (channelErrors.length > 0) messageFields.push({
            name: `${EMOJIS.channel} KANAL HATALARI`,
            value: channelErrors.join("\n")
        });

        // Öneriler varsa
        if (suggestions.length > 0) messageFields.push({
            name: "💬 YAPILMASI ÖNERİLEN",
            value: suggestions.join("\n")
        });

        // Mesajda gösterilecek resimler
        const guildIcon = guild.iconURL();
        const clientAvatar = msg.client.user.displayAvatarURL();

        // Eğer bir öneri veya hata yoksa mükemmel embed'i döndür
        if (messageFields.length == 0) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.crazy} İşte buuu!!!`)
                .setDescription(`Bot bu sunucuda kusursuz çalışıyor (tıpkı senin gibi...), kayıt işlemlerini gönül rahatlığıyla yapabilirsiniz!`)
                .setThumbnail(guildIcon)
                .setColor("Green")
                .setFooter({
                    text: "Sizleri seviyorum <3",
                    iconURL: clientAvatar
                });

            return message.edit({
                embeds: [
                    embed
                ]
            })
        }

        // Eğer hatalar varsa onları embed mesajda göster
        const finalEmbed = new EmbedBuilder()
            .setTitle("Sanki biraz yapılması gereken şeyler var gibi?")
            .addFields(...messageFields)
            .setThumbnail(guildIcon)
            .setColor("Orange")
            .setFooter({
                text: "Sizleri seviyorum <3",
                iconURL: clientAvatar
            });

        return message.edit({
            embeds: [
                finalEmbed
            ]
        });

    },
};