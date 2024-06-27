import { createWriteStream } from "fs";
import https from "https";

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

https.get(`https://pokeapi.co/api/v2/pokemon/${process.argv[2]}`, (res) => {
  if (res.statusCode === 404) {
    console.log("Pokemon Not Found");
    return;
  } else if (res.statusCode === 200) {
    res.setEncoding("utf8");
    let rawData = "";
    res.on("data", (chunk) => {
      rawData += chunk;
    });
    res.on("end", () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log("Name:", toTitleCase(parsedData.name));
        console.log("National Number:", parsedData.id);
        console.log(
          "Type:",
          parsedData.types
            .map((type) => {
              return type.type.name.toUpperCase();
            })
            .join(" ")
        );
        console.log(
          "Abilities:",
          `${parsedData.abilities.map((ability) => {
            return toTitleCase(ability.ability.name);
          })}:`
        );
        console.log("Height:", parsedData.height / 10, "m");
        console.log("Weight:", parsedData.weight / 10, "kg", "\n\nBase Stats:");
        let totalStats = 0;
        parsedData.stats.map((stat) => {
          console.log(toTitleCase(stat.stat.name).concat(":"), stat.base_stat);
          totalStats += stat.base_stat;
        });
        console.log("Total:", totalStats, "\n");

        // console.log(parsedData.sprites.other["official-artwork"].front_default);

        const file = createWriteStream("sprite.png");
        https.get(
          parsedData.sprites.other["official-artwork"].front_default,
          (res) => {
            res.pipe(file);

            file
              .on("finish", () => {
                file.close();
                console.log("Image Downloaded");
              })
              .on("error", (err) => {
                fs.unlink(imageName);
                console.error(`Error downloading image: ${err.message}`);
              });
          }
        );
      } catch (e) {
        console.error(e.message);
      }
    });
  } else {
    console.log(`Error occurred Status Code: ${res.statusCode}`);
  }
});
