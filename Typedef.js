// @ts-check

import * as Discord from "discord.js";

// #region DATABASE TYPES
/**
 * @typedef {Object} GuildDatabaseObject
 * @property {RegisterObject} register - Kayıt verileri
 * @property {PremiumObject} premium - Premium verileri
 * @property {RoleIdsObject} roleIds - Rol ID'leri
 * @property {ModerationObject} moderation - Moderasyon verileri
 * @property {SuspiciousObject} suspicious - Şüpheli verileri
 * @property {WaitMessageCommandsObject} waitMessageCommands - Bekleme mesajı komutları
 * @property {GuildChannelIdsObject} channelIds - Kanal ID'leri
 * @property {SnipeObject} snipe - Silinen mesajlar
 * @property {string} prefix - Sunucunun prefix'i
 * @property {Object<string,UserLogsObject>} userLogs - Kullanıcı logları
 * @property {JailObject} jail - Jail verileri
 * @property {CountCommandSettingsObject} countCommandSettings - Say komutu ayarları
 * @property {Object<string,AfkObject>} afk - AFK verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {Object<string,MemberStatObject>} stats - Sunucunun istatistikleri
 * @property {boolean} isStatOn - İstatistiklerin kaydedilip kaydedilmeyeceği
 * @property {Object<string, { content: string, timestamp: number }>} autoResponse - Otomatik cevap verilecek mesajlar
 */
// #endregion

// #region ROLE & CHANNEL IDS TYPES
/**
 * @typedef {Object} RoleIdsObject
 * @property {string} vip - VIP rol ID'si
 * @property {string} vipAuth - VIP yetkili rol ID'si
 */

/**
 * @typedef {Object} GuildChannelIdsObject
 * @property {string} voice - Ses kanalı ID'si
 */
// #endregion

// #region REGISTER TYPES
/**
 * @typedef {Object} CustomLogin
 * @property {string} content - Giriş mesajının içeriği
 * @property {boolean} isEmbed - Giriş mesajının embed olup olmadığı
 * @property {?string} image - Giriş mesajının resmi
 */

/**
 * @typedef {CustomLogin} CustomAfterRegister
 * @property {string} content - Kayıt sonrası mesajının içeriği
 * @property {boolean} isEmbed - Kayıt sonrası mesajının embed olup olmadığı
 * @property {?string} image - Kayıt sonrası mesajının resmi
 */
/**
 * @typedef {Object} RegisterRoleIdsObject
 * @property {string} registerAuth - Yetkili rol ID'si
 * @property {string} unregister - Kayıtsız üye ID'si
 * @property {Array<string>} girl - Kız rolü ID'leri
 * @property {Array<string>} member - Üye rolü ID'leri
 * @property {Array<string>} boy - Erkek rolü ID'leri
 * @property {Array<string>} bot - Bot rolü ID'leri
 */

/**
 * @typedef {Object} RegisterChannelIdsObject
 * @property {string} register - Kayıt kanalı ID'si
 * @property {string} log - Kayıt log kanalı ID'si
 * @property {string} afterRegister - Kayıt sonrası atılacak kanal ID'si
 */

/**
 * @typedef {Object} LastRegistersObject
 * @property {string} gender - Cinsiyet
 * @property {string} authorId - Yetkili ID'si
 * @property {string} memberId - Üye ID'si
 * @property {number} timestamp - Kayıt tarihi
 * @property {boolean} isAgainRegister - Tekrar kayıt olup olmadığı
 */

/**
 * @typedef {Object} CustomNamesObject
 * @property {string} register - Kayıt yapılırken düzenelecek isim
 * @property {string} registerBot - Bot kayıt yapılırken düzenelecek isim
 * @property {string} guildAdd - Kullanıcı sunucuya giriş yapınca düzenlenecek isim
 * @property {string} guildAddBot - Bot sunucuya giriş yapınca düzenlenecek isim
 */

/**
 * @typedef PrevNamesOfMembersObject
 * @property {"boy" | "girl" | "member" | "bot"} gender - Kayıt edilen cinsiyet
 * @property {string} name - Kayıt edilen kişinin yeni ismi
 * @property {string} roles - Verilen roller
 * @property {string} authorId - Kayıt eden yetkili ID'si
 * @property {number} timestamp - Kayıt tarihi
 */

