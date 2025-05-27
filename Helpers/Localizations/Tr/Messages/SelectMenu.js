
const allMessages = {
    notAuthor(authorId) {
        return `Bu menüyü sadece komutu kullanan kişi (<@${authorId}>) kullanabilir :(`
    },
    notFoundCategory: `Yardım komutlarını şu anda çekemiyoruz, lütfen daha sonra tekrar deneyiniz!`,
    embedDeleted(prefix) {
        return `Mesajda gösterilen embed silindiği için artık bu menü işe yaramaz. Lütfen **${prefix}yardım** yazarak yeni bir mesaj daha oluşturunuz`;
    }
}

module.exports = allMessages;