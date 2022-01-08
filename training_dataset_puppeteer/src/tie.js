const moment = require("moment");
const fs = require("fs");
require("dotenv").config();

const USERNAME = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const FACEBOOK_URL = "https://facebook.com/";
const EGO = process.env.EGO;

const REACTIONS = {
  "https://scontent.fjnb2-1.fna.fbcdn.net/m1/v/An9tU9mltzRvDoDeXQEJFl0TPMhk16ErJvLOtTBVW19D9Ks5FI_j6pZG-fFN3eJkOijusD5KWbb-YUjyv4WE1hCqkOc3spA_jeOHZBc-iWlwewzM.png?ccb=9-4&oh=94e026cbf391b4b94f94a0a2098f6503&oe=60D0EAA1":
    "love",
  "https://scontent.flhr4-4.fna.fbcdn.net/m1/v/An8JkpVv4NEzRagilLipZW9eAICo35S1A0gUa4zw4Kr53H6QUj1q7YbT6GS0zMJlLCmB4Wbxqu-bGVq1U-a3JrxL3l7S5zaUNIcxYJ4uUPCNDlXP.png?ccb=9-4&oh=8a120abc102a04c54ff440a8245a3529&oe=60D17332":
    "like",
  "https://scontent-frt3-2.xx.fbcdn.net/m1/v/An__wcku2C9egUdf94a5F1z38LKlNYEI-g0uLs0fHp8P_O_BCnO_5G1eYl98T_oRrRvFt2TeJO9z7Kn2px0MJFqjvZsZw6gGAhzX1fLhIoNydmCt.png?ccb=9-4&oh=266890b30dcea8ec4903d775b59fd376&oe=60D11CF7":
    "wow",
  "https://scontent.fjnb9-1.fna.fbcdn.net/m1/v/An-zv1qPExxz6a32zPrT6S6dY0H9YUfKQV5G2GtGfFkE-CFn00-Lq99Pp-0jUQwcEXXPxYjbZXZoE416bpzpqaYFNgTSXlvM4nCbmBfRzzGxNu8.png?ccb=9-4&oh=dbcc25a97373ef2c6d9a889216e67b32&oe=60D160D0":
    "laugh",
  "https://scontent.fqls2-1.fna.fbcdn.net/m1/v/An-eYNxVwba0wRnEA-d76ymjFj_xlEq1T0rnOlw9cXZvd9NV6OlI1X1M65yqQ2Ty1QuNQiVfzmfhn3bAWswz62oubWpvy0QiBkywBbYsoOcDmRTEIc9T.png?ccb=10-4&oh=6cbabc3d78479c9eb0bb413c3b072d19&oe=60D14BDA":
    "care",
  "https://scontent.fcpt5-1.fna.fbcdn.net/m1/v/An_jJ1nMvYBvga64HF0IHQVbDaJ9ZZ_vqvFfEkKdylchLsszYtXN2gwdh66zpE0wF0aYKv-xc8a-eZ8Js-8v7U5tLHbdRgKREz_QwfdpBYw58UhnXQ.png?ccb=9-4&oh=81a410a65a4d0191fd588c30cb317a42&oe=60D1622E":
    "sad",
  "https://scontent.fgau3-1.fna.fbcdn.net/m1/v/An__wcku2C9egUdf94a5F1z38LKlNYEI-g0uLs0fHp8P_O_BCnO_5G1eYl98T_oRrRvFt2TeJO9z7Kn2px0MJFqjvZsZw6gGAhzX1fLhIoNydmCt.png?ccb=9-4&oh=266890b30dcea8ec4903d775b59fd376&oe=60D11CF7":
    "wow",
  "https://scontent.ffco4-1.fna.fbcdn.net/m1/v/An_jJ1nMvYBvga64HF0IHQVbDaJ9ZZ_vqvFfEkKdylchLsszYtXN2gwdh66zpE0wF0aYKv-xc8a-eZ8Js-8v7U5tLHbdRgKREz_QwfdpBYw58UhnXQ.png?ccb=9-4&oh=81a410a65a4d0191fd588c30cb317a42&oe=60D1622E":
    "sad",
  "https://scontent.fham6-1.fna.fbcdn.net/m1/v/An-ZyF_zEOJ1_yJh_zPGSRxDwnhaw3vaQPln0lvtl4k6fJF_2_6HxNmlcNxO7JOKGqiHT47T_WT9B7QsRpqJeDVvist1cde3YJ3mCMK0A6yjn-D-.png?ccb=9-4&oh=6059a01f7d86e4bf541e3b8eb1420645&oe=60D16198":
    "angry",
  "https://scontent.fjnb2-1.fna.fbcdn.net/m1/v/An-zv1qPExxz6a32zPrT6S6dY0H9YUfKQV5G2GtGfFkE-CFn00-Lq99Pp-0jUQwcEXXPxYjbZXZoE416bpzpqaYFNgTSXlvM4nCbmBfRzzGxNu8.png?ccb=9-4&oh=dbcc25a97373ef2c6d9a889216e67b32&oe=60D160D0":
    "laugh",
  "https://scontent.fayt2-1.fna.fbcdn.net/m1/v/An-ZyF_zEOJ1_yJh_zPGSRxDwnhaw3vaQPln0lvtl4k6fJF_2_6HxNmlcNxO7JOKGqiHT47T_WT9B7QsRpqJeDVvist1cde3YJ3mCMK0A6yjn-D-.png?ccb=9-4&oh=6059a01f7d86e4bf541e3b8eb1420645&oe=60D16198":
    "angry",
  "https://scontent.xx.fbcdn.net/m1/v/An9tU9mltzRvDoDeXQEJFl0TPMhk16ErJvLOtTBVW19D9Ks5FI_j6pZG-fFN3eJkOijusD5KWbb-YUjyv4WE1hCqkOc3spA_jeOHZBc-iWlwewzM.png?hnt1=prn&ccb=10-4&oh=1da19892f2769ad7711435c807b9880a&oe=60D0EAA1":
    "love",
  "https://scontent.faae1-1.fna.fbcdn.net/m1/v/An8JkpVv4NEzRagilLipZW9eAICo35S1A0gUa4zw4Kr53H6QUj1q7YbT6GS0zMJlLCmB4Wbxqu-bGVq1U-a3JrxL3l7S5zaUNIcxYJ4uUPCNDlXP.png?ccb=9-4&oh=8a120abc102a04c54ff440a8245a3529&oe=60D17332":
    "like",
  "https://scontent-lcy1-1.xx.fbcdn.net/m1/v/An_jJ1nMvYBvga64HF0IHQVbDaJ9ZZ_vqvFfEkKdylchLsszYtXN2gwdh66zpE0wF0aYKv-xc8a-eZ8Js-8v7U5tLHbdRgKREz_QwfdpBYw58UhnXQ.png?ccb=9-4&oh=81a410a65a4d0191fd588c30cb317a42&oe=60D1622E":
    "sad",
  "https://scontent-lhr8-1.xx.fbcdn.net/m1/v/An__wcku2C9egUdf94a5F1z38LKlNYEI-g0uLs0fHp8P_O_BCnO_5G1eYl98T_oRrRvFt2TeJO9z7Kn2px0MJFqjvZsZw6gGAhzX1fLhIoNydmCt.png?ccb=9-4&oh=266890b30dcea8ec4903d775b59fd376&oe=60D11CF7":
    "wow",
  "https://scontent.ffih1-2.fna.fbcdn.net/m1/v/An8JkpVv4NEzRagilLipZW9eAICo35S1A0gUa4zw4Kr53H6QUj1q7YbT6GS0zMJlLCmB4Wbxqu-bGVq1U-a3JrxL3l7S5zaUNIcxYJ4uUPCNDlXP.png?ccb=10-4&oh=8a120abc102a04c54ff440a8245a3529&oe=60D17332":
    "like",
  "https://scontent.flos6-1.fna.fbcdn.net/m1/v/An-zv1qPExxz6a32zPrT6S6dY0H9YUfKQV5G2GtGfFkE-CFn00-Lq99Pp-0jUQwcEXXPxYjbZXZoE416bpzpqaYFNgTSXlvM4nCbmBfRzzGxNu8.png?ccb=10-4&oh=dbcc25a97373ef2c6d9a889216e67b32&oe=60D160D0":
    "laugh",
  "https://scontent.fist6-2.fna.fbcdn.net/m1/v/An9tU9mltzRvDoDeXQEJFl0TPMhk16ErJvLOtTBVW19D9Ks5FI_j6pZG-fFN3eJkOijusD5KWbb-YUjyv4WE1hCqkOc3spA_jeOHZBc-iWlwewzM.png?ccb=9-4&oh=23417b161d4473e103564769e13929a5&oe=60D19361":
    "love",
  "https://scontent.fmba5-1.fna.fbcdn.net/m1/v/An8JkpVv4NEzRagilLipZW9eAICo35S1A0gUa4zw4Kr53H6QUj1q7YbT6GS0zMJlLCmB4Wbxqu-bGVq1U-a3JrxL3l7S5zaUNIcxYJ4uUPCNDlXP.png?ccb=9-4&oh=8a120abc102a04c54ff440a8245a3529&oe=60D17332":
    "like",
  "https://scontent.xx.fbcdn.net/m1/v/An-zv1qPExxz6a32zPrT6S6dY0H9YUfKQV5G2GtGfFkE-CFn00-Lq99Pp-0jUQwcEXXPxYjbZXZoE416bpzpqaYFNgTSXlvM4nCbmBfRzzGxNu8.png?hnt1=prn&ccb=10-4&oh=753bff83e1eb111fc54ccca23e18970d&oe=60D160D0":
    "laugh",
  "https://scontent.xx.fbcdn.net/m1/v/An9tU9mltzRvDoDeXQEJFl0TPMhk16ErJvLOtTBVW19D9Ks5FI_j6pZG-fFN3eJkOijusD5KWbb-YUjyv4WE1hCqkOc3spA_jeOHZBc-iWlwewzM.png?hnt1=prn&ccb=10-4&oh=1b64fd4507963d560e37f3e3fdcfa527&oe=60D19361":
    "love",
  "https://scontent.flos3-1.fna.fbcdn.net/m1/v/An8JkpVv4NEzRagilLipZW9eAICo35S1A0gUa4zw4Kr53H6QUj1q7YbT6GS0zMJlLCmB4Wbxqu-bGVq1U-a3JrxL3l7S5zaUNIcxYJ4uUPCNDlXP.png?ccb=9-4&oh=8a120abc102a04c54ff440a8245a3529&oe=60D17332":
    "like",
  "https://scontent.xx.fbcdn.net/m1/v/An8JkpVv4NEzRagilLipZW9eAICo35S1A0gUa4zw4Kr53H6QUj1q7YbT6GS0zMJlLCmB4Wbxqu-bGVq1U-a3JrxL3l7S5zaUNIcxYJ4uUPCNDlXP.png?hnt1=prn&ccb=10-4&oh=03cac1c072370b7b6e684cd7b3aa699a&oe=60D17332":
    "like",
  "https://scontent.fcmn5-1.fna.fbcdn.net/m1/v/An9tU9mltzRvDoDeXQEJFl0TPMhk16ErJvLOtTBVW19D9Ks5FI_j6pZG-fFN3eJkOijusD5KWbb-YUjyv4WE1hCqkOc3spA_jeOHZBc-iWlwewzM.png?ccb=9-4&oh=23417b161d4473e103564769e13929a5&oe=60D19361":
    "love",
};

