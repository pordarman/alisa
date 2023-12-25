import Discord from "discord.js";

/**
 * @typedef {Object} customLogin
 * @property {String} content
 * @property {Boolean} isEmbed
 * @property {?String} image
 */

/**
 * @typedef {customLogin} customAfterRegister
 */

/**
 * @typedef {Object} registerRoleIdsObject
 * @property {String} registerAuth
 * @property {String} unregister
 * @property {Array<String>} girl
 * @property {Array<String>} normal
 * @property {Array<String>} boy
 * @property {Array<String} bot
 */

/**
 * @typedef {Object} registerChannelIdsObject
 * @property {String} register
 * @property {String} log
 * @property {String} afterRegister
 */

/**
 * @typedef {Object} lastRegistersObject
 * @property {String} gender
 * @property {String} authorId
 * @property {String} memberId
 * @property {Number} timestamp
 */

/**
 * @typedef {Object} premiumObject
 * @property {String} partnerRoleId
 * @property {Array<String>} authorizedRoleIds
 */

/**
 * @typedef {Object} customNamesObject
 * @property {String} register
 * @property {String} registerBot
 * @property {String} guildAdd
 * @property {String} guildAddBot
 */



/**
 * @typedef {Object} registerObject
 * @property {Object<String, Array>} authorizedInfos
 * @property {registerRoleIdsObject} roleIds - Bütün rollerin ID'lerinin saklandığı yer
 * @property {registerChannelIdsObject} channelIds - Bütün kanalın ID'lerinin saklandığı yer
 * @property {customLogin} customLogin - Özel giriş mesajı
 * @property {customAfterRegister} customAfterRegister - Özel kayıt sonrası mesajı
 * @property {Array<lastRegistersObject>} lastRegisters - Son yapılan kayıtlar
 * @property {customNamesObject} customNames - Özelleştirilmiş isimler
 * @property {Object} prevNamesOfMembers - Kullanıcıların önceki adları
 * @property {String} tag - Sunucunun tagı
 * @property {String} symbol - Sunucunun sembolü
 * @property {"normal"|"gender"} type - Kayıtın türü 
 * @property {Boolean} isRegisterOff
 * @property {Boolean} isAutoRegisterForBot
 * @property {Boolean} isAutoCorrectOn
 * @property {Boolean} isAgeRequired
 * @property {Number} ageLimit
 */

/**
 * @typedef {Object} roleIdsObject
 * @property {String} vip
 * @property {String} vipAuth
 */

/**
 * @typedef {Object} moderationRoleIdsObject
 * @property {String} banAuth
 * @property {String} kickAuth
 * @property {String} muteAuth
 */

/**
 * @typedef {Object} moderationChannelIdsObject
 * @property {String} modLog
 */

/**
 * @typedef {Object} moderationObject
 * @property {moderationChannelIdsObject} channelIds
 * @property {moderationRoleIdsObject} roleIds
 * @property {Object} nowMutedMembers
 * @property {Number} penaltyNumber
 */

/**
 * @typedef {Object} suspiciousObject
 * @property {String} roleId
 * @property {Number} suspiciousTime
 * @property {Boolean} autoSuspicious
 */

/**
 * @typedef {Object} afkObject
 * @property {String} reason
 * @property {Number} timestamp
 */

/**
 * @typedef {Object} countSettingsObject
 * @property {Boolean} total
 * @property {Boolean} registered
 * @property {Boolean} tagged
 * @property {Boolean} voice
 * @property {Boolean} boostCount
 * @property {Boolean} vip
 * @property {Boolean} jail
 * @property {Boolean} registerAuth
 * @property {Boolean} jailAuth
 * @property {Boolean} vipAuth
 * @property {Boolean} banAuth
 * @property {Boolean} kickAuth
 * @property {Boolean} muteAuth
 */

/**
 * @typedef {Object} countCommandSettingsObject
 * @property {Boolean} isEmoji
 * @property {countSettingsObject} datas
 */






/**
 * @typedef {Object} guildAddAndRemoveObject
 * @property {Object} add
 * @property {Object} remove
 */

/**
 * @typedef {Object} featuresObject
 * @property {Array<String>} newCodes
 * @property {Array<String>} newFeatures
 * @property {Array<String>} fixes
 * @property {Number} timestamp
 */

/**
 * @typedef {Object} featuresLangObject
 * @property {featuresObject} en
 * @property {featuresObject} tr
 */

/**
 * @typedef {Object} commandHelperObject
 * @property {featuresLangObject} features
 */

/**
 * @typedef {Object} lastObject
 * @property {String} authorId
 * @property {String} memberId
 * @property {Number} timestamp
 * @property {?String} reason
 * @property {Boolean} isJailed
 * @property {?Boolean} isTempJailed
 * @property {?Number} duration
 */

