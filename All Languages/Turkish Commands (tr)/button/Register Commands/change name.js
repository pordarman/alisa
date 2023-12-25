"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    RESTJSONErrorCodes,
    AttachmentBuilder
} = require("discord.js");
const photoFile = new AttachmentBuilder("https://i.hizliresim.com/s190sc5.png", {
    name: "ornek_kullanim.png",
    description: "Komutun nasıl kullanılacağına dair örnek"
})
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "changeName", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcının ismini değiştirir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        alisa,
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        registerDatas,
        language
    }) {

        // Eğer bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        const intMember = int.member;
        const [_, memberId] = customId.split("-");
        const guildMe = guild.members.me;
        const highestRole = guildMe.roles.highest;

        async function changeName({
            memberId,
            member,
            authorId,
        }) {

            return await int.channel.awaitMessages({
                filter: message => message.author.id === authorId,
                max: 1,
                time: 30 * 1000 // 30 saniye boyunca kullanıcının işlem yapmasını bekle
            })
                // Eğer mesaj attıysa
                .then(async messages => {
                    // Eğer mesajı attıysa database'den kullanıcının verisini sil
                    delete guildDatabase.waitMessageCommands.changeName[memberId];
                    database.writeFile(guildDatabase, guildId);

                    // Buton süre verisini 1 saniye sonra sil
                    setTimeout(() => {
                        int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
                    }, 1000);

                    const waitMessage = messages.first()
                    if (waitMessage.content.length == 0) return waitMessage.reply("Sanki bir isim yazmalıydın he, ne diyorsun?");

                    const hasGuildCustomRegisterName = guildDatabase.register.customNames.register;
                    let memberName = waitMessage.content;
                    let inputAge;

                    // Eğer kişi bot değilse yaş kontrolünü gerçekleştir
                    if (!member.user.bot) {

                        // Kullanıcının ismindeki yaşı çek
                        const inputAge = memberName.match(Util.regex.fetchAge);

                        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
                        if (!inputAge && guildDatabase.register.isAgeRequired) return waitMessage.reply("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!");

                        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
                        const ageLimit = guildDatabase.register.ageLimit ?? -1;
                        if (ageLimit > Number(inputAge?.[0])) return waitMessage.reply(`Heyyy dur bakalım orada! Bu sunucuda **${ageLimit}** yaşından küçükleri kayıt edemezsin!`);

                        // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
                        if (hasGuildCustomRegisterName.search(/<(ya[sş]|age)>/) != -1) {
                            memberName = memberName.replace(inputAge?.[0], "").replace(/ +/g, " ");
                        }
                    }
                    memberName = Util.customMessages.registerName({
                        message: hasGuildCustomRegisterName,
                        memberName,
                        guildDatabase,
                        inputAge,
                        isBot: member.user.bot
                    });

                    // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
                    if (memberName.length > 32) return waitMessage.reply("Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz");

                    // Eğer kişinin ismi yazılan isimle aynıysa
                    if (member.nickname === memberName) return errorEmbed(`<@${memberId}> adlı kişinin ismi yazdığınız isimle aynı zaten`);

                    // Kullanıcıyı düzenle
                    return await member.setNickname(memberName)
                        // Eğer düzenleme başarılıysa
                        .then(() => {
                            waitMessage.reply(`• <@${memberId}> adlı kişinin ismini **${memberName}** olarak değiştirdim. Bir dahakine daha dikkatli ol <@${authorId}> :)`)

                            const userLogs = guildDatabase.userLogs[memberId] ??= [];

                            // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                            const NOW_TIME = Date.now();
                            userLogs.unshift({
                                type: "changeName",
                                newName: memberName,
                                authorId,
                                timestamp: NOW_TIME
                            });
                            return database.writeFile(guildDatabase, guildId);

                        }).catch(err => {
                            // Eğer yetki hatası verdiyse
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return waitMessage.reply(`• <@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`)

                            console.log(err)
                            return waitMessage.reply(
                                `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                                `\`\`\`js\n` +
                                `${err}\`\`\``
                            );
                        })
                })
                // Eğer süre bittiyse bilgilendirme mesajı gönder
                .catch(err => {
                    int.channel?.send(`⏰ <@${authorId}>, süreniz bitti!`)

                    // Eğer mesajı atmadıysa database'den kullanıcının verisini sil
                    int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`);
                    delete guildDatabase.waitMessageCommands.buttonChangeName[memberId];
                    database.writeFile(guildDatabase, guildId);
                })
        }

        // Eğer bot yeniden başlatılmadan önce mesaj bekleniyorsa komutu tekrardan çalıştır
        if (registerDatas) {
            const {
                authorId,
                memberId
            } = registerDatas;

            // Hata çıkmaması için butonla ismini değiştirdiğini önbelleğe kaydet
            int.client.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);

            // Hata çıkmaması için önbelleği 35 saniye sonra sil
            setTimeout(() => {
                int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`);
            }, 35 * 1000);

            return changeName({
                memberId,
                member: await Util.fetchMemberForce(int, memberId),
                authorId
            });
        }

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(");

        // Kullanıcının ismini başka birisi daha değiştirmeye çalışıyorsa
        const isButtonChangeName = int.client.buttonChangeNameMember.get(`${guildId}.${memberId}`);
        if (isButtonChangeName) return errorEmbed(
            isButtonChangeName == authorId ?
                "Heyyy dur bakalım orada! Şu anda zaten bu kayıt işlemini gerçekleştiriyorsun!" :
                "Heyyy dur bakalım orada! Şu anda başkası kayıt işlemini gerçekleştiriyor!"
        );

        // Eğer sunucu sahibinin ismini değiştirmeye çalışıyorsa 
        if (memberId === guild.ownerId) return errorEmbed(`Sunucu sahibinin ismini değiştiremem şapşik şey seni :(`);

        // Eğer kendi ismini değiştirmeye çalışıyorsa ve yetkisi yoksa
        if (memberId === authorId && !intMember.permissions.has("ChangeNickname")) return errorEmbed(`Kendi ismini değiştiremezsin şapşik şey seni :(`);

        // Eğer etiketlediği kişinin rolünün sırası bottan yüksekse hata döndür
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= highestRole.position && memberId !== guildMe.id) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        // Eğer kendi rolünün üstünde bir kişiyi değiştirmeye çalışıyorsa
        if (memberHighestRolePosition >= intMember.roles.highest.position && authorId !== guild.ownerId && memberId !== authorId) return errorEmbed(`Etiketlediğiniz kişinin sizin rolünüzden yüksek o yüzden onun ismini değiştiremezsiniz`)

        // Hata çıkmaması için butonla ismini değiştirdiğini ettiğini önbelleğe kaydet
        int.client.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);
        return int.message.reply({
            content: `• 📝 <@${authorId}>, ismini değiştimek istediğiniz <@${memberId}> adlı kişinin lütfen **SADECE İSMİNİ** yazınız`,
            files: [
                photoFile
            ]
        })
            // Eğer mesaj gönderildiyse önbelleğe kaydet
            .then(message => {
                guildDatabase.waitMessageCommands.changeName[memberId] = {
                    commandName: this.name,
                    authorId,
                    messageId: message.id,
                    channelId: int.channelId,
                    timestamp: Date.now(),
                }
                database.writeFile(guildDatabase, guildId);

                // Hata çıkmaması için önbelleği 35 saniye sonra sil
                setTimeout(() => {
                    int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
                }, 35 * 1000);

                return changeName({
                    memberId,
                    member,
                    authorId,
                });
            })
            // Eğer bir hata olurda mesajı atamazsa hiçbir şey yapma
            .catch(() => {
                int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
            })
    },
};