"use strict";

// Botu başka dillerde de kullanacağımız için bütün dilleri ekle
const allLanguages = {
    tr: {
        long: {
            milisecond: "salise",
            second: "saniye",
            minute: "dakika",
            hour: "saat",
            day: "gün",
            month: "ay",
            year: "yıl",
        },
        short: {
            milisecond: "ms",
            second: "sn",
            minute: "dk",
            hour: "sa",
            day: "g",
            month: "ay",
            year: "yıl",
        },
        ago: "önce",
        before: "sonra"
    },
    en: {
        long: {
            milisecond: "milliseconds",
            second: "seconds",
            minute: "minutes",
            hour: "hours",
            day: "days",
            month: "months",
            year: "years",
        },
        short: {
            milisecond: "ms",
            second: "s",
            minute: "m",
            hour: "h",
            day: "d",
            month: "mo",
            year: "y",
        },
        ago: "ago",
        before: "before"
    }
}

// Kodlarımızı yazmaya başlıyoruz
class Time {


    get TIMES() {
        return {
            milisecond: 1,
            second: 1000,
            minute: 60 * (1000),
            hour: 60 * (60 * (1000)),
            day: 24 * (60 * (60 * (1000))),
            week: 7 * (24 * (60 * (60 * (1000)))),
            month: 30 * (24 * (60 * (60 * (1000)))),
            year: 365.25 * (24 * (60 * (60 * (1000))))
        }
    }

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
     * @param {"tr" | "en"} [language="tr"] - Döndürülecek dil
     * @param {{ toNow: Boolean, dateStyle: "long" | "short" }} [options] - Döndürülen değeri özelleştirmenizi sağlar
     * @returns {String}
     */
    duration(milisecond, language = "tr", { toNow = false, dateStyle = "long" } = {}) {
        // Girilen değeri bir sayıya dönüştür
        milisecond = Math.round(milisecond);

        // Eğer girilen değer bir sayı değilse hata döndür
        if (!this.isNumber(milisecond)) return "Geçersiz format (milisecond değeri bir sayı olmalı)";

        // Eğer zamanı şimdiden çıkarmamızı istiyorsa
        if (toNow) milisecond = Math.abs(milisecond - Date.now());

        const allMessages = allLanguages[language][dateStyle];

        // Geri döndürülecek değerin array olmasının nedeni: 
        // Her zaman ifadesinin arasına virgül koyacağımız için işleri kolaylaştırmak için başka nedeni yok
        const resultArray = [];

        // Eğer değer 1 yıldan fazlaysa
        if (milisecond >= this.TIMES.year) {
            resultArray.push(
                `${Math.floor(milisecond / this.TIMES.year)} ${allMessages.year}`
            );
            milisecond %= this.TIMES.year;
        }

        // Eğer değer 1 aydan fazlaysa
        if (milisecond >= this.TIMES.month) {
            resultArray.push(
                `${Math.floor(milisecond / this.TIMES.month)} ${allMessages.month}`
            );
            milisecond %= this.TIMES.month;
        }

        // Eğer değer 1 günden fazlaysa
        if (milisecond >= this.TIMES.day) {
            resultArray.push(
                `${Math.floor(milisecond / this.TIMES.day)} ${allMessages.day}`
            );
            milisecond %= this.TIMES.day;
        }

        // Eğer değer 1 saatten fazlaysa
        if (milisecond >= this.TIMES.hour) {
            resultArray.push(
                `${Math.floor(milisecond / this.TIMES.hour)} ${allMessages.hour}`
            );
            milisecond %= this.TIMES.hour;
        }

        // Eğer değer 1 dakikadan fazlaysa
        if (milisecond >= this.TIMES.minute) {
            resultArray.push(
                `${Math.floor(milisecond / this.TIMES.minute)} ${allMessages.minute}`
            );
            milisecond %= this.TIMES.minute;
        }

        // Eğer değer 1 saniyeden fazlaysa
        if (milisecond >= this.TIMES.second) {
            resultArray.push(
                `${Math.floor(milisecond / this.TIMES.second)} ${allMessages.second}`
            );
            milisecond %= this.TIMES.second;
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

            switch (unit.trim().toLowerCase()) {
                case "saniye":
                case "sn":
                case "second":
                case "sec":
                case "seconds":
                case "s":
                    multi = this.TIMES.second;
                    break;

                case "dakika":
                case "minute":
                case "min":
                case "minutes":
                case "dk":
                case "m":
                    multi = this.TIMES.minute;
                    break;

                case "saat":
                case "hour":
                case "hours":
                case "h":
                    multi = this.TIMES.hour;
                    break;

                case "gün":
                case "gun":
                case "day":
                case "days":
                case "d":
                    multi = this.TIMES.day;
                    break;

                case "hafta":
                case "week":
                case "weeks":
                case "w":
                    multi = this.TIMES.week;
                    break;

                case "ay":
                case "month":
                case "months":
                    multi = this.TIMES.month;
                    break;

                case "yıl":
                case "y":
                case "year":
                case "years":
                    multi = this.TIMES.year;
                    break;

                default:
                    continue;
            }

            time += Number(num) * multi;
        }

        return time;
    }



