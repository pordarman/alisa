const mainLanguage = require("./Tr/Index.js");
const otherLanguages = ["En"];
const skipKeys = new Set([
    "helpCommandHelper"
]);
const exampleObject = {
    name: {},
    description: {},
    category: {},
    datas: {
        numberToFormat() {
            return;
        },
        total: true,
        registered: true,
        tagged: true,
        voice: true,
        boostCount: true,
        vip: true,
        jail: true,
        registerAuth: true,
        jailAuth: true,
        vipAuth: true,
        banAuth: true,
        kickAuth: true,
        muteAuth: true,
        status: true
    },
    openOrCloseDatas: {},
    authorRegisterCounts: {},
    type: "kick",
    roleIds: [],
};
const exampleFunctionParams = [
    exampleObject,
    exampleObject,
    exampleObject
]

// Diğer dillerin içeriğini kontrol et ve eğer eksikse ekleyin veya düzeltin
for (let i = 0; i < otherLanguages.length; ++i) {
    const language = otherLanguages[i];
    const otherLanguage = require(`./${language}/Index.js`);

    (function checkInsideObject(main, other, path) {
        for (const key in main) {
            if (skipKeys.has(key)) {
                continue;
            }
            if (!other[key] || typeof main[key] !== typeof other[key]) {
                other[key] = main[key];
                console.warn(`"${path}.${key}" key is missing in ${language} language. It has been added.`);
            } else if (typeof main[key] === "object" && !Array.isArray(main[key])) {
                checkInsideObject(main[key], other[key], `${path}.${key}`);
            } else if (typeof main[key] == "function") {
                // Bu fonksiyonları kontrol et ve hata varsa veya fonksiyonun sonucu undefined ise hata mesajı göster
                try {
                    const result = main[key](...exampleFunctionParams);
                    if (result === undefined) {
                        console.error(`"${path.replace(/^\w+\./, "Tr.")}.${key}" function is not working properly in tr language.`);
                    }
                } catch (error) {
                    console.error(error)
                }

                try {
                    const result = other[key](...exampleFunctionParams);
                    if (result === undefined) {
                        console.error(`"${path}.${key}" function is not working properly in ${language} language.`);
                    }
                } catch (error) {
                    console.error(error)
                }


                // Şimdi ise parametreleri kontrol et ve parametreleri fazla veya eksikse hata mesajı göster
                const mainParams = main[key].toLocaleString().match(/(?<=\w+\()[\s\S]+(?=\) \{)/)?.[0]?.replace(/[\r\n ]/g, "")?.split(", ");
                const otherParams = other[key].toLocaleString().match(/(?<=\w+\()[\s\S]+(?=\) \{)/)?.[0]?.replace(/[\r\n ]/g, "")?.split(", ");

                if (!sameValue(mainParams, otherParams)) {
                    console.warn(`"${path}.${key}" function has different parameters in ${language} language.`);
                    console.warn(`\t${mainParams} - ${otherParams}`);
                }
                function sameValue(value1, value2) {
                    if (value1 === value2) return true;
                    if (!value1 || !value2) return false;

                    if (typeof value1 !== typeof value2) return false;

                    if (Array.isArray(value1)) {
                        if (value1.length != value2.length) return false;
                        for (let i = 0; i < value1.length; i++) {
                            if (value1[i].replace(/ +/g, " ").trim() !== value2[i].replace(/ +/g, " ").trim()) return false;
                        }
                        return true;
                    }

                    return true;
                }
            }
        }
    })(mainLanguage, otherLanguage, language);
}

module.exports = {
    tr: mainLanguage,
    en: require("./En/Index.js")
};
