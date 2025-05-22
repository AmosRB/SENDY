// productScraper.js
// גרסה ראשונית - חילוץ נתוני מוצר מ-AliExpress באמצעות Puppeteer

const puppeteer = require('puppeteer');

async function scrapeAliExpressProduct(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // שליפת שם מוצר
    const productName = await page.$eval('h1.product-title-text', el => el.innerText.trim());

    // שליפת טבלת פרטים טכניים (כמו משקל, מידות וכו')
    const specs = await page.$$eval('.product-specs .product-specs-list li', items => {
      return items.map(li => li.innerText.trim());
    });

    // מיפוי נתונים
    let weight = null;
    let dimensions = null;
    let manufacturer = null;
    let shipFrom = null;

    for (const item of specs) {
      const lower = item.toLowerCase();
      if (lower.includes('weight')) weight = item;
      if (lower.includes('dimensions') || lower.includes('size')) dimensions = item;
      if (lower.includes('manufacturer')) manufacturer = item;
      if (lower.includes('ship from')) shipFrom = item;
    }

    // חישוב CBM אם קיימות מידות
    let cbm = null;
    if (dimensions) {
      const match = dimensions.match(/(\d+(\.\d+)?)[xX×](\d+(\.\d+)?)[xX×](\d+(\.\d+)?)/);
      if (match) {
        const l = parseFloat(match[1]);
        const w = parseFloat(match[3]);
        const h = parseFloat(match[5]);
        cbm = ((l * w * h) / 1_000_000).toFixed(4); // CBM במטרים מעוקבים
      }
    }

    await browser.close();

    return {
      name: productName,
      manufacturer: manufacturer || 'N/A',
      weight: weight || 'N/A',
      dimensions: dimensions || 'N/A',
      cbm: cbm || 'N/A',
      origin: shipFrom || 'N/A'
    };
  } catch (error) {
    await browser.close();
    console.error('Scraping error:', error);
    return null;
  }
}

// דוגמה לשימוש
// scrapeAliExpressProduct('https://www.aliexpress.com/item/1005001234567890.html')
//   .then(console.log);

module.exports = scrapeAliExpressProduct;
