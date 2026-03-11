const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

async function scrapeTrends() {
  try {
    const url = 'https://news.google.com';
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    // Deep clean XML to prevent parsing errors
    const cleanXml = response.data
      .replace(/&/g, '&amp;')
      .replace(/&amp;(amp|lt|gt|quot|apos);/g, '&$1;');

    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: true,
      normalize: true
    });
    
    const result = await parser.parseStringPromise(cleanXml);
    
    // 1. SAFE NAVIGATION: Check if the path rss -> channel -> item exists
    const channel = result?.rss?.channel;
    if (!channel || !channel.item) {
      throw new Error("RSS structure invalid or empty. Check the source URL.");
    }

    const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
    
    const trends = rawItems.slice(0, 15).map(item => ({
      title: item.title || "No Title",
      url: item.link || url,
      source: item.source?.['_'] || item.source || "Google News",
      timestamp: item.pubDate || new Date().toISOString(),
      platform: "Google News",
      category: "Live Trend"
    }));

    fs.writeFileSync('trends.json', JSON.stringify(trends, null, 2));
    console.log(`Successfully updated trends.json with ${trends.length} items.`);
    
  } catch (error) {
    console.error('Scrape failed:', error.message);
    // Create an empty array if it fails so the JSON stays valid
    if (!fs.existsSync('trends.json')) {
        fs.writeFileSync('trends.json', JSON.stringify([]));
    }
    process.exit(1);
  }
}

scrapeTrends();
