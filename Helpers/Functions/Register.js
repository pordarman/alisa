"use strict";
const {
    Message,
    ButtonInteraction,
    GuildMember,
    Guild,
    RESTJSONErrorCodes,
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    AttachmentBuilder,
} = require("discord.js");
const Util = require("../Util");
const database = require("../Database");
const allMessages = require("../Localizations/Index");
const {
    colors,
    EMOJIS
} = require("../../settings.json");

class MemberRegister {


    /**
     * @param {{
     * msgOrInt: Message | ButtonInteraction,
     * guildDatabase: import("../../Typedef").GuildDatabaseObject,
     * guild: Guild,
     * msgMember: GuildMember,
     * guildMe: GuildMember,
     * language: "tr" | "en",
     * registerType: "boy" | "girl" | "member" | "bot",
     * alisa: import("../../Typedef").AlisaObject,
     * errorEmbed: import("../../Typedef").EmbedObject,
     * isAgainRegister: Boolean,
     * autoRegister: Boolean,
     * loginMessageBotFunc: (embeds: Array<EmbedBuilder>) => void,
     * extras: { authorId?: String, isMemberHasUnregisterRole?: Boolean }
     * }} param0
     */
    constructor({
        msgOrInt,
        guildDatabase,
        guild,
        msgMember,
        guildMe,
        language,
        registerType,
        alisa,
        errorEmbed,
        isAgainRegister = false,
        autoRegister = false,
        loginMessageBotFunc = null,
        extras = {},
    }) {
        /**
         * @type {Message | ButtonInteraction}
         * @description Mesaj veya buton etkileşimi
         */
        this.msgOrInt = msgOrInt;

        /**
         * @type {import("../../Typedef").GuildDatabaseObject}
         * @description Sunucu veritabanı
         */
        this.guildDatabase = guildDatabase;

        /**
         * @type {Guild}
         * @description Sunucu
         */
        this.guild = guild;

        /**
         * @type {GuildMember}
         * @description Mesaj atan üye
         */
        this.msgMember = msgMember;

        /**
         * @type {GuildMember}
         * @description Botun üye verisi
         */
        this.guildMe = guildMe;

        /**
         * @type {"tr" | "en"}
         * @description Sunucunun dil ayarı
         */
        this.language = language;

        /**
         * @type {"member" | "boy" | "girl" | "bot"}
         * @description Kayıt türü
         */
        this.registerType = registerType;

        /**
         * @type {import("../../Typedef").AlisaObject}
         * @description Alisa objesi
         */
        this.alisa = alisa;

        /**
         * @type {import("../../Typedef").EmbedObject}
         * @description Hata embedi
         */
        this.errorEmbed = errorEmbed;

        /**
         * @type {Boolean}
         * @description Tekrar kayıt ediliyor mu
         */
        this.isAgainRegister = isAgainRegister;

        /**
         * @type {String}
         * @description Sunucunun prefixi
         */
        this.prefix = guildDatabase.prefix;

        /**
         * @type {String}
         * @description Sunucunun ID'si
         */
        this.guildId = guild.id;

        /**
         * @type {String}
         * @description Mesaj atan kişinin ID'si
         */
        this.authorId = msgMember.id;

        /**
         * @type {String}
         * @description Kayıtsız rolünün ID'si
         */
        this.unregisterRoleId = this.guildDatabase.register.roleIds.unregister;

        /**
         * @description Sunucunun diline göre mesajlar
         */
        this.messages = allMessages[language];

        /**
         * @type {Array<String>}
         * @description Kullanıcıya verilecek roller
         */
        this.givenRoleIds = [];

        /**
         * @type {String}
         * @description Kullanıcının ismi
         */
        this.memberName = "";

        /**
         * @type {Boolean}
         * @description Kullanıcında kayıtsız rolü var mıydı
         */
        this.isMemberHasUnregisterRole = false;

        /**
         * @type {GuildMember | null | undefined}
         * @description Kayıt olan kişi
         */
        this.member = null;

        /**
         * @type {String}
         * @description Kayıt olan kişinin ID'si
         */
        this.memberId = "";

        // Eğer botları otomatik kayıt etme açıksa
        if (autoRegister) {

            /**
             * @type {Boolean}
             * @description Bot otomatik kayıt ediliyor mu
             */
            this.autoRegister = true;

            /**
             * @type {(embeds: Array<EmbedBuilder>) => void}
             * @description Bot kayıt edilirken hata çıkarsa bu fonksiyonu kullan
             */
            this.loginMessageBotFunc = loginMessageBotFunc;
        }

        // Eğer bot yeniden başlatılmışsa
        if (Object.keys(extras).length > 0) {
            this.authorId = extras.authorId || this.authorId;
            this.isMemberHasUnregisterRole = extras.isMemberHasUnregisterRole || false;

            /**
             * @type {Boolean}
             * @description Kişi kayıt olurken bot yeniden başlatıldı mı
             */
            this.rebootRegister = true;
        }
    }


