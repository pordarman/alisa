const fs = require("fs");

module.exports = (client, dirname) => {
  function loadEvents(path) {
    let files;

    try {
      files = fs.readdirSync(path);
    } catch (error) {
      console.error(error);
      return;
    }

    for (const file of files) {
      if (!file.includes(".")) {
        // Eğer dosya bir klasör ise onun da içini kontrol et
        loadEvents(`${path}/${file}`);
      } else if (file.endsWith(".js")) {
        try {
          const command = require(`${path}/${file}`);
          client[command.once ? "once" : "on"](command.name, (...args) => command.execute(...args));
        } catch (error) {
          console.error(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
          console.error(error);
        }
      }
    }

  }
  loadEvents(`${dirname}\\Events`);
};
