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

    // FIX: Escape ampersands that are not already part of an entity
    // This prevents the "Invalid character in entity name" error
    const sanitizedData = response.data.replace(/&(?!(?:apos|quot|[gl]t|amp);|#)/g, '&amp;');

    const parser = new xml2js.Parser({ 
      explicitArray: false, // Simplifies the resulting JSON structure
      trim: true 
    });
    
    const result = await parser.parseStringPromise(sanitizedData);
    
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
