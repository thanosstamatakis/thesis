const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");
require("dotenv").config();

const USERNAME = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const FACEBOOK_URL = "https://facebook.com/";
const EGO = process.env.EGO;

const main = async () => {
  //   const DIRECTED_POSTS_SELECTOR = "div[role=article] div[dir=ltr] > span[dir=ltr] a";
  //   const PERSONAL_POSTS_SELECTOR = "div[role=article] h2[dir=auto] > div > a";
  // const '//div[contains(text(),"Edit nicknames") '
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
  await page.goto("https://www.facebook.com/profile");

  // const posts = await page.$$("div[role=article]");

  // await autoScroll(page);

  // const wallPosts = await page.$$eval("div[role=article] div[dir=ltr] > span[dir=ltr] a", (posts) => posts.map((post) => post.innerText));
  // console.log(wallPosts.filter((name) => name !== EGO));

  // await page.evaluate(async () => {
  //   const ppDivs = Array.from(document.querySelectorAll("div[role=article] h2[dir=auto] > div > a")).map((el) => el.closest("div[role=article]"));
  //   const ppLikeBtns = ppDivs
  //     .filter((div) => div?.querySelector("div[role=article] span[role=toolbar]")?.nextElementSibling?.querySelector("div[role=button]"))
  //     .map((pp) => pp.querySelector("div[role=article] span[role=toolbar]").nextElementSibling.querySelector("div[role=button]"));
  //   ppLikeBtns.forEach((btn) => {
  //     btn.classList.add("personal-post-likes");
  //     btn.style.color = "red";
  //   });
  // });

  // await getPersonalPostReactions(page);

  let posts = [];
  if (fs.existsSync("wall_links.json")) {
    posts = JSON.parse(fs.readFileSync("wall_links.json")).hrefs;
  } else {
    await autoScroll(page);
    posts = await getPostUrls(page);
    const people = await getPostPeople(page);
  }

  let wallData = [];

  if (fs.existsSync("wall_data.json")) {
    wallData = JSON.parse(fs.readFileSync("wall_data.json")).wallData;
  }

  let post_idx = 0;
  if (fs.existsSync("progress_wall.json")) {
    const link = JSON.parse(fs.readFileSync("progress_wall.json")).post;
    post_idx = posts.findIndex((a) => a === link) + 1;
  }

  for await (post of posts.slice(post_idx)) {
    await page.goto(post);

    try {
      const wallPosts = await page.$$eval(
        "div[role=complementary] div[dir=ltr] > span[dir=ltr] a, div[role=article] div[dir=ltr] > span[dir=ltr] a",
        (posts) => posts.map((post) => post.innerText)
      );
      const postedBy = wallPosts?.length ? wallPosts.filter((name) => name !== EGO)[0] : EGO;
      const hasReactions = await page.evaluate(() => {
        const btn = document
          .querySelector("div[role=complementary] span[role=toolbar], div[role=article] span[role=toolbar]")
          ?.nextElementSibling?.querySelector("div[role=button]");
        if (btn) {
          btn.click();
          return true;
        } else {
          return false;
        }
      });
      let reactions = [];
      if (hasReactions) reactions = await scrollReactions(page);
      console.log({ hasReactions });
      try {
        if (hasReactions) {
          await page.waitForSelector("div[aria-label=Close],div[aria-label=????????????????]");
          await page.click("div[aria-label=Close],div[aria-label=????????????????]");
        }
      } catch {
        console.log("No reactions on this post");
      }

      let date;
      try {
        await page.waitForSelector("div[role=article] span>span>span>span>a, div[role=complementary] span>span>span>span>a", { timeout: 1500 });
        const btn = await page.$("div[role=article] span>span>span>span>a, div[role=complementary] span>span>span>span>a");
        await btn.hover();
        await page.waitForSelector("span[role=tooltip]");
        date = await page.$eval("span[role=tooltip]", (tooltip) => tooltip.innerText);
        let isGreek = /[??-????-??]/.test(date);
        date = moment(date, ["dddd, D MMMM YYYY h:mm a"], isGreek ? "el-gr" : "").toISOString();
      } catch (err) {
        throw new Error("Error getting article");
      }

      const comments = await page.$$eval("div[role=article] ul>li div[role=article],[role=complementary] ul>li div[role=article]", (divs) =>
        divs.map((d) => d.getAttribute("aria-label").split(" ").slice(2, -3).join(" "))
      );

      let titlePeople = await page.$$eval("div[role=complementary] h2 a[role=link],div[role=article] h2 a[role=link]", (divs) =>
        divs.map((div) => div.innerText)
      );
      const othersInPost = await page.$("div[role=complementary] h2 [role=button], div[role=article] h2 [role=button]");
      if (othersInPost) {
        await othersInPost.click();
        const people = await getPostPeople(page);
        titlePeople = [...titlePeople, ...people];
      }

      // console.log({ postedBy, date, reactions: reactions.map((r) => r?.person), comments });
      console.log({ postedBy: titlePeople[0], involved: titlePeople, date, reactions, comments });
      wallData.push({ postedBy: titlePeople[0], involved: titlePeople, date, reactions, comments });
      await fs.writeFileSync("wall_data.json", JSON.stringify({ wallData }));
      await fs.writeFileSync("progress_wall.json", JSON.stringify({ post }));
      console.log("Wrote file");
    } catch {
      console.log("Post data not available. NOT writing to file...");
    }
  }
};

