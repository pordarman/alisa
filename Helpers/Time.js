/**
 * Duration fonksiyonu için
 * @typedef {Object} durationObject
 * @property {Number} ms Bir **tarih** veya **milisaniye** değeri giriniz
 * @property {String} [format="<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"] Döndürülen değeri özelleştirmenizi sağlar
 * @property {Boolean} [double=false] Döndürülen değeri virgüllü olarak döndürülmesini sağlar `(1.5433 gün)`
 * @property {Boolean} [skipZeros=false] 0 dakika gibi şeyleri görmezden gelerek döndürülmesini sağlar
 * @property {Boolean} [toNow=false] Eğer true yaparsanız şu anki zamandan girdiğiniz süreyi çıkartır ve kalan sonuç ile devam eder
 */

/**
 * Duration to Duration fonksiyonu için
 * @typedef {Object} durationToDurationObject
 * @property {String} input İçinde **15 dakika 4 ay** gibi içeren metni giriniz
 * @property {String} [format="<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"] Döndürülen değeri özelleştirmenizi sağlar
 * @property {Boolean} [double=false] Döndürülen değeri virgüllü olarak döndürülmesini sağlar `(1.5433 gün)`
 * @property {Boolean} [skipZeros=false] 0 dakika gibi şeyleri görmezden gelerek döndürülmesini sağlar
 * @property {Boolean} [toNow=false] Eğer true yaparsanız şu anki zamandan girdiğiniz süreyi çıkartır ve kalan sonuç ile devam eder
 */

/**
 * Duration fonksiyonu için
 * @typedef {Object} durationWithoutMsObject
 * @property {String} [format="<y> yıl, <M> ay, <d> gün, <h> saat, <m> dakika, <s> saniye"] Döndürülen değeri özelleştirmenizi sağlar
 * @property {Boolean} [double=false] Döndürülen değeri virgüllü olarak döndürülmesini sağlar `(1.5433 gün)`
 * @property {Boolean} [skipZeros=false] 0 dakika gibi şeyleri görmezden gelerek döndürülmesini sağlar
 */

/**
 * Ms to Date fonksiyonu için
 * @typedef {Object} msToDateObject
 * @property {Number} ms Bir **milisaniye** değeri giriniz
 * @property {String} [format="<d>/<M>/<y> <h>:<m>:<s>"] Döndürülen değeri özelleştirmenizi sağlar
 */

const TIMES = {
    MILLISECOND: 1,
    SECOND: 1000,
    MINUTE: 60 * (1000),
    HOUR: 60 * (60 * (1000)),
    DAY: 24 * (60 * (60 * (1000))),
    MONTH: 30 * (24 * (60 * (60 * (1000)))),
    YEAR: 365.25 * (24 * (60 * (60 * (1000))))
};

// Botu başka dillerde de kullanacağımız için bütün dilleri ekle
const allLanguages = {
    tr: {
        milisecond: "salise",
        second: "saniye",
        minute: "dakika",
        hour: "saat",
        day: "gün",
        month: "ay",
        year: "yıl",
        ago: "önce",
        before: "sonra"
    },
    en: {
        milisecond: "milliseconds",
        second: "seconds",
        minute: "minutes",
        hour: "hours",
        day: "days",
        month: "months",
        year: "years",
        ago: "ago",
        before: "before"
    }
}

// Kodlarımızı yazmaya başlıyoruz
class Time {

