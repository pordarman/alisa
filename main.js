const {
  Collection,
  AttachmentBuilder,
  Client,
  GatewayIntentBits,
  User,
  WebhookClient,
} = require("discord.js");
const client = new Client({
  restRequestTimeout: 60000,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildBans,
  ],
  presence: { status: "idle" },
  failIfNotExists: false,
  shardCount: ayarlar.shard,
});

const { token, emojiler, shard, webhook } = require("./ayarlar.json");
const { readdirSync } = require("fs");
const db = require("./modüller/database");



// ===== Client ayarlamaları =====

/*
 * Sunucu verilerini daha hızlı çekmek amacıyla geçici olarak burada tutuyoruz
 */
client.sunucudb = {};

/*
 * Botu kullanan sunucuların kaç tanesi cinsiyetle kayıt ediyor kaç tanesi tek üye olarak kayıt ediyor burada saklıyoruz
 */
client.secenek = new Set();

/*
 * Prefix'le kullanılan komutları burada tutuyoruz
 */
client.commands = new Collection();

/*
 * Butonlarla yapılan komutları burada tutuyoruz
 */
client.buttons = new Collection();

/*
 * Butonla kayıt ederken aynı anda birden fazla kişinin kayıt edilmesini engellemek için oluşturuldu
 */
client.butonsure = new Collection();

/*
 * Slash komutlarını burada tutuyoruz
 */
client.slash = new Collection([["commands", []]]);

/*
 * Sunucunun verisini çeker
 */
client.guildDatabase = (id) => client.sunucudb[id] || db.buldosya(id);

/*
 * Sunucunun tagrol veri bilgisini çeker
 */
client.tagrolDatabase = (id, tag) =>
  db.bul(id, "tag rol", "diğerleri") || {
    kisi: {},
    tag: tag ? tag.slice(0, -1) : undefined,
  };

/*
 * ID'sini girdiğiniz sunucunun shard ID'sini yazar
 */
client.shardId = (guildId) => Number(BigInt(guildId) >> 22n) % shard;

/*
 * Yardım komutunda gösterilen komutları burada tutuyoruz
 */
client.allCommands = require("./diğerleri/tüm komutlar");

/*
 * Bazı RegExp verilerini karıştırmamak için burada tutup çekiyoruz
 */
client.regex = {
  fetchAge: /(?<=(\s|(?<!.)))[1-9]{1}(\d{1})?(?!\S)/,
  getAge: /(?<=\s)[1-9](\d)?(?!\w)/,
  getSeconds: /(?<!\d)\d{1,3}(?= ?(saniye|sn|s))(?! ? saat)/gi,
  getMinutes: /(?<!\d)\d{1,3}(?= ?(dakika|dk|m))/gi,
  getHours: /(?<!\d)\d{1,3}(?= ?(saat|h))/gi,
  getDays: /(?<!\d)\d{1,3}(?= ?(g[üu]n|d))(?! ?d(akika|k))/gi,
};

/*
 * Fake komutundaki butonlarda gösterilecek resimleri burada tutuyoruz
 */
client.namePhoto = {
  üye: new AttachmentBuilder("https://i.hizliresim.com/emr7apu.png", {
    name: "örnek_kullanım.png",
  }),
  şüpheli: new AttachmentBuilder("https://i.hizliresim.com/befowjp.png", {
    name: "örnek_kullanım.png",
  }),
  yeniden: new AttachmentBuilder("https://i.hizliresim.com/6vnmf5k.png", {
    name: "örnek_kullanım.png",
  }),
  erkek: new AttachmentBuilder("https://i.hizliresim.com/isk8bbl.png", {
    name: "örnek_kullanım.png",
  }),
  kız: new AttachmentBuilder("https://i.hizliresim.com/6w8153u.png", {
    name: "örnek_kullanım.png",
  }),
  bot: new AttachmentBuilder("https://i.hizliresim.com/nmntmn8.png", {
    name: "örnek_kullanım.png",
  }),
  isim: new AttachmentBuilder("https://i.hizliresim.com/s190sc5.png", {
    name: "örnek_kullanım.png",
  }),
};

