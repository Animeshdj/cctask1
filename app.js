import https from "https";
import http from "http";

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

let parsedData;

https
  .get(`https://pokeapi.co/api/v2/pokemon/${process.argv[2]}`, (res) => {
    const contentType = res.headers["content-type"];

    let error;
    if (res.statusCode !== 200) {
      console.log("Pokemon Not Found");
      return;
    }

    res.setEncoding("utf8");
    let rawData = "";
    res.on("data", (chunk) => {
      rawData += chunk;
    });
    res.on("end", () => {
      try {
        parsedData = JSON.parse(rawData);
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
          parsedData.abilities
            .map((ability) => {
              return toTitleCase(ability.ability.name);
            })
            .join(" ")
        );
        console.log("Height:", parsedData.height / 10, "m");
        console.log("Weight:", parsedData.weight / 10, "kg", "\n\nBase Stats:");
        let totalStats = 0;
        parsedData.stats.map((stat) => {
          console.log(toTitleCase(stat.stat.name).concat(":"), stat.base_stat);
          totalStats += stat.base_stat;
        });
        console.log("Total:", totalStats);
      } catch (e) {
        console.error(e.message);
      }
    });
  })
  .on("error", (e) => {
    console.error(`Got error: ${e.message}`);
  });

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      data: parsedData,
    })
  );
});
// console.log(process.argv[2]);

server.listen(8000);
