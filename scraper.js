const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeTrends() {
  try {
    const url = 'https://news.google.com';
    
    // 1. Add User-Agent to prevent getting blocked/empty results
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    // 2. Updated selectors for 2024/2025 Google News layout
    // Google often uses 'h4' or 'a.gPFEn' for titles now
    $('article').each((i, el) => {
      if (i < 15) {
        const titleElement = $(el).find('h3, h4, [role="heading"]').first();
        const linkElement = $(el).find('a').first();
        
        const title = titleElement.text().trim();
        let link = linkElement.attr('href');

        if (title) {
          // Convert relative Google News links to absolute URLs
          if (link && link.startsWith('./')) {
            link = 'https://news.google.com' + link.substring(1);
          }

          trends.push({
            title: title,
            url: link || url,
            platform: "Google News",
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    if (trends.length === 0) {
      console.log("Warning: No trends found. Selectors might be outdated.");
    }

    fs.writeFileSync('trends.json', JSON.stringify(trends, null, 2));
    console.log(`Successfully scraped ${trends.length} trends.`);
    
  } catch (error) {
    console.error('Scrape failed:', error.message);
    process.exit(1);
  }
}

scrapeTrends();
