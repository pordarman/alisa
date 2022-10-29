/**
 * Duration fonksiyonu için
 * @typedef {Object} doubleDigits
 * @property {Boolean} hour Eğer saat 0-9 arasında ise sayıyı 00-09 olarak çevirir
 * @property {Boolean} minute Eğer dakika 0-9 arasında ise sayıyı 00-09 olarak çevirir
 * @property {Boolean} second Eğer saniye 0-9 arasında ise sayıyı 00-09 olarak çevirir
 */

/**
 * Duration fonksiyonu için
 * @typedef {Object} durationObject
 * @property {Number} ms Bir **tarih** veya **milisaniye** değeri giriniz
 * @property {String} [format="<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"] Döndürülen değeri özelleştirmenizi sağlar
 * @property {Boolean} [integer=false] Döndürülen değeri virgüllü olarak döndürülmesini sağlar `(1.5433 gün)`
 * @property {Boolean} [skipZeros=false] 0 dakika gibi şeyleri görmezden gelerek döndürülmesini sağlar
 * @property {Boolean} [toNow=false] Eğer true yaparsanız şu anki zamandan girdiğiniz süreyi çıkartır ve kalan sonuç ile devam eder
 * @property {doubleDigits} [ShowHourMinutesOrSecondsInDoubleDigits={}] Eğer saat, dakika veya saniye 0-9 arasında ise sayıyı 00-09 olarak çevirir
 */

/**
 * Duration to Duration fonksiyonu için
 * @typedef {Object} durationToDurationObject
 * @property {String} input İçinde **15 dakika 4 ay** gibi içeren metni giriniz
 * @property {String} [format="<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"] Döndürülen değeri özelleştirmenizi sağlar
 * @property {Boolean} [integer=false] Döndürülen değeri virgüllü olarak döndürülmesini sağlar `(1.5433 gün)`
 * @property {Boolean} [skipZeros=false] 0 dakika gibi şeyleri görmezden gelerek döndürülmesini sağlar
 * @property {Boolean} [toNow=false] Eğer true yaparsanız şu anki zamandan girdiğiniz süreyi çıkartır ve kalan sonuç ile devam eder
 * @property {doubleDigits} [ShowHourMinutesOrSecondsInDoubleDigits={}] Eğer saat, dakika veya saniye 0-9 arasında ise sayıyı 00-09 olarak çevirir
 */

/**
 * Duration fonksiyonu için
 * @typedef {Object} durationWithoutMsObject
 * @property {String} [format="<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"] Döndürülen değeri özelleştirmenizi sağlar
 * @property {Boolean} [integer=false] Döndürülen değeri virgüllü olarak döndürülmesini sağlar `(1.5433 gün)`
 * @property {Boolean} [skipZeros=false] 0 dakika gibi şeyleri görmezden gelerek döndürülmesini sağlar
 * @property {doubleDigits} [ShowHourMinutesOrSecondsInDoubleDigits={}] Eğer saat, dakika veya saniye 0-9 arasında ise sayıyı 00-09 olarak çevirir
 */

/**
 * Ms to Date fonksiyonu için
 * @typedef {Object} msToDateObject
 * @property {Number} ms Bir **milisaniye** değeri giriniz
 * @property {String} [format="<d>/<M>/<y> <h>:<m>:<s>"] Döndürülen değeri özelleştirmenizi sağlar
 */

/**
 * Bütün değerleri milisaniyeye çevirme
 * @param {Object<Number>} formats Yılı, ayı, günü, saati, dakikayı, saniyeyi ve milisaniyeyi, milisaniye cinsine çevirme 
 * @param {Number} formats.YEARS Yılı milisaniye cinsine çevirir => 31125600000
 * @param {Number} formats.MONTHS Ayı milisaniye cinsine çevirir (30 gün) => 2592000000
 * @param {Number} formats.DAYS Günü milisaniye cinsine çevirir => 86400000
 * @param {Number} formats.HOURS Saati milisaniye cinsine çevirir => 3600000
 * @param {Number} formats.MINUTES Dakikayı milisaniye cinsine çevirir => 60000
 * @param {Number} formats.SECONDS Saniyeyi milisaniye cinsine çevirir => 1000
 * @param {Number} formats.MILISECONS Milisaniyeyi milisaniye cinsine çevirir => 1
 * @returns
 */

