// productScraper.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const urlLib = require('url');
const detectSelectorsFromPage = require('./selectorDetector');

const SELECTOR_CACHE_PATH = path.join(__dirname, '../data/selectors-cache.json');

// טוען את קובץ הזיכרון המקומי
function loadCache() {
  if (!fs.existsSync(SELECTOR_CACHE_PATH)) return {};
  return JSON.parse(fs.readFileSync(SELECTOR_CACHE_PATH));
}

// מחלץ את שם הדומיין מתוך כתובת
function extractDomain(url) {
  const parsed = urlLib.parse(url);
  return parsed.hostname.replace('www.', '');
}

// הפונקציה הכללית
async function scrapeProductFromAnySite(url) {
  const domain = extractDomain(url);
  let cache = loadCache();
  let selectors = cache[domain];

  // אם אין סלקטורים קיימים – מבצע לימוד חדש
  if (!selectors || !selectors.name) {
    console.log(`🧠 Detecting selectors for domain: ${domain}`);
    const detected = await detectSelectorsFromPage(url);
    selectors = detected.selectors;
    cache = loadCache(); // נטען מחדש לאחר ש-selectorDetector שמר קובץ חדש
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // פונקציית שליפת טקסט לפי סלקטור
    const getText = async (selector) => {
      if (!selector) return null;
      try {
        return await page.$eval(selector, el => el.innerText.trim());
      } catch {
        return null;
      }
    };

    // שליפת הנתונים בפועל
    const name = await getText(selectors.name);
    const weight = await getText(selectors.weight);
    const dimensions = await getText(selectors.dimensions);
    const manufacturer = await getText(selectors.manufacturer);
    const origin = await getText(selectors.origin);

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
      name: name || 'N/A',
      manufacturer: manufacturer || 'N/A',
      weight: weight || 'N/A',
      dimensions: dimensions || 'N/A',
      cbm: cbm || 'N/A',
      origin: origin || 'N/A'
    };
  } catch (error) {
    await browser.close();
    console.error('❌ Scraping error:', error.message);
    return null;
  }
}

module.exports = scrapeProductFromAnySite;