    /**
     * Girilen değerin sayı olup olmadığını kontrol eder
     * @param {any} value - Kontrol edilecek değer
     * @returns {Boolean}
     */
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }


    /**
     * Girilen milisaniye değerini insanların okuyabileceği bir şekilde yeniden düzenler
     * @param {Number} milisecond - Bir **milisaniye** değeri giriniz
     * @param {"tr"|"en"} [language="tr"] - Döndürülecek dil
     * @param {Boolean} [toNow=false] - Eğer true yaparsanız şu anki zamandan girdiğiniz süreyi çıkartır ve kalan sonuç ile devam eder
     * @returns {String}
     */
    duration(milisecond, language = "tr", toNow = false) {
        // Girilen değeri bir sayıya dönüştür
        milisecond = Math.round(milisecond);

        // Eğer girilen değer bir sayı değilse hata döndür
        if (!this.isNumber(milisecond)) return "Geçersiz format (milisecond değeri bir sayı olmalı)";

        // Eğer zamanı şimdiden çıkarmamızı istiyorsa
        if (toNow) milisecond = Math.abs(milisecond - Date.now());

        const allMessages = allLanguages[language];

        // Geri döndürülecek değerin array olmasının nedeni: 
        // Her zaman ifadesinin arasına virgül koyacağımız için işleri kolaylaştırmak için başka nedeni yok
        const resultArray = [];

        // Eğer değer 1 yıldan fazlaysa
        if (milisecond >= TIMES.YEAR) {
            resultArray.push(
                `${Math.floor(milisecond / TIMES.YEAR)} ${allMessages.year}`
            );
            milisecond %= TIMES.YEAR;
        }

        // Eğer değer 1 aydan fazlaysa
        if (milisecond >= TIMES.MONTH) {
            resultArray.push(
                `${Math.floor(milisecond / TIMES.MONTH)} ${allMessages.month}`
            );
            milisecond %= TIMES.MONTH;
        }

        // Eğer değer 1 günden fazlaysa
        if (milisecond >= TIMES.DAY) {
            resultArray.push(
                `${Math.floor(milisecond / TIMES.DAY)} ${allMessages.day}`
            );
            milisecond %= TIMES.DAY;
        }

        // Eğer değer 1 saatten fazlaysa
        if (milisecond >= TIMES.HOUR) {
            resultArray.push(
                `${Math.floor(milisecond / TIMES.HOUR)} ${allMessages.hour}`
            );
            milisecond %= TIMES.HOUR;
        }

        // Eğer değer 1 dakikadan fazlaysa
        if (milisecond >= TIMES.MINUTE) {
            resultArray.push(
                `${Math.floor(milisecond / TIMES.MINUTE)} ${allMessages.minute}`
            );
            milisecond %= TIMES.MINUTE;
        }

        // Eğer değer 1 saniyeden fazlaysa
        if (milisecond >= TIMES.SECOND) {
            resultArray.push(
                `${Math.floor(milisecond / TIMES.SECOND)} ${allMessages.second}`
            );
            milisecond %= TIMES.SECOND;
        }

        // Eğer değer 1 saniyeden bile azsa (yani dizide hiçbir değer yoksa)
        return resultArray.length == 0 ?
            `${milisecond} ${allMessages.milisecond}` :
            resultArray.join(", ");
    }


    /**
     * Girilen değerdeki bütün süre verilerini milisaniye cinsinden döndürür
     * @param {String} timeString 
     * @returns {Number}
     */
    parseTime(timeString) {
        let time = 0;

        // Süreyi mesajdan çek
        const allTimes = timeString.match(/(?<!\d)\d{1,5} ?\D+/gi);

        // Eğer mesajda hiç süre yazılmamışsa
        if (!allTimes) return time;

        // Bütün değerlerde dön ve süreyi belirle
        for (let i = 0; i < allTimes.length; i++) {
            let multi;

            const [num, unit] = allTimes[i].split(/(?<=\d)(?=\D)/);

            switch (unit) {
                case "saniye":
                case "sn":
                case "second":
                case "sec":
                case "seconds":
                case "s":
                    multi = TIMES.SECOND;
                    break;

                case "dakika":
                case "minute":
                case "min":
                case "minutes":
                case "dk":
                case "m":
                    multi = TIMES.MINUTE;
                    break;

                case "saat":
                case "hour":
                case "hours":
                case "h":
                    multi = TIMES.HOUR;
                    break;

                case "gün":
                case "gun":
                case "day":
                case "days":
                case "d":
                    multi = TIMES.DAY;
                    break;

                case "hafta":
                case "week":
                case "weeks":
                case "w":
                    multi = TIMES.WEEK;
                    break;

                case "ay":
                case "month":
                case "months":
                    multi = TIMES.MONTH;
                    break;

                case "yıl":
                case "y":
                case "year":
                case "years":
                    multi = TIMES.YEAR;
                    break;

                default:
                    continue;
            }

            time += Number(num) * multi;
        }

        return time;
    }


    /**
     * Bir **milisaniye** cinsinden bir değer girerek o tarihi şu şekilde döndürür => `Cumartesi, 8 Nisan 2023 17:05:30`
     * @param {Date|Number} milisecond - Bir **tarih** veya **milisaniye** değeri giriniz
     * @param {String} [language="tr"] - Döndürülecek dil
     * @returns {String}
     */

    toDateString(milisecond = Date.now(), language = "tr") {
        const intlDate = new Intl.DateTimeFormat(language, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
        });

        return intlDate.format(milisecond);
    }


    /**
     * Bir **tarih** veya **milisaniye** cinsinden bir değer girerek o güne olan uzaklığı şöyle gösterir => `1 yıl sonra` veya `5 gün önce`
     * @param {Date|Number} milisecond Bir **milisaniye** değeri giriniz
     * @param {"tr"|"en"} language - Döndürülecek dil
     * @returns {String}
     */

    toNow(milisecond, language = "tr") {
        // Girilen değeri bir sayıya dönüştür
        milisecond = Math.round(milisecond);

        // Eğer girilen değer bir sayı değilse hata döndür
        if (!this.isNumber(milisecond)) return "Geçersiz format (milisecond değeri bir sayı olmalı)";

        const allMessages = allLanguages[language]

        const diffTime = Date.now() - milisecond;
        let beforeOrAfter;

        // Eğer milisaniye ileri bir tarihi gösteriyorsa "sonra" değilse "önce" yazdır
        if (diffTime < 0) {
            diffTime = diffTime * -1;
            beforeOrAfter = allMessages.before;
        } else {
            beforeOrAfter = allMessages.ago;
        }

        // Yıl hesaplama
        const years = Math.floor((diffTime + 3 * TIMES.MONTH) / TIMES.YEAR)
        if (years > 0) return `${years} ${allMessages.year} ${beforeOrAfter}`;

        // Ay hesaplama
        const months = Math.floor((diffTime + 7.5 * TIMES.DAY) / TIMES.MONTH)
        if (months > 0) return `${months} ${allMessages.month} ${beforeOrAfter}`;

        // Gün hesaplama
        const days = Math.floor((diffTime + 6 * TIMES.HOUR) / TIMES.DAY)
        if (days > 0) return `${days} ${allMessages.day} ${beforeOrAfter}`;

        // Saat hesaplama
        const hours = Math.floor((diffTime + 15 * TIMES.MINUTE) / TIMES.HOUR)
        if (hours > 0) return `${hours} ${allMessages.hour} ${beforeOrAfter}`;

        // Dakika hesaplama
        const minutes = Math.floor((diffTime + 15 * TIMES.SECOND) / TIMES.MINUTE)
        if (minutes > 0)`${minutes} ${allMessages.minute} ${beforeOrAfter}`;

        // Saniye hesaplama
        const seconds = Math.floor(diffTime / TIMES.SECOND);
        return `${seconds} ${allMessages.second} ${beforeOrAfter}`;
    }

}
module.exports = new Time();