"use strict";
const database = require("../../../../Helpers/Database");
const {
  Message,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
  name: "autoresponse", // Komutun ismi
  id: "otocevap", // Komutun ID'si
  cooldown: 3, // Komutun bekleme süresi
  aliases: [ // Komutun diğer çağırma isimleri
    "autoresponse",
    "autoresponder",
  ],
  description: "You set a server-specific auto-response command", // Komutun açıklaması
  category: "Premium commands", // Komutun kategorisi (yardım menüsü için)
  usage: "<px>otocevap", // Komutun kullanım şekli
  care: false, // Komutun bakım modunda olup olmadığını ayarlar
  ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
  premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
  addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

  /**
   * Parametrelerdeki isimlerin ne olduklarını tanımlar
   * @param {import("../../../../typedef").exportsRunCommands} params 
   */
  async execute({
    guildDatabase,
    msg,
    msgMember,
    guildId,
    authorId,
    args,
    prefix,
    errorEmbed,
    extras,
    language,
  }) {

    // Eğer Bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
    let autoResponse = {};
    const objName = `${guildId}.${authorId}`;
    const filter = message => message.author.id == authorId && message.content.length > 0;
    const timeout = 30 * 1000; // Mesaj atması için 30 saniye bekle

    // Database'ye kaydetme fonksiyonu
    const saveDatabase = (message, functionName) => {
      guildDatabase.waitMessageCommands.autoResponse[objName] = {
        commandName: this.name,
        messageId: message.id,
        channelId: message.channelId,
        functionName,
        autoResponseData: autoResponse,
        timestamp: Date.now()
      };
      database.writeFile(guildDatabase, guildId);
    }

    /**
     * Tetikleyici mesajı ayarlama
     * @param {Message} message 
     */
    async function setTriggerMessage(message) {
      saveDatabase(message, "setTriggerMessage");

      // Mesaj atmasını bekle
      await message.channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          // Veriyi kaydet ve sonraki fonksiyona geç
          autoResponse.triggerMessage = message.content;
          await message.reply(
            `Now, when the user writes this message, what will I write??`
          );
          return await setSendMessage(message);
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          message.reply(`⏰ <@${authorId}>, your time is up!`);

          delete guildDatabase.waitMessageCommands.autoResponse[objName];
          database.writeFile(guildDatabase, guildId);
        })
    }

    /**
    * Tetikleyici mesajı atan kullanıcıya atılacak mesajı ayarlama
    * @param {Message} message 
    */
    async function setSendMessage(message) {
      saveDatabase(message, "setSendMessage");

      // Mesaj atmasını bekle
      await message.channel?.awaitMessages({
        filter,
        max: 1,
        time: timeout
      })
        // Eğer mesaj attıysa
        .then(async messages => {
          const message = messages.first();

          // Veriyi database'ye kaydet
          guildDatabase.autoResponse[autoResponse.triggerMessage] = {
            content: message.content,
            timestamp: Date.now()
          };
          delete guildDatabase.waitMessageCommands.autoResponse[objName];
          database.writeFile(guildDatabase, guildId);

          return errorEmbed(
            `Your auto message has been set up successfully! I have given how to use the message in the example below`,
            "success",
            null,
            {
              fields: [
                {
                  name: "\u200b",
                  value: "\u200b"
                },
                {
                  name: "The message the user will send",
                  value: autoResponse.triggerMessage
                },
                {
                  name: "The message I will send",
                  value: message.content
                }
              ]
            }
          );
        })
        // Eğer mesaj atmadıysa
        .catch(() => {
          message.reply(`⏰ <@${authorId}>, your time is up!`);

          delete guildDatabase.waitMessageCommands.autoResponse[objName];
          database.writeFile(guildDatabase, guildId);
        })
    }

    // Eğer Bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır 
    if (extras) {
      const {
        functionName,
        autoResponseData
      } = extras;
      autoResponse = autoResponseData;

      return {
        async setTriggerMessage() {
          await msg.reply(
            `Since the bot has been restarted, the **Automatic response setting** command you used before has been started again\n\n` +
            `• Now please write the message to trigger`
          )
          return setTriggerMessage(msg);
        },
        async setSendMessage() {
          await msg.reply(
            `Since the bot has been restarted, the **Automatic response setting** command you used before has been started again\n\n` +
            `• Now please write the message I will give when the user sends the message to be triggered`
          )
          return setSendMessage(msg);
        }
      }[functionName](msg);
    };

    // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
    if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

    switch (args[0]?.toLocaleLowerCase(language)) {
      // Eğer otocevap ayarlamak istiyorsa
      case "set":
      case "add": {
        await msg.reply(
          `Please write the message to trigger\n\n` +
          `**• If you don't know what this means: for example, if you want the bot to type "as" when someone types "hi", type "hi" in the message to be triggered**`
        );
        return await setTriggerMessage(msg);
      };

      // Eğer ayarlanan otocevabı kaldırmak istiyorsa
      case "remove": {

        // Çıkarılacak mesajı seç
        const message = msg.content.slice(
          msg.content.search(
            new RegExp(`(?<=remove)`)
          )
        ).trim();

        // Eğer bir mesaj girmemişse
        if (!message) return errorEmbed(
          `Please enter a **trigger** message data\n\n` +
          `**Example:**\n` +
          `• ${prefix}${this.name} remove hello\n` +
          `• ${prefix}${this.name} remove hi`,
          "warn",
          30 * 1000 // Mesajı 30 saniye boyunca göster
        );

        // Eğer mesaj otocevap verisinde yoksa hata döndür
        if (!(message in guildDatabase.autoResponse)) return errorEmbed("No autoresponse data was found for the data you entered!");

        // Database'ye kaydet
        delete guildDatabase.autoResponse[message];
        database.writeFile(guildDatabase, guildId);

        return errorEmbed(`Autoreply data named **${message}** has been successfully removed`, "success");
      }

      // Eğer otocevap listesini göstermek istiyorsa
      case "list": {

        const allAutoResponseDatas = Object.entries(guildDatabase.autoResponse);
        const length = allAutoResponseDatas.length;

        // Eğer hiç veri yoksa
        if (length === 0) return errorEmbed("The table cannot be displayed because there is no autoresponse data on this server");

        const AUTO_RESPONSES_PER_PAGE = 5,
          MAX_LENGTH = 75,
          MAX_LENGTH_SELECT_MENU = 25,
          LENGTH_TO_HUMANIZE = Util.toHumanize(length, language),
          MAX_PAGE_NUMBER = Math.ceil(length / AUTO_RESPONSES_PER_PAGE);

        // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
        const pages = new Map();

        // Eğer mesaj belirli bir karakter sınırının üstündeyse mesajı ayır
        function truncatedString(string, maxLength) {
          if (string.length <= maxLength) return string;

          let truncated = string.slice(0, maxLength);

          // Eğer kelimenin tam sonuna geldiyse olduğu gibi döndür
          if (
            !/[a-zA-ZığüşçöİĞÜŞÖÇ]/.test(string[maxLength])
          ) return `${truncated}...`;

          const lastSpaceIndex = truncated.lastIndexOf(" ");
          if (lastSpaceIndex !== -1) {
            truncated = truncated.slice(0, lastSpaceIndex).trim();
          }

          return `${truncated}...`;
        }

        // Mesajın düzgün gözükmesi için ekstra boşluklar koyuyoruz
        const extraSpace = `\u200b `.repeat(2);

        // Mesajda gösterilecek otocevap verilerini silme ve düzenleme için select menüler gösterme
        const editMessageSelectMenu = new StringSelectMenuBuilder()
          .setPlaceholder("Edit data")
          .setMinValues(1)
          .setMaxValues(1)
          .setCustomId("ONEautoResponse");
        const deleteMessageSelectMenu = new StringSelectMenuBuilder()
          .setPlaceholder("delete data")
          .setMinValues(1)
          .setCustomId("autoResponse_");

        // Sayfada gözükecek otocevapları database'den çekme fonksiyonu
        function getAutoRespondes(pageNum, limit) {
          // Select menüleri sıfırla
          let editMessageArray = [];
          let deleteMessageArray = [];

          const startIndex = (pageNum - 1) * limit
          const resultArray = [];
          for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
            try {
              let [triggerMessage, {
                content,
                timestamp
              }] = allAutoResponseDatas[index];

              // Milisaniyeyi saniyeye çevirme
              timestamp = Math.round(timestamp / 1000);

              const truncatedTriggerMessage = truncatedString(triggerMessage, MAX_LENGTH_SELECT_MENU);
              const truncatedContent = truncatedString(content, MAX_LENGTH_SELECT_MENU);

              // Select menülere veri ekleme
              editMessageArray.push(
                {
                  label: truncatedTriggerMessage,
                  description: truncatedContent,
                  value: `autoResponse-edit-${index}-${authorId}`,
                  emoji: "🏷️"
                }
              )
              deleteMessageArray.push(
                {
                  label: truncatedTriggerMessage,
                  description: truncatedContent,
                  value: `autoResponse-delete-${index}-${authorId}`,
                  emoji: "🏷️"
                }
              )

              resultArray.push(
                `• ${truncatedString(triggerMessage, MAX_LENGTH)}\n` +
                `${extraSpace}└> ${truncatedString(content, MAX_LENGTH)}\n` +
                `${extraSpace}└> **Added timestamp:** <t:${timestamp}:F> - <t:${timestamp}:R>`
              );
            }
            // Eğer olur da bir hata oluşursa döngüyü geç
            catch (__) {
              continue;
            }
          }

          // Select menülere verileri ekle
          editMessageSelectMenu
            .setOptions(...editMessageArray);

          deleteMessageSelectMenu
            .setOptions(...deleteMessageArray)
            .setMaxValues(deleteMessageArray.length);

          const result = {
            array: resultArray,
            selectMenus: [
              new ActionRowBuilder()
                .addComponents(editMessageSelectMenu),
              new ActionRowBuilder()
                .addComponents(deleteMessageSelectMenu)
            ]
          };

          pages.set(pageNum, result);
          return result
        }
        function getPage(pageNum) {
          return pages.get(pageNum) ?? getAutoRespondes(pageNum, AUTO_RESPONSES_PER_PAGE)
        }

        let pageNumber = 1;

        const clientAvatar = msg.client.user.displayAvatarURL();

        // Girilen sayfa numarasına göre embed'i düzenleme fonksiyonu
        function createContent(pageNum) {
          const pageContent = getPage(pageNum);
          return {
            embed: new EmbedBuilder()
              .setAuthor({
                name: msg.client.user.displayName,
                iconURL: clientAvatar
              })
              .setDescription(
                `• The bot currently has __${LENGTH_TO_HUMANIZE}__ autoresponse data\n\n` +
                pageContent.array.join("\n")
              )
              .setThumbnail(clientAvatar)
              .setColor("DarkPurple")
              .setFooter({
                text: `Page ${pageNum}/${MAX_PAGE_NUMBER || 1}`
              }),
            components: pageContent.selectMenus
          }
        };

        const pageContent = createContent(pageNumber);

        if (MAX_PAGE_NUMBER <= 1) return msg.reply({
          embeds: [
            pageContent.embed
          ],
          components: pageContent.components
        });

        // Mesaja butonlar ekle ve bu butonlar sayesinde sayfalar arasında geçişler yap
        const fastleftButton = new ButtonBuilder()
          .setEmoji(EMOJIS.leftFastArrow)
          .setCustomId("COMMAND_BUTTON_FASTLEFT")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageNumber == 1);

        const leftButton = new ButtonBuilder()
          .setEmoji(EMOJIS.leftArrow)
          .setCustomId("COMMAND_BUTTON_LEFT")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageNumber == 1);

        const deleteButton = new ButtonBuilder()
          .setEmoji(EMOJIS.delete)
          .setCustomId("COMMAND_BUTTON_DELETE")
          .setStyle(ButtonStyle.Danger);

        const rightButton = new ButtonBuilder()
          .setEmoji(EMOJIS.rightArrow)
          .setCustomId("COMMAND_BUTTON_RIGHT")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageNumber == MAX_PAGE_NUMBER);

        const fastrightButton = new ButtonBuilder()
          .setEmoji(EMOJIS.rightFastArrow)
          .setCustomId("COMMAND_BUTTON_FASTRIGHT")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageNumber == MAX_PAGE_NUMBER);

        // Her yerde yeni bir ActionRowBuilder oluşturmak yerine hepsini bu fonksiyondan çekeceğiz
        function createRowBuilder() {
          return new ActionRowBuilder()
            .addComponents(
              fastleftButton,
              leftButton,
              deleteButton,
              rightButton,
              fastrightButton
            )
        }

        const waitMessage = await msg.reply({
          content: `**• If the pages do not change even when you press the buttons, please delete this message and create a new one**`,
          embeds: [
            pageContent.embed
          ],
          components: [
            createRowBuilder(),
            ...pageContent.components
          ]
        });

        // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
        if (!waitMessage) return;

        const TWO_MINUTES = 1000 * 60 * 2

        const waitComponents = waitMessage.createMessageComponentCollector({
          filter: (button) => button.user.id == authorId,
          time: TWO_MINUTES
        })

        // Eğer butona tıklarsa
        waitComponents.on("collect", (button) => {
          switch (button.customId) {
            case "COMMAND_BUTTON_DELETE":
              // Mesajı sil
              return waitMessage.delete();

            case "COMMAND_BUTTON_FASTLEFT":
            case "COMMAND_BUTTON_LEFT":
              // Sağ okları yeniden aktif et    
              rightButton.setDisabled(false);
              fastrightButton.setDisabled(false);

              // Kaç sayfa geriye gideceğini hesapla
              pageNumber = Math.max(1, pageNumber - (button.customId == "COMMAND_BUTTON_LEFT" ? 1 : 5));

              // Eğer en başa geldiysek sol okları deaktif et
              if (pageNumber == 1) {
                leftButton.setDisabled(true);
                fastleftButton.setDisabled(true);
              }
              break;
            default:
              // Sol okları yeniden aktif et    
              leftButton.setDisabled(false);
              fastleftButton.setDisabled(false);

              // Kaç sayfa ileriye gideceğini hesapla
              pageNumber = Math.min(MAX_PAGE_NUMBER, pageNumber + (button.customId == "COMMAND_BUTTON_RIGHT" ? 1 : 5));

              // Eğer en sona geldiysek sağ okları deaktif et
              if (pageNumber == MAX_PAGE_NUMBER) {
                rightButton.setDisabled(true);
                fastrightButton.setDisabled(true);
              }
              break;
          }

          const pageContent = createContent(pageNumber);

          return waitMessage.edit({
            embeds: [
              pageContent.embed
            ],
            components: [
              createRowBuilder(),
              ...pageContent.components
            ]
          })
        })

        // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
        waitComponents.on("end", () => {
          // Eğer mesaj silinmişse hiçbir şey yapma
          if (
            !msg.channel.messages.cache.has(waitMessage.id)
          ) return;

          // Butonları deaktif et
          fastleftButton
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);
          leftButton
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);
          deleteButton
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);
          rightButton
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);
          fastrightButton
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

          // Bellekten tasarruf etmek için Map fonksiyonunu temizle
          pages.clear();

          // ilk componentteki düğmeleri düzenle
          waitMessage.components[0] = createRowBuilder();

          return waitMessage.edit({
            content: `• This message is no longer active`,
            components: waitMessage.components
          })
        });

      }

        break;

      // Eğer geçerli bir seçenek girmediyse
      default:
        return errorEmbed(
          `Please enter an option\n\n` +
          `**🗒️ Enterable options**\n` +
          `**• ${prefix}${this.name} add =>** Adds a new autoresponse data\n` +
          `**• ${prefix}${this.name} remove =>** Removes autoresponse data from the specified\n` +
          `**• ${prefix}${this.name} list =>** Shows the entire autoreply list`
        )
    }

  },
};