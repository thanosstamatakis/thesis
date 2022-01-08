const fs = require("fs");
const path = require("path");
const moment = require("moment");

const decodeUTF8 = (text) => {
  return decodeURIComponent(escape(text));
};

let friends = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "friends.json"))
).friends;
if (!friends) {
  friends = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "friends.json"))
  ).friends_v2;
}

friends = friends.map((f) => {
  return {
    name: decodeUTF8(f.name),
    friendship_started: moment(f.timestamp * 1000).toISOString(),
  };
});

fs.writeFileSync("friend_dates.json", JSON.stringify({ friends }));