const formats = {
    YEARS: 31125600000,
    MONTHS: 2592000000,
    WEEKS: 604800000,
    DAYS: 86400000,
    HOURS: 3600000,
    MINUTES: 60000,
    SECONDS: 1000,
    MILISECONS: 1,
}


/**
 * Girilen değerde sayı olup olmadığını kontrol etme (slice için)
 * @param {String} input 
 * @returns 
 */

const search = (input) => {
    const s = input.search(/[1-9]/)
    if (s == -1) return 0
    else return s
}


class Time {
    constructor() { }



    /**
         * node.js'de kullanılan setTimeout fonksiyonu normalde en fazla 2147483647 ms değeri alabilir. Fakat bu fonksiyonu kullanarak bu süreyi sınırsız şekilde arttırabilirsiniz
         * @param {Function} func Bir fonksiyon gir
         * @param {Number|String} ms Bir milisaniye ya da içinde zaman ifadesi geçen yazı değeri giriniz 
         * @example
         * Time.setTimeout(() => {
         *  console.log("Hello World!")
         * }, "15 saniye")
         * 
         * Time.setTimeout(() => {
         *  console.log("O7 Alisa..")
         * }, "15 gün 12 saat")
         * @returns {Boolean}
         */

    setTimeout(func, ms) {
        if (this.isString(ms)) ms = this.durationToMs(ms)
        if (ms > 2147483647) {
            ms -= 2147483647
            return setTimeout(() => this.setTimeout(func, ms), 2147483647)
        } else return setTimeout(func, ms)
    }


    /**
         * Bir süre hiçbir şey yapmadan bekler (await gerektirir!)
         * @param {Number|String} ms Bir milisaniye ya da içinde zaman ifadesi geçen yazı değeri giriniz 
         * @example
         * console.log("Bir")
         * await Time.wait("10 saniye")
         * console.log("İki") // 10 saniye sonra yazdı
         * @returns {Boolean}
         */

    async wait(ms) {
        if (this.isString(ms)) ms = this.durationToMs(ms)
        return await new Promise((resolve) => {
            setTimeout(() => {
                return resolve()
            }, ms)
        })
    }


    /**
     * Girilen değerin bir tarih objesi olup olmadığını kontrol eder
     * @param {Date} input Bir yazı değeri gir
     * @example
     * Time.isDate(new Date()) // true
     * 
     * Time.isDate("07/09/2005") // false
     * Time.isDate("12:34:23") // false
     * Time.isDate(new Date().toLocaleString()) // false
     * @returns {Boolean}
     */

    isDate(input) {
        return Object.prototype.toString.call(input) === "[object Date]"
    }


    /**
     * Girilen değerin bir tarih içerip içermediğini kontrol eder (isTrueDateFormat'tan farkı girilen bir değerde gerçekten öyle bir tarih olup olmadığını kontrol etmez sadece tarih yazılı olup olmadığını kontrol eder, gerçek mi değil mi onu kontrol etmez)
     * @param {String} input Bir yazı değeri gir
     * @example
     * Time.isDateFormat("07/09/2005") // true
     * Time.isDateFormat("12/05/2001 16:34:26") // true
     * Time.isDateFormat(new Date()) // true
     * 
     * Time.isDateFormat("16:34:26") // false
     * Time.isDateFormat("43859237489") // false
     * 
     * // Fakat bu girilen değerdeki tarihin gerçek olup olmadığına bakmaz
     * Time.isDateFormat("56/23/4323") // true
     * 
     * // Gördüğünüz gibi 23. ay ve 56. gün diye bir tarih yok fakat burada bir tarih yazılı olduğu için true döndürüyor
     * @returns {Boolean}
     */

    isDateFormat(input) {
        if (this.isDate(input)) return true
        if (this.isString(input) && input.search(/\d{2}[/\.\- ]\d{2}[/\.\- ]\d{4}/) != -1) return true
        return false
    }


