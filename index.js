const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const itemsList = require("./items.json");
require("dotenv").config();
const emailUserLogin = process.env.userLogin;
const emailUserPassword = process.env.userPassword;
const emailFromUser = process.env.fromUser;
const emailToUser = process.env.toUser;

async function configireBrowser(url, locator) {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(url);
  // await page.setDefaultNavigationTimeout(60000);
  // await page.setDefaultTimeout(60000);
  // await Promise.all([page.waitForNavigation({ waitUntil: "load" })]);
  // await page.waitForTimeout(120000);

  // if (url.includes("dns")) {
  //   page.click(".confirm-city-mobile__buttons .confirm-city-mobile__accept");
  // }

  await page.waitForSelector(locator);
  return page;
}

async function checkPrice(page, item, locator) {
  let rublePrice = await page.$eval(locator, (el) => el.innerText);
  let currentPrice = await Number(rublePrice.replace(/[^0-9.-]+/g, ""));

  if (currentPrice < item.price) {
    console.log(`"Цена на ${item.name} упала до ${currentPrice}!`);
    // sendNotification(item.name + currentPrice);
  }
}

async function startTracking() {
  for (let property in itemsList) {
    itemsList[property].items.forEach(async (item) => {
      const page = await configireBrowser(
        item.url,
        itemsList[property].locator
      );

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

// async function sendNotification(price) {
//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: emailUserLogin,
//       pass: emailUserPassword,
//     },
//   });

//   let textToSend = "Новый ценник: " + price;

//   let info = await transporter.sendMail({
//     from: "Price Tracker" + emailFromUser,
//     to: emailToUser,
//     subject: "Новая цена у товара!",
//     text: textToSend,
//   });
//   console.log("Message sent: %s", info.messageId);
// }

startTracking();
