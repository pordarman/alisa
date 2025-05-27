

// Switchs/ adlı klasördeki tüm dosyaları obje olarak döndürür
module.exports = {
    cancelOrReset: require("./CancelOrReset"),
    onOrOff: require("./OnOrOff"),
    alisa: require("./Commands/Alisa"),
    authorized: require("./Commands/Authorized"),
    autoResponse: require("./Commands/AutoResponse"),
    help: require("./Commands/Help"),
    language: require("./Commands/Language"),
    partner: require("./Commands/Partner"),
    premium: require("./Commands/Premium"),
    registerCountRoles: require("./Commands/RegisterCountRoles"),
    setCountOptions: require("./Commands/SetCountOptions"),
    setCustomNames: require("./Commands/SetCustomNames"),
    setRegisterType: require("./Commands/SetRegisterType"),
    setupRegister: require("./Commands/SetupRegister"),
    vip: require("./Commands/Vip"),
}