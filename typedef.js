import Discord from "discord.js"

/**
 * @typedef {Object} özelObject
 * @property {String} yazı
 * @property {Boolean} embed
 * @property {?String} im
 */

/**
 * @typedef {Object} gözelObject
 * @property {String} yazı
 * @property {Boolean} embed
 */

/**
 * @typedef {Object} kayıtObject
 * @property {Array<String>} kız
 * @property {Array<String>} erkek
 * @property {Array<String>} normal
 * @property {String} tag
 * @property {Boolean} secenek
 * @property {Boolean} ayar
 * @property {Boolean} bototo
 * @property {Boolean} otoduzeltme
 * @property {Boolean} yaszorunlu
 * @property {özelObject} özel
 * @property {gözelObject} gözel
 * @property {Array<String>} bot
 * @property {String} kanal
 * @property {String} log
 * @property {String} günlük
 * @property {String} tag
 * @property {String} sembol
 * @property {Number} yassinir
 * @property {String} vrol
 * @property {String} vyetkili
 * @property {String} kayıtsız
 * @property {Number} otogun
 * @property {Number} otos
 * @property {String} otosrol
 * @property {String} yetkili
 * @property {String} bany
 * @property {String} kicky
 * @property {String} mutey
 * @property {String} modl
 * @property {String} dis
 */

/**
 * @typedef {Object} premiumObject
 * @property {String} author
 * @property {?Number} expiresTimestamp
 * @property {?Number} totalTime
 * @property {String} code
 * @property {Boolean} isUse
 */

/**
 * @typedef {Object} alisaObject
 * @property {numberObject} kullanımlar
 * @property {Object} kisiler
 * @property {Object} kl
 * @property {Object} sunucular
 * @property {Object} starih
 * @property {Array} kurallar
 * @property {Object} skullanımlar
 * @property {Object} öneri
 * @property {Object} kayıtsayı
 * @property {Object} yenilik
 * @property {Array} klserver
 * @property {Number} lastUptime
 */

/**
 * @typedef {Object} guildDatabaseObject
 * @property {Object} kayıtkisiler
 * @property {Array} son
 * @property {kayıtObject} kayıt
 * @property {Object} isimler
 * @property {Object} premium
 * @property {Object} kl
 * @property {Object} sc
 * @property {Object} jail
 * @property {Object} say
 * @property {Array} afk
 */

/**
 * @typedef {Object} filedsObject
 * @property {String} name
 * @property {String} value
 * @property {Boolean} inline
 */

/**
 * @typedef {Object} hataFieldsAndImageObject
 * @property {filedsObject} fileds
 * @property {String|null} image
 */

/**
 * @typedef {Function} hataObject
 * @property {String} message
 * @property {["h" | "b" | "ne"]} select
 * @property {Number} delete
 * @property {hataFieldsAndImageObject} filedsAndImage
 */









/**
 * @typedef {Object} exportsRunCommands
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {Discord.Message} msg 
 * @property {Array<String>} args 
 * @property {String} guildId 
 * @property {String} prefix 
 * @property {premiumObject} pre
 * @property {hataObject} hata 
 * @property {Array|Object|Boolean} sonradan
 * @property {Discord.GuildMember} msgMember
 * @property {Discord.GuildMember} guildMe
 * @property {Discord.Guild} guild
 */
 
/**
 * @typedef {Object} exportsRunButtons
 * @property {Discord.ButtonInteraction} int 
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {hataObject} hata 
 * @property {String} guildId
 * @property {Discord.Guild} guild
 * @property {Array} sonradan
 */

/**
 * @typedef {Object} exportsRunSlash
 * @property {Discord.ChatInputCommandInteraction} int 
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {hataObject} hata 
 * @property {String} guildId
 * @property {Discord.Guild} guild
 * @property {Array} sonradan
 */