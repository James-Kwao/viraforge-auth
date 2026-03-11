const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

async function scrapeTrends() {
  try {
    // RSS Feed for Top Stories (US/English)
    const url = 'https://news.google.com';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    // Parse XML to JSON
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    // Extract items from the RSS channel
    const items = result.rss.channel[0].item;
    
    const trends = items.slice(0, 15).map(item => ({
      title: item.title[0],
      url: item.link[0],
      source: item.source ? item.source[0]._ : "Google News",
      timestamp: item.pubDate[0],
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
