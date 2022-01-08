const puppeteer = require("puppeteer");
const fs = require("fs").promises;
require("dotenv").config();

const USERNAME = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const FACEBOOK_URL = "https://facebook.com/";
const EGO = process.env.EGO;

const main = async () => {
  const browser = await puppeteer.launch({
    args: ["--window-size=800,800", "--incognito"],
    headless: false,
  });
  const context = await browser.createIncognitoBrowserContext();
  await context.overridePermissions(FACEBOOK_URL, []);

  // Create new window and close the useless one
  const page = await context.newPage();
  const useless = (await browser.pages())[0];
  await useless.close();

  await loginWithCredentials(page);
  await page.waitForNavigation();
  await page.goto("https://www.facebook.com/profile");

  const username = (await page.url()).split("/")[3];
  console.log(username);

  await Promise.all([
    await page.goto(`https://www.facebook.com/${username}/friends`),
    await page.waitForSelector("div[data-pagelet=ProfileAppSection_0]>div>div>div>div>div:nth-child(3)>div"),
  ]);

  // Scroll until friendlist is fully loaded
  await autoScroll(page);

  // Create dom instance and get all data
  const friends = await page.evaluate(() => {
    let friends = [];
    const friendList = document.querySelectorAll("div[data-pagelet=ProfileAppSection_0]>div>div>div>div>div:nth-child(3)>div");
    for (let i = 0; i < friendList.length; i++) {
      const friend = friendList[i];
      const anchor = friend.querySelector("div>div:nth-child(2)>div>a");
      const span = friend.querySelector("div>div:nth-child(2)>div>span");
      console.log({ anchor, span });
      const full_name = anchor ? anchor?.innerText : span?.innerText;
      const user_name = anchor?.href || "";
      const disabled = anchor ? false : true;
      let mutual_friends = 0;
      if (!disabled && span) {
        mutual_friends = parseInt(span?.innerText?.split(" ")[0]);
      }

      if (full_name) {
        friends.push({ full_name, user_name, disabled, mutual_friends });
      }
    }
    return friends;
  });

  await fs.writeFile("friends.json", JSON.stringify({ friends }));
};

main()
  .then(() => console.log("Done"))
  .catch((e) => console.log("error", e));

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}

const loginWithCredentials = async (page) => {
  try {
    await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
    await page.waitForSelector("button[data-cookiebanner=accept_button]");
    await page.click("button[data-cookiebanner=accept_button]", { delay: 20 });

    await page.type("#email", USERNAME, { delay: 20 });
    await page.type("#pass", PASSWORD, { delay: 20 });
    await page.click("button[type=submit]", { delay: 20 });
  } catch {
    console.log("Error logging in with credentials.");
  }
};
