const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");

const USERNAME = "";
const PASSWORD = "";
const FACEBOOK_URL = "";
const EGO = "";

const main = async () => {
  const browser = await puppeteer.launch({
    args: ["--window-size=800,800", "--incognito"],
    headless: false,
  });
  const context = await browser.createIncognitoBrowserContext();
  await context.overridePermissions(FACEBOOK_URL, []);

  console.log(await browser.userAgent());

  // Create new window and close the useless one
  const page = await context.newPage();
  const useless = (await browser.pages())[0];
  await useless.close();

  await loginWithCredentials(page);
  await page.goto("https://www.facebook.com/messages/t/100055306603787");
  await page.waitForSelector("div[role=grid]");
  await page.waitForSelector("div[data-testid=MWJewelThreadListContainer]");

  if (!fs.existsSync("links.json")) {
    await getContacts(page);
    const links = await page.$$eval("div[data-testid=MWJewelThreadListContainer] > div[data-testid=mwthreadlist-item] a", (as) =>
      as.map((a) => a.href)
    );
    await fs.writeFileSync("links.json", JSON.stringify({ links }));
  }

  const links = await getLinks();

  let stats = await getStats();

  try {
    for await (const link of links) {
      await page.goto(link);

      const isGroup = await isGroupChat(page);
      const isAccessible = await isChatInfoAccessible(page);
      const alter = await getParticipantInfo(page);

      if (!isGroup && isAccessible && alter) {
        console.log({ isGroup, isAccessible, link, alter });
        const res = await autoScroll(page);

        stats.push({ ...res, user: alter });
      }
      try {
        fs.writeFileSync("messages.json", JSON.stringify({ stats }));
      } catch {
        console.log("Error while writting to file 'messages.json'");
      }
      try {
        fs.writeFileSync("progress.json", JSON.stringify({ link: link }));
      } catch {
        console.log("Error while writting to file 'progress.json'");
      }
    }
  } catch {
    console.log("Failed to ");
    fs.writeFileSync("messages.json", JSON.stringify({ stats }));
  }
};

const getStats = async () => {
  if (fs.existsSync("messages.json")) {
    return JSON.parse(fs.readFileSync("messages.json")).stats;
  } else {
    return [];
  }
};

const getLinks = async () => {
  if (fs.existsSync("progress.json")) {
    const progressFile = JSON.parse(fs.readFileSync("progress.json"));
    const fileLinks = JSON.parse(fs.readFileSync("links.json")).links;
    const leftOfIndex = fileLinks.indexOf(progressFile.link);
    return leftOfIndex === fileLinks.length ? [] : fileLinks.slice(leftOfIndex + 1, fileLinks.length);
  } else if (!fs.existsSync("progress.json") && fs.existsSync("links.json")) {
    const fileLinks = JSON.parse(fs.readFileSync("links.json")).links;
    return fileLinks;
  } else {
    return [];
  }
};

main()
  .then(() => console.log("Done"))
  .catch((e) => console.log("error", e));

async function isChatInfoAccessible(page) {
  await openChatSidebar(page);
  try {
    await page.waitForXPath('//span[contains(text(),"Customise chat") or contains(text(),"Προσαρμογή συνομιλίας")]', { timeout: 2200 });
    return true;
  } catch {
    console.log("\x1b[31m%s\x1b[0m", "Cannot find customise chat button");
    return false;
  }
}

isGroupChat = async (page) => {
  await openChatSidebar(page);
  try {
    await page.waitForXPath('//span[contains(text(),"Chat members") or contains(text(),"Μέλη συνομιλίας")]', { timeout: 2200 });
    return true;
  } catch {
    return false;
  }
};

openChatSidebar = async (page) => {
  try {
    await page.waitForSelector('div[aria-label="Conversation information"]');
  } catch {
    console.log("Could not find selector of button that opens the chat sidebar.");
  }
  try {
    await page.waitForXPath('//span[contains(text(),"Privacy and support") or contains(text(),"Απόρρητο και υποστήριξη")]', { timeout: 1200 });
  } catch {
    await page.click('div[aria-label="Conversation information"]', {
      delay: 20,
    });
    await new Promise((r) => setTimeout(r, 1200));
    await page.waitForXPath('//span[contains(text(),"Privacy and support") or contains(text(),"Απόρρητο και υποστήριξη")]', { timeout: 1200 });
  }
};

isCustomizeChatExpanded = async (page) => {
  try {
    await page.waitForXPath('//span[contains(text(),"Edit nicknames") or contains(text(),"Επεξεργασία ψευδώνυμων")]', { timeout: 600 });
    return true;
  } catch {
    return false;
  }
};

getParticipantInfo = async (page) => {
  await openChatSidebar(page);

  try {
    await page.waitForXPath('//span[contains(text(),"Customise chat") or contains(text(),"Προσαρμογή συνομιλίας")]');
    const customizeChatBtns = await page.$x('//span[contains(text(),"Customise chat") or contains(text(),"Προσαρμογή συνομιλίας")]');
    const expanded = await isCustomizeChatExpanded(page);
    if (!expanded) await customizeChatBtns[0].click();
  } catch {
    console.log("Error clicking customize chat button");
  }

  try {
    await page.waitForXPath('//span[contains(text(),"Edit nicknames") or contains(text(),"Επεξεργασία ψευδώνυμων")]');
    const nickNameBtns = await page.$x('//span[contains(text(),"Edit nicknames") or contains(text(),"Επεξεργασία ψευδώνυμων")]');
    await nickNameBtns[0].click();
  } catch {
    console.log("Error clicking the edit nicknames button.");
    return null;
  }

  page.waitForSelector("div[aria-label=Nicknames] > div:nth-child(3) div[role=button] span[dir=auto]");

  await new Promise((r) => setTimeout(r, 1200));

  const nickNames = await page.$$eval("div[aria-label=Nicknames] > div:nth-child(3) div[role=button] span[dir=auto]", (spans) =>
    spans.map((span) => span.innerText)
  );

  const participant = await getName(nickNames);

  await page.click('div[aria-label="Close"]', { delay: 20 });

  return participant;
};

