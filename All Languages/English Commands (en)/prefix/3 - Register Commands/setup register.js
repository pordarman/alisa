"use strict";
const {
  Message,
  ChannelType
} = require("discord.js");
const {
  EMOJIS
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
  name: "setup", // Komutun ismi
  id: "kur", // Komutun ID'si
  cooldown: 3, // Komutun bekleme süresi
  aliases: [ // Komutun diğer çağırma isimleri
    "setup",
    "setupregister"
  ],
  description: "Instead of setting up all roles and channels one by one, you set them all at once", // Komutun açıklaması
  category: "Register commands", // Komutun kategorisi (yardım menüsü için)
  usage: "<px>setup", // Komutun kullanım şekli
  care: false, // Komutun bakım modunda olup olmadığını ayarlar
  ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
  premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
  addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

  /**
   * Parametrelerdeki isimlerin ne olduklarını tanımlar
   * @param {import("../../../../typedef").exportsRunCommands} params 
   */
  async execute({
    guildDatabase,
    msg,
    msgMember,
    guildMe,
    guildId,
    guild,
    authorId,
    errorEmbed,
    language,
    extras,
  }) {

    // Eğer Bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
    let registerDatabase = {
      roleIds: {
        boy: [],
        girl: [],
        normal: [],
        bot: [],
        registerAuth: "",
        unregister: ""
      },
      channelIds: {
        register: "",
        log: "",
        afterRegister: "",
      },
      customNames: {
        register: "<tag> <name>",
        registerBot: "<tag> <name>",
        guildAdd: "<tag> <name>",
        guildAddBot: "<tag> <name>",
      },
      tag: "",
      symbol: ""
    };
    const filter = message => message.author.id === authorId;
    const timeout = 60 * 1000; // Mesajları 1 dakika süreyle bekle
    const channel = msg.channel;
    const allErrors = {
      // Genel hatalar
      cancel: `❗ The transaction has been canceled`,
      numberOfRemainingAttempts(numberOfRemain) {
        return `‼️ Please answer the questions correctly - __*( **${numberOfRemain}** left )*__`;
      },

      // Kanal hataları
      notTextChannel: `${EMOJIS.no} The channel you tagged is not a text channel. Please enter a text channel`,

      // Rol hataları
      botRole: `${EMOJIS.no} I cannot give roles created by bots to others. Please enter another role`,
      unregisterRole: `${EMOJIS.no} The role or one of the roles you tagged is the role that will be given to unregistered members on this server. Please enter another role`,
      authRole: `${EMOJIS.no} One of the roles you tagged is the authorized role that registers the members on this server. Please enter another role`,
      maxRole: `${EMOJIS.no} Hey hey heyyy, don't you think you tagged too many roles? Please tag fewer roles and try again`,
      aboveBotRole(roleId) {
        return `${EMOJIS.no} The rank of the role **<@&${roleId}>** is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`
      },
      aboveBotRoles(roles) {
        return `${EMOJIS.no} The rank of the role you tagged [${roles.map(role => `<@&${role.id}>`).join(" | ")}] is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`
      },
      boyRoles(roles) {
        return `${EMOJIS.no} The [${roles.map(role => `<@&${role.id}>`).join(" | ")}] role(s) you tagged are the roles that will be given to men on this server. Please enter another role`
      },
      girlRoles(roles) {
        return `${EMOJIS.no} The [${roles.map(role => `<@&${role.id}>`).join(" | ")}] role(s) you tagged are the roles that will be given to the girls on this server. Please enter another role`
      },
      normalRoles(roles) {
        return `${EMOJIS.no} The [${roles.map(role => `<@&${role.id}>`).join(" | ")}] role(s) you have tagged are the roles that will be given to members on this server. Please enter another role`
      },

      // Tag ve sembol hataları
      tag: `${EMOJIS.no} Your tag length cannot be greater than 10. Please enter a shorter tag`,
      symbol: `${EMOJIS.no} Your symbol length cannot be greater than 3. Please enter a shorter symbol`,
    };
    const allMessages = {
      // Kayıt kanalı ayarlama
      registerChannel: `${EMOJIS.channel} On which channel will the recordings be made? Pleage tag a channel`,

      // Kayıt sonrası kanalı ayarlama
      afterRegisterChannel: `${EMOJIS.channel} Which channel will be the channel after register? It is recommended that the after recording channel be a chat channel. If you do not want to set the channel after register, you can type \`skip\`. Pleage tag a channel`,

      // Kayıt log kanalı ayarlama
      registerLogChannel: `${EMOJIS.channel} Which channel will be the register log channel? If you do not want to set the register log channel, you can type \`skip\`. Pleage tag a channel`,

      // Kayıt yetkili rolü ayarlama
      registerAuthRole: `${EMOJIS.role} Which role will be the authorized person who registers the members? Please tag a role`,

      // Kayıtsız rolü ayarlama
      unregisterRole: `${EMOJIS.role} What role will be taken after registering the members or what role will I give them when they join the server? In short, what will be the indifferent role? Please tag a role`,

      // Kayıt tipini ayarlama
      registerType: `❓ Will your register type be **Normal** or **Gender**?`,

      // Üye rollerini ayarlama
      normalRoles: `${EMOJIS.normal} What role(s) will be assigned to members? Please tag the role(s)`,

      // Kız ve Erkek rollerini ayarlama
      girlRoles: `${EMOJIS.girl} What role(s) will the girls be given? Please tag the role(s)`,
      boyRoles: `${EMOJIS.boy} What role(s) will be assigned to men? Please tag the role(s)`,

      // Bot Rollerini ayarlama
      botRoles: `${EMOJIS.bot} What role(s) will be given to bots? If you don't want to set it, you can type \`skip\`. Please tag the role(s)`,

      // Tag ve sembol ayarlama
      tag() {
        return `📝 What should be the tag to put in front of the names? If you do not want to set a tag, you can write \`skip\`\n` +
          `• If you set the tag to **♫** it will look like this **${Util.customMessages.registerName({
            message: guildDatabase.register.customNames.register,
            memberName: "Fearless Crazy",
            guildDatabase,
            inputAge: ["20"],
            isBot: false,
            defaultObject: {
              tag: "♫"
            }
          })}**`;
      },
      symbol() {
        return `📝 What symbol should be placed between the names? If you don't want to set a symbol you can type \`skip\`\n` +
          `‼️ Symbols will not be placed in bot names \n` +
          `• If you set the symbol to **|** it will look like this **${Util.customMessages.registerName({
            message: guildDatabase.register.customNames.register,
            memberName: "Fearless Crazy",
            guildDatabase,
            inputAge: ["20"],
            isBot: false,
            defaultObject: {
              symbol: "|"
            }
          })}**`;
      },

      // Otoisim ayarlama
      guildAddName(guildAddNameParam) {
        return `📝 When someone enters the server, what should be their username? If you do not want to set the username, you can type \`skip\`\n` +
          `‼️ Autoname will not be placed in the names of the bots\n` +
          `• If you set the autoname to **${guildAddNameParam}** it will look like this **${Util.customMessages.unregisterName({
            message: guildDatabase.register.customNames.guildAdd,
            guildDatabase,
            name: "User's name"
          })}**`;
      }
    };

    // Eğer kullanıcı kur komutunu kullanırken çok fazla hata yaptıysa komutu bitir
    // Ve en fazla kaç tane hata yapabilir belirt
    let currErrorCount = 0;

    // Eğer Bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır 
    if (extras) {
      const textToFunc = {
        // Kanal ayarlamaları
        setRegisterChannel: (message) => {
          sendCustomMessage(message, allMessages.registerChannel)
          return setRegisterChannel(message);
        },
        setAfterRegisterChannel: (message) => {
          sendCustomMessage(message, allMessages.afterRegisterChannel)
          return setAfterRegisterChannel(message);
        },
        setRegisterLogChannel: (message) => {
          sendCustomMessage(message, allMessages.registerLogChannel)
          return setRegisterLogChannel(message);
        },

        // Yetkili ve kayıtsız rolü ayarlamaları
        setRegisterAuthRole: (message) => {
          sendCustomMessage(message, allMessages.registerAuthRole)
          return setRegisterAuthRole(message);
        },
        setUnregisteredRole: (message) => {
          sendCustomMessage(message, allMessages.unregisterRole)
          return setUnregisteredRole(message);
        },

        // Kayıt tipini ayarlama
        setRegisterType: (message) => {
          sendCustomMessage(message, allMessages.registerType)
          return setRegisterType(message);
        },

        // Diğer rol ayarlamalı
        setGirlRoles: (message) => {
          sendCustomMessage(message, allMessages.girlRoles)
          return setGirlRoles(message);
        },
        setBoyRoles: (message) => {
          sendCustomMessage(message, allMessages.boyRoles)
          return setBoyRoles(message);
        },
        setNormalRoles: (message) => {
          sendCustomMessage(message, allMessages.normalRoles)
          return setNormalRoles(message);
        },
        setBotRoles: (message) => {
          sendCustomMessage(message, allMessages.botRoles)
          return setBotRoles(message);
        },

        // Tag ve sembol ayarlamaları
        setGuildTag: (message) => {
          sendCustomMessage(message, allMessages.tag())
          return setGuildTag(message);
        },
        setGuildSymbol: (message) => {
          sendCustomMessage(message, allMessages.symbol())
          return setGuildSymbol(message);
        },

        // Otoisim ayarlaması
        setGuildAddName: (message) => {
          sendCustomMessage(message, allMessages.guildAddName("<tag> Unregistered"))
          return setGuildAddName(message);
        },
      };

      // Database'ye kaydedilen veriyleri çek
      const {
        registerData,
        functionName,
        errorCount
      } = extras;
      registerDatabase = registerData;
      currErrorCount = errorCount;

      // Fonksiyonu çalıştır
      return textToFunc[functionName](msg);
    }

    // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
    if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

    // Eğer kayıt işlemi daha önceden başlatılmışsa hata döndür
    if (guildDatabase.waitMessageCommands.setup) return errorEmbed("You cannot start the registration process again while the registration process is in progress!!");

    // Eğer botta "Yönetici" yetkisi yoksa hata döndür
    if (!guildMe.permissions.has('Administrator')) return errorEmbed(`Administrator`, "botPermissionError");

    // Özel bir şekilde mesaj gönderme fonksiyonu
    async function sendCustomMessage(message, content) {
      return message.reply({
        content,
        allowedMentions: {
          roles: [],
          repliedUser: true
        }
      });
    }

    // Hatalara bir tane hata ekle ve mesaj gönder
    function addErrorAndSendMessage(message, content, func) {
      currErrorCount += 1;

      // Eğer maximum hata ulaştıysa
      if (currErrorCount == Util.MAX.errorForSetup) {
        // Veriyi sil ve Database'ye kaydet
        delete guildDatabase.waitMessageCommands.setup;
        database.writeFile(guildDatabase, guildId);
        return sendCustomMessage(
          message,
          allErrors.cancel
        );
      };

      // İşlemi devam ettir
      sendCustomMessage(
        message,
        `${allErrors.numberOfRemainingAttempts(Util.MAX.errorForSetup - currErrorCount)}\n` +
        content
      );
      return func(message);
    }

    // Database'ye kaydetme fonksiyonu
    const saveDatabase = (message, functionName) => {
      guildDatabase.waitMessageCommands.setup = {
        commandName: this.name,
        messageId: message.id,
        channelId: channel.id,
        functionName,
        registerData: registerDatabase,
        errorCount: currErrorCount,
        timestamp: Date.now()
      };
      database.writeFile(guildDatabase, guildId);
    }

    // Mesajı gönder 
    sendCustomMessage(
      msg,
      `${allMessages.registerChannel}\n\n` +
      `• To cancel the transaction, you can type **cancel** or **close**\n` +
      `• If you want to return to the previous question, you can write **back**`
    );
    return await setRegisterChannel(msg);


    /**
     * Kayıt kanalını ayarlar
     * @param {Message} message 
     */
    async function setRegisterChannel(message) {
      // Database'ye kaydet
      saveDatabase(message, "setRegisterChannel")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              sendCustomMessage(message, allMessages.registerAuthRole)
              return await setRegisterAuthRole(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(
                message,
                `• I-I don't know how I can do this...\n` +
                `${allMessages.registerChannel}`
              );
              return await setRegisterChannel(message)
          };

          // Mesajdaki ilk kanalı bul
          const channel = Util.fetchChannel(message);

          // Eğer bir kanal etiketlememişse
          if (!channel) return addErrorAndSendMessage(
            message,
            allErrors.registerChannel,
            setRegisterChannel
          );

          // Eğer etiketlediği kanal bir yazı kanalı değilse
          if (channel.type != ChannelType.GuildText) return addErrorAndSendMessage(
            message,
            allErrors.notTextChannel,
            setRegisterChannel
          );

          // Database'ye kaydet ve devam et
          registerDatabase.channelIds.register = channel.id;
          sendCustomMessage(
            message,
            allMessages.afterRegisterChannel
          );
          return await setAfterRegisterChannel(message)
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.registerChannel,
            setRegisterChannel
          );
        })
    }

    /**
     * Kayıt sonrası kanalı ayarlar
     * @param {Message} message 
     */
    async function setAfterRegisterChannel(message) {
      // Database'ye kaydet
      saveDatabase(message, "setAfterRegisterChannel")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              sendCustomMessage(message, allMessages.registerLogChannel)
              return await setRegisterLogChannel(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(
                message,
                allMessages.registerChannel
              );
              return await setRegisterChannel(message)
          };

          // Mesajdaki ilk kanalı bul
          const channel = Util.fetchChannel(message);

          // Eğer bir kanal etiketlememişse
          if (!channel) return addErrorAndSendMessage(
            message,
            allErrors.registerChannel,
            setAfterRegisterChannel
          );

          // Eğer etiketlediği kanal bir yazı kanalı değilse
          if (channel.type != ChannelType.GuildText) return addErrorAndSendMessage(
            message,
            allErrors.notTextChannel,
            setAfterRegisterChannel
          );

          // Database'ye kaydet ve devam et
          registerDatabase.channelIds.afterRegister = channel.id;
          sendCustomMessage(
            message,
            allMessages.registerLogChannel
          );
          return await setRegisterLogChannel(message)
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.registerChannel,
            setAfterRegisterChannel
          );
        })
    }

    /**
     * Kayıt sonrası kanalı ayarlar
     * @param {Message} message 
     */
    async function setRegisterLogChannel(message) {
      // Database'ye kaydet
      saveDatabase(message, "setRegisterLogChannel")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              sendCustomMessage(message, allMessages.registerAuthRole);
              return await setRegisterAuthRole(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(
                message,
                allMessages.afterRegisterChannel
              );
              return await setAfterRegisterChannel(message);
          };

          // Mesajdaki ilk kanalı bul
          const channel = Util.fetchChannel(message);

          // Eğer bir kanal etiketlememişse
          if (!channel) return addErrorAndSendMessage(
            message,
            allErrors.registerChannel,
            setRegisterLogChannel
          );

          // Eğer etiketlediği kanal bir yazı kanalı değilse
          if (channel.type != ChannelType.GuildText) return addErrorAndSendMessage(
            message,
            allErrors.notTextChannel,
            setRegisterLogChannel
          );

          // Database'ye kaydet ve devam et
          registerDatabase.channelIds.log = channel.id;
          sendCustomMessage(
            message,
            allMessages.registerAuthRole
          );
          return await setRegisterAuthRole(message)
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.registerChannel,
            setRegisterLogChannel
          );
        })
    }

    /**
     * Kayıt yetkili rolünü ayarlar
     * @param {Message} message 
     */
    async function setRegisterAuthRole(message) {
      // Database'ye kaydet
      saveDatabase(message, "setRegisterAuthRole")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.registerLogChannel)
              return await setRegisterLogChannel(message);
          }

          // Mesajdaki ilk rolü bul
          const role = Util.fetchRole(message);

          // Eğer rolü etiketlememişse
          if (!role) return addErrorAndSendMessage(
            message,
            allMessages.registerAuthRole,
            setRegisterAuthRole
          );

          // Eğer etiketlediği rol bir bot rolüyse
          if (role.managed) return addErrorAndSendMessage(
            message,
            allErrors.botRole,
            setRegisterAuthRole
          );

          registerDatabase.roleIds.registerAuth = role.id;
          sendCustomMessage(message, allMessages.unregisterRole);
          return await setUnregisteredRole(message)
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.registerAuthRole,
            setRegisterAuthRole
          );
        })
    }

    /**
     * Kayıtsız rolünü ayarlar
     * @param {Message} message 
     */
    async function setUnregisteredRole(message) {
      // Database'ye kaydet
      saveDatabase(message, "setUnregisteredRole")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.registerAuthRole)
              return await setRegisterAuthRole(message);
          }

          // Mesajdaki ilk rolü bul
          const role = Util.fetchRole(message);

          // Eğer rolü etiketlememişse
          if (!role) return addErrorAndSendMessage(
            message,
            allMessages.unregisterRole,
            setUnregisteredRole
          );

          // Eğer etiketlediği rol bir bot rolüyse
          if (role.managed) return addErrorAndSendMessage(
            message,
            allErrors.botRole,
            setUnregisteredRole
          );

          // Eğer etiketlediği rol yetkili rolüyse
          if (role.id == registerDatabase.roleIds.registerAuth) return addErrorAndSendMessage(
            message,
            allErrors.authRole,
            setUnregisteredRole
          );

          registerDatabase.roleIds.unregister = role.id;
          sendCustomMessage(message, allMessages.registerType);
          return await setRegisterType(message)
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.registerAuthRole,
            setUnregisteredRole
          );
        })
    }

    /**
     * Kayıt türünü belirler
     * @param {Message} message 
     */
    async function setRegisterType(message) {
      // Database'ye kaydet
      saveDatabase(message, "setRegisterType")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.unregisterRole)
              return await setUnregisteredRole(message);

            // Eğer seçeneğini cinsiyet olarak seçmişse
            case "gender":
            case "g":
              registerDatabase.type = "gender";
              sendCustomMessage(message, allMessages.girlRoles);
              return await setGirlRoles(message);

            // Eğer seçeneğini Normal olarak seçmişse
            case "normal":
            case "nor":
            case "n":
              registerDatabase.type = "normal";
              sendCustomMessage(message, allMessages.normalRoles)
              return await setNormalRoles(message);

            // Eğer girdiği değer geçerli bir değer değilse
            default:
              return addErrorAndSendMessage(
                message,
                allMessages.registerType,
                setRegisterType
              );
          }
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.registerType,
            setRegisterType
          );
        })
    }

    /**
     * Üye rollerini ayarlar
     * @param {Message} message 
     */
    async function setNormalRoles(message) {
      // Database'ye kaydet
      saveDatabase(message, "setNormalRoles")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.registerType)
              return await setRegisterType(message);
          }

          // Mesajdaki rolleri çek
          const roles = Util.fetchRoles(message);

          // Eğer hiç rol etiketlememişse
          if (roles.size == 0) return addErrorAndSendMessage(
            message,
            allMessages.normalRoles,
            setNormalRoles
          );

          // Eğer bot rolünü etiketlemişse
          if (roles.some(role => role.managed)) return addErrorAndSendMessage(
            message,
            allErrors.botRole,
            setNormalRoles
          );

          // Eğer yetkili rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.registerAuth)) return addErrorAndSendMessage(
            message,
            allErrors.authRole,
            setNormalRoles
          );

          // Eğer kayıtsız rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.unregister)) return addErrorAndSendMessage(
            message,
            allErrors.unregisterRole,
            setNormalRoles
          );

          // Eğer rollerin bazıları bot rolünün üstündeyse
          const highestRoleBot = message.guild.members.me.roles.highest.position;
          const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
          if (roleAboveTheBotRole.size > 0) return addErrorAndSendMessage(
            message,
            allErrors.aboveBotRoles(roleAboveTheBotRole, message),
            setNormalRoles
          );

          // Database'ye kaydet
          registerDatabase.roleIds.normal = roles.map(role => role.id);
          sendCustomMessage(message, allMessages.botRoles)
          return await setBotRoles(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.normalRoles,
            setNormalRoles
          );
        })
    }

    /**
    * Kız rollerini ayarlar
    * @param {Message} message 
    */
    async function setGirlRoles(message) {
      // Database'ye kaydet
      saveDatabase(message, "setGirlRoles")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.registerType)
              return await setRegisterType(message);
          }

          // Mesajdaki rolleri çek
          const roles = Util.fetchRoles(message);

          // Eğer hiç rol etiketlememişse
          if (roles.size == 0) return addErrorAndSendMessage(
            message,
            allMessages.girlRoles,
            setGirlRoles
          );

          // Eğer bot rolünü etiketlemişse
          if (roles.some(role => role.managed)) return addErrorAndSendMessage(
            message,
            allErrors.botRole,
            setGirlRoles
          );

          // Eğer yetkili rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.registerAuth)) return addErrorAndSendMessage(
            message,
            allErrors.authRole,
            setGirlRoles
          );

          // Eğer kayıtsız rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.unregister)) return addErrorAndSendMessage(
            message,
            allErrors.unregisterRole,
            setGirlRoles
          );

          // Eğer maximum rol sayısına ulaştıysa
          if (roles.size > Util.MAX.mentionRoleForRegister) return addErrorAndSendMessage(
            message,
            allErrors.maxRole,
            setGirlRoles
          );

          // Eğer rollerin bazıları bot rolünün üstündeyse
          const highestRoleBot = message.guild.members.me.roles.highest.position;
          const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
          if (roleAboveTheBotRole.size > 0) return addErrorAndSendMessage(
            message,
            allErrors.aboveBotRoles(roleAboveTheBotRole, message),
            setGirlRoles
          );

          // Database'ye kaydet
          registerDatabase.roleIds.girl = roles.map(role => role.id);
          sendCustomMessage(message, allMessages.boyRoles)
          return await setBoyRoles(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.girlRoles,
            setGirlRoles
          );
        })
    }

    /**
     * Erkek rollerini ayarlar
     * @param {Message} message 
     */
    async function setBoyRoles(message) {
      // Database'ye kaydet
      saveDatabase(message, "setBoyRoles")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.girlRoles)
              return await setGirlRoles(message);
          }

          // Mesajdaki rolleri çek
          const roles = Util.fetchRoles(message);

          // Eğer hiç rol etiketlememişse
          if (roles.size == 0) return addErrorAndSendMessage(
            message,
            allMessages.boyRoles,
            setBoyRoles
          );

          // Eğer bot rolünü etiketlemişse
          if (roles.some(role => role.managed)) return addErrorAndSendMessage(
            message,
            allErrors.botRole,
            setBoyRoles
          );

          // Eğer yetkili rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.registerAuth)) return addErrorAndSendMessage(
            message,
            allErrors.authRole,
            setBoyRoles
          );

          // Eğer kayıtsız rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.unregister)) return addErrorAndSendMessage(
            message,
            allErrors.unregisterRole,
            setBoyRoles
          );

          // Eğer maximum rol sayısına ulaştıysa
          if (roles.size > Util.MAX.mentionRoleForRegister) return addErrorAndSendMessage(
            message,
            allErrors.maxRole,
            setBoyRoles
          );

          // Eğer rollerin bazıları bot rolünün üstündeyse
          const highestRoleBot = message.guild.members.me.roles.highest.position;
          const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
          if (roleAboveTheBotRole.size > 0) return addErrorAndSendMessage(
            message,
            allErrors.aboveBotRoles(roleAboveTheBotRole, message),
            setBoyRoles
          );

          // Database'ye kaydet
          registerDatabase.roleIds.boy = roles.map(role => role.id);
          sendCustomMessage(message, allMessages.botRoles)
          return await setBotRoles(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.boyRoles,
            setBoyRoles
          );
        })
    }

    /**
     * Bot rollerini ayarlar
     * @param {Message} message 
     */
    async function setBotRoles(message) {
      // Database'ye kaydet
      saveDatabase(message, "setBotRoles")

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              sendCustomMessage(message, allMessages.tag())
              return await setGuildTag(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.boyRoles)
              return await setBotRoles(message);
          }

          // Mesajdaki rolleri çek
          const roles = Util.fetchRoles(message);

          // Eğer hiç rol etiketlememişse
          if (roles.size == 0) return addErrorAndSendMessage(
            message,
            allMessages.botRoles,
            setBotRoles
          );

          // Eğer bot rolünü etiketlemişse
          if (roles.some(role => role.managed)) return addErrorAndSendMessage(
            message,
            allErrors.botRole,
            setBotRoles
          );

          // Eğer yetkili rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.registerAuth)) return addErrorAndSendMessage(
            message,
            allErrors.authRole,
            setBotRoles
          );

          // Eğer kayıtsız rolünü etiketlemişse
          if (roles.has(registerDatabase.roleIds.unregister)) return addErrorAndSendMessage(
            message,
            allErrors.unregisterRole,
            setBotRoles
          );

          // Eğer maximum rol sayısına ulaştıysa
          if (roles.size > Util.MAX.mentionRoleForRegister) return addErrorAndSendMessage(
            message,
            allErrors.maxRole,
            setBotRoles
          );

          // Eğer rollerin bazıları bot rolünün üstündeyse
          const highestRoleBot = message.guild.members.me.roles.highest.position;
          const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
          if (roleAboveTheBotRole.size > 0) return addErrorAndSendMessage(
            message,
            allErrors.aboveBotRoles(roleAboveTheBotRole, message),
            setBotRoles
          );

          // Database'ye kaydet
          registerDatabase.roleIds.bot = roles.map(role => role.id);
          sendCustomMessage(message, allMessages.tag())
          return await setGuildTag(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.botRoles,
            setBotRoles
          );
        })
    }

    /**
     * Sunucunun tagını ayarlar
     * @param {Message} message 
     */
    async function setGuildTag(message) {
      // Database'ye kaydet
      saveDatabase(message, "setGuildTag");

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter: message => message.author.id == authorId && message.content.length > 0,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.botRoles)
              return await setBotRoles(message)

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              sendCustomMessage(message, allMessages.symbol())
              return await setGuildSymbol(message)
          }

          // Eğer tagın uzunluğu maximum değere ulaştıysa
          if (message.content.length > Util.MAX.tagLength) return addErrorAndSendMessage(
            message,
            allErrors.tag,
            setGuildTag
          );

          // Database'ye kaydet
          registerDatabase.tag = message.content.trim();
          sendCustomMessage(message, allMessages.symbol());
          return await setGuildSymbol(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.tag(),
            setGuildTag
          );
        })
    }

    /**
    * Sunucunun sembolünü ayarlar
    * @param {Message} message 
    */
    async function setGuildSymbol(message) {
      // Database'ye kaydet
      saveDatabase(message, "setGuildSymbol");

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter: message => message.author.id == authorId && message.content.length > 0,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.tag())
              return await setGuildTag(message)

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              sendCustomMessage(message, allMessages.guildAddName("<tag> Unregistered"));
              return await setGuildAddName(message);
          }

          // Eğer sembolün uzunluğu maximum değere ulaştıysa
          if (message.content.length > Util.MAX.symbolLength) return addErrorAndSendMessage(
            message,
            allErrors.symbol,
            setGuildSymbol
          );

          // Database'ye kaydet
          registerDatabase.symbol = message.content.trim();
          sendCustomMessage(message, allMessages.guildAddName("<tag> Unregistered"));
          return await setGuildAddName(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.symbol(),
            setGuildSymbol
          );
        })
    }

    /**
     * Sunucunun özelleştirilmiş giriş ismini ayarlar
     * @param {Message} message 
     */
    async function setGuildAddName(message) {
      // Database'ye kaydet
      saveDatabase(message, "setGuildAddName");

      // Mesaj atmasını bekle
      await channel?.awaitMessages({
        filter: message => message.author.id == authorId && message.content.length > 0,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          switch (message.content.toLocaleLowerCase(language)) {
            // Eğer kayıt kuru iptal etmek istiyorsa
            case "close":
            case "cancel":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "back":
              sendCustomMessage(message, allMessages.symbol())
              return await setGuildSymbol(message)

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "skip":
              registerDatabase.customNames.guildAdd = "<tag> <name>";
              return await last(message);
          }

          // Database'ye kaydet
          registerDatabase.customNames.guildAdd = message.content.trim();
          return await last(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          return addErrorAndSendMessage(
            message,
            allMessages.guildAddName("<tag> Unregistered"),
            setGuildAddName
          )
        })
    }

    /**
     * Kayıt verilerini kaydetme ve verileri gösterir
     * @param {Message} message 
     */
    async function last(message) {
      // Database'deki setup verisini sil
      delete guildDatabase.waitMessageCommands.setup;

      // Verileri Database'ye kaydet
      guildDatabase.register = {
        ...guildDatabase.register,
        ...registerDatabase
      };
      database.writeFile(guildDatabase, guildId);

      return msg.client.prefixCommands[language].get("registerinfo").execute({
        guildDatabase,
        msg: message,
        msgMember,
        guildId,
        guild,
        errorEmbed,
      });
    }

  },
};