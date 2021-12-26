const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const itemsList = require("./items.json");

const headphone = itemsList["Sennheiser HD 280 Pro"];

async function configireBrowser() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(headphone);
  return page;
}

async function checkPrice(page) {
  await page.reload();
  let html = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(html);
  const rublePrice = [];

  $(".ProductPrice__price.ProductHeader__price-default__price", html).each(
    function () {
      rublePrice.push($(this).text());

      let currentPrice = Number(rublePrice[0].replace(/[^0-9.-]+/g, ""));

      if (currentPrice < 7000) {
        console.log("NEW PRICE! " + currentPrice);
      }
    }
  );
}

async function startTracking() {
  const page = await configireBrowser();

  let job = new CronJob(
    "*/15 * * * * *",
    function () {
      checkPrice(page);
    },
    null,
    true,
    null,
    null,
    true
  );
  job.start();
}

startTracking();