    /**
     * Girilen değerdeki bütün süre verilerini milisaniye cinsinden döndürür ve mesajdaki süreleri siler
     * @param {String} timeString 
     * @returns {Array} - [Mesajdaki süreler silinmiş hali, toplam süre]
     */
    parseTimeAndReplace(timeString) {
        let time = 0;

        // Süreyi mesajdan çek
        const resultString = timeString.replace(/(?<!\d)(\d{1,5}) ?(\S+)/gi, (match, num, unit) => {
            let multi;

            switch (unit.trim().toLowerCase()) {
                case "saniye":
                case "sn":
                case "second":
                case "sec":
                case "seconds":
                case "s":
                    multi = this.TIMES.second;
                    break;

                case "dakika":
                case "minute":
                case "min":
                case "minutes":
                case "dk":
                case "m":
                    multi = this.TIMES.minute;
                    break;

                case "saat":
                case "hour":
                case "hours":
                case "h":
                    multi = this.TIMES.hour;
                    break;

                case "gün":
                case "gun":
                case "day":
                case "days":
                case "d":
                    multi = this.TIMES.day;
                    break;

                case "hafta":
                case "week":
                case "weeks":
                case "w":
                    multi = this.TIMES.week;
                    break;

                default:
                    return match;
            }

            time += num * multi;
            return "";
        });

        return [resultString, time];
    }


    /**
     * Bir **milisaniye** cinsinden bir değer girerek o tarihi şu şekilde döndürür => `Cumartesi, 8 Nisan 2023 17:05:30`
     * @param {Date | Number} milisecond - Bir **tarih** veya **milisaniye** değeri giriniz
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
     * @param {Number} milisecond Bir **milisaniye** değeri giriniz
     * @param {"tr" | "en"} language - Döndürülecek dil
     * @returns {String}
     */

    toNow(milisecond, language = "tr") {
        // Girilen değeri bir sayıya dönüştür
        milisecond = Math.round(milisecond);

        // Eğer girilen değer bir sayı değilse hata döndür
        if (!this.isNumber(milisecond)) return "Geçersiz format (milisecond değeri bir sayı olmalı)";

        const allMessages = allLanguages[language]

        let diffTime = Date.now() - milisecond;
        let beforeOrAfter;

        // Eğer milisaniye ileri bir tarihi gösteriyorsa "sonra" değilse "önce" yazdır
        if (diffTime < 0) {
            diffTime = diffTime * -1;
            beforeOrAfter = allMessages.before;
        } else {
            beforeOrAfter = allMessages.ago;
        }

        // Yıl hesaplama
        const years = Math.floor((diffTime + 3 * this.TIMES.month) / this.TIMES.year)
        if (years > 0) return `${years} ${allMessages.year} ${beforeOrAfter}`;

        // Ay hesaplama
        const months = Math.floor((diffTime + 7.5 * this.TIMES.day) / this.TIMES.month)
        if (months > 0) return `${months} ${allMessages.month} ${beforeOrAfter}`;

        // Gün hesaplama
        const days = Math.floor((diffTime + 6 * this.TIMES.hour) / this.TIMES.day)
        if (days > 0) return `${days} ${allMessages.day} ${beforeOrAfter}`;

        // Saat hesaplama
        const hours = Math.floor((diffTime + 15 * this.TIMES.minute) / this.TIMES.hour)
        if (hours > 0) return `${hours} ${allMessages.hour} ${beforeOrAfter}`;

        // Dakika hesaplama
        const minutes = Math.floor((diffTime + 15 * this.TIMES.second) / this.TIMES.minute)
        if (minutes > 0)`${minutes} ${allMessages.minute} ${beforeOrAfter}`;

        // Saniye hesaplama
        const seconds = Math.floor(diffTime / this.TIMES.second);
        return `${seconds} ${allMessages.second} ${beforeOrAfter}`;
    }

}
module.exports = new Time();