getName = async (nickNames) => {
  let alter = [];
  if (nickNames[0] === EGO || nickNames[1] === EGO) {
    alter = nickNames.slice(2, 4);
  } else {
    alter = nickNames.slice(0, 2);
  }
  if (alter[1] === "Set nickname" || alter[1] === "Ορισμός ψευδώνυμου") {
    return alter[0];
  } else {
    return alter[1];
  }
};

async function getContacts(page) {
  await page.evaluate(async () => {
    const contactScroller = document.querySelector("div[data-testid=MWJewelThreadListContainer]").parentElement.parentElement.parentElement;
    let scrollHeight = contactScroller.scrollHeight;

    await new Promise((resolve, reject) => {
      let retries = 0;
      let timer = setInterval(() => {
        if (contactScroller.scrollHeight === scrollHeight) {
          retries += 1;
        } else {
          retries = 0;
        }

        scrollHeight = contactScroller.scrollHeight;
        contactScroller.scrollBy(0, 1500);

        if (retries === 5) {
          clearInterval(timer);
          resolve();
        }
      }, 2500);
    });
  });
}

async function autoScroll(page) {
  try {
    let retries = 0;

    while (retries <= 4) {
      const scrollTop = await page.$eval("div[aria-label=Messages]", (div) => div.parentElement.parentElement.scrollTop);

      if (scrollTop === 0) {
        retries += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Failed to get immediately, retry ${retries}`);
      } else if (scrollTop !== 0) {
        retries = 0;
      }

      page.evaluate('document.querySelector("div[aria-label=Messages]").parentElement.parentElement.scrollTop = 0');
      await page.waitForTimeout(1000);
    }

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    const incomingMessages = await page.$$eval("div[data-testid=messenger_incoming_text_row]", (divs) => divs.length);
    const outgoingMessages = await page.$$eval("div[data-testid=outgoing_message] > span > div > div[dir=auto]", (divs) => divs.length);

    const incomingVideoChats = await page.$$eval('div[data-testid=incoming_group] div[aria-label="Video chat"]', (divs) => divs.length);
    const outgoingVideoChats = await page.$$eval('div[data-testid=outgoing_message] div[aria-label="Video chat"]', (divs) => divs.length);

    const incomingVideos = await page.$$eval('div[data-testid=incoming_group] a[aria-label="Expand video"]', (divs) => divs.length);
    const outgoingVideos = await page.$$eval('div[data-testid=outgoing_message] a[aria-label="Expand video"]', (divs) => divs.length);

    const incomingPhotos = await page.$$eval('div[data-testid=incoming_group] a[aria-label="Open photo"]', (divs) => divs.length);
    const outgoingPhotos = await page.$$eval('div[data-testid=outgoing_message] a[aria-label="Open photo"]', (divs) => divs.length);
    const chatDates = await page.$$eval("div[aria-label=Messages] > div[role=row] h3 > div:nth-child(2)", (divs) => divs.map((div) => div.innerText));

    return {
      messages: {
        incoming: incomingMessages,
        outgoing: outgoingMessages,
      },
      video_chats: {
        incoming: incomingVideoChats,
        outgoing: outgoingVideoChats,
      },
      videos: { incoming: incomingVideos, outgoing: outgoingVideos },
      photos: { incoming: incomingPhotos, outgoing: outgoingPhotos },
      chat_dates: formatDates(chatDates),
    };
  } catch {
    throw new Error("Error while scrolling in link.");
  }
}

formatDates = (parsedDates) => {
  parsedDates = parsedDates.filter((date) => date);

  let moments = [];

  for (const date of parsedDates) {
    const isGreek = /[α-ωΑ-Ω]/.test(date);

    const mmnt = moment(date, ["ddd HH:mm", "HH:mm", "DD/MM/YYYY, HH:mm", "D MMM YYYY, HH:mm"], isGreek ? "el-gr" : "");

    // Subtract a week if moment gets the wrong day
    if (mmnt.isAfter()) {
      mmnt.subtract(1, "week");
    }

    if (mmnt.isValid()) moments.push(mmnt);
  }

  // Sort by date and convert to ISO strings
  moments.sort((lhs, rhs) => (lhs > rhs ? 1 : lhs < rhs ? -1 : 0));
  moments = moments.map((mmnt) => mmnt.toISOString());

  return moments;
};

const loginWithCredentials = async (page) => {
  try {
    await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
    await page.waitForSelector("button[data-cookiebanner=accept_button]");
    await page.click("button[data-cookiebanner=accept_button]", { delay: 20 });

    await page.type("#email", USERNAME, { delay: 20 });
    await page.type("#pass", PASSWORD, { delay: 20 });
    await page.click("button[type=submit]", { delay: 20 });
    await page.waitForNavigation();
  } catch {
    console.log("Error logging in with credentials.");
  }
};