const main = async () => {
  let friends_wall = JSON.parse(fs.readFileSync("friends.json")).friends;
  let friends = [];
  JSON.parse(fs.readFileSync("friend_dates.json")).friends.forEach((fd, i) => {
    const idx = friends_wall.findIndex((x) => x.full_name === fd.name);
    friends.push({ ...friends_wall[idx], friendship_start: fd.friendship_started });
  });

  const friendNames = friends.map((f) => f?.full_name);
  const messages = JSON.parse(fs.readFileSync("messages.json")).stats.filter((c) => friendNames.includes(c.user));
  const wallPosts = JSON.parse(fs.readFileSync("wall_data.json")).wallData.filter((p) => p?.postedBy === EGO || friendNames.includes(p?.postedBy));

  console.log({ friends: friends.slice(0, 3), posts: wallPosts.slice(0, 3), messages: messages.slice(0, 3) });
  const firstMessage = getMinDate(messages);
  const lastMessage = getMaxDate(messages);

  let msgdata = friends.map((f) => {
    return {
      user: f.full_name,
      chat_dates: 0,
      messages: { incoming: 0, outgoing: 0 },
      video_chats: { incoming: 0, outgoing: 0 },
      videos: { incoming: 0, outgoing: 0 },
      photos: { incoming: 0, outgoing: 0 },
      first_communication: null,
      last_communication: null,
      days_of_communication: 0,
      mean_days_between_contact: 0,
      unique_dates: 0,
      same_dates: 0,
      messages_per_day: { incoming: 0, outgoing: 0 },
      friendship_start: f.friendship_start,
    };
  });

  messages.forEach((m) => {
    const idx = msgdata.findIndex((x) => x.user === m.user);
    msgdata[idx] = {
      user: m.user,
      chat_dates: m.chat_dates.length,
      messages: m.messages,
      video_chats: m.video_chats,
      videos: m.videos,
      photos: m.photos,
      first_communication: m.chat_dates[0],
      last_communication: m.chat_dates[m.chat_dates.length - 1],
      mean_days_between_contact: 0,
      friendship_start: msgdata[idx].friendship_start,
      days_of_communication: moment(m.chat_dates[m.chat_dates.length - 1]).diff(moment(m.chat_dates[0]), "days"),
      messages_per_day: {
        incoming:
          parseFloat((m.messages.incoming / moment(m.chat_dates[m.chat_dates.length - 1]).diff(moment(m.chat_dates[0]), "days")).toFixed(2)) || 0,
        outgoing:
          parseFloat((m.messages.outgoing / moment(m.chat_dates[m.chat_dates.length - 1]).diff(moment(m.chat_dates[0]), "days")).toFixed(2)) || 0,
      },
    };
  });

  messages.forEach((m) => {
    const chat_dates = m.chat_dates;
    const friendship_start = friends.find((u) => u.full_name === m.user).friendship_start;
    const unique_dates = Array.from(new Set(chat_dates.map((d) => moment(d).format("DD/MM/YYYY")))).map((d) => moment(d, ["DD/MM/YYYY"]));
    const same_dates = chat_dates.length - unique_dates.length;

    const friendship_length = moment(lastMessage).diff(moment(friendship_start), "days");
    const days_of_communication = moment(m.last_communication).diff(moment(m.first_communication), "days");
    const days_on_fb = moment(lastMessage).diff(moment(firstMessage), "days");
    const messages_per_day = unique_dates.length > 0 ? (same_dates / unique_dates.length) * (days_of_communication / days_on_fb) : 0;

    // Calculate mean difference between days
    let diff = 0;
    for (let i = 0; i < unique_dates.length - 1; i += 1) {
      diff += unique_dates[i + 1].diff(unique_dates[i], "days");
    }
    const idx = msgdata.findIndex((u) => u.user === m.user);
    msgdata[idx].mean_days_between_contact = unique_dates.length > 0 ? diff / unique_dates.length : null;
    msgdata[idx].unique_dates = unique_dates.length;
    msgdata[idx].same_dates = same_dates;

    // console.log({
    //   user: m.user,
    //   unique_dates: unique_dates.length,
    //   same_dates,
    //   friendship_length,
    //   // friend_date,
    //   days_of_communication,
    //   mean_days_between_contact: diff / unique_dates.length,
    //   com_repetition: (100 * messages_per_day) / unique_dates.length,
    //   messages_per_day,
    //   perc_uniq_dates: 100 * (unique_dates.length / 1321),
    // });
  });

  // messages.forEach((m) => {
  //   const dates = m.chat_dates.map((d) => moment(d));
  //   const idx = msgdata.findIndex((x) => x.user === m.user);
  //   let difference = 0;
  //   let unique_dates = 0;
  //   let same_dates = 0;

  //   for (let i = 0; i < dates.length - 2; i += 2) {
  //     const date = dates[i];
  //     const next_date = dates[i + 1];
  //     const day_diff = next_date.diff(date, "days");
  //     difference += day_diff;

  //     if (day_diff === 0) {
  //       same_dates += 1;
  //     } else if (day_diff > 0) {
  //       unique_dates += 1;
  //     }
  //     // console.log({ date, next_date, diff: next_date.diff(date, "days"), user: m.user });
  //   }
  //   msgdata[idx].mean_days_between_contact = difference / dates.length;
  //   msgdata[idx].unique_dates = unique_dates;
  //   msgdata[idx].same_dates = same_dates;
  // });

  let wallData = friendNames.map((n) => wallPosts.filter((p) => p.postedBy === n)).filter((n) => n.length);
  wallData = wallData.map((p) => {
    const postDates = p.map((pos) => pos.date);
    return {
      user: p[0].postedBy,
      dates: postDates,
      first_post: postDates[postDates.length - 1],
      last_post: postDates[0],
      posts: p,
    };
  });

  let reacts = friendNames.map((f) => {
    return { user: f, like: 0, care: 0, wow: 0, sad: 0, laugh: 0, love: 0, angry: 0 };
  });

  for (const pst of JSON.parse(fs.readFileSync("wall_data.json")).wallData) {
    pst?.reactions.forEach((r) => {
      if (friendNames.includes(r.person)) {
        const person = r.person;
        const react = REACTIONS[r.react];
        const idx = reacts.findIndex((x) => x.user === person);
        reacts[idx][react] += 1;
      }
    });
  }

  let personalContact = friendNames.map((f) => {
    return { user: f, personal_encounters: 0 };
  });
  let involvements = JSON.parse(fs.readFileSync("wall_data.json")).wallData.map((p) =>
    p.involved.filter((i) => friendNames.includes(i) && p.postedBy !== i)
  );
  involvements = [].concat.apply([], involvements);
  involvements.forEach((i) => {
    const idx = personalContact.findIndex((x) => x.user === i);
    personalContact[idx].personal_encounters += 1;
  });

  let tieData = [];
  friendNames.forEach((f) => {
    const p = personalContact.find((u) => u.user === f);
    const r = reacts.find((u) => u.user === f);
    const m = msgdata.find((u) => u.user === f);
    tieData.push({ ...r, ...p, ...m, ...{ mutual_friends: 0 } });
  });

  friends.forEach((friend) => {
    const tieidx = tieData.findIndex((x) => x.user === friend.full_name);
    tieData[tieidx].mutual_friends = friend.mutual_friends;
  });

  for (const pst of JSON.parse(fs.readFileSync("wall_data.json")).wallData) {
    pst?.reactions.forEach((r) => {
      if (friendNames.includes(r.person)) {
        const person = r.person;
        const reactDate = pst.date;
        const reactMoment = moment(pst.date);
        const idx = tieData.findIndex((x) => x.user === person);
        if (tieData[idx].first_communication) {
          const firstCom = moment(tieData[idx].first_communication);
          // if (reactMoment.isBefore(firstCom)) {
          //   tieData[idx].first_communication = reactDate;
          //   tieData[idx].days_of_communication = moment(tieData[idx].last_communication).diff(reactMoment, "days");
          // }
        }
      }
    });
  }
  // const ties = getTieStrength(tieData);
  const dates = tieData
    .map((u) => u.last_communication)
    .filter((d) => d !== null && d !== undefined)
    .map((d) => moment(d));

  const lastDate = moment.max(dates).toISOString();
  console.log(lastDate);
  fs.writeFileSync(
    "tie_data.json",
    JSON.stringify(
      tieData
        .map((u) => {
          return {
            user: u.user,
            like: u.like,
            care: u.care,
            wow: u.wow,
            sad: u.sad,
            laugh: u.laugh,
            love: u.love,
            angry: u.angry,
            personal_encounters: u.personal_encounters,
            chat_dates: u.chat_dates,
            messages_incoming: u.messages.incoming,
            messages_outgoing: u.messages.outgoing,
            video_chats_incoming: u.video_chats.incoming,
            video_chats_outgoing: u.video_chats.outgoing,
            videos_incoming: u.videos.incoming,
            videos_outgoing: u.videos.outgoing,
            photos_incoming: u.photos.incoming,
            photos_outgoing: u.photos.outgoing,
            days_of_communication: u.days_of_communication,
            unique_dates: u.unique_dates,
            same_dates: u.same_dates,
            mutual_friends: u.mutual_friends || 0,
            days_since_last_contact: u.last_communication ? moment(lastDate).diff(moment(u.last_communication), "days") : 3000,
          };
        })
        .filter((u) => u.user !== undefined)
    )
  );
};

