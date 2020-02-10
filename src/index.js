const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const prompt = require('prompt')
require('dotenv').config()

const prompt_attributes = [{
  name: 'githubUser',
}]

const github = 'https://github.com/';
const webhookURL = `https://hooks.slack.com/services/TSVDQ330U/BTUD8J754/${process.env.TOKEN}`;

const pageToScreenshot = async (githubUser) => {
  console.log('Launch Puppeteer');
  const time = new Date().getTime();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`${github}/${githubUser}`);
  await page.screenshot({ path: `src/images/${time}-${githubUser}.png` });
  const githubCounter = await page.evaluate(() => document.getElementsByClassName('Counter')[0].innerText);
  const githubUserPhoto = await page.evaluate(() => document.getElementsByClassName('avatar-before-user-status')[0].src);
  postToSlack(githubUser, githubUserPhoto, githubCounter);
  await browser.close();
};

const postToSlack = async (user, photo, count) => {
  const data = JSON.stringify({
    'blocks': [
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*Reto Cumplido* \n https://github.com/${user} \n Numero de repositorios: ${count.trimStart()}`,
        },
        'accessory': {
          'type': 'image',
          'image_url': photo,
          'alt_text': user,
        },
      },
    ],
  });
  await fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: data,
  }).then((response) => {
    console.log(JSON.stringify(response));
  });
};

prompt.get(prompt_attributes, (err, result) => {
  if (err) {
    console.log(err);
    return 1;
  }
  console.log('Command-line received data:');
  const user = result.githubUser;
  if (user) {
    console.log('Start PageToScreenshot()');
    pageToScreenshot(user);
  }
})

prompt.start()