/*
 * Bir webhook kanalı ayarlayınız. Bu kanal botta oluşan hataları gösterecektir
 */
try {
  client.hook = new WebhookClient({ url: webhook });
} catch (e) {}

/*
 * Bu da hata kanalına atılan mesaj
 */
client.hata = (dirname, error) =>
  client.hook?.send(
    `**${dirname}** adlı komut dosyamda bir hata oluştu!\n` +
      "```js\n" +
      error +
      "```"
  );

/*
 * Bu konsolda gösterilen bazı hataları giderir lütfen bunu silmeyiniz
 */
client.setMaxListeners(0);

// ===== Client ayarlamaları =====



// ===== Yardımcı ayarlamalar =====

/*
 * Bu komut çok önemlidir, eğer bunu kaldırırsanız bot gerektiği gibi çalışmayacaktır!
 * Bu komutu açıklamak gerekirse; botunu 400-500 sunucuya ulaştığında bot artık her yeniden başlatıldığında her sunucudaki üyeleri çekemeyecek
 * Ve bazı sunucularda 500 üye olmasına rağmen 5 tane üye olarak gösterecek. O sunucudaki bütün üyeleri önbelleğe kaydetmek için en az bir kere .fetch() methotunu kullanmamız gerek
 */
client.getMembers = async (msg) => {
  let guild = msg.guild,
    cache = guild.members.cache;
  if (guild.memberCount == cache.size) return cache;
  return await guild.members.fetch().catch((err) => {});
};

/*
 * Mesajda etiketlenen veya ID'si girilen sunucu üyesini çeker
 */
client.fetchMember = async (id, msg) => {
  if (!id) return undefined;
  const matchId = id.match(/\d{17,19}/);
  if (!matchId) return undefined;
  let member = await client.fetchMemberForce(matchId[0], msg);
  if (!member) return null;
  return member;
};

/*
 * Bu da eğer o kişinin sunucuda olduğundan eminseniz bu komutu kullanarak hiç kontrol etmeden üyeyi çeker
 */
client.fetchMemberForce = async (id, msg) => {
  return (await client.getMembers(msg)).get(id);
};

/*
 * Mesajda etiketlenen veya ID'si girilen discord üyesini çeker
 */
client.fetchUser = async (id) => {
  if (!id) return undefined;
  const matchId = id.match(/\d{17,19}/);
  if (!matchId) return undefined;
  let member = await client.fetchUserForce(matchId[0]);
  if (!member) return null;
  return member;
};

/*
 * Bu da eğer o kişinin discordda olduğundan eminseniz bu komutu kullanarak hiç kontrol etmeden üyeyi çeker
 */
client.fetchUserForce = async (id) => {
  let user = client.users.cache.get(id);
  if (user) return user;
  try {
    let deneme = await client.shard.broadcastEval(
      (c, idg) => {
        let userShard = c.users.cache.get(idg);
        if (userShard) return userShard;
      },
      { context: id }
    );
    user = deneme.find((a) => a != null);
    if (user) return new User(client, user);
  } catch (e) {}
  return await client.users.fetch(id).catch((err) => {});
};

/*
 * Mesajda etiketlenen veya ID'si girilen bütün rolleri çeker
 */
client.fetchRoles = (id, msg) => {
  if (!id) return new Map();
  const matchId = id.match(/\d{17,19}/g);
  if (!matchId || !matchId.length) return new Map();
  return msg.guild.roles.cache.filter((a) => matchId.includes(a.id));
};

/*
 * Mesajda etiketlenen veya ID'si girilen ilk rolü çeker
 */
client.fetchRole = (id, msg) => {
  let role = msg.mentions.roles.first();
  if (role) return role;
  let matchId = id.match(/\d{17,19}/);
  if (!matchId) return undefined;
  return msg.guild.roles.cache.get(matchId);
};