const getTieStrength = (tieData) => {
  const firstDate = moment.min(tieData.map((d) => moment(d.first_communication)).filter((m) => m.isValid())).toISOString();
  const lastDate = moment.max(tieData.map((d) => moment(d.last_communication)).filter((m) => m.isValid())).toISOString();
  const days_on_fb = moment(lastDate).diff(moment(firstDate), "days");

  const max_video_chats = Math.max(...tieData.map((tie) => tie.video_chats.incoming + tie.video_chats.outgoing));
  const max_videos = Math.max(...tieData.map((tie) => tie.videos.incoming + tie.videos.outgoing));
  const max_photos = Math.max(...tieData.map((tie) => tie.photos.incoming + tie.photos.outgoing));

  const tieStrengths = [];
  const communication = calcCommunicationDim(tieData, lastDate, firstDate, days_on_fb);

  for (const friend of tieData) {
    const totalReactions = friend.like + friend.care + friend.wow + friend.sad + friend.laugh + friend.love + friend.angry;
    const positive = totalReactions !== 0 ? ((friend.care + friend.wow + friend.laugh + friend.love) * 100) / totalReactions : 0;
    const negative = totalReactions !== 0 ? ((friend.sad + friend.angry) / totalReactions) * 100 : 0;
    const neutral = totalReactions !== 0 ? (friend.like / totalReactions) * 100 : 0;
    let com_recency = 0;
    if (friend.first_communication) {
      const now_last_com = moment(lastDate).diff(moment(friend.last_communication), "days");
      const last_com_first_com = moment(friend.last_communication).diff(moment(friend.first_communication), "days");
      com_recency = 100 - (now_last_com / last_com_first_com) * 100;

      if (com_recency < 0) {
        com_recency = 0;
      } else if (com_recency > 100) {
        com_recency = 100;
      }
    }

    let intimacy =
      (60 * (friend.video_chats.incoming + friend.video_chats.outgoing)) / max_video_chats +
      (20 * (friend.videos.incoming + friend.videos.outgoing)) / max_videos +
      (20 * (friend.photos.incoming + friend.photos.outgoing)) / max_photos;

    let structural = (friend.mutual_friends / tieData.length) * 100;
    // Calculate emotional dimention
    let emotional = positive * 0.4 + negative * 0.4 + neutral * 0.2;
    const com_duration = communication[communication.findIndex((u) => u.user === friend.user)].com_dim;

    const tieStrength = intimacy * 0.3 + com_duration * 0.2 + com_recency * 0.25 + emotional * 0.15 + structural * 0.1;
    tieStrengths.push({ user: friend.user, tieStrength });
  }
  // fs.writeFileSync(
  //   "tie_strength.json",
  //   JSON.stringify({
  //     tieStrengths: tieStrengths
  //       .filter((a) => !Number.isNaN(a.tieStrength) && a.user)
  //       .sort((a, b) => b.tieStrength - a.tieStrength)
  //       .map((a) => {
  //         return {
  //           ...a,
  //           tieStrength: a.tieStrength.toFixed(2) + "%",
  //         };
  //       }),
  //   })
  // );
  console.log(
    tieStrengths
      .filter((a) => !Number.isNaN(a.tieStrength) && a.user)
      .sort((a, b) => b.tieStrength - a.tieStrength)
      .map((a) => {
        return {
          ...a,
          tieStrength: a.tieStrength.toFixed(2) + "%",
        };
      })
  );
};

