/**
 * Botun premium sistemi için o kişiye özel oluşturulan kod'u oluşturma komutu
 */

module.exports = (uzunluk, pre) => {
  let objectToArray = Object.values(pre)
    , letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  function rast() {
    var s = '';
    for (var i = uzunluk; i > 0; --i) s += letters[Math.floor(Math.random() * letters.length)];
    if (objectToArray.some(a => a.code == s)) return rast()
    return s
  }
  return rast();
}