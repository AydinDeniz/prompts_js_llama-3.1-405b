const puppeteer = require('puppeteer');

async function scrapeData(urls, elementToWaitFor, elementsToScrape) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const results = [];

  for (const url of urls) {
    await page.goto(url);
    await page.waitForSelector(elementToWaitFor);

    const pageResults = {};
    for (const element of elementsToScrape) {
      const selector = element.selector;
      const property = element.property;

      try {
        const textContent = await page.$eval(selector, el => el.textContent);
        pageResults[property] = textContent.trim();
      } catch (error) {
        pageResults[property] = null;
      }
    }

    results.push(pageResults);
  }

  await browser.close();
  return results;
}

// Example usage:
const urls = ['https://example.com/page1', 'https://example.com/page2'];
const elementToWaitFor = '#main-content';
const elementsToScrape = [
  { selector: '#title', property: 'title' },
  { selector: '#description', property: 'description' },
  { selector: '#author', property: 'author' },
];

scrapeData(urls, elementToWaitFor, elementsToScrape).then(results => {
  console.log(JSON.stringify(results, null, 2));
});