const calcCommunicationDim = (tieData, lastDate, firstDate) => {
  let data = [];
  const days_on_fb = moment(lastDate).diff(moment(firstDate), "days");
  let max_unique_dates = Math.max(...tieData.map((d) => d.unique_dates));
  for (const friend of tieData) {
    const friendship_duration = moment(lastDate).diff(moment(friend.friendship_start), "days");
    const communication_duration = friend.days_of_communication;
    const unique_dates = friend.unique_dates;
    const same_dates = friend.same_dates;
    const user = friend.user;
    let com_recency = 0;
    let com_duration = 0;
    let com_freq = 0;
    if (friend.first_communication) {
      const now_last_com = moment(lastDate).diff(moment(friend.last_communication), "days");
      const now_first_com = moment(lastDate).diff(moment(friend.first_communication), "days");
      const last_com_first_com = moment(friend.last_communication).diff(moment(friend.first_communication), "days");
      com_duration = (communication_duration / days_on_fb) * 100;
      com_recency = (now_last_com / last_com_first_com) * 100;
      com_freq = (unique_dates / max_unique_dates) * 100;
      if (com_recency < 0) {
        com_recency = 0;
      } else if (com_recency > 100) {
        com_recency = 100;
      }
    }
    // if (user === "Billy Skabilly") console.log({ user, friendship_duration, communication_duration, unique_dates, same_dates });
    // console.log({ user, friendship_duration, communication_duration, com_dim: 100 * (unique_dates / friendship_duration), same_dates });
    data.push({
      user,
      // comdXfrid: 100 * (communication_duration / days_on_fb),
      // communication_duration,
      // unique_dates,
      // contact_freq: 100 * ((7 * unique_dates) / communication_duration),
      // com_dim: 100 * ((unique_dates * 3) / friendship_duration) - com_recency,
      // com_recency,
      // com_duration,
      // com_freq,
      com_dim: 0.8 * com_freq + 0.2 * com_duration,
    });

    // console.log({
    //   user,
    //   friendship_duration,
    //   communication_duration,
    //   friendship_start: friend.friendship_start,
    //   // unique_dates,
    //   uniqueXcomd,
    //   comdXfrid: 100 * uniqueXcomd * (communication_duration / friendship_duration),
    // });
  }
  return data;
  console.log(data.sort((a, b) => b.com_dim - a.com_dim));
};

const getMinDate = (messages) => {
  let dates = messages.map((m) => m.chat_dates);
  let d = [];
  dates.forEach((dts) => {
    d.push(...dts);
  });

  d = d.map((i) => moment(i));
  return moment.min(d).toISOString();
};

const getMaxDate = (messages) => {
  let dates = messages.map((m) => m.chat_dates);
  let d = [];
  dates.forEach((dts) => {
    d.push(...dts);
  });

  d = d.map((i) => moment(i));
  return moment.max(d).toISOString();
};

main()
  .then(() => {
    console.log("Ended successfully");
  })
  .catch((err) => console.log(err));