/*
 * Mesajda etiketlenen veya ID'si girilen ilk kanalı çeker
 */
client.fetchChannel = (id, msg) => {
  let channel = msg.mentions.channels.first();
  if (channel) return channel;
  let matchId = id.match(/\d{17,19}/);
  if (!matchId) return undefined;
  return msg.guild.channels.cache.get(matchId);
};

/*
 * Girdiğiniz sayı değerini emojili halde yazar
 */
client.stringToEmojis = (input) => {
  let emojisayı = "",
    say = String(input);
  for (let i = 0; i < say.length; i++) emojisayı += emojiler[say[i]];
  return emojisayı;
};

/*
 * Bu isteğe bağlıdır kaldırabilirsiniz, fakat bunu kullanan birkaç komut var orayı da düzenlemelisiniz
 *
 * ==================================
 * ./events/ready.js
 * └> 400. satır, 63. sütun
 *
 * ./komutlar/bot komutları/alisa.js
 * └> 148. satır, 182. sütun
 *
 * ./komutlar/bot komutları/premium.js
 * ├> 35. satır, 79. sütun
 * ├> 38. satır, 89. sütun
 * ├> 68. satır, 105. sütun
 * ├> 101. satır, 108. sütun
 * └> 103. satır, 105. sütun
 *
 * ./komutlar/sahip komutları/kl.js
 * ├> 92. satır, 45. sütun
 * └> 96. satır, 45. sütun
 *
 * ./slash/bot komutları/alisa.js
 * └> 129. satır, 182. sütun
 *
 * ./slash/bot komutları/premium.js
 * ├> 32. satır, 83. sütun
 * ├> 35. satır, 93. sütun
 * ├> 83. satır, 116. sütun
 * ├> 96. satır, 112. sütun
 * └> 130. satır, 116. sütun
 * ==================================
 */
client.getGuildNameOrId = async (id, bool = true) => {
  try {
    let sunucu = client.guilds.cache.get(id);
    if (sunucu) return bool ? `**${sunucu.name}**` : sunucu.name;
    sunucu = await client.shard.broadcastEval(
      (c, id) => c.guilds.cache.get(id),
      { context: id, shard: client.shardId(id) }
    );
    if (sunucu) return bool ? `**${sunucu.name}**` : sunucu.name;
  } catch (e) {}
  return bool ? `**${id}** ID'ye sahip` : undefined;
};

/*
 * Eğer belirli bir kanala mesaj attırmak istiyorsanız (mesela siz X sunucusundasınız ve Y sunucusununun kanalına mesaj attırmak istiyorsunuz) bu komut işinize yarayabilir
 * Ve eğer o sunucunun ID'sini de biliyorsanız daha hızlı bir şekilde komutu kullanabilirsiniz
 *
 * DİKKAT!!
 *
 * Bazı yerlerde bu fonksion kullanılıyor. Eğer botun sorunsuz bir şekilde çalışmasını istiyorsanız lütfen aşağıdaki dosyalara giderek uygun kanal ID'lerini yazınız.
 * Eğer yazmazsanız botunuz gerektiği gibi çalışmayacaktır
 *
 * ==================================
 * ./events/guildCreate.js
 * └> 201. satır, 239. sütun
 *
 * ./events/guildDelete.js
 * └> 19. satır, 337. sütun
 *
 * ./events/messageCreate.js
 * └> 75. satır, 53. sütun
 *
 * ./events/ready.js =>
 * └> 467. satır, 156. sütun
 *
 *
 * ./komutlar/geri bildirim.js
 * └> 40. satır, 51. sütun
 *
 * ./komutlar/hata.js
 * └> 40. satır, 51. sütun
 *
 * ./komutlar/öneri.js
 * └> 50. satır, 348. sütun
 *
 *
 * ./slash/geri bildirim.js
 * └> 38. satır, 57. sütun
 *
 * ./slash/hata.js
 * └> 38. satır, 57. sütun
 *
 * ./slash/öneri.js
 * └> 48. satır, 354. sütun
 * ==================================
 */
