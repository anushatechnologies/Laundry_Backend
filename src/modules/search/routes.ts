import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';

const router = Router();

// Laundry-specific keywords and synonyms for better search matching
const LAUNDRY_KEYWORDS = {
  // Services
  'wash': ['washing', 'laundry', 'clean', 'cleaning'],
  'iron': ['press', 'ironing', 'pressing', 'steam'],
  'dry clean': ['dryclean', 'dry cleaning', 'drycleaning'],
  'fold': ['folding', 'folded'],
  'starch': ['starching', 'starched'],
  'steam': ['steaming', 'steamed', 'press'],
  
  // Common laundry items
  'shirt': ['shirts', 'tshirt', 't-shirt', 'tee'],
  'pant': ['pants', 'trouser', 'trousers'],
  'suit': ['suits', 'blazer', 'formal'],
  'dress': ['dresses', 'gown', 'frock'],
  'saree': ['sari', 'sarees', 'saris'],
  'kurta': ['kurtas', 'kurti', 'kurtis'],
  'jeans': ['jean', 'denim'],
  'jacket': ['jackets', 'coat'],
  'blanket': ['blankets', 'comforter', 'quilt'],
  'bedsheet': ['bed sheet', 'sheets', 'linen'],
  'towel': ['towels'],
  'curtain': ['curtains', 'drapes'],
  
  // Fabrics
  'silk': ['pure silk', 'silken'],
  'cotton': ['cotton handloom'],
  'wool': ['woolen', 'pashmina'],
  'linen': ['flax'],
  'chiffon': ['georgette'],
  'velvet': ['velveteen'],
  
  // Categories
  'men': ['mens', 'male', 'gents'],
  'women': ['womens', 'ladies', 'female'],
  'kids': ['children', 'child', 'baby'],
  'home': ['household', 'linen'],
};

// Normalize query for better matching
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
    .replace(/\s+/g, ' ');         // Normalize spaces
}

