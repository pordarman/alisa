"use strict";
const {
    EmbedBuilder,
    Guild,
    Events
} = require("discord.js");
const database = require("../../Helpers/Database");
const {
    supportGuildId,
    channelIds: {
        guildCreate: guildCreateChannelId
    }
} = require("../../settings.json");
const {
    guildCreate
} = require("../../messages.json");
const Util = require("../../Helpers/Util");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

module.exports = {
    name: Events.GuildCreate,
    /**
     * 
     * @param {Guild} guild 
     */
    async execute(guild) {
        try {

            const alisaFile = database.getFile("alisa", "other");

            const guildId = guild.id;

            // Eğer sunucu karalistede varsa direkt sunucudan çık
            if (alisaFile.blacklistGuilds[guildId]) return guild.leave();

            const rest = new REST()
                .setToken(guild.client.token);

            try {
                // Slash komutlarını oluştur
                rest.put(
                    Routes.applicationGuildCommands(guild.client.user.id, guildId),
                    {
                        body: guild.client.slashCommandsJSON
                    },
                ).catch(() => { });
            }
            // Eğer herhangi bir hata olduğunda konsola yazdır
            catch (error) {
                console.error(error);
            }

            const messageEmbeds = [];

            // Sunucunun verilerini kontrol et ve eğer bazı roller veya kanallar silinmişse databaseden verileri sil ve sunucu sahibine bilgilendirme mesajı gönder
            const guildDatabase = Util.getGuildData(guild.client, guildId);

            // Silinen verileri kontrol et
            const deletedRoleAndChannels = Util.checkGuildData(guild, guildDatabase);

            const {
                language
            } = guildDatabase;

            // Eğer silinen veri varsa bilgilendirme mesajı gönder ve database'ye kaydet
            if (deletedRoleAndChannels.length > 0) {
                // Database'ye kaydet
                database.writeFile(guildDatabase, guildId);

                const {
                    embed: {
                        title,
                        roleAndChannelDescription,
                        and
                    }
                } = Util.rolesAndChannelMessages[language];

                const lastElement = deletedRoleAndChannels.pop();
                const informationMessage = deletedRoleAndChannels.length ? `${deletedRoleAndChannels.join(", ")} ${and} ${lastElement}` : lastElement;

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(
                        roleAndChannelDescription({
                            guild,
                            guildId,
                            informationMessage
                        })
                    )
                    .setColor("Blue")
                    .setTimestamp();

                messageEmbeds.push(embed);
            }

            // Sunucu sayısını kontrol et ve eğer sunucu sayısı 100'ün kayıtsa database'te kaydet
            const joinedTimestamp = guild.members.me.joinedTimestamp;

            const guildCount = (await guild.client.shard.broadcastEval(client => client.guilds.cache.size)).reduce((acc, top) => acc + top, 0);

            alisaFile.guildAddRemove.add[guildId] = joinedTimestamp;
            if (guildCount % 100 == 0 && !alisaFile.guildsCount[guildCount]) alisaFile.guildsCount[guildCount] = joinedTimestamp;

            database.writeFile(alisaFile, "alisa", "other");

            // Eğer sunucunun kayıt şekli "Normal kayıt" ise önbelleğe bunu kaydet 
            if (guildDatabase.register.type == "normal") guild.client.registerOptions.add(guildId);

            // Botun destek sunucusuna sunucuya girdiğine dair mesaj at
            const randomMessage = guildCreate[Math.floor(Math.random() * guildCreate.length)].replace("<s>", `${guild.name} - (${guildId})`);

            Util.webhooks.guildCreate.send(`📥 ${randomMessage} ( Toplamda **${guildCount}** sunucuya hizmet ediyorum )`);

            // Sunucu sahibine bilgilendirme mesajı gönder, eğer sunucu sahibini çekemezse hiçbir şey döndürme
            const guildOwner = await Util.fetchUserForce(guild.client, guild.ownerId);

            if (!guildOwner) return;

            const clientAvatar = guild.client.user.displayAvatarURL();
            const prefix = guildDatabase.prefix;

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const {
                description,
                footer
            } = Util.eventMessages.guildCreate[language];

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: guild.client.user.displayName,
                    iconURL: clientAvatar
                })
                .setDescription(
                    description({
                        guild,
                        prefix
                    })
                )
                .setColor("#9e02e2")
                .setThumbnail(clientAvatar)
                .setFooter({
                    text: footer
                });

            messageEmbeds.unshift(embed);

            // Sunucu sahibine bilgilendirme mesajı gönder
            guildOwner.send({
                embeds: messageEmbeds
            });

        } catch (e) {
            console.log(e)
        }
    }
}