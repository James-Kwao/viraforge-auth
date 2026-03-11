const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

async function scrapeTrends() {
  try {
    const url = 'https://news.google.com';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    // 1. STUBBORN AMPERSAND FIX
    // First, escape every '&' to '&amp;'
    // Then, fix cases where we accidentally double-escaped valid entities (e.g., &amp;amp;)
    let cleanXml = response.data
      .replace(/&/g, '&amp;')
      .replace(/&amp;(amp|lt|gt|quot|apos);/g, '&$1;');

    const parser = new xml2js.Parser({ 
      explicitArray: false,
      trim: true,
      // Disable strict mode if the parser supports it to ignore minor XML errors
      strict: false 
    });
    
    const result = await parser.parseStringPromise(cleanXml);
    
    const items = result.rss.channel.item;
    const trends = (Array.isArray(items) ? items : [items]).slice(0, 15).map(item => ({
      title: item.title,
      url: item.link,
      source: item.source?._ || item.source || "Google News",
      timestamp: item.pubDate,
      platform: "Google News",
      category: "Live Trend"
    }));

    fs.writeFileSync('trends.json', JSON.stringify(trends, null, 2));
    console.log(`Successfully updated trends.json with ${trends.length} items.`);
    
  } catch (error) {
    console.error('Scrape failed:', error.message);
    process.exit(1);
  }
}

scrapeTrends();