client.sendChannel = async (object, id, guildId) => {
  try {
    let kanal = client.channels.cache.get(id);
    if (kanal) return kanal.send(array[0]).catch((err) => {});
    return await client.shard.broadcastEval(
      (a, array) => {
        let kanalClient = a.channels.cache.get(array[1]);
        if (kanalClient) return kanalClient.send(array[0]).catch((err) => {});
      },
      {
        context: [object, id],
        shard: guildId ? client.sharId(guildId) : undefined,
      }
    );
  } catch (e) {
    return undefined;
  }
};

/*
 * ID'sini girdiğiniz sunucunun bilgilerini çeker
 *
 * Fakat bu JSON objesi olarak döndürüldüğü için bu sunucunun davetlerini çekemez, rollerini çekemez ve kanallarına mesaj atamazsınız!
 */
client.getGuild = async (id) => {
  try {
    let sunucu = client.guilds.cache.get(id);
    if (sunucu) return sunucu.toJSON();
    return await client.shard.broadcastEval(
      (a, id_1) => {
        let sunucu2 = a.guilds.cache.get(id_1);
        if (sunucu2) return sunucu2;
      },
      { context: id, shard: client.sharId(id) }
    );
  } catch (e) {
    return undefined;
  }
};
// ===== Yardımcı ayarlamalar =====

// ===== Komut yüklemeleri =====
readdirSync(`${__dirname}\\slash`).forEach((klasorAdları) => {
  readdirSync(`${__dirname}\\slash\\${klasorAdları}`).forEach((file) => {
    const command = require(`${__dirname}\\slash\\${klasorAdları}\\${file}`);
    switch (klasorAdları) {
      case "sahip komutları":
        command.owner = true;
        break;
      case "premium komutları":
        command.pre = true;
        break;
    }
    client.slash.set(command.data.name, command);
    client.slash.commands.push(command.data.toJSON());
  });
});

readdirSync(`${__dirname}\\butonlar`).forEach((klasorAdları) => {
  readdirSync(`${__dirname}\\butonlar\\${klasorAdları}`).forEach((file) => {
    const command = require(`${__dirname}\\butonlar\\${klasorAdları}\\${file}`);
    client.buttons.set(command.name, command);
  });
});

readdirSync(`${__dirname}\\events`).forEach((file) => {
  const event = require(`${__dirname}\\events\\${file}`);
  client.on(event.name, (...args) => event.run(...args));
});

let komutIsmiVarMiYokMu = db.bul("kullanımlar", "alisa", "diğerleri"),
  obje = { Ç: "C", Ğ: "G", Ö: "O", Ş: "S", Ü: "U" };
readdirSync(`${__dirname}\\komutlar`).forEach((klasorAdları) => {
  readdirSync(`${__dirname}\\komutlar\\${klasorAdları}`).forEach((file) => {
    const command = require(`${__dirname}\\komutlar\\${klasorAdları}\\${file}`);
    switch (klasorAdları) {
      case "sahip komutları":
        command.owner = true;
        break;
      case "premium komutları":
        command.pre = true;
        break;
    }
    if (!Array.isArray(command.aliases)) command.aliases = [command.aliases];
    command.aliases.forEach((a, i) =>
      command.aliases.unshift(
        command.aliases[i + i]
          .toLocaleUpperCase()
          .replace(/[ÇĞÖÜŞ]/g, (e) => obje[e])
          .toLocaleLowerCase()
      )
    );
    command.aliases = [...new Set(command.aliases)];
    command.aliases.forEach((x) => client.commands.set(x, command));
  });
});
db.yaz("kullanımlar", komutIsmiVarMiYokMu, "alisa", "diğerleri");
// ===== Komut yüklemeleri =====

client.login(token);
