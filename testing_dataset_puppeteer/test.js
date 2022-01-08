const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");

const USERNAME = "";
const PASSWORD = "";
const FACEBOOK_URL = "https://facebook.com/";
const EGO = "";

const main = async () => {
  const eng_date = "Sunday, 24 December 2017 at 06:07";
  const gr_date = "Κυριακή, 4 Δεκέμβριος 2016 στις 5:41 μ.μ.";

  const isGreek = /[α-ωΑ-Ω]/.test(gr_date);
  const mmnt = moment(gr_date, ["dddd, D MMMM YYYY h:mm a"], isGreek ? "el-gr" : "");

  console.log(mmnt.toISOString());
};

main()
  .then(() => console.log("Done"))
  .catch((err) => console.log("Finished with errors"));

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
