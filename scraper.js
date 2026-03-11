const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeTrends() {
  try {
    // Example: Scraping Google News for trending headlines
    const { data } = await axios.get('https://news.google.com');
    const $ = cheerio.load(data);
    const trends = [];

    $('article h3').each((i, el) => {
      if (i < 10) {
        trends.push({
          title: $(el).text(),
          url: $(el).find('a').attr('href'),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Save to a local JSON file
    fs.writeFileSync('trends.json', JSON.stringify(trends, null, 2));
    console.log('Trends updated successfully!');
  } catch (error) {
    console.error('Scrape failed:', error);
    process.exit(1);
  }
}

scrapeTrends();
