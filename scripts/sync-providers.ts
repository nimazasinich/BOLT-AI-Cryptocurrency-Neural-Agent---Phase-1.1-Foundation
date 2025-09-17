#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Type definitions as specified in requirements
type ProviderCategory = 'MarketData' | 'News' | 'Sentiment' | 'FearGreed' | 'Whales' | 'OnChain' | 'Explorers' | 'Community' | 'Other';

interface ProviderSpec {
  id: string;
  name: string;
  url: string;
  docs?: string;
  apiBase?: string;
  category: ProviderCategory;
  auth?: 'apiKey' | 'oauth' | 'none';
  notes?: string;
}

interface ProvidersBundle {
  source: string;
  count: number;
  categories: Record<ProviderCategory, ProviderSpec[]>;
}

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HTML_PATH = path.resolve(__dirname, '../.bolt/dio7_code.html');
const OUTPUT_PATH = path.resolve(__dirname, '../config/providers.generated.json');

// Category mapping heuristics
function guessCategory(categoryName: string, providerName: string, url: string): ProviderCategory {
  const categoryLower = categoryName.toLowerCase();
  const providerLower = providerName.toLowerCase();
  const urlLower = url.toLowerCase();

  // Block Explorer APIs -> Explorers
  if (categoryLower.includes('block') || categoryLower.includes('explorer') || 
      providerLower.includes('scan') || providerLower.includes('explorer') ||
      urlLower.includes('scan.com') || urlLower.includes('explorer')) {
    return 'Explorers';
  }

  // Market Data APIs -> MarketData
  if (categoryLower.includes('market') || categoryLower.includes('price') ||
      providerLower.includes('coin') || providerLower.includes('market') ||
      urlLower.includes('coingecko') || urlLower.includes('coinmarketcap') ||
      urlLower.includes('cryptocompare') || urlLower.includes('nomics')) {
    return 'MarketData';
  }

  // News & Aggregators -> News
  if (categoryLower.includes('news') || categoryLower.includes('aggregator') ||
      providerLower.includes('news') || providerLower.includes('panic') ||
      urlLower.includes('newsapi') || urlLower.includes('cryptopanic')) {
    return 'News';
  }

  // Whale Tracking -> Whales
  if (categoryLower.includes('whale') || providerLower.includes('whale') ||
      urlLower.includes('whale-alert')) {
    return 'Whales';
  }

  // On-Chain & Sentiment Analysis -> OnChain or Sentiment
  if (categoryLower.includes('on-chain') || categoryLower.includes('onchain') ||
      providerLower.includes('glassnode') || providerLower.includes('intotheblock')) {
    return 'OnChain';
  }

  if (categoryLower.includes('sentiment') || providerLower.includes('sentiment') ||
      providerLower.includes('lunarcrush') || providerLower.includes('santiment')) {
    return 'Sentiment';
  }

  // Fear & Greed -> FearGreed
  if (providerLower.includes('fear') || providerLower.includes('greed') ||
      urlLower.includes('alternative.me')) {
    return 'FearGreed';
  }

  // Community Sentiment -> Community
  if (categoryLower.includes('community') || providerLower.includes('reddit') ||
      urlLower.includes('reddit.com')) {
    return 'Community';
  }

  // Default to Other
  return 'Other';
}

function determineAuth(provider: any): 'apiKey' | 'oauth' | 'none' {
  if (provider.requiresKey === true || provider.apiKey) {
    return 'apiKey';
  }
  return 'none';
}

function generateProviderId(name: string, url: string): string {
  // Create a unique ID from name and domain
  const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^(www\.|api\.)/, '');
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${cleanName}_${domain.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
}