    /**
     * Girilen değerin bir doğru tarih objesi olup olmadığını kontrol eder (isDateFormat'tan farkı girilen bir değerde gerçekten öyle bir tarih olup olmadığını kontrol eder)
     * @param {String} input Bir yazı değeri gir
     * @example
     * Time.isTrueDateFormat("28/01/2014") // true
     * Time.isTrueDateFormat("31/05/2000 16:23:45") // true
     * Time.isTrueDateFormat(new Date()) // true
     * 
     * Time.isTrueDateFormat("28/13/2014") // false
     * Time.isTrueDateFormat("45/02/2005") // false
     * Time.isTrueDateFormat("31/05/2000 26:76:95") // false
     * @returns {Boolean}
     */

    isTrueDateFormat(input) {
        if (!this.isDateFormat(input)) return false
        let split = input?.split(/[\/\. :]/g)?.map(a => +a)
        if (split?.length < 6) split = (split.join(" ") + " 0".repeat(6 - split.length)).split(" ").map(a => +a)
        let yil = split[2], ay = split[1], gun = split[0], saat = split[3], dakika = split[4], saniye = split[5]
        switch (+ay) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                if (gun > 31) return false
                break;
            case 2:
                if (yil % 4 == 0) {
                    if (gun > 29) return false
                } else if (gun > 28) return false
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                if (gun > 30) return false
                break;
            default:
                return false
        }
        if (saat > 23 && saat < 0) return false
        if (dakika > 59 && dakika < 0) return false
        if (saniye > 59 && saniye < 0) return false
        return true
    }


    /**
     * Girilen değerin bir tarih objesi veya sayı olup olmadığını kontrol eder
     * @param {Number|Date|String} input Bir tarih veya sayı değeri gir
     * @example
     * // Girilen değerin bir tarih objesi olup olmadığını veya bir sayı olup olmadığını kontrol eder
     * Time.isNumberOrDateFormat("324") // true
     * Time.isNumberOrDateFormat(3421) // true
     * Time.isNumberOrDateFormat("06/11/2011") // true
     * Time.isNumberOrDateFormat(new Date()) // true
     * 
     * Time.isNumberOrDateFormat("65/82/2011") // false
     * @returns {Boolean}
     */

    isNumberOrDateFormat(input) {
        return (this.isTrueDateFormat(input) || this.isNumber(input))
    }


    /**
     * Girilen değerin bir sayı objesi olup olmadığını kontrol eder
     * @param {Number} input Bir sayı değeri gir
     * @example
     * Time.isNumber("123") // true
     * Time.isNumber(4234) // true
     * 
     * Time.isNumber("3423f") // false
     * @returns {Boolean}
     */

    isNumber(input) {
        return (String(input).search(/(?![-\+])\D/) == -1 && String(input).search(/\d/) != -1)
    }


    /**
      * Girilen değerin bir null objesi olup olmadığını kontrol eder
      * @param {String} input Bir yazı gir
      * @example
      * Time.isNull(null) // true
      * 
      * Time.isNull(4234) // false
      * Time.isNull(["asd"]) // false
      * @returns {Boolean}
      */

    isNull(input) {
        return Object.prototype.toString.call(input) == "[object Null]"
    }


    /**
      * Girilen değerin bir yazı objesi olup olmadığını kontrol eder
      * @param {String} input Bir yazı gir
      * @example
      * Time.isString("123") // true
      * 
      * Time.isString(4234) // false
      * Time.isString(["asd"]) // false
      * @returns {Boolean}
      */

    isString(input) {
        return Object.prototype.toString.call(input) == "[object String]"
    }


    /**
     * Girilen değerin bir sayı objesi olup olmadığını kontrol eder
     * @param {Object} input Bir sayı değeri gir
     * @example
     * Time.isObject({}) // true
     * Time.isObject({ hello: "World!" }) // true
     * 
     * Time.isObject("3423f") // false
     * Time.isObject(["3423f"]) // false
     * @returns {Boolean}
     */

    isObject(input) {
        return Object.prototype.toString.call(input) == "[object Object]"
    }


    /**
     * Bir **milisaniye** cinsinden bir değer girerek o tarihi şu şekilde döndürür => `Cumartesi, 8 Nisan 2023 17:05:30`
     * @param {Date|Number} ms Bir **tarih** veya **milisaniye** değeri giriniz
     */

    toDateStringForAlisa(ms = Date.now()) {
        let date = new Date(ms), days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"], months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${date.toLocaleTimeString()}`
    }


    /**
     * Bir **tarih** veya **milisaniye** cinsinden bir değer girerek o tarihi şu şekilde döndürür => `Cumartesi, 8 Nisan 2023 17:05:30`
     * @param {Date|Number} ms Bir **tarih** veya **milisaniye** değeri giriniz
     * @returns {String}
     */

    toDateString(ms = Date.now()) {
        if (!this.isNumberOrDateFormat(ms)) return `Geçersiz Format`
        let date = new Date(this.dateToMs(ms))
        if (date == "Invalid Date") return `Geçersiz Tarih`
        let days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"], months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${date.toLocaleTimeString()}`
    }


    /**
     * Bir **milisaniye** cinsinden bir değer girerek milisaniyeyi `yıl (<y>)`, `ay (<M>)`, `gün (<d>)`, `saat (<h>)`, `dakika (<m>)`, `saniye (<s>)` ve `milisaniye (<ms>)` değerlerine döndürür
     * @param {durationObject} durationObject 
     * @example
     * // Bu modülün en önemli kısımlarından birisidir ve her şeyde bunu kullanabilirsiniz
     * 
     * // Mesela kaç gün yaşadığını mı merak ediyorsun
     * const dateToMs = Time.dateToMs("08/04/2003 17:30:00") // Buraya doğum tarihini gir
     * 
     * Time.duration({ ms: dateToMs, format: "<d> gün yaşamışsın waow", integer: true, toNow: true })
     * // 6984.97376 gün yaşamışsın waow
     * @returns {String}
     */

    duration(durationObject = {}) {
        if (!this.isObject(durationObject)) {
            if (!this.isNumber(durationObject)) return `Geçersiz Format`
            if (durationObject == 0) {
                if (!this.isString(format)) return `Geçersiz Format`
                let sondaHangisiVar = Math.max(format.indexOf("<ms>"), format.indexOf("<s>"), format.indexOf("<m>"), format.indexOf("<h>"), format.indexOf("<d>"), format.indexOf("<M>"), format.indexOf("<y>"))
                if (sondaHangisiVar == -1) return format
                return "0" + (format[sondaHangisiVar + 2] == ">" ? format.slice(sondaHangisiVar + 3) : format.slice(sondaHangisiVar + 4))
            }
            var ms = durationObject
        } else var { ms, format, integer, skipZeros, ShowHourMinutesOrSecondsInDoubleDigits, toNow } = durationObject
        if (!this.isString(format)) format = "<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"
        if (!this.isObject(ShowHourMinutesOrSecondsInDoubleDigits)) ShowHourMinutesOrSecondsInDoubleDigits = {}
        if (toNow) ms = Math.abs(Date.now() - Math.abs(+ms))
        else ms = Math.abs(+ms)
        if (integer) {
            if (format.includes("<y>")) format = format.replace(/<y>/g, ((ms / formats.YEARS).toFixed(5)))
            if (format.includes("<M>")) format = format.replace(/<M>/g, ((ms / formats.MONTHS).toFixed(5)))
            if (format.includes("<d>")) format = format.replace(/<d>/g, ((ms / formats.DAYS).toFixed(5)))
            if (format.includes("<h>")) format = format.replace(/<h>/g, ((ms / formats.HOURS).toFixed(5)))
            if (format.includes("<m>")) format = format.replace(/<m>/g, ((ms / formats.MINUTES).toFixed(5)))
            if (format.includes("<s>")) format = format.replace(/<s>/g, ((ms / formats.SECONDS).toFixed(5)))
            if (format.includes("<ms>")) format = format.replace(/<ms>/g, ((ms / formats.MILISECONS).toFixed(5)))
            return format
        }
        if (format.includes("<y>")) {
            let years = Math.floor(ms / formats.YEARS)
            if (years) ms -= years * formats.YEARS
            else {
                const index = format.search(/<(M|d|h|m|s|ms)>/)
                const searchy = format.search(/<y>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchy) + format.slice(index)
                    else format = format.slice(0, searchy)
                } else if (index != -1 && search(format) >= searchy) format = format.slice(index)
            }
            format = format.replace(/<y>/g, years)
        }
        if (format.includes("<M>")) {
            let months = Math.floor(ms / formats.MONTHS)
            if (months) ms -= months * formats.MONTHS
            else {
                const index = format.search(/<(y|d|h|m|s|ms)>/)
                const searchM = format.search(/<M>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchM) + format.slice(index)
                    else format = format.slice(0, searchM)
                } else if (index != -1 && search(format) >= searchM) format = format.slice(index)
            }
            format = format.replace(/<M>/g, months)
        }
        if (format.includes("<d>")) {
            let days = Math.floor(ms / formats.DAYS)
            if (days) ms -= days * formats.DAYS
            else {
                const index = format.search(/<(y|M|h|m|s|ms)>/)
                const searchd = format.search(/<d>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchd) + format.slice(index)
                    else format = format.slice(0, searchd)
                } else if (index != -1 && search(format) >= searchd) format = format.slice(index)
            }
            format = format.replace(/<d>/g, days)
        }
        if (format.includes("<h>")) {
            let hours = Math.floor(ms / formats.HOURS)
            if (hours) ms -= hours * formats.HOURS
            else {
                const index = format.search(/<(y|M|d|m|s|ms)>/)
                const searchh = format.search(/<h>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchh) + format.slice(index)
                    else format = format.slice(0, searchh)
                } else if (index != -1 && search(format) >= searchh) format = format.slice(index)
            }
            if (ShowHourMinutesOrSecondsInDoubleDigits.hour && hours.toString().length < 2) hours = "0" + hours
            format = format.replace(/<h>/g, hours)
        }
        if (format.includes("<m>")) {
            let minutes = Math.floor(ms / formats.MINUTES)
            if (minutes) ms -= minutes * formats.MINUTES
            else {
                const index = format.search(/<(y|M|h|d|s|ms)>/)
                const searchm = format.search(/<m>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchm) + format.slice(index)
                    else format = format.slice(0, searchm)
                } else if (index != -1 && search(format) >= searchm) format = format.slice(index)
            }
            if (ShowHourMinutesOrSecondsInDoubleDigits.minute && minutes.toString().length < 2) minutes = "0" + minutes
            format = format.replace(/<m>/g, minutes)
        }
        if (format.includes("<s>")) {
            let seconds = Math.floor(ms / formats.SECONDS)
            if (seconds) ms -= seconds * formats.SECONDS
            else {
                const index = format.search(/<(y|M|h|m|d|ms)>/)
                const searchs = format.search(/<s>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchs) + format.slice(index)
                    else format = format.slice(0, searchs)
                } else if (index != -1 && search(format) >= searchs) format = format.slice(index)
            }
            if (ShowHourMinutesOrSecondsInDoubleDigits.second && seconds.toString().length < 2) seconds = "0" + seconds
            format = format.replace(/<s>/g, seconds)
        }
        if (format.includes("<ms>")) {
            let miliseconds = Math.floor(ms)
            if (miliseconds) ms -= miliseconds * formats.MILISECONS
            else {
                const index = format.search(/<(y|M|h|m|d|s)>/)
                const searchms = format.search(/<ms>/)
                if (skipZeros) {
                    if (index != -1) format = format.slice(0, searchms - 1) + format.slice(index)
                    else format = format.slice(0, searchms - 1)
                } else if (index != -1 && search(format) >= searchms) format = format.slice(index)
            }
            format = format.replace(/<ms>/g, miliseconds)
        }
        return format.replace(/, ?_* *$/gm, "")
    }


    /**
     * Bir **tarih** veya **milisaniye** cinsinden bir değer girerek o güne olan uzaklığı şöyle gösterir => `1 yıl sonra` veya `5 gün önce`
     * @param {Date|Number} ms Bir **tarih** veya **milisaniye** değeri giriniz
     * @returns {String}
     */

    toNow(ms) {
        if (!ms && ms != 0) return `Geçersiz Format`
        let date = Date.now() - this.dateToMs(ms), agoOrLater
        if (!this.isNumber(date)) return `Geçersiz Format`
        if (date < 0) {
            date = -date
            agoOrLater = "sonra"
        } else agoOrLater = "önce";
        let years = Math.floor((date + 3 * formats.MONTHS) / formats.YEARS)
        if (years > 0) return `${years} yıl ${agoOrLater}`
        let months = Math.floor((date + 7.5 * formats.DAYS) / formats.MONTHS)
        if (months > 0) return `${months} ay ${agoOrLater}`
        let days = Math.floor((date + 6 * formats.HOURS) / formats.DAYS)
        if (days > 0) return `${days} gün ${agoOrLater}`
        let hours = Math.floor((date + 15 * formats.MINUTES) / formats.HOURS)
        if (hours > 0) return `${hours} saat ${agoOrLater}`
        let minutes = Math.floor((date + 15 * formats.SECONDS) / formats.MINUTES)
        if (minutes > 0) {
            if (minutes < 4) return `birkaç dakika ${agoOrLater}`
            return `${minutes} dakika ${agoOrLater}`
        }
        let seconds = Math.floor(date / formats.SECONDS)
        if (seconds > 0) {
            if (seconds < 10) return `birkaç saniye ${agoOrLater}`
            return `${seconds} saniye ${agoOrLater}`
        }
        return `birkaç saniye ${agoOrLater}`
    }


    /**
     * Bir **milisaniye** cinsinden bir değer girerek girilen milisaniye cinsini insanın okuyabileceği bir şekilde döndürür **Örnek =>** `8 ay`, `15 dakika` veya `5 yıl`
     * @param {Number} ms Bir **milisaniye** değeri giriniz
     * @returns {String}
     */

    humanize(ms) {
        if (!ms && ms != 0) return `Geçersiz Format`
        if (!this.isNumber(ms)) return `Geçersiz Format`
        ms = +Math.abs(ms)
        let years = Math.floor((ms + 3 * formats.MONTHS) / formats.YEARS)
        if (years > 0) return `${years} yıl`
        let months = Math.floor((ms + 7.5 * formats.DAYS) / formats.MONTHS)
        if (months > 0) return `${months} ay`
        let days = Math.floor((ms + 6 * formats.HOURS) / formats.DAYS)
        if (days > 0) return `${days} gün`
        let hours = Math.floor((ms + 15 * formats.MINUTES) / formats.HOURS)
        if (hours > 0) return `${hours} saat`
        let minutes = Math.floor((ms + 15 * formats.SECONDS) / formats.MINUTES)
        if (minutes > 0) return `${minutes} dakika`
        let seconds = Math.floor(ms / formats.SECONDS)
        if (seconds > 0) return `${seconds} saniye`
        return `birkaç saniye`
    }


    /**
     * Girilen tarihi milisaniye cinsinden döndürür
     * @param {Date} date Bir **tarih** değeri giriniz
     * @example
     * // Mesela doğduğunuz günün javascriptte hangi zamana geldiğini öğrenebilirsin
     * const dateToMs = Time.dateToMs("08/04/2003 17:30:00") // 1049812200000
     * 
     * // Ve bu değeri istediğiniz şeye dönüştürebilirsiniz
     * Time.duration({ ms: Date.now() - dateToMs, format: "Ben <y> yaşındayım" })
     * // Ben 19 yaşındayım
     * @returns {Number}
     */

    dateToMs(date = new Date().toLocaleString()) {
        if (this.isNumber(date)) return +date
        if (this.isDate(date)) date = date.toLocaleString()
        if (!this.isTrueDateFormat(date)) return `Geçersiz Format`
        date = String(date)
        let split = date?.split(/[\/\. :]/g)?.map(a => +a)
        if (split?.length == 0) return date
        if (split?.length < 6) split = (split.join(" ") + " 0".repeat(6 - split.length)).split(" ").map(a => +a)
        const stringDate = new Date((split[2] || 1970), (split[1] - 1), (split[0] || 1), split[3], split[4], split[5])
        if (stringDate == "Invalid Date") return "Geçersiz Tarih"
        return stringDate.getTime()
    }


    /**
     * Bir **milisaniye** cinsinden bir değer girerek o günün tarihini döndürür
     * @param {msToDateObject} object Bir **milisaniye** değeri giriniz
     * @returns {String}
     */

    msToDate(object = { ms: Date.now(), format: "<d>/<M>/<y> <h>:<m>:<s>" }) {
        let { ms, format } = object
        if (!ms) {
            if (ms == 0) return `Geçersiz Format`
            ms = object
            format = "<d>/<M>/<y> <h>:<m>:<s>"
        }
        if (!this.isString(format)) return `Format bir yazı tipi olmalı`
        if (!this.isNumber(ms)) return `Geçersiz Format`
        let date = new Date(ms)
        if (date == "Invalid Date") return `Geçersiz Tarih`
        if (!this.isString(format)) format = "<d>/<M>/<y> <h>:<m>:<s>"
        let month = date.getMonth() + 1, day = date.getDate(), hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds()
        if (month.toString().length < 2) month = "0" + month
        if (day.toString().length < 2) day = "0" + day
        if (hours.toString().length < 2) hours = "0" + hours
        if (minutes.toString().length < 2) minutes = "0" + minutes
        if (seconds.toString().length < 2) seconds = "0" + seconds
        return format.replace(/<y>/g, date.getFullYear()).replace(/<M>/g, month).replace(/<d>/g, day).replace(/<h>/g, hours).replace(/<m>/g, minutes).replace(/<s>/g, seconds)
    }


    /**
     * Girilen değerin içerisindeki zaman ifadelerini bulur ve o zaman ifadesini milisaniye cinsinden döndürür
     * @param {String} input İçinde **15 dakika 4 ay** gibi içeren metni giriniz
     * @returns {Number}
     * @example
     * const input = "2 yıl 3 ay 1 hafta 2 gün 20 saat 30 dakika 2 saniye 142 milisaniye"
     * const inputToMs = Time.durationToMs(input) // 70878602142
     * 
     * // Buradan milisaniyeyi alıp bu mesajı istediğiniz gibi düzenleyebilirsiniz
     * const editInput = Time.duration({ ms: inputToMs, format: "<d> gün", integer: true }) // 820.35419 gün
     * 
     * console.log(`${input} şu kadar gün ediyor => ${editInput}`)
     * // 2 yıl 3 ay 1 hafta 2 gün 20 saat 30 dakika 2 saniye 142 milisaniye şu kadar gün ediyor => 820.35419 gün
     */

    durationToMs(input) {
        if (!input) return `Geçersiz Format`
        if (!this.isString(input)) return `Girilen değer bir yazı tipi olmalıdır`
        let ms = input.match(/\d+(?= ?(milisaniye|salise|ms))/gi), seconds = input.match(/\d+(?= ?(saniye|sn))/gi), minutes = input.match(/\d+(?= ?(dakika|dk))/gi), hours = input.match(/\d+(?= ?saat)/gi), days = input.match(/\d+(?= ?(gün|gun))/gi), weeks = input.match(/\d+(?= ?hafta)/gi), months = input.match(/\d+(?= ?ay)/gi), years = input.match(/\d+(?= ?yıl)/gi), totalMs = 0
        if (ms) ms.forEach(a => totalMs += a * formats.MILISECONS)
        if (seconds) seconds.forEach(a => totalMs += a * formats.SECONDS)
        if (minutes) minutes.forEach(a => totalMs += a * formats.MINUTES)
        if (hours) hours.forEach(a => totalMs += a * formats.HOURS)
        if (days) days.forEach(a => totalMs += a * formats.DAYS)
        if (weeks) weeks.forEach(a => totalMs += a * formats.WEEKS)
        if (months) months.forEach(a => totalMs += a * formats.MONTHS)
        if (years) years.forEach(a => totalMs += a * formats.YEARS)
        return totalMs
    }


    /**
     * Girilen değerin içerisindeki zaman ifadelerini bulur ve o zaman ifadesini tekrar düzenler
     * @param {durationToDurationObject} durationToDurationObject
     * @returns {String}
     * @example
     * // Elinizde böyle bir tarih var ve bunu düzenlemek mi istiyorsunuz
     * const input = "213434 saat"
     * 
     * Time.durationToDuration(input) // 24 yıl, 8 ay, 7 gün, 2 saat, 0 dakika, 0 saniye, 0 salise
     * 
     * // Ya da daha düzgün bir hale getirmek için şöyle yapabilirsiniz
     * Time.durationToDuration({ input: input, skipZeros: true }) // 24 yıl, 8 ay, 7 gün, 2 saat
     * 
     */

    durationToDuration(durationToDurationObject = {}) {
        let { input, format, integer, skipZeros, ShowHourMinutesOrSecondsInDoubleDigits } = durationToDurationObject
        if (this.isString(durationToDurationObject)) input = durationToDurationObject
        let ms = this.durationToMs(input)
        if (!this.isNumber(ms)) return ms
        return this.duration({ ms, format, integer, skipZeros, ShowHourMinutesOrSecondsInDoubleDigits })
    }


    /**
     * İki gün arasındaki uzaklığı `yıl (<y>)`, `ay (<M>)`, `gün (<d>)`, `saat (<h>)`, `dakika (<m>)`, `saniye (<s>)` ve `milisaniye (<ms>)` cinsinden değer döndürür
     * @param {Date|Number} startDate **Tarih** veya **milisaniye** cinsinden bir başlangıç tarih değeri
     * @param {Date|Number} endDate **Tarih** veya **milisaniye** cinsinden bir bitiş tarih değeri
     * @param {String} format Döndürülen değeri özelleştirmenizi sağlar
     * @param {durationObject} durationObject Döndürülen değeri özelleştirmenizi sağlar
     * @example
     * // Mesela doğum gününüze kalan süreyi bu komut sayesinde bulabilirsiniz
     * Time.daysBetweenTwoDates(new Date(), "08/04/2023 17:30:00", { format: "Doğum günüme <M> ay ve <d> gün kaldı!" })
     * // Doğum günüme 10 ay ve 20 gün kaldı!{String}
     */

    daysBetweenTwoDates(startDate, endDate, durationObject = {}) {
        if (!startDate && startDate != 0) return `Geçersiz Format`
        if (!endDate && endDate != 0) return `Geçersiz Format`
        startDate = this.dateToMs(startDate)
        if (!this.isNumber(startDate)) return `Geçersiz tarih`
        endDate = this.dateToMs(endDate)
        if (!this.isNumber(endDate)) return `Geçersiz tarih`
        return this.duration({ ...durationObject, ms: Math.abs(endDate - startDate) })
    }


    /**
     * Bir **tarih** veya **milisaniye** cinsinden bir değer girerek o tarihi discord tarih sistemi cinsinden yazar. Örnek => `Bugün saat 15:23` veya `08.04.2023`
     * @param {Date|Number} ms Bir **tarih** veya **milisaniye** değeri giriniz
     * @returns {String}
     */

    discordTime(ms) {
        if (!ms) return `Bugün saat ${new Date().toLocaleTimeString()}`
        const same = (date1, date2) => date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
        let dateto = this.dateToMs(ms), date = Date.now() - dateto
        let dateButString = new Date(), dateDate = new Date(dateto)
        if (dateDate == "Invalid Date") return `Geçersiz Tarih`
        if (same(dateButString, dateDate)) return `Bugün saat ${dateDate.toLocaleTimeString()}`
        if (date < 0) {
            date = -date
            dateButString.setDate(dateButString.getDate() + 1)
            if (same(dateButString, dateDate)) return `Yarın saat ${dateDate.toLocaleTimeString()}`
            else return `${dateDate.toLocaleDateString()}`
        } else {
            dateButString.setDate(dateButString.getDate() - 1)
            if (same(dateButString, dateDate)) return `Dün saat ${dateDate.toLocaleTimeString()}`
            dateButString.setDate(dateButString.getDate() - 1)
            if (same(dateButString, dateDate)) return `Evvelsi gün saat ${dateDate.toLocaleTimeString()}`
            else return `${dateDate.toLocaleDateString()}`
        }
    }


    /**
     * Noel gününe kalan süresi gösterir
     * @param {durationWithoutMsObject} durationWithoutMsObject Döndürülen değeri özelleştirmenizi sağlar
     */

    christmasCountdown(durationWithoutMsObject = {}) {
        let thisDate = new Date(), thisYear = thisDate.getFullYear()
        if (thisDate.getMonth() == 11) {
            if (thisDate.getDay() == 25) return `Bugün noel 🎅`
            else if (thisDate.getDay() > 25) thisYear += 1
        }
        let süre = new Date(thisYear, 11, 25, 0, 0, 0).getTime() - Date.now()
        return this.duration({ ...durationWithoutMsObject, ms: süre })
    }

    /**
     * Yılbaşına kalan süresi gösterir
     * @param {durationWithoutMsObject} newYearObject Döndürülen değeri özelleştirmenizi sağlar
     */

    newYearCountdown(newYearObject = {}) {
        return this.duration({ ...newYearObject, ms: new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0).getTime() - Date.now() })
    }

}

Time.prototype.toString = function () { return "[object Time]" }

module.exports = new Time()