async function getPostUrls(page) {
  await page.evaluate(() => {
    document.querySelectorAll("div[role=article] span>span>span>span>a").forEach((post) => post.classList.add("custom-page-link"));
  });

  const heights = await page.evaluate(async () => {
    let res = [];
    const divs = document.querySelectorAll(".custom-page-link");

    for (let i = divs.length - 1; i >= 0; i--) {
      const div = divs[i];
      while (div.getBoundingClientRect().top === 0) {
        window.scrollBy(0, -50);
        await new Promise((r) => setTimeout(r, 20));
      }
      await new Promise((r) => setTimeout(r, 200));
      const height = div.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 2;
      res.push(height);
    }
    return res;
  });

  const posts = await page.$$(".custom-page-link");
  console.log(posts.length, heights.length);
  for await ([idx, height] of heights.reverse().entries()) {
    try {
      page.evaluate(`window.scrollTo(0, ${height})`);
      await page.waitForTimeout(200);
      await posts[idx].hover();
    } catch {
      console.log(`Error getting post no ${idx}...Continuing.`);
    }
  }

  try {
    const hrefs = await page.$$eval(".custom-page-link", (atags) => atags.map((a) => a.href));
    await fs.writeFileSync("wall_links.json", JSON.stringify({ hrefs }));
    return hrefs;
  } catch (err) {
    console.log("Error writing to wall_links.json", err);
    return [];
  }
  return [];
}

async function getPersonalPostReactions(page) {
  try {
    const heights = await page.evaluate(async () => {
      let res = [];
      const divs = document.querySelectorAll(".personal-post-likes");

      for (let i = divs.length - 1; i >= 0; i--) {
        const div = divs[i];
        while (div.getBoundingClientRect().top === 0) {
          window.scrollBy(0, -50);
          await new Promise((r) => setTimeout(r, 20));
        }
        await new Promise((r) => setTimeout(r, 200));
        div.scrollIntoView();
        res.push(window.scrollY);
      }
      return res;
    });
    console.log(`There are ${heights.length} personal posts`);
    for await ([idx, height] of heights.reverse().entries()) {
      console.log({ index: idx });
      page.evaluate(`window.scrollTo(0, ${height})`);
      await page.waitForTimeout(200);
      page.evaluate(`document.querySelectorAll(".personal-post-likes")[${idx}].click()`);
      await page.waitForTimeout(200);
      await page.waitForSelector("div[aria-label=Close],div[aria-label=????????????????]");
      await scrollReactions(page);
      await page.click("div[aria-label=Close],div[aria-label=????????????????]", { delay: 200 });
    }
    await page.evaluate('document.querySelectorAll("div[aria-label=Close],div[aria-label=????????????????]").forEach(el=>el.click())');
    // const selector = await page.waitForSelector("div[aria-label=Reactions]");
  } catch (err) {
    console.log(`Error getting personal post reactions: ${err}`);
  }
}

