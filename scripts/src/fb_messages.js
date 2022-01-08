const fs = require("fs");
const path = require("path");
const moment = require("moment");
require("dotenv").config();
const EGO = process.env.EGO;

console.log("DIRNAME:", __dirname);

const files = fs.readdirSync(path.join(__dirname, "..", "messages", "inbox"));

const directories = [];
for (const file of files) {
  try {
    const chatFiles = fs.readdirSync(
      path.join(__dirname, "..", "messages", "inbox", file)
    );

    for (const chatFile of chatFiles) {
      if (/.json$/.test(chatFile))
        directories.push(
          path.join(__dirname, "..", "messages", "inbox", file, chatFile)
        );
    }
  } catch (error) {
    console.log(`${file} is not a directory`);
  }
}

const decodeUTF8 = (text) => {
  return decodeURIComponent(escape(text));
};

let friends = [];
directories.forEach((directory) => {
  const chat = JSON.parse(fs.readFileSync(directory));
  const participants = chat.participants.map((p) => decodeUTF8(p.name));
  friends = [...friends, ...participants];
});

friends = Array.from(new Set(friends));
friends = friends.map((f) => {
  return {
    user: f,
    first_communication: null,
    last_communication: null,
    videos: { incoming: 0, outgoing: 0 },
    photos: { incoming: 0, outgoing: 0 },
    video_chats: { incoming: 0, outgoing: 0 },
    messages: { incoming: 0, outgoing: 0 },
    chat_dates: [],
  };
});

for (const directory of directories) {
  const chat = JSON.parse(fs.readFileSync(directory));
  const participants = chat.participants.map((p) =>
    decodeURIComponent(escape(p.name))
  );
  if (participants.length === 2) {
    const chat_messages = chat.messages.filter(
      (m) => m.content !== "You are now connected on Messenger"
    );

    // Get video data
    const videos = chat_messages.filter((m) => m.videos?.length).length;
    const videos_incoming = chat_messages.filter(
      (m) => m.videos?.length && decodeUTF8(m.sender_name) !== EGO
    ).length;
    const videos_outgoing = videos - videos_incoming;

    // Get photo data
    const photos = chat_messages.filter((m) => m.photos?.length).length;
    const photos_incoming = chat_messages.filter(
      (m) => m.photos?.length && decodeUTF8(m.sender_name) !== EGO
    ).length;
    const photos_outgoing = photos - photos_incoming;

    // Get video chat data
    const video_chats = chat_messages.filter((m) => m.type === "Call").length;
    const video_chats_incoming = chat_messages.filter(
      (m) => m.type === "Call" && decodeUTF8(m.sender_name) !== EGO
    ).length;
    const video_chats_outgoing = video_chats - video_chats_incoming;

    // Get message data
    const messages = chat_messages.length - videos - photos - video_chats;
    const messages_incoming = chat_messages.filter(
      (m) =>
        !m.photos?.length &&
        !m.videos?.length &&
        m.type === "Generic" &&
        decodeUTF8(m.sender_name) !== EGO
    ).length;
    const messages_outgoing = chat_messages.filter(
      (m) =>
        !m.photos?.length &&
        !m.videos?.length &&
        m.type === "Generic" &&
        decodeUTF8(m.sender_name) === EGO
    ).length;

    const timestamps = chat_messages.map((m) => moment(m.timestamp_ms));
    const first_communication = moment.min(timestamps);
    const last_communication = moment.max(timestamps);

    const idx = friends.findIndex((u) => u.user === participants[0]);
    friends[idx].video_chats.incoming += video_chats_incoming;
    friends[idx].video_chats.outgoing += video_chats_outgoing;
    friends[idx].videos.incoming += videos_incoming;
    friends[idx].videos.outgoing += videos_outgoing;
    friends[idx].photos.incoming += photos_incoming;
    friends[idx].photos.outgoing += photos_outgoing;
    friends[idx].messages.incoming += messages_incoming;
    friends[idx].messages.outgoing += messages_outgoing;
    friends[idx].chat_dates = [...friends[idx].chat_dates, ...timestamps].sort(
      (a, b) => a - b
    );
    friends[idx].first_communication = moment.min(friends[idx].chat_dates);
    friends[idx].last_communication = moment.max(friends[idx].chat_dates);
  }
}

fs.writeFileSync("messages.json", JSON.stringify({ stats: friends }));
