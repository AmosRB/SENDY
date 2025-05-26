const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SELECTOR_PATH = path.join(__dirname, '../routes/data/selectors-fixed.json');
const LEARNED_PATH = path.join(__dirname, '../routes/data/selectors-learned.json');

function loadFixedSelectors() {
  if (!fs.existsSync(SELECTOR_PATH)) return {};
  return JSON.parse(fs.readFileSync(SELECTOR_PATH));
}

function loadLearnedSelectors() {
  if (!fs.existsSync(LEARNED_PATH)) return {};
  return JSON.parse(fs.readFileSync(LEARNED_PATH));
}

function mergeSelectors(fixed, learned) {
  const merged = { ...fixed };

  for (const domain in learned) {
    if (!merged[domain]) merged[domain] = {};

    for (const field in learned[domain]) {
      const sorted = learned[domain][field]
        .filter(s => !!s.selector)
        .sort((a, b) => b.score - a.score)
        .map(s => s.selector);

      if (sorted.length) {
        merged[domain][field] = sorted;
      }
    }
  }

  return merged;
}

function updateSelectorScore(domain, field, selector, success) {
  const learnedPath = path.join(__dirname, '../routes/data/selectors-learned.json');
  if (!fs.existsSync(learnedPath)) return;

  const data = JSON.parse(fs.readFileSync(learnedPath, 'utf8'));
  const entry = data[domain]?.[field]?.find(s => s.selector === selector);
  if (!entry) return;

  if (success) entry.score++;
  else if (entry.score > 0) entry.score--;

  fs.writeFileSync(learnedPath, JSON.stringify(data, null, 2), 'utf8');
}

const defaultKeywords = {
  name: ['product', 'title'],
  manufacturer: ['brand', 'manufacturer'],
  weight: ['weight', 'kg', 'lbs'],
  dimensions: ['size', 'dimension'],
  origin: ['ship from', 'origin', 'location'],
};

function calculateCBM(text) {
  const match = text.match(/(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)/);
  if (!match) return 'N/A';
  const l = parseFloat(match[1]);
  const w = parseFloat(match[3]);
  const h = parseFloat(match[5]);
  return ((l * w * h) / 1_000_000).toFixed(4);
}

async function scrapeProductFromAnySite(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 4000));

    const rawHost = new URL(url).hostname;
    const hostname = rawHost.replace(/^www\.|^he\./, '');
    console.log(`🌐 Domain: ${hostname}`);

    const fixed = loadFixedSelectors();
    const learned = loadLearnedSelectors();
    const selectorsByDomain = mergeSelectors(fixed, learned);
    const manual = selectorsByDomain[hostname] || {};

const extractManual = async (field, selector) => {
  if (!selector) return null;

const tryOne = async (sel) => {
  try {
    await page.waitForSelector(sel, { timeout: 5000 }); // ← נוספה המתנה
    const value = await page.$eval(sel, el => el.innerText.trim());
    console.log(`✅ [${field}] Found via selector: ${sel}`);
    updateSelectorScore(hostname, field, sel, true);
    return value;
  } catch {
    console.log(`❌ [${field}] Failed selector: ${sel}`);
    updateSelectorScore(hostname, field, sel, false);
    return null;
  }
};


  if (Array.isArray(selector)) {
    for (const sel of selector) {
      const val = await tryOne(sel);
      if (val) return val;
    }
    return null;
  } else {
    return await tryOne(selector);
  }
};


    let name = await extractManual('name', manual.name);
    let manufacturer = await extractManual('manufacturer', manual.manufacturer);
    let weight = await extractManual('weight', manual.weight);
    let dimensions = await extractManual('dimensions', manual.dimensions);
    let origin = await extractManual('origin', manual.origin);

    // fallback לפי מילים
    if (!name || !manufacturer || !weight || !dimensions || !origin) {
      const html = await page.content();
      const $ = cheerio.load(html);

      const findByKeywords = (field) => {
        const keywords = defaultKeywords[field] || [];
        const results = [];
        $('body *:not(script):not(style)').each((_, el) => {
          const text = $(el).text().toLowerCase();
          if (keywords.some(k => text.includes(k))) {
            const clean = $(el).text().replace(/\s+/g, ' ').trim();
            if (clean.length > 3 && clean.length < 300) results.push(clean);
          }
        });
        return results.length ? results[0] : null;
      };

      name = name || findByKeywords('name') || 'N/A';
      manufacturer = manufacturer || findByKeywords('manufacturer') || 'N/A';
      weight = weight || findByKeywords('weight') || 'N/A';
      dimensions = dimensions || findByKeywords('dimensions') || 'N/A';
      origin = origin || findByKeywords('origin') || 'N/A';
    }

    const cbm = (dimensions && dimensions !== 'N/A') ? calculateCBM(dimensions) : 'N/A';

    await browser.close();
    return { name, manufacturer, weight, dimensions, cbm, origin };

  } catch (err) {
    await browser.close();
    console.error('❌ Scraper error:', err.message);
    return {
      name: `Something went wrong: ${err.message}`,
      manufacturer: 'N/A',
      weight: 'N/A',
      dimensions: 'N/A',
      cbm: 'N/A',
      origin: 'Something went wrong'
    };
  }
}

module.exports = scrapeProductFromAnySite;
