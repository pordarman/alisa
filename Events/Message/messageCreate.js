"use strict";
const {
  EmbedBuilder,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");
const {
  owners,
  EMOJIS,
  botInviteLink,
  discordInviteLink,
} = require("../../settings.json");
const database = require("../../Helpers/Database");
const Util = require("../../Helpers/Util");

module.exports = {
  name: Events.MessageCreate,
  /**
   *
   * @param {Message} msg
   */
  async execute(msg) {
    try {

      // Eğer kullanıcı bir bot ise mesajını görmezden gel
      if (msg.author.bot) return;

      // Eğer dosya çekilememişse hiçbir şey döndürme
      const alisaFile = database.getFile("alisa", "other");
      if (!alisaFile) return;

      const authorId = msg.author.id;
      const guildId = msg.guildId;
      const guildDatabase = Util.getGuildData(msg.client, guildId);
      const guild = msg.guild;
      const guildMe = guild.members.me;
      const guildMePermissions = guildMe.permissions;
      const msgMember = msg.member;
      const {
        afk: afkDatabase,
        language,
        autoResponse = {}
      } = guildDatabase;

      // Eğer mesaj bir tetikleyici mesaj ise
      const replyMessage = autoResponse[msg.content];
      if (replyMessage) {
        if (replyMessage.content) {
          msg.reply(replyMessage.content);
        }
      }

      // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
      const allMessages = Util.eventMessages.messageOrInteractionCreate[language];

      // Eğer database'de en az bir kullanıcı bulunuyorsa afk sistemini çalıştır
      if (Object.keys(afkDatabase).length > 0) {
        const afkMembers = [];

        // Eğer kullanıcı afk ise afk'lıktan çıkar
        if (afkDatabase[authorId]) {

          // Eğer kullanıcının ismini değiştirebiliyorsa isminin başındaki "[AFK]" yazısını kaldır
          if (
            msgMember.nickname.startsWith("[AFK] ") &&
            authorId != guild.ownerId &&
            guildMePermissions.has("ChangeNickname") &&
            msgMember.roles.highest.position < guildMe.roles.highest.position
          ) msgMember.setNickname(msgMember.displayName.replace("[AFK] ", ""));

          Util.waitAndDeleteMessage(
            await msg.reply(
              allMessages.afk.authorIsBack(authorId, afkDatabase[authorId].timestamp)
            ),
            8 * 1000 // Mesajı 8 saniye boyunca göster
          );

          delete afkDatabase[authorId];
          database.writeFile(guildDatabase, guildId);
        }

        // Kullanıcının etiketlediği kişileri kontrol et
        msg.mentions.members.forEach(user => {
          const isUserAFK = afkDatabase[user.id];
          if (isUserAFK) afkMembers.push(
            allMessages.afk.memberIsAfk(user, isUserAFK)
          )
        });

        // Eğer en az 1 tane afk olan kullanıcıyı etiketlemişse bilgilendirme mesajını gönder
        if (afkMembers.length > 0) msg.reply({
          content: afkMembers.join("\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n"),
          allowedMentions: {
            repliedUser: true,
            users: [],
            roles: []
          }
        })
      }

      const clientId = msg.client.user.id;
      const contentTrim = msg.content.trim();
      const guildPrefix = guildDatabase.prefix;

      // Eğer kullanıcı mesajında sadece Alisa'ı etiketlemişse bilgilendirme mesajını gönder
      if (new RegExp(`^<@!?${clientId}>$`).test(contentTrim)) {
        const clientAvatar = msg.client.user.displayAvatarURL();

        const {
          thankYouMessage: {
            title,
            description,
            footer,
            buttons: {
              inviteMe,
              supportGuild,
              voteMe
            }
          }
        } = allMessages;

        const embed = new EmbedBuilder()
          .setAuthor({
            name: title,
            iconURL: clientAvatar
          })
          .setDescription(
            description(guildMe, guildPrefix)
          )
          .setColor("Purple")
          .setThumbnail(clientAvatar)
          .setTimestamp()
          .setFooter({
            text: footer,
            iconURL: guild.iconURL()
          });

        const allButtons = new ActionRowBuilder()
          .addComponents(
            // Botun davet linki
            new ButtonBuilder()
              .setLabel(inviteMe)
              .setEmoji("💌")
              .setStyle(ButtonStyle.Link)
              .setURL(botInviteLink),

            // Oy verme linki
            new ButtonBuilder()
              .setLabel(voteMe)
              .setEmoji(EMOJIS.shy)
              .setStyle(ButtonStyle.Link)
              .setURL(`https://top.gg/bot/${msg.client.user.id}/vote`),

            // Destek sunucusu linki
            new ButtonBuilder()
              .setLabel(supportGuild)
              .setEmoji("🎉")
              .setStyle(ButtonStyle.Link)
              .setURL(discordInviteLink)
          );
        
        return msg.reply({
          embeds: [
            embed
          ],
          components: [
            allButtons
          ]
        })
      }

      // Girilen string ifadedeki RegExp ifadelerinin (".", "*", "?"...) başına "\" işareti koyarak devre dışı bırakır
      function disableRegexpExpressions(string) {
        return string.toLocaleLowerCase(language).replace(/([.*+?^${}()|\[\]\\])/g, "\\$1");
      }

      let isCommandContent = new RegExp(`^(${disableRegexpExpressions(guildPrefix)}|<@!?${clientId}>)`).exec(contentTrim);
      if (!isCommandContent) return; // Eğer kullanıcı komut çalıştırmıyorsa alttakileri çalıştırma

      const args = contentTrim.slice(isCommandContent[0].length).trim().split(/\s+/),
        commandName = args.shift().toLocaleLowerCase(language),
        command = msg.client.prefixCommands[language].get(commandName);

      if (!command) return; // Eğer komut bulunamadıysa alttakileri çalıştırma

      // Eğer kullanıcı karalisteyse bilgilendirme mesajı gönder
      const isBannedUser = alisaFile.blacklistUsers[authorId];
      if (isBannedUser) {
        // Eğer kullanıcı mesajı daha önceden görmüşse hiçbir şey döndürme
        if (isBannedUser.isSee) return;

        // Bilgilendirme mesajı gönder
        msg.reply(
          allMessages.bannedFromBot(isBannedUser.reason)
        )
          // Eğer mesaj atıldıysa mesajı gördü olarak işaretle
          .then(() => {
            isBannedUser.isSee = true;
            database.writeFile(alisaFile, "alisa", "other");
          })
        return;
      }

      // Eğer botta "Bağlantı yerleştir" yetkisi yoksa hata döndür
      if (!guildMePermissions.has("EmbedLinks")) return msg.reply(allMessages.embedLinkError);

      const isOwner = owners.includes(authorId), // Kullanıcının bot sahibi olup olmadığını kontrol eder
        channel = msg.channel;

      // Premiuma sahip olup olmadığını kontrol eder
      const premiumFile = database.getFile("premium", "other");
      const premium = premiumFile[guildId];

      if (!isOwner) {
        // Eğer komut sahip komutuysa hiçbir şey döndürme
        if (command.ownerOnly) return;

        // Komutun bakım modunda olup olmadığını kontrol eder
        if (command.care) return msg.reply(
          allMessages.care
        );

        // Komutun premium kullanıcılara özel olup olmadığını kontrol eder
        if (command.premium && !premium) return msg.reply(
          allMessages.premium(guildPrefix)
        );

        let isCooldown = msg.client.prefixCooldown.get(`${authorId}.${command.id}`);

        // Kullanıcı aynı komutu çok hızlı kullanırsa onu durdur
        if (isCooldown) {
          // Eğer mesajı daha önceden atmışsa alttakileri çalıştırma
          if (isCooldown.isSee) return;

          isCooldown.isSee = true;
          const remainTime = isCooldown.expires - Date.now();

          return Util.waitAndDeleteMessage(
            await msg.reply(
              allMessages.waitCommand(remainTime)
            ),
            remainTime // Mesajı bekleme süresi boyunca göster
          );
        }

        msg.client.prefixCooldown.set(`${authorId}.${command.id}`, {
          isSee: false,
          expires: premium ? 1000 : Date.now() + (command.cooldown * 1000)
        });
        setTimeout(() => {
          msg.client.prefixCooldown.delete(`${authorId}.${command.id}`);
        }, premium ? 1000 : command.cooldown * 1000);

        const channelCooldown = msg.client.channelCooldown.get(channel.id);

        if (channelCooldown) {
          channelCooldown.count += 1;
          setTimeout(() => {
            channelCooldown.count -= 1;
          }, 2000)

          // Eğer kanalda çok kısa sürede 4 taneden fazla komut kullanılmış ise uyarı ver
          if (channelCooldown.count > 4) {

            // Eğer kanalda aynı anda komut kullanılırsa kullanıcıları uyar
            if (channelCooldown.isSee) return; // Eğer mesajı daha önceden atmışsa alttakileri çalıştırma
            channelCooldown.isSee = true;

            // 5 saniye sonra isSee değerini false yap
            setTimeout(() => {
              channelCooldown.isSee = false;
            }, 5 * 1000);

            return Util.waitAndDeleteMessage(
              await msg.reply(
                allMessages.waitChannel
              ),
              2 * 1000 // Mesajı 2 saniye boyunca göster
            );
          }
        } else {
          const object = {
            isSee: false,
            count: 1
          }
          msg.client.channelCooldown.set(channel.id, object);
          setTimeout(() => {
            object.count -= 1;
          }, 2 * 1000)
        }
      }

      // Komut kullanımını database'ye kaydet
      alisaFile.commandUses[command.id] ??= {
        prefix: 0,
        slash: 0,
        button: 0,
        selectMenu: 0,
        total: 0
      }
      alisaFile.commandUses[command.id].prefix += 1;
      alisaFile.commandUses[command.id].total += 1;

      alisaFile.usersCommandUses[authorId] ??= 0;
      alisaFile.usersCommandUses[authorId] += 1;

      alisaFile.guildsCommandUses[guildId] ??= 0;
      alisaFile.guildsCommandUses[guildId] += 1;

      database.writeFile(alisaFile, "alisa", "other");


      /**
       * Bazı embedler için biz hazır önayar yaparız
       * Mesela hata embed'i yapmak için her seferinde başlığı "Hata" yapmak yerine hazır yaparız ki hem tekrardan düzenlemesinde kolaylık olur
       * hem de hata oranı azalır
       * @param {String} messageContent
       * @param {String} type
       * @param {Number} cooldown
       * @returns
       */
      async function errorEmbed(messageContent, type = "error", cooldown = 8000, { fields, image = null } = {}) {
        const embed = new EmbedBuilder()
          .setTimestamp();

        if (fields) embed.addFields(...fields)
        if (image) embed.setImage(image)

        const {
          errorEmbed: {
            errorTitle,
            memberPermissionError,
            botPermissionError,
            warn,
            success
          }
        } = allMessages;

        switch (type) {
          case "memberPermissionError": {
            embed
              .setTitle(errorTitle)
              .setDescription(
                memberPermissionError(messageContent)
              )
              .setColor("Red")
          }
            break;

          case "botPermissionError": {
            embed
              .setTitle(errorTitle)
              .setDescription(
                botPermissionError(messageContent)
              )
              .setColor("Red")
          }
            break;

          case "error": {
            embed
              .setTitle(errorTitle)
              .setDescription(`• ${messageContent}`)
              .setColor("Red");
          }
            break;

          case "warn": {
            embed
              .setTitle(warn)
              .setDescription(messageContent)
              .setColor("Orange");
          }
            break;

          case "success": {
            let splitString = messageContent.split("\n");

            messageContent = splitString.length > 1 ?
              `${splitString[0]} ${EMOJIS.yes}\n${splitString.slice(1).join("\n")}` :
              `${messageContent} ${EMOJIS.yes}`;

            embed
              .setTitle(success)
              .setDescription(messageContent)
              .setColor("Green");

            return msg.reply({
              embeds: [
                embed
              ]
            });
          }

          default:
            throw new TypeError(`Bilinmeyen bir tip girişi! - ${type}`);
        }

        // Mesajı belirli bir süre sonra sil
        Util.waitAndDeleteMessage(
          await msg.reply({
            embeds: [
              embed
            ]
          }),
          cooldown
        );
      };

      // Eğer komutu Alisa'ı etiketleyerek çağırdıysa (yani @Alisa#1170 yardım yazarak komut kullandıysa) etiketlenen kullanıcılardan Alisa'ı sil
      if (isCommandContent[0] != guildPrefix) {
        msg.mentions.members.delete(clientId);
        msg.mentions.users.delete(clientId);
      }

      // Komutu çalıştırmaya çalış
      try {
        await command.execute({
          alisa: alisaFile,
          msg,
          guildDatabase,
          guildId,
          guildMe,
          guildMePermissions,
          guild,
          msgMember,
          args,
          prefix: guildPrefix,
          authorId,
          language,
          errorEmbed,
          isOwner,
          premium
        });
      }
      // Eğer hata çıkarsa kullanıcıyı bilgilendir
      catch (error) {

        // Eğer komut sahip komutuysa hatayı konsola değil de mesajda gönster
        if (command.ownerOnly) return msg.reply(
          allMessages.commandErrorOwner(error)
        );

        // Eğer sahip komutu değilse
        msg.reply(
          allMessages.commandError(authorId)
        );
        Util.error(error, command.dirname)

      }

    } catch (error) {
      console.log(error);
    }
  },
};
