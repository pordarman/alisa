"use strict";

// Tanımlamalar
const {
  Client,
  GatewayIntentBits,
  Partials,
  RESTJSONErrorCodes,
  Options
} = require("discord.js");
const {
  token,
  shardCount,
  topggtoken,
  authorBotId
} = require("./settings.json");
const client = new Client({
  intents: [
    // Botun erişmesini istediğimiz özellikler
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  // Botun önbelleğe kaydetmesini istediğimiz özellikler
  makeCache: Options.cacheWithLimits({
    MessageManager: 10_000,
  }),
  // Botun önbellekteki verilerini ne zaman silmemizi istediğimiz özellikler
  sweepers: {
    messages: {
      interval: 60 * 60 * 3, // Her 3 saatte mesajları sil
      lifetime: 60 * 30, // 30 dakika önceki mesajları sil
    },
  },
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
  ],
  presence: {
    status: "idle",
  },
  failIfNotExists: false, // Eğer cevap verdiği kullanıcının mesajı yoksa botun döndürip vermemesini ayarlar
  shardCount
});
const fs = require("fs");

// client önbellek tanımlamaları
// Bunları obje olarak kaydetmemizin asıl nedeni birden çok dil ekleyeceğimiz için bütün dillerin komutlarını farklı bir veride tutacağız
client.prefixCommands = {}; // Prefix komutları
client.slashCommands = {}; // Slash komutları
client.slashCommandsJSON = []; // Slash JSON komutları (Slash komutlarını sunucuda aktif etmek için json şeklinde olması gerek)
client.buttonCommands = {}; // Buton komutları
client.selectMenuCommands = {}; // Seçmeli menü komutları
client.interactionCommands = {}; // İnteraction komutları
client.categoryCommands = {}; // Kategori komutları

client.waitCommands = new Set(); // Mesaj bekleme komutlarını kullanırken kullanıcıların art arda komut kullanılmasını önlemek için kullanıcılarının ID'lerini önbelleğe kaydediyoruz
client.buttonRegisterMember = new Map(); // Kullanıcıları hem butonla hem de komut kullanarak kayıt etmesini engeller
client.buttonChangeNameMember = new Map(); // Kullanıcının ismini aynı anda 2 kişinin değiştirmesini engeller
client.guildVoices = new Map(); // Sunucunun ses bilgilerini saklar

client.prefixCooldown = new Map(); // Bekleme süreleri ile ilgili veriler
client.channelCooldown = new Map(); // Kanalın bekleme süresi

client.guildDatabase = {}; // Sunucunun verileri önbelleğe kaydetme
client.registerOptions = new Set(); // Kaç sunucunun kayıt tipinin "Normal" olduğunu gösterir

client.mutedMembers = new Map(); // Kullanıcıların mute bilgilerini saklar
client.jailedMembers = new Map(); // Kullanıcıların jail mute bilgilerini saklar
client.guildPremiums = new Map(); // Sunucu premium bilgilerini saklar

client.setMaxListeners(0); // Konsola hata vermemesi için

// Yardımcı komut yüklemeleri
const files = fs.readdirSync(`${__dirname}\\Handlers`);

for (const file of files) {
  require(`./Handlers/${file}`)(client, __dirname);
};

// Botu başlatma
client.login(token).catch((error) => {
  console.log(
    error.code === RESTJSONErrorCodes.InvalidToken ?
      "Girdiğiniz token hatalı! Lütfen tokeninizi kontrol ediniz ve tekrar başlatınız" :
      error
  );
  return process.exit(1);
})
  // Eğer bot başarıyla başlatılmışsa
  .then(() => {

    if (topggtoken) {
      // Botun bilgilerini Top.gg'ye aktarma
      const { AutoPoster } = require("topgg-autoposter");

      const poster = AutoPoster(topggtoken, client, {
        interval: 1000 * 60 * 60 * 6, // Her 6 saatte bir güncelleme yap
      });

      poster.on("posted", () => {
        console.log(`[${new Date().toLocaleString("fr")}] Botun istatistikleri paylaşıldı`);
      });
    }
  })