// Calculate relevance score
function calculateRelevance(item: any, query: string, normalizedQuery: string): number {
  let score = 0;
  const itemName = (item.name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemCategory = (item.categoryTag || '').toLowerCase();
  const itemSubcategory = ((item.subcategory || item.subCategory) || '').toLowerCase();
  const serviceName = (item.serviceName || '').toLowerCase();
  
  // Exact match (highest priority)
  if (itemName === normalizedQuery) score += 100;
  
  // Starts with query
  if (itemName.startsWith(normalizedQuery)) score += 50;
  
  // Contains exact query
  if (itemName.includes(normalizedQuery)) score += 30;
  
  // Individual word matches
  const queryWords = normalizedQuery.split(' ');
  queryWords.forEach(word => {
    if (word.length < 2) return; // Skip single letters
    
    if (itemName.includes(word)) score += 10;
    if (itemDesc.includes(word)) score += 5;
    if (itemCategory.includes(word)) score += 8;
    if (itemSubcategory.includes(word)) score += 7;
    if (serviceName.includes(word)) score += 6;
  });
  
  // Synonym/keyword matching
  Object.entries(LAUNDRY_KEYWORDS).forEach(([key, synonyms]) => {
    const allTerms = [key, ...synonyms];
    allTerms.forEach(term => {
      if (normalizedQuery.includes(term)) {
        if (itemName.includes(key) || itemName.includes(term)) score += 15;
        if (itemDesc.includes(key) || itemDesc.includes(term)) score += 8;
        synonyms.forEach(syn => {
          if (itemName.includes(syn)) score += 12;
        });
      }
    });
  });
  
  // Boost popular items slightly
  if (item.isPopular) score += 5;
  
  return score;
}

// Advanced search endpoint
router.get('/', (req: Request, res: Response) => {
  const query = (req.query.q || req.query.query || '') as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const category = ((req.query.category as string) || '').toUpperCase();
  const minPrice = parseFloat(req.query.minPrice as string) || 0;
  const maxPrice = parseFloat(req.query.maxPrice as string) || Infinity;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters',
    });
  }
  
  const normalizedQuery = normalizeQuery(query);
  const catalog = db.getFullCatalog();
  
  // Get all items with their prices
  const allItems = (catalog.clothTypes || []).map(cloth => {
    const prices = (catalog.priceMatrix || [])
      .filter(p => p && p.clothTypeId === cloth.id && p.isActive)
      .sort((a, b) => (a.price || 0) - (b.price || 0));
    
    const primaryPrice = prices[0];
    const serviceMaster = (catalog.serviceMasters || []).find(s => s.id === primaryPrice?.serviceId);
    
    return {
      id: cloth.id,
      name: cloth.name,
      description: cloth.description || '',
      categoryTag: cloth.categoryTag,
      subcategory: cloth.subCategory || '',
      imageUrl: cloth.imageUrl || '',
      serviceName: serviceMaster?.name || primaryPrice?.serviceName || 'Standard Service',
      serviceId: primaryPrice?.serviceId,
      price: primaryPrice?.price || 0,
      unit: 'Piece',
      turnaroundHours: primaryPrice?.turnaroundHours || 24,
      pricingModel: 'PER_ITEM',
      isPopular: false,
      allPrices: prices.map(p => ({
        serviceId: p.serviceId,
        serviceName: p.serviceName,
        price: p.price,
        unit: 'Piece',
        turnaroundHours: p.turnaroundHours,
      })),
    };
  });
  
  // Filter by category if specified
  let filtered = allItems;
  if (category && category !== 'ALL') {
    filtered = filtered.filter(item => 
      item.categoryTag.toUpperCase() === category
    );
  }
  
  // Calculate relevance scores
  const scored = filtered.map(item => ({
    ...item,
    relevance: calculateRelevance(item, query, normalizedQuery),
  }));
  
  // Filter by relevance > 0 (has at least some match)
  const relevant = scored.filter(item => item.relevance > 0);
  
  // Filter by price range
  const priceFiltered = relevant.filter(item => 
    item.price >= minPrice && item.price <= maxPrice
  );
  
  // Sort by relevance (descending)
  const sorted = priceFiltered.sort((a, b) => b.relevance - a.relevance);
  
  // Limit results
  const results = sorted.slice(0, limit);
  
  // Group by category for better UX
  const groupedResults = results.reduce((acc, item) => {
    const cat = item.categoryTag || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof results>);
  
  // Get suggestions for no/low results
  const suggestions: string[] = [];
  if (results.length === 0) {
    // Suggest related terms
    Object.entries(LAUNDRY_KEYWORDS).forEach(([key, synonyms]) => {
      if (normalizedQuery.includes(key) || synonyms.some(s => normalizedQuery.includes(s))) {
        suggestions.push(key);
        synonyms.slice(0, 2).forEach(s => suggestions.push(s));
      }
    });
    
    // Suggest popular items if no matches
    if (suggestions.length === 0) {
      suggestions.push('shirt', 'pants', 'dress', 'saree', 'dry cleaning', 'steam press');
    }
  }
  
  return res.json({
    success: true,
    data: {
      query,
      normalizedQuery,
      results,
      groupedResults,
      totalResults: results.length,
      totalMatched: relevant.length,
      limit,
      hasMore: relevant.length > limit,
      suggestions: suggestions.slice(0, 6),
      categories: Object.keys(groupedResults),
    },
  });
});

