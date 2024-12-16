const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node compare.js <SONGLIST_PATH> <DB_PATH>");
  process.exit(1);
}

const songlistPath = args[0];
const databasePath = args[1];

fs.readFile(songlistPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading songlist file");
    return;
  }

  let songlist;
  try {
    songlist = JSON.parse(data);
  } catch (parseError) {
    console.error("Error while parsing songlist file");
    return;
  }

  const songArray = Array.isArray(songlist.songs) ? songlist.songs : null;
  if (!songArray) {
    console.error(
      "Invalid songlist format. (Is this the official Arcaea songlist?)"
    );
    return;
  }

  const songIds = songArray.map((song) => song.id);

  const db = new sqlite3.Database(
    databasePath,
    sqlite3.OPEN_READONLY,
    (err) => {
      if (err) {
        console.error("Error while connecting to database");
        return;
      }
      console.log("Connected to database.");
    }
  );

  const query = `SELECT song_id FROM chart WHERE song_id IN (${songIds
    .map(() => "?")
    .join(",")})`;
  db.all(query, songIds, (err, rows) => {
    if (err) {
      console.error("Error querying database:", err);
      db.close();
      return;
    }

    const existingIds = rows.map((row) => row.song_id);
    const missingIds = songIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      console.log("These chart datas aren't found in database:", missingIds);
    } else {
      console.log("All chart datas are found in the database.");
    }
    db.close();
  });
});
