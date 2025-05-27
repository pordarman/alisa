"use strict";
const {
    EmbedBuilder,
    Guild,
    Events
} = require("discord.js");
const database = require("../../Helpers/Database.js");
const allRandomMessages = require("../../Helpers/Random/GuildCreate");
const Util = require("../../Helpers/Util.js");
const allMessages = require("../../Helpers/Localizations/Index.js");

module.exports = {
    name: Events.GuildCreate,
    /**
     * 
     * @param {Guild} guild 
     */
    async execute(guild) {
        try {

            const alisaFile = await database.getFile("alisa");

            const guildId = guild.id;

            // Eğer sunucu karalistede varsa direkt sunucudan çık
            if (alisaFile.blacklistGuilds[guildId]) return guild.leave();

            const guildDatabase = await database.getGuild(guildId);

            // Slash komutlarını oluştur
            Util.setRestToken(guild.client.token);
            Util.setGuildCommands(guild.client.user.id, guildId, Util.maps.guildCommandsJSON.get(guildDatabase.language));

            const messageEmbeds = [];

            // Silinen verileri kontrol et
            const {
                deletedRoleAndChannels,
                changedGuildData
            } = Util.checkGuildData(guild, guildDatabase);

            const {
                language
            } = guildDatabase;
            const {
                others: otherMessages
            } = allMessages[language];

            // Eğer silinen veri varsa bilgilendirme mesajı gönder ve database'ye kaydet
            if (deletedRoleAndChannels.length > 0) {
                // Database'ye kaydet
                await database.updateGuild(guildId, changedGuildData, true);

                const {
                    embed: {
                        title,
                        roleAndChannelDescription
                    }
                } = otherMessages.rolesAndChannels;

                const informationMessage = Util.formatArray(deletedRoleAndChannels, language);

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(
                        roleAndChannelDescription({
                            guildName: guild.name,
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

            const setObject = {
                [`guildAddLeave.add.${guildId}`]: joinedTimestamp
            };

            alisaFile.guildAddLeave.add[guildId] = joinedTimestamp;
            if (guildCount % 100 == 0 && !alisaFile.guildsCount[guildCount]) {
                setObject[`guildsCount.${guildCount}`] = Date.now();
                alisaFile.guildsCount[guildCount] = Date.now();
            }

            // Eğer sunucunun kayıt şekli "Üyeli kayıt" ise önbelleğe bunu kaydet 
            if (guildDatabase.register.type == "member") Util.maps.registerOptions.add(guildId);

            // Botun destek sunucusuna sunucuya girdiğine dair mesaj at
            const randomMessage = Util.random(allRandomMessages(`${guild.name} - (${guildId})`));

            Util.webhooks.guildCreate.send(`📥 ${randomMessage} ( Toplamda **${guildCount}** sunucuya hizmet ediyorum )`);

            // Sunucu sahibine bilgilendirme mesajı gönder, eğer sunucu sahibini çekemezse hiçbir şey döndürme
            const [guildOwner] = await Promise.all([
                Util.fetchUserForce(guild.client, guild.ownerId),
                database.updateFile("alisa", {
                    $set: setObject
                })
            ]);

            if (!guildOwner) return;

            const clientAvatar = guild.client.user.displayAvatarURL();
            const prefix = guildDatabase.prefix;

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const {
                description,
                footer
            } = otherMessages.events.guildCreate;

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: guild.client.user.displayName,
                    iconURL: clientAvatar
                })
                .setDescription(
                    description({
                        guildName: guild.name,
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
            console.error(e)
        }
    }
}