async function getPostPeople(page) {
  try {
    await page.waitForSelector("div[aria-label=People] > div:nth-child(3)", { timeout: 3000 });
    let retries = 0;
    let previousScrollTop = await page.$eval("div[aria-label=People] > div:nth-child(3)", (div) => div.scrollHeight);

    while (retries <= 2) {
      const scrollTop = await page.$eval("div[aria-label=People] > div:nth-child(3)", (div) => div.scrollHeight);
      if (scrollTop <= previousScrollTop) {
        retries += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Failed to get immediately, retry ${retries}, scrollTop:${previousScrollTop}`);
      } else if (scrollTop > previousScrollTop) {
        retries = 0;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Got immediately, retry ${retries}, scrollTop:${previousScrollTop}`);
      }

      page.evaluate(
        `document.querySelector('div[aria-label=People] > div:nth-child(3)').scrollTo(0, document.querySelector('div[aria-label=People] > div:nth-child(3)').scrollHeight)`
      );
      previousScrollTop = scrollTop;

      await page.waitForTimeout(1000);
    }

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    const people = await page.$$eval("div[aria-label=People] > div:nth-child(3) span[dir=auto]>div>a", (people) =>
      people.map((person) => person?.innerText)
    );
    try {
      await page.click("div[aria-label=Close],div[aria-label=????????????????]");
    } catch {
      console.log("Error closing dialog.");
    }
    return people;
  } catch {
    console.log("Error while scrolling in people dialog.");
    return [];
  }
}

async function scrollReactions(page) {
  try {
    await page.waitForSelector("div[aria-label=Reactions] > div:nth-child(3), div[aria-label=??????????????????????] > div:nth-child(3)", { timeout: 3000 });
    let retries = 0;
    let previousScrollTop = await page.$eval(
      "div[aria-label=Reactions] > div:nth-child(3), div[aria-label=??????????????????????] > div:nth-child(3)",
      (div) => div.scrollHeight
    );

    while (retries <= 2) {
      const scrollTop = await page.$eval(
        "div[aria-label=Reactions] > div:nth-child(3), div[aria-label=??????????????????????] > div:nth-child(3)",
        (div) => div.scrollHeight
      );
      if (scrollTop <= previousScrollTop) {
        retries += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Failed to get immediately, retry ${retries}, scrollTop:${previousScrollTop}`);
      } else if (scrollTop > previousScrollTop) {
        retries = 0;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Got immediately, retry ${retries}, scrollTop:${previousScrollTop}`);
      }

      page.evaluate(
        `document.querySelector('div[aria-label=Reactions] > div:nth-child(3), div[aria-label=??????????????????????] > div:nth-child(3)').scrollTo(0, document.querySelector('div[aria-label=Reactions] > div:nth-child(3), div[aria-label=??????????????????????] > div:nth-child(3)').scrollHeight)`
      );
      previousScrollTop = scrollTop;

      await page.waitForTimeout(1000);
    }

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    const people = await page.$$eval(
      "div[aria-label=Reactions] > div:nth-child(3) span[dir=auto]>div>a,div[aria-label=??????????????????????] > div:nth-child(3) span[dir=auto]>div>a",
      (people) => people.map((person) => person?.innerText)
    );
    const reactions = await page.$$eval(
      "div[aria-label=Reactions] > div:nth-child(3) div>a div img, div[aria-label=??????????????????????] > div:nth-child(3) div>a div img",
      (imgs) => imgs.map((img) => img?.src)
    );
    let response = [];
    if (people.length !== reactions.length) {
      console.log("Not same people and reactions");
    } else {
      response = people.map((pers, idx) => {
        return { person: pers, react: reactions[idx] };
      });
    }
    return response;
  } catch {
    return [];
    console.log("Error while scrolling in link.");
  }
}

async function autoScroll(page) {
  try {
    let retries = 0;
    let previousScrollTop = await page.$eval("body", (body) => body.scrollHeight);

    // while (retries <= 4 && previousScrollTop < 5000) {
    while (retries <= 4) {
      const scrollTop = await page.$eval("body", (body) => body.scrollHeight);
      if (scrollTop <= previousScrollTop) {
        retries += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Failed to get immediately, retry ${retries}, scrollTop:${previousScrollTop}`);
      } else if (scrollTop > previousScrollTop) {
        retries = 0;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Got immediately, retry ${retries}, scrollTop:${previousScrollTop}`);
      }

      page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
      previousScrollTop = scrollTop;

      await page.waitForTimeout(1000);
    }

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  } catch {
    console.log("Error while scrolling in link.");
  }
}

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

main()
  .then(() => console.log("Done"))
  .catch((err) => console.log("Finished with errors"));
