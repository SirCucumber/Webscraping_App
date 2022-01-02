const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const itemsList = require("./items.json");

async function configireBrowser(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  return page;
}

async function checkPrice(page, item, locator) {
  let rublePrice = await page.$eval(locator, (el) => el.innerText);
  let currentPrice = await Number(rublePrice.replace(/[^0-9.-]+/g, ""));

  if (currentPrice < item.price) {
    console.log(`"Цена на ${item.name} упала до ${currentPrice}!`);
  }
}

async function startTracking() {
  for (let property in itemsList) {
    itemsList[property].items.forEach(async (item) => {
      const page = await configireBrowser(item.url);

      let job = new CronJob(
        "*/15 * * * * *",
        function () {
          checkPrice(page, item, itemsList[property].locator);
        },
        null,
        true,
        null,
        null,
        true
      );
      job.start();
    });
  }
}

startTracking();