// Autocomplete/suggestions endpoint
router.get('/autocomplete', (req: Request, res: Response) => {
  const query = (req.query.q || req.query.query || '') as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  
  if (!query || query.trim().length < 1) {
    // Return popular searches if no query
    return res.json({
      success: true,
      data: {
        suggestions: [
          { text: 'Shirt wash & iron', type: 'popular', icon: '👔' },
          { text: 'Dry cleaning', type: 'popular', icon: '✨' },
          { text: 'Saree', type: 'popular', icon: '🥻' },
          { text: 'Steam press', type: 'popular', icon: '🔥' },
          { text: 'Bedsheet', type: 'popular', icon: '🛏️' },
          { text: 'Blanket', type: 'popular', icon: '🧶' },
        ],
      },
    });
  }
  
  const normalizedQuery = normalizeQuery(query);
  const catalog = db.getFullCatalog();
  
  // Get all unique item names
  const itemNames = (catalog.clothTypes || []).map(c => ({
    text: c.name,
    type: 'item' as const,
    category: c.categoryTag,
    icon: '👕',
  }));
  
  // Get all unique service names
  const serviceNames = Array.from(new Set(
    (catalog.serviceMasters || []).map(s => s.name)
  )).map(name => ({
    text: name,
    type: 'service' as const,
    icon: '🧺',
  }));
  
  // Get all keywords
  const keywords = Object.keys(LAUNDRY_KEYWORDS).map(key => ({
    text: key,
    type: 'keyword' as const,
    icon: '🔍',
  }));
  
  // Combine all suggestions
  const allSuggestions = [...itemNames, ...serviceNames, ...keywords];
  
  // Filter and score suggestions
  const matched = allSuggestions
    .map(suggestion => ({
      ...suggestion,
      score: calculateTextScore(suggestion.text, normalizedQuery),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return res.json({
    success: true,
    data: {
      query,
      suggestions: matched,
      totalSuggestions: matched.length,
    },
  });
});

function calculateTextScore(text: string, query: string): number {
  const normalizedText = normalizeQuery(text);
  let score = 0;
  
  // Exact match
  if (normalizedText === query) score += 100;
  
  // Starts with
  if (normalizedText.startsWith(query)) score += 50;
  
  // Contains
  if (normalizedText.includes(query)) score += 25;
  
  // Word match
  const queryWords = query.split(' ');
  const textWords = normalizedText.split(' ');
  queryWords.forEach(qWord => {
    textWords.forEach(tWord => {
      if (tWord.startsWith(qWord)) score += 10;
      if (tWord.includes(qWord)) score += 5;
    });
  });
  
  return score;
}

// Popular searches endpoint
router.get('/popular', (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  
  const popularSearches = [
    { text: 'Shirt', count: 1250, trend: 'up' },
    { text: 'Dry Cleaning', count: 980, trend: 'up' },
    { text: 'Saree', count: 856, trend: 'stable' },
    { text: 'Steam Press', count: 742, trend: 'up' },
    { text: 'Pants', count: 689, trend: 'stable' },
    { text: 'Bedsheet', count: 623, trend: 'up' },
    { text: 'Blanket', count: 567, trend: 'stable' },
    { text: 'Dress', count: 534, trend: 'up' },
    { text: 'Kurta', count: 498, trend: 'stable' },
    { text: 'Jeans', count: 467, trend: 'down' },
  ];
  
  return res.json({
    success: true,
    data: {
      popularSearches: popularSearches.slice(0, limit),
      lastUpdated: new Date().toISOString(),
    },
  });
});

// Trending searches endpoint
router.get('/trending', (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 6, 20);
  
  const trendingSearches = [
    { text: 'Winter Blanket Cleaning', growth: '+45%', emoji: '❄️' },
    { text: 'Silk Saree Care', growth: '+38%', emoji: '🥻' },
    { text: 'Express Dry Clean', growth: '+32%', emoji: '⚡' },
    { text: 'Woolen Garments', growth: '+28%', emoji: '🧥' },
    { text: 'Curtain Cleaning', growth: '+25%', emoji: '🪟' },
    { text: 'Shoe Spa', growth: '+22%', emoji: '👞' },
  ];
  
  return res.json({
    success: true,
    data: {
      trendingSearches: trendingSearches.slice(0, limit),
      lastUpdated: new Date().toISOString(),
    },
  });
});

export default router;