/**
 * @typedef {Object} FirstAndLastRegister
 * @property {string} memberId - Üye ID'si
 * @property {string} roles - Üyeye verilen roller
 * @property {number} timestamp - Kayıt tarihi
 */

/**
 * @typedef {Object} AuthorizedInfos
 * @property {{ girl: number, boy: number, member: number, bot: number, total: number }} countables - Kayıt sayıları
 * @property {FirstAndLastRegister} firstRegister - İlk kayıt bilgileri
 * @property {FirstAndLastRegister} lastRegister - Son kayıt bilgileri
 */

/**
 * @typedef {Object} RegisterObject
 * @property {Object<string, AuthorizedInfos>} authorizedInfos - Kayıt yapan yetkili verileri
 * @property {RegisterRoleIdsObject} roleIds - Bütün rollerin ID'lerinin saklandığı yer
 * @property {RegisterChannelIdsObject} channelIds - Bütün kanalın ID'lerinin saklandığı yer
 * @property {CustomLogin} customLogin - Özel giriş mesajı
 * @property {CustomAfterRegister} customAfterRegister - Özel kayıt sonrası mesajı
 * @property {Array<LastRegistersObject>} lastRegisters - Son yapılan kayıtlar
 * @property {CustomNamesObject} customNames - Özelleştirilmiş isimler
 * @property {Object<string,Array<PrevNamesOfMembersObject>>} prevNamesOfMembers - Kullanıcıların önceki adları
 * @property {string} tag - Sunucunun tagı
 * @property {string} symbol - Sunucunun sembolü
 * @property {"member" | "gender"} type - Kayıtın türü
 * @property {boolean} isRegisterOff - Kaydın kapalı olup olmadığı
 * @property {boolean} isAutoRegisterForBot - Botların otomatik kayıt yapılıp yapılmadığı
 * @property {boolean} isAutoCorrectOn - İsim düzeltmesi
 * @property {boolean} isAgeRequired - Yaş girmenin zorunlu olup olmadığı
 * @property {boolean} isAuthroizedNotificationOn - Yetkili bildiriminin açık olup olmadığı
 * @property {boolean} isNameRequired - İsim girmenin zorunlu olup olmadığı
 * @property {number | null} ageLimit - Yaş sınırı
 * @property {Object<string,string>} rankRoles - Kayıt sayısına göre verilecek roller
 */
// #endregion

// #region STATS TYPES
/**
 * @typedef {Object} MemberStatVoiceDatasObject
 * @property {Number} duration - Ses süresi
 * @property {Number} startedTimestamp - Ses kanalına giriş zamanı
 * @property {Number} endedTimestamp - Ses kanalından çıkış zamanı
*/

/**
 * @typedef {Object} MemberStatVoiceObject
 * @property {Number} total - Toplam ses süresi
 * @property {Array<MemberStatVoiceDatasObject>} datas - Ses süresi bilgileri
 */

/**
 * @typedef {Object} MemberStatCurrVoiceObject
 * @property {string} channelId - Ses kanalının ID'si
 * @property {Number} startedTimestamp - Ses kanalına giriş zamanı
 */

/**
 * @typedef {Object} MemberStatTotalObject
 * @property {Number} message - Toplam mesaj sayısı
 * @property {Number} voice - Toplam ses süresi

/**
 * @typedef {Object} MemberStatObject
 * @property {MemberStatCurrVoiceObject} currVoice - Şu anda ses kanalında olan üye bilgileri
 * @property {MemberStatTotalObject} totals - Toplam mesaj ve ses bilgileri
 * @property {Object<string, Array<Number>>} messages - Kullanıcının mesajları ve zamanları
 * @property {Object<string, MemberStatVoiceObject>} voice - Kullanıcının ses bilgileri ve zamanları
 */
// #endregion

// #region USER LOGS TYPES
/**
 * @typedef {Object} UserLogsObject
 * @property {"register" | "unregister" | "suspicious" | "changeRoles" | "changeName" | "ban" | "unban" | "kick" | "mute" | "unmute" | "jail" | "tempjail" | "unjail" | "joinGuild" | "leaveGuild"} type - Kullanıcı log türü
 * @property {string} authorId - Yetkili ID'si
 * @property {number} timestamp - Log tarihi
 * @property {"boy" | "girl"} [to] - Eğer cinsiyeti değiştiriyorsa cinsiyet
 * @property {number} penaltyNumber - Ceza numarası
 * @property {number} [duration] - Eğer ceza süresi varsa ceza süresi
 * @property {string} [newName] - Eğer ismi değiştiriyorsa yeni isim
 * @property {boolean} [isJailed] - Eğer jaile atıldıysa true, değilse false
 * @property {"boy" | "girl" | "member" | "bot"} [gender] - Eğer kayıt yapıldıysa cinsiyet
 */

