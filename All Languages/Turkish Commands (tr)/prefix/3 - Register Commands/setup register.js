"use strict";
const {
  EmbedBuilder,
  Message,
  ChannelType
} = require("discord.js");
const {
  EMOJIS
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
  name: "kur", // Komutun ismi
  id: "kur", // Komutun ID'si
  cooldown: 3, // Komutun bekleme süresi
  aliases: [ // Komutun diğer çağırma isimleri
    "kur",
    "kayıtkur",
    "setup",
    "setupregister"
  ],
  description: "Bütün rolleri ve kanalları teker teker ayarlamak yerine hepsini birden ayarlarsınız", // Komutun açıklaması
  category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
  usage: "<px>kur", // Komutun kullanım şekli
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
      cancel: `❗ İşlem iptal edilmiştir`,
      numberOfRemainingAttempts(numberOfRemain) {
        return `‼️ Lütfen soruları düzgün cevaplayınız - __*( **${numberOfRemain}** adet hakkınız kaldı )*__`;
      },

      // Kanal hataları
      notTextChannel: `${EMOJIS.no} Etiketlediğiniz kanal bir yazı kanalı değil. Lütfen bir yazı kanal giriniz`,

      // Rol hataları
      botRole: `${EMOJIS.no} Botların oluşturduğu rolleri başkalarına veremem. Lütfen başka bir rol giriniz`,
      unregisterRole: `${EMOJIS.no} Etiketlediğiniz rol veya rollerden birisi bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rol giriniz`,
      authRole: `${EMOJIS.no} Etiketlediğiniz rol veya rollerden biri bu sunucudaki üyeleri kayıt eden yetkili rolü. Lütfen başka bir rol giriniz`,
      maxRole: `${EMOJIS.no} Hey hey heyyy, sence de biraz fazla rol etiketlemedin mi? Lütfen daha az rol etiketleyip tekrar deneyiniz`,
      aboveBotRole(roleId) {
        return `${EMOJIS.no} **<@&${roleId}>** adlı rolün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`
      },
      aboveBotRoles(roles) {
        return `${EMOJIS.no} Etiketlediğiniz [${roles.map(role => `<@&${role.id}>`).join(" | ")}] adlı rolün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`
      },
      boyRoles(roles) {
        return `${EMOJIS.no} Etiketlediğiniz [${roles.map(role => `<@&${role.id}>`).join(" | ")}] rol(ler) bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rol giriniz`
      },
      girlRoles(roles) {
        return `${EMOJIS.no} Etiketlediğiniz [${roles.map(role => `<@&${role.id}>`).join(" | ")}] rol(ler) bu sunucudaki kızlara verilecek olan rol. Lütfen başka bir rol giriniz`
      },
      normalRoles(roles) {
        return `${EMOJIS.no} Etiketlediğiniz [${roles.map(role => `<@&${role.id}>`).join(" | ")}] rol(ler) bu sunucudaki üyelere verilecek olan rol. Lütfen başka bir rol giriniz`
      },

      // Tag ve sembol hataları
      tag: `${EMOJIS.no} tag uzunluğunuz 10'dan büyük olamaz. Lütfen daha kısa bir tag giriniz`,
      symbol: `${EMOJIS.no} sembol uzunluğunuz 3'ten büyük olamaz. Lütfen daha kısa bir sembol giriniz`,
    };
    const allMessages = {
      // Kayıt kanalı ayarlama
      registerChannel: `${EMOJIS.channel} Kayıtlar hangi kanalda yapılacak. Lütfen bir kanal etiketleyiniz`,

      // Kayıt sonrası kanalı ayarlama
      afterRegisterChannel: `${EMOJIS.channel} Kayıt sonrası kanal hangi kanal olacak. Kayıt sonrası kanalının sohbet kanalı olması önerilir. Eğer kayıt sonrası kanalını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen bir kanal etiketleyiniz`,

      // Kayıt log kanalı ayarlama
      registerLogChannel: `${EMOJIS.channel} Kayıt log kanalı hangi kanal olacak. Eğer kayıt log kanalını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen bir kanal etiketleyiniz`,

      // Kayıt yetkili rolü ayarlama
      registerAuthRole: `${EMOJIS.role} Üyeleri kayıt eden yetkili rolü hangi rol olacak. Lütfen bir rol etiketleyiniz`,

      // Kayıtsız rolü ayarlama
      unregisterRole: `${EMOJIS.role} Üyeleri kayıt ettikten sonra hangi rol alınacak veya sunucuya katılınca ona hangi rolü vereceğim. Kısaca kayıtsız rolü ne olacak. Lütfen bir rol etiketleyiniz`,

      // Kayıt tipini ayarlama
      registerType: `❓ Kayıt türünüz **Normal** mi yoksa **Cinsiyet** mi olacak?`,

      // Üye rollerini ayarlama
      normalRoles: `${EMOJIS.normal} Üyelere hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz`,

      // Kız ve Erkek rollerini ayarlama
      girlRoles: `${EMOJIS.girl} Kızlara hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz`,
      boyRoles: `${EMOJIS.boy} Erkeklere hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz`,

      // Bot Rollerini ayarlama
      botRoles: `${EMOJIS.bot} Botlara hangi rol(ler) verilecek. Eğer ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen rol(leri) etiketleyiniz`,

      // Tag ve sembol ayarlama
      tag() {
        return `📝 İsimlerin başına koyulacak tag ne olsun. Eğer tag ayarlamak istemiyorsanız \`geç\` yazabilirsiniz\n` +
          `• Eğer tagı **♫** olarak ayarladıysanız şöyle gözükecek **${Util.customMessages.registerName({
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
        return `📝 İsimlerin arasına koyulacak sembol ne olsun. Eğer sembol ayarlamak istemiyorsanız \`geç\` yazabilirsiniz\n` +
          `‼️ Semboller botların isimlerine koyulmayacaktır \n` +
          `• Eğer sembolü **|** olarak ayarladıysanız şöyle gözükecek **${Util.customMessages.registerName({
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
        return `📝 Birisi sunucuya girince onun kullanıcı adı ne olsun. Eğer kullanıcı adını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz\n` +
          `‼️ Oto isim botların isimlerine koyulmayacaktır\n` +
          `• Eğer oto ismi **${guildAddNameParam}** olarak ayarladıysanız şöyle gözükecek **${Util.customMessages.unregisterName({
            message: guildDatabase.register.customNames.guildAdd,
            guildDatabase,
            name: "Kullanıcının ismi"
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
          sendCustomMessage(message, allMessages.guildAddName("<tag> Kayıtsız"))
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
    if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

    // Eğer kayıt işlemi daha önceden başlatılmışsa hata döndür
    if (guildDatabase.waitMessageCommands.setup) return errorEmbed("Kayıt kur işlemi devam ederken tekrar kayıt kur işlemini başlatamazsın!!");

    // Eğer botta "Yönetici" yetkisi yoksa hata döndür
    if (!guildMe.permissions.has('Administrator')) return errorEmbed(`Yönetici`, "botPermissionError");

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
      `• İşlemi iptal etmek için **iptal** veya **kapat**\n` +
      `• Eğer önceki soruya dönmek isterseniz **geri** yazabilirsiniz`
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
              sendCustomMessage(message, allMessages.registerAuthRole)
              return await setRegisterAuthRole(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
              sendCustomMessage(
                message,
                `• B-ben bunu nasıl yapabileceğimi b-bilmiyorum...\n` +
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
        .catch(err => {
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
              sendCustomMessage(message, allMessages.registerLogChannel)
              return await setRegisterLogChannel(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
        .catch(err => {
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
              sendCustomMessage(message, allMessages.registerAuthRole);
              return await setRegisterAuthRole(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
        .catch(err => {
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
              sendCustomMessage(message, allMessages.unregisterRole)
              return await setUnregisteredRole(message);

            // Eğer seçeneğini cinsiyet olarak seçmişse
            case "cinsiyet":
            case "cin":
            case "c":
              registerDatabase.type = "gender";
              sendCustomMessage(message, allMessages.girlRoles);
              return await setGirlRoles(message);

            // Eğer seçeneğini Normal olarak seçmişse
            case "normal":
            case "normalkayit":
            case "normalkayıt":
            case "normal kayıt":
            case "normal kayit":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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

          // Eğer maximum rol sayısına ulaştıysa
          if (roles.size > Util.MAX.mentionRoleForRegister) return addErrorAndSendMessage(
            message,
            allErrors.maxRole,
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel);

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
              sendCustomMessage(message, allMessages.tag())
              return await setGuildTag(message);

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
              sendCustomMessage(message, allMessages.botRoles)
              return await setBotRoles(message)

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
              sendCustomMessage(message, allMessages.tag())
              return await setGuildTag(message)

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
              sendCustomMessage(message, allMessages.guildAddName("<tag> Kayıtsız"));
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
          sendCustomMessage(message, allMessages.guildAddName("<tag> Kayıtsız"));
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
            case "kapat":
            case "iptal":
              delete guildDatabase.waitMessageCommands.setup;
              database.writeFile(guildDatabase, guildId);
              return sendCustomMessage(message, allErrors.cancel)

            // Eğer önceki ayarlamaya dönmek istiyorsa
            case "geri":
              sendCustomMessage(message, allMessages.symbol())
              return await setGuildSymbol(message)

            // Eğer bu ayarlamayı geçmek istiyorsa
            case "geç":
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
            allMessages.guildAddName("<tag> Kayıtsız"),
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

      return msg.client.prefixCommands[language].get("kayıtbilgi").execute({
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