    // #region Check controls and register
    /**
     * Kayıt işlemlerini this.prefix komutlarına göre kontrol et ve kayıt et
     * @param {String | Array<String>} [argsOrMemberId] - Komut argümanları veya kayıt edilecek kişinin ID'si (Eğer butonla kayıt ediliyorsa memberId, eğer komutla kayıt ediliyorsa args)
     */
    async checkControlsAndRegister(argsOrMemberId) {
        const {
            registers: registerMessages,
            members: memberMessages,
            permissions: permissionMessages,
            roles: roleMessages,
            channels: channelMessages,
            missingDatas: missingDatasMessages,
        } = this.messages;

        // Eğer botları otomatik kayıt etme açıksa
        if (this.autoRegister) {
            // Eğer sunucuda herhangi bir bot rolü ayarlanmamışsa
            if (!this.guildDatabase.register.roleIds.bot) return this.loginMessageBotFunc(
                [
                    new EmbedBuilder()
                        .setTitle(this.messages.others.events.guildMemberAdd.errorEmbed.information)
                        .setDescription(registerMessages.embedRegisterBot.noBotRole)
                        .setColor("Blue")
                        .setTimestamp()
                ]
            );

            this.memberId = argsOrMemberId;
            this.member = await Util.fetchMemberForce(this.guild, this.memberId);

            this.setMemberRolesAndNickname({
                isPrefix: false,
                givenRoleIds: this.guildDatabase.register.roleIds.bot,
                message: this.msgOrInt,
                messageContent: this.member.user.username,
                errorEmbed: this.errorEmbed
            });
            return await this.registerMember();
        }

        // Eğer kişi kayıt edilirken bot yeniden başlatılmışsa direkt kayıt işlemine geç
        if (this.rebootRegister) {
            this.memberId = argsOrMemberId;
            this.member = await Util.fetchMemberForce(this.guild, this.memberId);

            if (!this.member) return this.msgOrInt.reply(registerMessages.notInGuild(this.memberId));

            // Hata çıkmaması için butonla kayıt ettiğini önbelleğe kaydet
            Util.maps.buttonRegisterMember.set(`${this.guildId}.${this.memberId}`, this.authorId);

            // Hata çıkmaması için önbelleği 35 saniye sonra sil
            setTimeout(() => {
                Util.maps.buttonRegisterMember.delete(`${this.guildId}.${this.memberId}`);
            }, 35 * 1000);

            return await this.waitMessage();
        }

        const hasAdmin = this.msgMember.permissions.has("Administrator");

        // Önce yetkili rolü var mı onu kontrol ediyoruz, eğer yoksa hata, eğer varsa kişide rol var mı onu kontrol ediyoruz
        const authorizedRoleId = this.guildDatabase.register.roleIds.registerAuth;
        if (!authorizedRoleId) return this.errorEmbed(
            roleMessages.roleNotSetRegister({
                roleName: registerMessages.roleNames.auth,
                hasAdmin,
                hasAdminText: {
                    prefix: this.prefix,
                    commandName: registerMessages.commandNames.auth
                }
            })
        );

        if (!this.msgMember["_roles"].includes(authorizedRoleId) && !hasAdmin) return this.errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (this.guildDatabase.register.isRegisterOff) return this.errorEmbed(
            registerMessages.noRegister({
                prefix: this.prefix,
                hasAdmin,
            })
        );

        // Eğer kişi tekrardan kayıt ediliyorsa
        if (this.isAgainRegister) {

            // Eğer önceki kaydı yoksa hata döndür
            this.memberId = argsOrMemberId;
            const memberPrevNames = this.guildDatabase.register.prevNamesOfMembers[this.memberId];
            if (!memberPrevNames) return this.errorEmbed(registerMessages.notRegisterBefore);

            const lastRegister = memberPrevNames[0];
            this.registerType = lastRegister.gender;
            this.memberName = lastRegister.name;

            if (this.registerType == "member" && this.guildDatabase.register.type != "member") return this.errorEmbed(registerMessages.again.differentType);

            // Eğer önceki seçeneği "Cinsiyet" ve şimdiki seçeneği "Üyelik" ise tipi "Üye" yap
            if (this.registerType != "member" && this.guildDatabase.register.type == "member") this.registerType = "member";
        }
        // Eğer kişi tekrardan kayıt edilmiyorsa
        else {
            switch (this.registerType) {
                case "member": {
                    // Eğer kayıt türü member ise ve kayıt seçeneği "member" değilse hata döndür
                    if (this.guildDatabase.register.type != "member") return this.errorEmbed(
                        registerMessages.registerTypeIs.gender({
                            prefix: this.prefix,
                            hasAdmin
                        })
                    );
                    break;
                }

                case "boy":
                case "girl": {
                    // Eğer kayıt türü kız veya erkek ise ve kayıt seçeneği "gender" değilse hata döndür
                    if (this.guildDatabase.register.type != "gender") return this.errorEmbed(
                        registerMessages.registerTypeIs.member({
                            prefix: this.prefix,
                            hasAdmin
                        })
                    );
                    break;
                }
            }
        }

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!this.guildMe.permissions.has(["ManageRoles", "ManageNicknames"])) return this.errorEmbed(permissionMessages.manageRolesOrNicknames, "botPermissionError");

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const givenRoleIds = this.guildDatabase.register.roleIds[this.registerType];
        if (givenRoleIds.length == 0) return this.errorEmbed(
            roleMessages.rolesNotSetRegister({
                roleName: registerMessages.roleNames[this.registerType],
                hasAdmin,
                hasAdminText: {
                    prefix: this.prefix,
                    commandName: registerMessages.commandNames[this.registerType]
                }
            })
        );
        const unregisterRoleId = this.guildDatabase.register.roleIds.unregister
        if (!unregisterRoleId) return this.errorEmbed(
            roleMessages.roleNotSetRegister({
                roleName: registerMessages.roleNames.unregister,
                hasAdmin,
                hasAdminText: {
                    prefix: this.prefix,
                    commandName: registerMessages.commandNames.unregisterRole
                }
            })
        );