// #region WAIT MESSAGE COMMANDS TYPES
/**
 * @typedef {Object} SetupObject
 * @property {string} commandName - Komutun ismi
 * @property {string} messageId - Komutun atıldığı mesaj ID'si
 * @property {string} channelId - Komutun atıldığı kanal ID'si
 * @property {string} functionName - Komutun fonksiyon ismi
 * @property {RegisterObject} registerData - Kayıt verileri
 * @property {Number} errorCount - Hata sayısı
 * @property {Number} timestamp - Komutun atıldığı tarih
 */

/**
 * @typedef {Object} WaitMessageObject
 * @property {string} authorId - Komutu atan kişinin ID'si
 * @property {string} channelId - Komutun atıldığı kanal ID'si
 * @property {string} messageId - Komutun atıldığı mesaj ID'si
 * @property {Number} timestamp - Komutun atıldığı tarih
 * @property {string} commandName - Komutun ismi
*/

/**
 * @typedef {Object} ButtonRegisterObject
 * @property {string} authorId - Komutu atan kişinin ID'si
 * @property {string} channelId - Komutun atıldığı kanal ID'si
 * @property {string} messageId - Komutun atıldığı mesaj ID'si
 * @property {Number} timestamp - Komutun atıldığı tarih
 * @property {string} commandName - Komutun ismi
 * @property {Boolean} isMemberHasUnregisterRole - Üyenin kayıtsız rolü olup olmadığı
 */

/**
 * @typedef {Object} AutoResponseDataObject
 * @property {string} triggerMessage - Tetikleyici mesaj
 */

/**
 * @typedef {Object} AutoResponseObject
 * @property {string} commandName - Komutun ismi
 * @property {string} messageId - Mesaj ID'si
 * @property {string} channelId - Kanal ID'si
 * @property {string} functionName - Fonksiyonun ismi
 * @property {AutoResponseDataObject} autoResponseData - Oto cevap datası
 * @property {number} timestamp - Komut tarihi
 */


/**
 * @typedef {Object} WaitMessageCommandsObject
 * @property {SetupObject} setup - Setup komutu
 * @property {WaitMessageObject} customLogin - Özel giriş mesajı
 * @property {WaitMessageObject} customAfterRegister - Özel kayıt sonrası mesajı
 * @property {Object<string,WaitMessageObject>} changeName - İsim değiştirme komutu
 * @property {Object<string,ButtonRegisterObject>} buttonRegister - Butonla kayıt komutu
 * @property {AutoResponseObject} autoResponse - Otomatik cevap verme komutları
 */
// #endregion

// #region AFK TYPES
/**
 * @typedef {Object} AfkObject
 * @property {string} reason - AFK sebebi
 * @property {number} timestamp - AFK olma tarihi
 */
// #endregion

// #region SNIPE TYPES
/**
 * @typedef {Object} SnipeAttachmentsObject
 * @property {Number} image - Resim sayısı
 * @property {Number} video - Video sayısı
 * @property {Number} audio - Ses sayısı
 * @property {Number} text - Metin sayısı
 * @property {Number} font - Font sayısı
 * @property {Number} others - Diğer sayısı

/**
 * @typedef {Object} SnipeObject
 * @property {string} content - Silinen mesajın içeriği
 * @property {Number} createdTimestamp - Mesajın oluşturulma zamanı
 * @property {Number} deletedTimestamp - Mesajın silinme zamanı
 * @property {SnipeAttachmentsObject} attachments - Mesajın ekleri
 */
// #endregion

// #region MODERATION TYPES
/**
 * @typedef {Object} ModerationRoleIdsObject
 * @property {string} banAuth - Ban yetkili rol ID'si
 * @property {string} kickAuth - Kick yetkili rol ID'si
 * @property {string} muteAuth - Mute yetkili rol ID'si
 */

/**
 * @typedef {Object} ModerationChannelIdsObject
 * @property {string} modLog - Moderasyon log kanalı ID'si
 */