async function parseHtmlManifest(): Promise<ProvidersBundle> {
  console.log(`📖 Reading HTML manifest from: ${HTML_PATH}`);
  
  if (!fs.existsSync(HTML_PATH)) {
    console.warn(`⚠️  HTML manifest not found at ${HTML_PATH}. Creating empty bundle.`);
    return createEmptyBundle();
  }

  try {
    const htmlContent = fs.readFileSync(HTML_PATH, 'utf-8');
    
    // Extract the tabData JavaScript object using regex
    const tabDataMatch = htmlContent.match(/const\s+tabData\s*=\s*(\{[\s\S]*?\});/);
    if (!tabDataMatch) {
      console.warn('⚠️  Could not find tabData in HTML file. Creating empty bundle.');
      return createEmptyBundle();
    }

    // Parse the JavaScript object (this is a bit hacky but works for our structured data)
    const tabDataString = tabDataMatch[1];
    const tabData = eval(`(${tabDataString})`); // Note: In production, use a proper JS parser

    const providers: ProviderSpec[] = [];
    
    // Process both tab1 and tab2 data
    for (const tabKey of ['tab1', 'tab2']) {
      if (!tabData[tabKey]) continue;
      
      for (const [categoryName, categoryProviders] of Object.entries(tabData[tabKey])) {
        if (!Array.isArray(categoryProviders)) continue;
        
        for (const provider of categoryProviders as any[]) {
          if (!provider.name || !provider.url) continue;
          
          const providerSpec: ProviderSpec = {
            id: generateProviderId(provider.name, provider.url),
            name: provider.name,
            url: provider.url,
            apiBase: provider.url,
            category: guessCategory(categoryName, provider.name, provider.url),
            auth: determineAuth(provider),
            notes: provider.description || undefined
          };

          // Check for duplicate IDs and make unique if necessary
          const existingIndex = providers.findIndex(p => p.id === providerSpec.id);
          if (existingIndex >= 0) {
            providerSpec.id = `${providerSpec.id}_${providers.length}`;
          }

          providers.push(providerSpec);
        }
      }
    }

    console.log(`✅ Parsed ${providers.length} providers from HTML manifest`);

    // Check minimum provider count
    if (providers.length < 42) {
      console.warn(`⚠️  Warning: Only found ${providers.length} providers (expected >= 42). This may indicate incomplete data.`);
    }

    // Group by categories
    const categories: Record<ProviderCategory, ProviderSpec[]> = {
      MarketData: [],
      News: [],
      Sentiment: [],
      FearGreed: [],
      Whales: [],
      OnChain: [],
      Explorers: [],
      Community: [],
      Other: []
    };

    for (const provider of providers) {
      categories[provider.category].push(provider);
    }

    // Log category distribution
    console.log('📊 Provider distribution by category:');
    for (const [category, providerList] of Object.entries(categories)) {
      if (providerList.length > 0) {
        console.log(`   ${category}: ${providerList.length} providers`);
      }
    }

    return {
      source: HTML_PATH,
      count: providers.length,
      categories
    };

  } catch (error) {
    console.error('❌ Failed to parse HTML manifest:', error);
    console.warn('⚠️  Falling back to empty bundle.');
    return createEmptyBundle();
  }
}

function createEmptyBundle(): ProvidersBundle {
  return {
    source: '(missing)',
    count: 0,
    categories: {
      MarketData: [],
      News: [],
      Sentiment: [],
      FearGreed: [],
      Whales: [],
      OnChain: [],
      Explorers: [],
      Community: [],
      Other: []
    }
  };
}

async function main() {
  console.log('🚀 Starting provider synchronization...');
  
  try {
    // Ensure config directory exists
    const configDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`📁 Created config directory: ${configDir}`);
    }

    // Parse providers from HTML manifest
    const bundle = await parseHtmlManifest();

    // Write to output file
    const jsonContent = JSON.stringify(bundle, null, 2);
    fs.writeFileSync(OUTPUT_PATH, jsonContent, 'utf-8');

    console.log(`✅ Successfully wrote ${bundle.count} providers to: ${OUTPUT_PATH}`);
    console.log(`📝 Source: ${bundle.source}`);

    // Validation summary
    if (bundle.count >= 42) {
      console.log('✅ Provider count meets minimum requirement (>= 42)');
    } else {
      console.log(`⚠️  Provider count (${bundle.count}) below recommended minimum (42)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Provider synchronization failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}