/**
 * @typedef {Object} jailObject
 * @property {String} authRoleId
 * @property {String} roleId
 * @property {String} logChannelId
 * @property {Object} nowJailedMembers
 * @property {Array<lastObject>} last
 * @property {Object<String,Array<String>>} prevRoles
 */

/**
 * @typedef {Object} premiumFileObject
 * @property {String} authorId
 * @property {?Number} expiresTimestamp
 * @property {?Number} totalTime
 * @property {String} code
 * @property {Boolean} isUse
 */

/**
 * @typedef {Object} deleteDataObject
 * @property {String} authorId
 * @property {String} channelId
 * @property {Number} timestamp
 */

/**
 * @typedef {Object} waitMessageCommandsObject
 * @property {setupObject} setup
 * @property {customLoginObject} customLogin
 * @property {customAfterRegisterObject} customAfterRegister
 * @property {changeNameObject} changeName
 * @property {buttonRegisterObject} buttonRegister
 * @property {deleteDataObject} deleteRegister
 * @property {deleteDataObject} deleteAllDatas
 */

/**
 * @typedef {Object} snipeObject
 * @property {String} lastUserId
 */

/**
 * @typedef {Object} guildChannelIdsObject
 * @property {String} voice
 */

/**
 * @typedef {Object} registersCountObject
 * @property {Number} nowTotal
 */

/**
 * @typedef {Object} countablesObject
 * @property {Number} registerType
 * @property {Number} guildCount 
 */

/**
 * @typedef {Object} lastUptimeMessage
 * @property {String} messageId
 * @property {String} channelId
 * @property {String} guildId
 */

/**
 * @typedef {Object} alisaObject
 * @property {guildAddAndRemoveObject} guildAddRemove
 * @property {Object} commandUses
 * @property {Object} usersCommandUses
 * @property {Object} blacklistUsers
 * @property {Object} blacklistGuild
 * @property {Object} suggestions
 * @property {registersCountObject} registersCount
 * @property {Object} guildsCommandUses
 * @property {commandHelperObject} commandHelpers
 * @property {countablesObject} countables
 * @property {Number} lastUptimeTimestamp
 * @property {?lastUptimeMessage} lastUptimeMessage
 */

/**
 * @typedef {Object} guildDatabaseObject
 * @property {registerObject} register
 * @property {premiumObject} premium
 * @property {roleIdsObject} roleIds
 * @property {moderationObject} moderation
 * @property {suspiciousObject} suspicious
 * @property {waitMessageCommandsObject} waitMessageCommands
 * @property {guildChannelIdsObject} channelIds
 * @property {snipeObject} snipe
 * @property {String} prefix
 * @property {Object} userLogs
 * @property {jailObject} jail
 * @property {countCommandSettingsObject} countCommandSettings
 * @property {Object<String,afkObject>} afk
 * @property {"tr"|"en"} language
 */




/**
 * @typedef {Object} fieldsObject
 * @property {String} name
 * @property {String} value
 * @property {Boolean} inline
 */

/**
 * @typedef {Object} fieldsAndImageObject
 * @property {Array<fieldsObject>} fields
 * @property {String|null} image
 */

/**
 * @typedef {(
 * message: String, 
 * type?: "error" | "success" | "warn" | "memberPermissionError" | "botPermissionError", 
 * deleteMessageForMilisecond?: Number, 
 * fieldsAndImage?: fieldsAndImageObject
 * ) => Discord.EmbedBuilder} embedObject
 */






/**
 * @typedef {Object} exportsRunCommands
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {"tr"|"en"} language 
 * @property {Discord.Message} msg 
 * @property {Array<String>} args 
 * @property {String} guildId 
 * @property {String} authorId 
 * @property {String} prefix 
 * @property {embedObject} errorEmbed 
 * @property {Object} extras
 * @property {Discord.GuildMember} msgMember
 * @property {Discord.GuildMember} guildMe
 * @property {Discord.Guild} guild
 * @property {Boolean} isOwner
 * @property {premiumFileObject} premium
 */

/**
 * @typedef {Object} exportsRunButtons
 * @property {Discord.ButtonInteraction} int 
 * @property {String} customId
 * @property {String} authorId
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {"tr"|"en"} language 
 * @property {embedObject} errorEmbed
 * @property {String} guildId
 * @property {Discord.Guild} guild
 */

/**
 * @typedef {Object} exportsRunSlash
 * @property {Discord.ChatInputCommandInteraction} int
 * @property {String} authorId
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {"tr"|"en"} language 
 * @property {embedObject} errorEmbed
 * @property {String} guildId
 * @property {Discord.Guild} guild
 */

/**
 * @typedef {Object} exportsRunStringSelectMenu
 * @property {Discord.ChatInputCommandInteraction} int
 * @property {String} authorId
 * @property {alisaObject} alisa
 * @property {guildDatabaseObject} guildDatabase 
 * @property {"tr"|"en"} language 
 * @property {embedObject} errorEmbed
 * @property {String} guildId
 * @property {Discord.Guild} guild
 */