/**
 * @typedef {Object} NowMutedMembersObject
 * @property {number} timestamp - Mutelenme tarihi
 * @property {number} expiresTimestamp - Mute'nin bitme tarihi
 * @property {string} messageId - Mesaj ID'si (daha sonrasından mesajı yanıtlayabilmek için)
 * @property {string} authorId - Muteleyen yetkili ID'si
 * @property {string} channelId - Kanal ID'si
 * @property {string} reason - Mute sebebi
 * @property {number} penaltyNumber - Ceza numarası
 */

/**
 * @typedef {Object} ModerationObject
 * @property {ModerationChannelIdsObject} channelIds - Kanal ID'leri
 * @property {ModerationRoleIdsObject} roleIds - Rol ID'leri
 * @property {Object<string,NowMutedMembersObject>} nowMutedMembers - Şu anda susturulmuş üyeler
 * @property {number} penaltyNumber - Ceza numarası
 */
// #endregion

// #region SUSPICIOUS TYPES
/**
 * @typedef {Object} SuspiciousObject
 * @property {string} roleId - Şüpheli rol ID'si
 * @property {number | null} suspiciousTime - Kullanıcının şüpheli olacağı süre
 * @property {boolean} autoSuspicious - Kullanıcının otomatik şüpheli olup olmadığı
 */
// #endregion

// #region JAIL TYPES
/**
 * @typedef {Object} LastObject
 * @property {string} authorId - Yetkili ID'si
 * @property {string} memberId - Üye ID'si
 * @property {number} timestamp - Jaile atılma tarihi
 * @property {?string} reason - Jaile atılma sebebi
 * @property {boolean} isJailed - Jaile atılıp atılmadığı
 * @property {?boolean} isTempJailed - Geçici jaile atılıp atılmadığı
 * @property {?number} duration - Jaile atılma süresi
 */

/**
 * @typedef {Object} NowJailedMembersObject
 * @property {number} timestamp - Mutelenme tarihi
 * @property {number} expiresTimestamp - Mute'nin bitme tarihi
 * @property {string} messageId - Mesaj ID'si (daha sonrasından mesajı yanıtlayabilmek için)
 * @property {string} authorId - Muteleyen yetkili ID'si
 * @property {string} channelId - Kanal ID'si
 * @property {string} reason - Mute sebebi
 */

/**
 * @typedef {Object} JailObject
 * @property {string} authRoleId - Jail yetkili rol ID'si
 * @property {string} roleId - Jail rol ID'si
 * @property {string} logChannelId - Jail log kanal ID'si
 * @property {Object<string,NowJailedMembersObject>} nowJailedMembers - Şu anda jaile atılmış ve süresinin açılmasını bekleyen üyeler
 * @property {Array<LastObject>} last - Jaile atılan son kişiler
 * @property {Object<string,Array<string>>} prevRoles - Jaile atılan kullanıcıların rol verileri
 */
// #endregion

// #region COUNT SETTINGS TYPES
/**
 * @typedef {Object} CountSettingsObject
 * @property {boolean} total - Toplam üye sayısı
 * @property {boolean} registered - Kayıtlı üye sayısı
 * @property {boolean} voice - Seste olan üye sayısı
 * @property {boolean} boostCount - Boost basan üye sayısı
 * @property {boolean} vip - VIP üye sayısı
 * @property {boolean} jail - Hapiste olan üye sayısı
 * @property {boolean} registerAuth - Kayıt yetkilisi sayısı
 * @property {boolean} jailAuth - Hapishane yetkilisi sayısı
 * @property {boolean} vipAuth - VIP yetkilisi sayısı
 * @property {boolean} banAuth - Ban yetkilisi sayısı
 * @property {boolean} kickAuth - Kick yetkilisi sayısı
 * @property {boolean} muteAuth - Mute yetkilisi sayısı
 * @property {boolean} status - Online olan üye sayısı
 */

/**
 * @typedef {Object} CountCommandSettingsObject
 * @property {boolean} isEmoji - Sayıları emojilerle gösterme
 * @property {CountSettingsObject} datas - Sayılacak veriler
 */
// #endregion

// #region PREMIUM TYPES
/**
 * @typedef {Object} PremiumObject
 * @property {string} partnerRoleId - Partner rol ID'si
 * @property {Array<string>} authorizedRoleIds - Yetkili rol ID'leri
 */
// #endregion









// #region ALISA FILE TYPES
/**
 * @typedef {Object} guildAddAndLeaveObject
 * @property {Object<string,number>} add - Botun sunucuya katılma zamanları
 * @property {Object<string,number>} leave - Botun sunucudan ayrılma zamanları
 */

