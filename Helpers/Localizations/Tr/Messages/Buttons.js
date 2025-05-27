
const allMessages = {
    notAuthor(authorId) {
        return `Bu butonu sadece komutu kullanan kişi (<@${authorId}>) kullanabilir :(`
    },
    embedDeleted(prefix) {
        return `Mesajda gösterilen embed silindiği için artık bu butonlar işe yaramaz. Lütfen **${prefix}yardım** yazarak yeni bir mesaj daha oluşturunuz`
    },
}

module.exports = allMessages;