        const registerChannel = this.guildDatabase.register.channelIds.register
        if (!registerChannel) return this.errorEmbed(
            channelMessages.channelNotSetRegister({
                channelName: registerMessages.registerChannelName,
                hasAdmin,
                hasAdminText: {
                    prefix: this.prefix,
                    commandName: registerMessages.commandNames.registerChannel
                }
            })
        );

        // Eğer kayıtlar kayıt kanalında yapmıyorsa hata döndür
        if (this.msgOrInt.channelId !== registerChannel) return this.errorEmbed(registerMessages.isNotRegisterChannel(registerChannel));

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = this.guildMe.roles.highest;
        const rolesCache = this.guild.roles.cache;
        const roleAboveTheBotRole = [...givenRoleIds, unregisterRoleId].filter(roleId => rolesCache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return this.errorEmbed(
            roleMessages.rolesAreHigherThanMe({
                roleIds: Util.mapAndJoin(roleAboveTheBotRole, roleId => `<@&${roleId}>`, " | "),
                highestRoleId: Util.getBotOrHighestRole(this.guildMe).id
            })
        )

        const isMessage = Util.isMessage(this.msgOrInt);

        const messageContent = isMessage ? argsOrMemberId.join(" ") : argsOrMemberId;

        this.member = (isMessage && this.msgOrInt.mentions.members.first()) || await Util.fetchMember(this.guild, messageContent);
        if (!this.member) return this.errorEmbed(
            this.member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const isBot = this.member.user.bot;

        // Eğer etiketlenen kişi bot ise ve kayıt türü bot değilse hata döndür
        if (isBot && this.registerType != "bot") {
            if (this.guildDatabase.register.roleIds.bot) return this.errorEmbed(
                registerMessages.cantRegisterBotAsMember.existBotRole({
                    prefix: this.prefix,
                    botId: this.member.id
                })
            );

            if (hasAdmin) return this.errorEmbed(
                registerMessages.cantRegisterBotAsMember.notExistBotRole(this.prefix)
            );

            return this.errorEmbed(
                registerMessages.cantRegisterBotAsMember.notExistBotRoleAndNotAdmin()
            );
        } else if (!isBot && this.registerType == "bot") return this.errorEmbed(
            registerMessages.cantRegisterMemberAsBot({
                prefix: this.prefix,
                registerType: this.guildDatabase.register.type
            })
        );

        this.memberId = this.member.id;

        // Kullanıcıyı hem butonla hem de komutla etmeye çalışırsa hata döndür
        const isButtonRegistering = Util.maps.buttonRegisterMember.get(`${this.guildId}.${this.memberId}`);
        if (isButtonRegistering) return this.errorEmbed(
            isButtonRegistering == this.authorId ?
                registerMessages.whileRegister.you :
                registerMessages.whileRegister.other
        );

        // Eğer kullanıcı kendi kendini kayıt etmeye çalışıyorsa
        if (this.memberId === this.authorId) return this.errorEmbed(memberMessages.cantUseOn.yourself)

        // Eğer sunucu sahibini kayıt etmeye çalışıyorsa
        if (this.memberId == this.guild.ownerId) return this.errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kullanıcının rolünün sırası botun rolünden yüksekse hata döndür
        if (this.member.roles.highest.position >= highestRole.position) return this.errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId: this.memberId,
            highestRoleId: Util.getBotOrHighestRole(this.guildMe).id
        }));

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(this.member["_roles"]);

        // Eğer kişi daha önceden kayıt olmuşsa hata döndür
        let otherRoles;
        switch (this.registerType) {
            case "boy":
                otherRoles = this.guildDatabase.register.roleIds.girl;
                break;

            case "girl":
                otherRoles = this.guildDatabase.register.roleIds.boy;
                break;

            default:
                otherRoles = [];
                break;
        }

        if (
            givenRoleIds.every(roleId => memberRolesSet.has(roleId)) ||
            (otherRoles.length > 0 && otherRoles.every(roleId => memberRolesSet.has(roleId)))
        ) return this.errorEmbed(registerMessages.alreadyRegister(this.memberId));

        // Eğer kişide kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        this.isMemberHasUnregisterRole = memberRolesSet.has(unregisterRoleId);

        // Eğer kişi prefix ile kayıt ediliyorsa veya kişi bot ise
        if (isMessage || isBot) {
            this.setMemberRolesAndNickname({
                isPrefix: true,
                givenRoleIds,
                message: this.msgOrInt,
                messageContent,
                errorEmbed: this.errorEmbed
            });

            // Kullanıcıyı kayıt et
            await this.registerMember();
        }
        // Eğer kullanıcı butonla kayıt ediliyorsa
        else {
            await this.sendMessage();
        }

    }
    // #endregion

    // #region Set members name and roles
    /**
     * Kişinin ismini ve rollerini ayarla
     * @param {{
     * isPrefix: Boolean,
     * givenRoleIds: Array<String>,
     * message: Message | ButtonInteraction,
     * messageContent: String,
     * errorEmbed: import("../../Typedef").EmbedObject,
     * }} param1
     * @returns {void}
     */
    setMemberRolesAndNickname({
        isPrefix,
        givenRoleIds,
        message,
        messageContent,
        errorEmbed = this.errorEmbed,
    }) {
        const isBot = this.member.user.bot;

        const guildCustomRegisterName = this.guildDatabase.register.customNames[isBot ? "registerBot" : "register"];
        let isNameInput = true;
        let age;

        const {
            registers: registerMessages,
            sets: {
                noName: noNameSet
            }
        } = this.messages;

        // Eğer otomatik kayıt değilse kontrolleri yap
        if (!this.autoRegister) {

            // Eğer isim prefix ile girilmişse
            if (isPrefix) {
                this.memberName = messageContent.replace(new RegExp(`<@!?${this.memberId}>|${this.memberId}`), "").trim();

                // Eğer kullanıcı botsa ve ismi girilmemişse ismini botun ismi yap
                if (isBot && !this.memberName) this.memberName = this.member.user.username;

                // Eğer kullanıcının ismini girmemişse
                if (!this.memberName) {
                    // Eğer isim girilmesi zorunluysa
                    if (this.guildDatabase.register.isNameRequired) return errorEmbed(
                        registerMessages.enterName({
                            prefix: this.prefix,
                            memberId: this.memberId,
                            commandName: `register${this.registerType.charAt(0).toUpperCase()}${this.registerType.slice(1)}`
                        })
                    );

                    this.memberName = this.member.user.username;
                    isNameInput = false;
                }
            } else if (!this.isAgainRegister) { // Eğer kişi tekrardan kayıt edilmiyorsa
                if (!this.guildDatabase.register.isNameRequired && noNameSet.has(message.content.toLocaleLowerCase(this.language))) {
                    this.memberName = this.member.user.username;
                    isNameInput = false;
                } else {
                    this.memberName = message.content;
                }
            }

            // Eğer kullanıcı bot değilse
            if (!isBot) {
                // Kullanıcının ismindeki yaşı çek
                age = this.memberName.match(Util.regex.fetchAge)?.[0];

                // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
                if (!age && this.guildDatabase.register.isAgeRequired) return errorEmbed(registerMessages.enterAge);

                // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
                const ageLimit = this.guildDatabase.register.ageLimit;
                if (ageLimit && ageLimit > Number(age)) return errorEmbed(registerMessages.underAge(ageLimit));

                // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
                if (guildCustomRegisterName.search(/<(ya[sş]|age)>/) != -1) {
                    this.memberName = this.memberName.replace(age, "").replace(/ +/g, " ");
                }
            }
        }

        // Eğer kişi yeniden kayıt edilmiyorsa ismi özelleştir
        if (!this.isAgainRegister) {
            this.memberName = Util.customMessages.registerName({
                message: guildCustomRegisterName,
                name: this.autoRegister ? this.member.user.username : this.memberName,
                guildDatabase: this.guildDatabase,
                age,
                isNameInput,
                isBot
            });
        }

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (this.memberName.length > 32 && !this.autoRegister) return errorEmbed(this.isAgainRegister ? registerMessages.again.discordNameError : registerMessages.discordNameError);

        if (this.autoRegister) this.memberName = this.memberName.slice(0, 32);

        const memberSettedRoles = new Set([...this.member["_roles"], ...givenRoleIds]);
        memberSettedRoles.delete(this.unregisterRoleId);
        this.givenRoleIds = [...memberSettedRoles];
    }

    // #region Send message to register and check the message and register the member
    /**
     * Mesajı gönder, mesajı kontrol et ve kişiyi kayıt et
     * @returns {Promise<void>}
     */
    async sendMessage() {
        Util.maps.buttonRegisterMember.set(`${this.guildId}.${this.memberId}`, this.authorId);
        await this.msgOrInt.message.reply(
            this.messages.registers.writeMembersName({
                authorId: this.authorId,
                memberId: this.memberId,
                isAgeRequired: this.guildDatabase.register.isAgeRequired,
                isNameRequired: this.guildDatabase.register.isNameRequired,
                type: this.registerType
            })
        )
            // Eğer mesaj gönderildiyse önbelleğe kaydet
            .then(async message => {
                this.guildDatabase.waitMessageCommands.buttonRegister[this.memberId] = {
                    commandName: `register${this.registerType.charAt(0).toUpperCase()}${this.registerType.slice(1)}`,
                    authorId: this.authorId,
                    messageId: message.id,
                    channelId: this.msgOrInt.channelId,
                    isMemberHasUnregisterRole: this.isMemberHasUnregisterRole,
                    timestamp: Date.now(),
                }
                await database.updateGuild(this.guildId, {
                    $set: {
                        [`waitMessageCommands.buttonRegister.${this.memberId}`]: this.guildDatabase.waitMessageCommands.buttonRegister[this.memberId]
                    }
                });

                // Hata çıkmaması için önbelleği 35 saniye sonra sil
                setTimeout(() => {
                    Util.maps.buttonRegisterMember.delete(`${this.guildId}.${this.memberId}`)
                }, 35 * 1000);

                // Mesaj atmasını bekle
                await this.waitMessage();
            })
            // Eğer bir hata olurda mesajı atamazsa hiçbir şey yapma
            .catch(() => {
                Util.maps.buttonRegisterMember.delete(`${this.guildId}.${this.memberId}`)
            })
    }

    // #region Wait message and check the message
    /**
     * Mesajı bekle ve mesajı kontrol et
     * @returns {Promise<void>}
     */
    async waitMessage() {
        await this.msgOrInt.channel.awaitMessages({
            filter: msg => msg.author.id == this.authorId && msg.content?.trim()?.length > 0,
            max: 1,
            time: 30 * 1000, // 30 saniye boyunca kullanıcının işlem yapmasını bekle
            errors: ["time"]
        })
            // Mesajı attıysa
            .then(async discordMessages => {
                // Eğer mesajı attıysa database'den kullanıcının verisini sil
                delete this.guildDatabase.waitMessageCommands.buttonRegister[this.memberId];
                await database.updateGuild(this.guildId, {
                    $unset: {
                        [`waitMessageCommands.buttonRegister.${this.memberId}`]: ""
                    }
                });

                // Buton süre verisini 1 saniye sonra sil
                setTimeout(() => {
                    Util.maps.buttonRegisterMember.delete(`${this.guildId}.${this.memberId}`)
                }, 1000);

                const waitMessage = discordMessages.first();

                const isError = this.setMemberRolesAndNickname({
                    isPrefix: false,
                    givenRoleIds: this.guildDatabase.register.roleIds[this.registerType],
                    message: waitMessage,
                    messageContent: waitMessage.content,
                    errorEmbed: waitMessage.reply.bind(waitMessage)
                });
                if (isError) return;

                await this.registerMember();
            })
            // Eğer süre bittiyse bilgilendirme mesajı gönder
            .catch(async () => {
                this.msgOrInt.channel?.send(this.messages.others.timeIsUp(this.authorId))

                // Eğer mesajı atmadıysa database'den kullanıcının verisini sil
                Util.maps.buttonRegisterMember.delete(`${this.guildId}.${this.memberId}`);
                delete this.guildDatabase.waitMessageCommands.buttonRegister[this.memberId];
                await database.updateGuild(this.guildId, {
                    $unset: {
                        [`waitMessageCommands.buttonRegister.${this.memberId}`]: 1
                    }
                });
            })
    }

    // #region Edit member's roles and nickname 
    /**
     * Kişinin kayıt edilmesi
     * @returns {Promise<void>}
     */
    async registerMember() {
        const {
            registers: registerMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages,
            others: otherMessages,
        } = this.messages;

        await this.member.edit({
            roles: this.givenRoleIds,
            nick: this.memberName
        })
            // Eğer kullanıcı düzgün bir şekilde kayıt edildiyse database'ye kaydet
            .then(async () => {
                const NOW_TIME = Date.now();
                const givenRolesString = Util.mapAndJoin(this.givenRoleIds, roleId => `<@&${roleId}>`, ", ");
                const authorData = this.guildDatabase.register.authorizedInfos[this.authorId] ??= Util.DEFAULTS.registerAuthData;
                const memberPrevNames = this.guildDatabase.register.prevNamesOfMembers[this.memberId] ??= [];
                const userLogs = this.guildDatabase.userLogs[this.memberId] ??= [];
                let embedDescription = "";

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const userLogObject = {
                    type: "register",
                    gender: this.registerType,
                    authorId: this.authorId,
                    timestamp: NOW_TIME
                };
                userLogs.unshift(userLogObject);

                const embeds = [];

                const isBot = this.member.user.bot;

                // Eğer kişi botsa
                if (isBot) {
                    // Kayıt ettiğimiz kişi bot olduğu için sadece kayıt sayısını arttır
                    authorData.countables.bot += 1;
                } else {

                    // Eğer kişi daha önceden kayıt olmuşsa kayıt sayısını arttırma
                    if (memberPrevNames.length != 0) {
                        embedDescription = registerMessages.embedRegister.description.alreadyRegister({
                            memberId: this.memberId,
                            registerCount: memberPrevNames.length,
                            prefix: this.prefix
                        })
                    } else {
                        authorData.countables[this.registerType] += 1
                        authorData.countables.total += 1;
                        const newRank = Util.checkUserRank(authorData.countables.total, this.language);

                        // Eğer rankı atladıysa yeni rankını embed mesajda göster
                        if (newRank) {
                            embedDescription = registerMessages.embedRegister.description.congrats({
                                authorId: this.authorId,
                                newRank
                            })
                        }

                        // Eğer yeni rol verilecekse rolü ver
                        const newRoleId = this.guildDatabase.register.rankRoles[authorData.countables.total];

                        // Eğer yeni rol varsa ve kişide o rol yoksa rolü ver
                        if (newRoleId && !this.msgMember.roles.cache.has(newRoleId)) {
                            await this.msgMember.roles.add(newRoleId)
                                // Eğer rol verildiyse embed descriptionda belirt
                                .then(() => {
                                    embedDescription += `\n${registerMessages.embedRegister.description.giveNewRole({
                                        authorId: this.authorId,
                                        rankCount: authorData.countables.total,
                                        roleId: newRoleId
                                    })}`;
                                })
                                // Eğer hata oluştuysa
                                .catch((err) => {
                                    embeds.push(
                                        new EmbedBuilder()
                                            .setDescription(
                                                this.messages.roles.rankRoleIsHigherThanMe({
                                                    memberId: this.authorId,
                                                    roleId: newRoleId,
                                                    highestRoleId: Util.getBotOrHighestRole(this.guildMe).id
                                                })
                                            )
                                            .setColor("Red")
                                    )
                                })
                        }
                    }
                }

                // Eğer kayıt otomatik bir kayıt ise
                if (this.autoRegister) {
                    embedDescription = registerMessages.embedRegisterBot.description;
                }

                const buttonComponents = [
                    // İsmini değiştirme butonu
                    new ButtonBuilder()
                        .setLabel(registerMessages.buttonLabels.changeName)
                        .setEmoji("📝")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`changeName-${this.memberId}`)
                ];

                // Eğer kayıt edilen kişi kız veya erkekse cinsiyetini değiştirme butonunu ekle
                if (["boy", "girl"].includes(this.registerType)) {
                    buttonComponents.push(
                        // Cinsiyetini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel(registerMessages.buttonLabels.changeGender)
                            .setEmoji("♻️")
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`changeGender-${this.memberId}`),
                    )
                }

                buttonComponents.push(
                    // Kayıtsıza atma butonu
                    new ButtonBuilder()
                        .setLabel(registerMessages.buttonLabels.unregister)
                        .setEmoji("⚒️")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(`kickUnregistered-${this.memberId}`)
                );

                const totalRegisterCount = authorData.countables[this.autoRegister ? "bot" : "total"];
                const toHumanizeRegisterCount = Util.toHumanize(totalRegisterCount, this.language);
                const clientUser = this.member.client.user;
                const clientAvatar = clientUser.displayAvatarURL();
                const memberAvatar = this.member.displayAvatarURL();
                const allButtons = new ActionRowBuilder()
                    .addComponents(
                        ...buttonComponents
                    );
                const recreateName = Util.escapeMarkdown(this.memberName);

                embeds.push(
                    new EmbedBuilder()
                        .setAuthor({
                            name: registerMessages.embedRegister.author,
                            iconURL: this.guild.iconURL()
                        })
                        .setDescription(embedDescription || null)
                        .addFields(
                            ...registerMessages.embedRegister.fields({
                                authorId: this.authorId,
                                rank: this.autoRegister ? registerMessages.embedRegister.botsHaveNoRank : Util.getUserRank(totalRegisterCount, this.language),
                                registerCount: totalRegisterCount,
                                memberId: this.memberId,
                                newName: recreateName,
                                givenRoles: givenRolesString
                            })
                        )
                        .setThumbnail(memberAvatar)
                        .setFooter({
                            text: otherMessages.embedFooters.register,
                            iconURL: clientAvatar
                        })
                        .setColor(colors[this.registerType])
                        .setTimestamp()
                );

                const replyObject = {
                    embeds,
                    components: [
                        allButtons
                    ]
                };

                const isMessage = Util.isMessage(this.msgOrInt);

                // Eğer msgOrInt yoksa kayıt kanalına mesaj at
                if (!this.msgOrInt) {
                    const registerChannelId = this.guildDatabase.register.channelIds.register;
                    const channel = this.guild.channels.cache.get(registerChannelId);
                    if (channel) {
                        channel.send(replyObject);
                    }
                } else {

                    // Eğer msgOrInt bir mesaj ise 
                    if (isMessage) {
                        this.msgOrInt.reply(replyObject);
                    } else {
                        this.msgOrInt.message.reply(replyObject);
                    }
                }

                const recreateMemberName = Util.escapeMarkdown(this.member.user.displayName);
                const recreateAuthorName = Util.escapeMarkdown(this.msgOrInt ? this.msgOrInt.member.user.username : clientUser.username);

                // Eğer kayıt edilen kişi bot değilse
                if (!isBot) {
                    const afterRegisterChannelId = this.guildDatabase.register.channelIds.afterRegister;

                    if (afterRegisterChannelId) {
                        const allAfterRegisterMessages = otherMessages.afterRegister[this.registerType];
                        const randomMessage = Util.random(allAfterRegisterMessages).replace("<m>", `<@${this.memberId}>`);
                        const channel = this.guild.channels.cache.get(afterRegisterChannelId);
                        // Eğer kanal varsa alttaki kodları çalıştır
                        if (channel) {
                            const customAfterLoginMessage = this.guildDatabase.register.customAfterRegister;

                            // Eğer özel mesaj ayarlanmışsa ayarlanan mesajı düzenle ve gönder
                            if (customAfterLoginMessage.content.length > 0) {

                                // Mesajı düzenle
                                const resultMessage = Util.customMessages.afterRegisterMessage({
                                    message: customAfterLoginMessage.content,
                                    language: this.language,
                                    memberId: this.memberId,
                                    memberCount: this.guild.memberCount,
                                    authorId: this.authorId,
                                    recreateAuthorName,
                                    recreateMemberName,
                                    givenRolesString: givenRolesString,
                                    guildTag: this.guildDatabase.register.tag,
                                    toHumanizeRegisterCount
                                });

                                // Mesajı gönder
                                channel.send(
                                    customAfterLoginMessage.isEmbed ?
                                        // Eğer mesaj embed olarak gönderilecekse
                                        {
                                            content: randomMessage,
                                            embeds: [
                                                new EmbedBuilder()
                                                    .setTitle(`${registerMessages.embedAfterRegister.title} ${recreateMemberName} ${EMOJIS.hi}`)
                                                    .setDescription(resultMessage)
                                                    .addFields(
                                                        registerMessages.embedAfterRegister.fields({
                                                            authorId: this.authorId,
                                                            authorName: recreateAuthorName,
                                                            memberId: this.memberId,
                                                            memberName: recreateMemberName
                                                        })
                                                    )
                                                    .setImage(customAfterLoginMessage.image || null)
                                                    .setThumbnail(memberAvatar)
                                                    .setColor(colors[this.registerType])
                                                    .setFooter({
                                                        text: `${registerMessages.embedAfterRegister.footer}: ${toHumanizeRegisterCount}`
                                                    })
                                            ]
                                        } :
                                        // Eğer mesaj normal gönderilecekse
                                        {

                                            content: resultMessage,
                                            files: customAfterLoginMessage.image ?
                                                [new AttachmentBuilder(customAfterLoginMessage.image)] :
                                                [],
                                            allowedMentions: {
                                                users: [this.memberId],
                                                roles: Util.getRolesExceptInputRoles(this.guild.roles.cache, this.givenRoleIds)
                                            }
                                        }
                                );

                            }
                            // Eğer özel mesaj ayarlanmamışsa mesajı gönder
                            else {
                                const embed = new EmbedBuilder()
                                    .setTitle(`${registerMessages.embedAfterRegister.title} ${recreateMemberName} ${EMOJIS.hi}`)
                                    .setDescription(registerMessages.embedAfterRegister.description({
                                        memberId: this.memberId,
                                        givenRoles: givenRolesString
                                    }))
                                    .addFields(
                                        registerMessages.embedAfterRegister.fields({
                                            authorId: this.authorId,
                                            authorName: recreateAuthorName,
                                            memberId: this.memberId,
                                            memberName: recreateMemberName
                                        })
                                    )
                                    .setThumbnail(memberAvatar)
                                    .setColor(colors[this.registerType])
                                    .setFooter({
                                        text: `${registerMessages.embedAfterRegister.footer}: ${toHumanizeRegisterCount}`
                                    });

                                // Mesajı gönder
                                channel.send({
                                    content: randomMessage,
                                    embeds: [
                                        embed
                                    ],
                                });
                            }

                        }
                    }
                }

                // Database'ye kaydedilecek son veriler
                const lastRegisterObject = {
                    gender: this.registerType,
                    authorId: this.authorId,
                    memberId: this.memberId,
                    isAgainRegister: memberPrevNames.length > 0,
                    timestamp: NOW_TIME
                };
                this.guildDatabase.register.lastRegisters.unshift(lastRegisterObject);

                // Log kanalına mesaj atılacak mesaj
                const logChannelId = this.guildDatabase.register.channelIds.log;
                if (logChannelId) {
                    const logChannel = this.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: this.member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                registerMessages.embedLog.description({
                                    registerType: this.guildDatabase.register.type,
                                    totalRegisterCount: Util.toHumanize(this.guildDatabase.register.lastRegisters.length, this.language),
                                    authorId: this.authorId,
                                    authorName: recreateAuthorName,
                                    authorRegisterCounts: authorData.countables,
                                    commandOrButton: registerMessages.embedLog[this.autoRegister ? "auto" : isMessage ? "command" : "button"],
                                    registerAt: Util.msToSecond(NOW_TIME),
                                    memberId: this.memberId,
                                    memberName: recreateMemberName,
                                    isMemberHasUnregisterRole: this.isMemberHasUnregisterRole,
                                    takenRole: this.unregisterRoleId,
                                    givenRoles: givenRolesString,
                                    newName: recreateName,
                                    type: this.registerType,
                                    memberPrevNamesLength: memberPrevNames.length,
                                })
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(colors[this.registerType])
                            .setFooter({
                                text: otherMessages.embedFooters.log,
                                iconURL: clientAvatar
                            })
                            .setTimestamp()

                        logChannel.send({
                            embeds: [
                                embed
                            ]
                        })
                    }
                }

                const lastAndFirstRegisterObject = {
                    memberId: this.memberId,
                    roles: givenRolesString,
                    timestamp: NOW_TIME
                };
                authorData.firstRegister ||= lastAndFirstRegisterObject;
                authorData.lastRegister = lastAndFirstRegisterObject;

                // Kaydı kaydet
                this.alisa.registersCount.nowTotal += 1;

                // Eğer kayıt 100'ün katıysa database'ye kaydet
                if (this.alisa.registersCount.nowTotal % 100 == 0) {
                    this.alisa.registersCount[this.alisa.registersCount.nowTotal] = NOW_TIME
                }

                const memberPrevNameObject = {
                    gender: this.registerType,
                    name: this.memberName,
                    roles: givenRolesString,
                    authorId: this.authorId,
                    timestamp: NOW_TIME
                };
                memberPrevNames.unshift(memberPrevNameObject);

                // Önbelleğe kaydet
                const registerFile = await database.getFile("registers");
                registerFile[this.guildId] ??= Util.DEFAULTS.guildRegisterData;
                registerFile[this.guildId][this.registerType] += 1;
                registerFile[this.guildId].total += 1;

                const memberNamesFile = await database.getFile("members names");
                memberNamesFile[this.memberId] ??= {};
                memberNamesFile[this.memberId][this.guildId] ??= [];

                const memberNameObject = {
                    name: this.memberName,
                    gender: this.registerType,
                    timestamp: NOW_TIME
                };
                memberNamesFile[this.memberId][this.guildId].push(memberNameObject);

                return Promise.all([
                    // Kaydı kaydet
                    database.updateFile("registers", {
                        $set: {
                            [this.guildId]: registerFile[this.guildId]
                        }
                    }),
                    database.updateGuild(this.guildId, {
                        $push: {
                            [`userLogs.${this.memberId}`]: {
                                $each: [userLogObject],
                                $position: 0
                            },
                            "register.lastRegisters": {
                                $each: [lastRegisterObject],
                                $position: 0,
                            },
                            [`register.prevNamesOfMembers.${this.memberId}`]: {
                                $each: [memberPrevNameObject],
                                $position: 0,
                            }
                        },
                        $set: {
                            [`register.authorizedInfos.${this.authorId}`]: authorData,
                        }
                    }),
                    database.updateFile("members names", {
                        $push: {
                            [`${this.memberId}.${this.guildId}`]: memberNameObject
                        }
                    })
                ]);
            })
            // Eğer hata çıktıysa kullanıcıya bildir
            .catch(async err => {
                // Eğer otomatik kayıtsa
                if (this.autoRegister) {
                    console.error(err);
                    const {
                        others: {
                            events: {
                                guildMemberAdd: {
                                    permissionsErrors: {
                                        manageRoles,
                                        manageNicknames,
                                        unregisterRole,
                                        errorGivingRole,
                                        memberAboveFromMe
                                    },
                                    errorEmbed: {
                                        errorTitle,
                                        reasons: REASONS,
                                    },
                                }
                            }
                        }
                    } = this.messages;

                    const reasons = [];
                    const guildMePermissions = this.guildMe.permissions;

                    // Eğer botta "Rolleri Yönet" yetkisi yoksa
                    if (!guildMePermissions.has("ManageRoles")) reasons.push(manageRoles);

                    // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa
                    if (!guildMePermissions.has("ManageNicknames")) reasons.push(manageNicknames);

                    // Eğer kayıtsız rolü botun rolünden üstteyse
                    const unregisterRoleId = this.guildDatabase.register.roleIds.unregister;
                    const highestRole = this.guildMe.roles.highest;
                    if (this.guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) reasons.push(
                        unregisterRole(unregisterRoleId)
                    );

                    // Eğer gelen kişinin rolü botun rolünden üstteyse
                    if (this.member.roles.highest.position > highestRole.position) reasons.push(
                        memberAboveFromMe(this.memberId)
                    );

                    const embed = new EmbedBuilder()
                        .setTitle(errorTitle)
                        .setDescription(
                            errorGivingRole(this.memberId)
                        )
                        .addFields({
                            name: REASONS,
                            value: reasons.join("\n") || `• ${err}`
                        })
                        .setColor("Red")
                        .setTimestamp();

                    return this.loginMessageBotFunc([embed]);
                }

                switch (err.code) {
                    // Eğer kişi sunucuda değilse
                    case RESTJSONErrorCodes.UnknownMember:
                        return this.msgOrInt.reply(memberMessages.isNotInGuild.member);

                    // Eğer botun rolü yüksekse
                    case RESTJSONErrorCodes.MissingPermissions:
                        console.error(`${this.guildId} sunucusunda ${this.memberId} adlı kişiyi ${this.registerType} olarak kayıt ederken yetki hatası oluştu`);
                        return this.msgOrInt.reply({
                            content: memberMessages.memberIsHigherThanMeRoleAndName({
                                memberId: this.memberId,
                                highestRoleId: Util.getBotOrHighestRole(this.guildMe).id,
                            }),
                            allowedMentions: {
                                users: [],
                                roles: [],
                                repliedUser: true
                            }
                        });

                    // Eğer hatanın sebebi başka bir şeyse
                    default:
                        console.error(err)
                        return this.msgOrInt.reply(
                            unknownErrorMessages.unknownError(err)
                        );
                }
            });
    }
    // #endregion
}

module.exports = MemberRegister;