/**
 * @typedef {Object} RegistersCountObject
 * @property {number} nowTotal - Toplam kayıt sayısı
 * @property {number} [_] - Kayıt sayıları (100, 200, 300, ...)
 */

/**
 * @typedef {Object} LastUptimeMessage
 * @property {string} messageId - Mesaj ID'si
 * @property {string} channelId - Kanal ID'si
 * @property {string} guildId - Sunucu ID'si
 */

/**
 * @typedef {Object} CommandUsesObject
 * @property {number} prefix - Prefix ile kullanılan komut sayısı
 * @property {number} slash - Slash ile kullanılan komut sayısı
 * @property {number} button - Buton ile kullanılan komut sayısı
 * @property {number} selectMenu - Select menu ile kullanılan komut sayısı
 * @property {number} contextMenu - Context menu ile kullanılan komut sayısı
 * @property {number} total - Toplam komut sayısı
 */

/**
 * @typedef {Object} BlackListUsersTempObject
 * @property {number} expiresTimestamp - Kara listedeki kullanıcının süresi
 * @property {number} startedTimestamp - Kara listeye eklenme tarihi
 * @property {number} banCount - Kara listedeki kullanıcının ban sayısı
 */

/**
 * @typedef {Object} BlackListUsersObject
 * @property {number} addedTimestamp - Kara listeye eklenme tarihi
 * @property {string} reason - Kara listeye eklenme sebebi
 * @property {boolean} isSee - Kara listeye eklenen kişinin kara listeye eklendiğini görüp görmediği
 * @property {string} ownerId - Kara listeye ekleyen kişinin ID'si
 * @property {BlackListUsersTempObject} temp - Geçici kara liste bilgileri
 */

/**
 * @typedef {Object} BlackListGuildsObject
 * @property {number} addedTimestamp - Kara listeye eklenme tarihi
 * @property {string} reason - Kara listeye eklenme sebebi
 * @property {string} ownerId - Kara listeye ekleyen kişinin ID'si
 */

/**
 * @typedef {Object} AlisaObject
 * @property {guildAddAndLeaveObject} guildAddLeave - Botun sunucuya katılma ve ayrılma zamanları
 * @property {Object<string,CommandUsesObject>} commandUses - Komut kullanım sayıları
 * @property {Object<string,number>} usersCommandUses - Kullanıcıların komut kullanım sayıları
 * @property {BlackListUsersObject} blacklistUsers - Kara listedeki kullanıcılar
 * @property {Object<string,BlackListGuildsObject>} blacklistGuilds - Kara listedeki sunucular
 * @property {RegistersCountObject} registersCount - Kayıt sayıları (100. kayıt, 200. kayıt vs.)
 * @property {Object<string,number>} guildsCommandUses - Sunucuların komut kullanım sayıları
 * @property {Number} lastUptimeTimestamp - Son uptime zamanı
 * @property {?LastUptimeMessage} lastUptimeMessage - Eğer bot .respawn komutu ile yeniden başlatıldıysa son mesaj bilgileri
 */
// #endregion

// #region PREMIUM FILE TYPES
/**
 * @typedef {Object} premiumFileObject
 * @property {string} authorId - Premium alan kişinin ID'si
 * @property {?Number} expiresTimestamp - Premiumun bitiş tarihi
 * @property {?Number} totalTime - Toplam süre
 * @property {string} code - Premium kodu
 * @property {boolean} isUse - Premium kullanılıp kullanılmadığı
 */
// #endregion

// #region EMBED TYPES
/**
 * @typedef {Object} FieldsObject
 * @property {String} name - Field ismi
 * @property {String} value - Field değeri
 * @property {Boolean} inline - Field'ın yan yana olup olmayacağı
 */

/**
 * @typedef {Object} FieldsAndImageObject
 * @property {Array<FieldsObject>} [fields] - Field'lar
 * @property {String} [image] - Resim URL'si
 */

/**
 * @callback EmbedFunction
 * @param {String} message - Gösterilecek mesaj içeriği
 * @param {"error" | "success" | "warn" | "memberPermissionError" | "botPermissionError"} [type] - Mesaj tipi
 * @param {Number} [deleteMessageForMilisecond] - Mesajın otomatik silinme süresi
 * @param {FieldsAndImageObject} [fieldsAndImage] - Embed'e eklenecek field ve resim bilgisi
 * @returns {Discord.Message} - Dönüş olarak embed mesaj objesi
 */

