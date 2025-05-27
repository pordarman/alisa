const Util = require("../../../Util.js");

const allRoleMessages = {
     tagAnotherRole: "Lütfen başka bir rol etiketleyiniz",
     boosterRole: "Etiketlediğiniz rol sadece discord tarafından verilen bir rol",
     alreadyReset(roleName) {
          return `${roleName} rolü zaten sıfırlanmış durumda`
     },
     successReset(roleName) {
          return `${roleName} rolü başarıyla sıfırlandı`
     },
     successSet({
          roleName,
          roleIds
     }) {
          return typeof roleIds == "string" ?
               `${roleName} rolü başarıyla <@&${roleIds}> olarak ayarlandı` :
               `${roleName} rol(leri) başarıyla [${Util.mapAndJoin(roleIds, roleId => `<@&${roleId?.id || roleId}>`, " | ")}] olarak ayarlandı`
     },
     ifYouSet({
          prefix,
          commandName,
          roleName
     }) {
          return `• ${roleName} rolünü ayarlamak için **${prefix}${commandName} @rol**\n` +
               `• Sıfırlamak için ise **${prefix}${commandName} sıfırla** yazabilirsiniz`
     },
     ifYouSetMulti({
          prefix,
          commandName,
          roleName
     }) {
          return `• ${roleName} rollerini ayarlamak için **${prefix}${commandName} @rol @rol @rol**\n` +
               `• Sıfırlamak için ise **${prefix}${commandName} sıfırla** yazabilirsiniz`
     },
     botRole: "Botların oluşturduğu rolleri başkalarına veremem",
     sameRole(roleName) {
          return `${roleName} rolü zaten etiketlediğiniz rolle aynı`;
     },
     errorRole({
          roleId,
          roleName
     }) {
          return `Etiketlediğiniz [<@&${roleId}>] rolü bu sunucuda ${roleName} rolü. ${this.tagAnotherRole}`;
     },
     roleIsHigherThanMe({
          roleId,
          highestRoleId
     }) {
          return `<@&${roleId}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
     },
     rankRoleIsHigherThanMe({
          memberId,
          roleId,
          highestRoleId
     }) {
          return `• <@${memberId}> adlı kişiye rank rolü olan <@&${roleId}> adlı rolü verirken bir hata oluştu! Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
     },
     rolesAreHigherThanMe({
          roleIds,
          highestRoleId
     }) {
          return `[${roleIds}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
     },
     roleNotSet({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
               extraContent = "",
          } = {}
     }) {
          return `Bu sunucuda ${roleName} rolü __ayarlanmamış__` +
               (
                    hasAdmin ?
                         `\n\n• Ayarlamak için **${prefix}${commandName} @rol** yazabilirsiniz${extraContent}` :
                         ""
               )
     },
     rolesNotSet({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
               extraContent = "",
          } = {}
     }) {
          return `Bu sunucuda ${roleName} rolleri __ayarlanmamış__` +
               (
                    hasAdmin ?
                         `\n\n• Ayarlamak için **${prefix}${commandName} @rol** yazabilirsiniz${extraContent}` :
                         ""
               )
     },
     roleNotSetRegister({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
          } = {}
     }) {
          return this.roleNotSet({
               roleName,
               hasAdmin,
               hasAdminText: {
                    prefix,
                    commandName,
                    extraContent: ` veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz`,
               }
          })
     },
     rolesNotSetRegister({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
          } = {}
     }) {
          return this.rolesNotSet({
               roleName,
               hasAdmin,
               hasAdminText: {
                    prefix,
                    commandName,
                    extraContent: ` veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz`,
               }
          })
     },
     maxRoleError(maxRoleCount) {
          return `Hey hey heyyy sence de biraz fazla rol etiketlemedin mi? En fazla **${maxRoleCount}** tane rol ayarlayabilirsin`
     }
}

module.exports = allRoleMessages;