const axios = require('axios');
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

    const rawData = response.data;
    const trends = [];

    // Use Regex to find <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(rawData)) !== null && trends.length < 15) {
      const itemContent = match[1];

      // Extract title and link using specific regex for XML tags
      const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);

      if (titleMatch && linkMatch) {
        trends.push({
          title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(), // Clean CDATA
          url: linkMatch[1].trim(),
          timestamp: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
          platform: "Google News",
          category: "Live Trend"
        });
      }
    }

    if (trends.length === 0) {
      throw new Error("Regex failed to find any news items.");
    }

    fs.writeFileSync('trends.json', JSON.stringify(trends, null, 2));
    console.log(`Successfully updated trends.json with ${trends.length} items.`);
    
  } catch (error) {
    console.error('Scrape failed:', error.message);
    process.exit(1);
  }
}

scrapeTrends();