/**
 * @typedef {EmbedFunction} EmbedObject
 */
// #endregion

// #region RUN COMMANDS TYPES
/**
 * @typedef {Object} ExportsRunCommands
 * @property {AlisaObject} alisa - Alisa dosya verileri
 * @property {GuildDatabaseObject} guildDatabase - Sunucu verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {Discord.Message} msg - Mesaj
 * @property {Array<String>} args - Komut argümanları
 * @property {String} guildId - Sunucu ID'si
 * @property {String} authorId - Komutu kullanan kişinin ID'si
 * @property {String} prefix - Sunucunun prefix'i
 * @property {EmbedObject} errorEmbed - Hata embedi
 * @property {Object} extras - Ekstra veriler (kur komutu vs. beklemeli mesaj komutları)
 * @property {Discord.GuildMember} msgMember - Mesajı atan kişi
 * @property {Discord.GuildMember} guildMe - Botun sunucudaki üye verisi
 * @property {Discord.PermissionsBitField} guildMePermissions - Botun sunucudaki izinleri
 * @property {Discord.Guild} guild - Sunucu
 * @property {Boolean} isOwner - Botun sahibi mi
 * @property {premiumFileObject} premium - Premium verileri
 */

/**
 * @typedef {Object} ExportsRunButtons
 * @property {Discord.ButtonInteraction} int - Buton etkileşimi
 * @property {String} customId - Butonun custom ID'si
 * @property {Array<String>} splitCustomId - Butonun custom ID'si parçalanmış hali
 * @property {String} authorId - Butonu kullanan kişinin ID'si
 * @property {AlisaObject} alisa - Alisa dosya verileri
 * @property {GuildDatabaseObject} guildDatabase - Sunucu verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {EmbedObject} errorEmbed - Hata embedi
 * @property {String} guildId - Sunucu ID'si
 * @property {Discord.Guild} guild - Sunucu
 */

/**
 * @typedef {Object} ExportsRunSlash
 * @property {Discord.ChatInputCommandInteraction} int - Slash komut etkileşimi
 * @property {String} authorId - Komutu kullanan kişinin ID'si
 * @property {AlisaObject} alisa - Alisa dosya verileri
 * @property {GuildDatabaseObject} guildDatabase - Sunucu verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {EmbedObject} errorEmbed - Hata embedi
 * @property {String} guildId - Sunucu ID'si
 * @property {Discord.Guild} guild - Sunucu
 */

/**
 * @typedef {Object} ExportsRunStringSelectMenu
 * @property {Discord.ChatInputCommandInteraction} int - String select menu etkileşimi
 * @property {String} authorId - Komutu kullanan kişinin ID'si
 * @property {AlisaObject} alisa - Alisa dosya verileri
 * @property {Array<String>} splitCustomId - String select menü custom ID'si parçalanmış hali
 * @property {GuildDatabaseObject} guildDatabase  - Sunucu verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {EmbedObject} errorEmbed - Hata embedi
 * @property {String} guildId - Sunucu ID'si
 * @property {Discord.Guild} guild - Sunucu
 */

/**
 * @typedef {Object} ExportsRunContextMenu
 * @property {Discord.ContextMenuCommandInteraction} int - Context menu etkileşimi
 * @property {String} authorId - Komutu kullanan kişinin ID'si
 * @property {AlisaObject} alisa - Alisa dosya verileri
 * @property {GuildDatabaseObject} guildDatabase - Sunucu verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {EmbedObject} errorEmbed - Hata embedi
 * @property {String} guildId - Sunucu ID'si
 * @property {Discord.Guild} guild - Sunucu
 */

/**
 * @typedef {Object} ExportsRunUserContextMenu
 * @property {Discord.UserContextMenuCommandInteraction} int - User context menu etkileşimi
 * @property {String} authorId - Komutu kullanan kişinin ID'si
 * @property {AlisaObject} alisa - Alisa dosya verileri
 * @property {GuildDatabaseObject} guildDatabase - Sunucu verileri
 * @property {"tr" | "en"} language - Sunucunun dil ayarı
 * @property {EmbedObject} errorEmbed - Hata embedi
 * @property {String} guildId - Sunucu ID'si
 * @property {Discord.Guild} guild - Sunucu
 */
// #endregion