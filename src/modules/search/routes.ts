import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';

const router = Router();

// Laundry-specific keywords and synonyms for better search matching
const GARMENT_SYNONYMS: Record<string, string[]> = {
  saree: ['saree', 'sari'],
  shirt: ['shirt', 'tshirt', 't-shirt', 'tee', 'polo'],
  tshirt: ['tshirt', 't-shirt', 'tee', 'polo', 'shirt'],
  pant: ['pant', 'trouser', 'chino', 'bottom'],
  trouser: ['trouser', 'pant', 'chino', 'bottom'],
  chino: ['chino', 'trouser', 'pant'],
  jeans: ['jeans', 'jean', 'denim'],
  suit: ['suit', 'blazer', 'tuxedo'],
  blazer: ['blazer', 'coat', 'suit'],
  jacket: ['jacket', 'windcheater', 'shrug'],
  coat: ['coat', 'overcoat', 'blazer'],
  kurta: ['kurta', 'kameez', 'kurti'],
  kurti: ['kurti', 'tunic', 'kurta'],
  lehenga: ['lehenga', 'ghagra', 'choli'],
  dress: ['dress', 'frock', 'gown', 'maxi', 'onepiece'],
  frock: ['frock', 'dress', 'gown'],
  gown: ['gown', 'maxi', 'dress'],
  bedsheet: ['bedsheet', 'bed sheet', 'sheet', 'bedcover'],
  sheet: ['sheet', 'bedsheet', 'bed sheet', 'bedcover'],
  pillow: ['pillow', 'cushion', 'bolster'],
  cushion: ['cushion', 'pillow'],
  blanket: ['blanket', 'quilt', 'razai', 'comforter', 'mink', 'fleece', 'duvet'],
  quilt: ['quilt', 'blanket', 'razai', 'comforter', 'duvet'],
  comforter: ['comforter', 'duvet', 'blanket', 'quilt'],
  razai: ['razai', 'quilt', 'blanket', 'comforter'],
  curtain: ['curtain', 'drape', 'sheer'],
  towel: ['towel', 'bathrobe'],
  sweater: ['sweater', 'cardigan', 'pullover', 'woolen'],
  cardigan: ['cardigan', 'sweater'],
  hoodie: ['hoodie', 'sweatshirt'],
  sweatshirt: ['sweatshirt', 'hoodie'],
  shoe: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'footwear'],
  sneaker: ['sneaker', 'shoes', 'shoe', 'footwear'],
  sherwani: ['sherwani', 'indo-western', 'achkan'],
  dhoti: ['dhoti', 'mundu', 'veshti'],
  top: ['top', 'blouse', 'tunic', 'tee'],
  blouse: ['blouse', 'top'],
  skirt: ['skirt', 'pinafore'],
  shorts: ['shorts', 'bermuda', 'half pant'],
  uniform: ['uniform', 'school uniform'],
  romper: ['romper', 'onesie', 'baby suit'],
};

function stemWord(raw: string): string {
  const w = raw.toLowerCase().trim();
  if (w.length <= 3) return w;

  if (w === 'men' || w === 'mens') return 'man';
  if (w === 'women' || w === 'womens') return 'woman';
  if (w === 'children') return 'child';
  if (w === 'jeans') return 'jeans';
  if (w === 'chinos') return 'chino';
  if (w === 'trousers') return 'trouser';
  if (w === 'shoes') return 'shoe';
  if (w === 'sarees' || w === 'saris') return 'saree';

  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ses') || w.endsWith('xes') || w.endsWith('ches') || w.endsWith('shes')) return w.slice(0, -2);
  if (w.endsWith('ees') && w.length > 4) return w.slice(0, -1);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

// Normalize query for better matching
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Calculate relevance score with garment intent verification
function calculateRelevance(item: any, query: string, normalizedQuery: string): number {
  const itemName = (item.name || '').toLowerCase();
  const nameWords = itemName.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const stemmedNameWords = nameWords.map(stemWord);
  const itemDesc = (item.description || '').toLowerCase();
  const itemCategory = (item.categoryTag || '').toLowerCase();
  const itemSubcategory = ((item.subcategory || item.subCategory) || '').toLowerCase();
  const serviceName = (item.serviceName || '').toLowerCase();

  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
  if (queryWords.length === 0) return 0;

  // Detect garment intent
  const targetGarmentKeys = new Set<string>();
  queryWords.forEach((word) => {
    const stemmed = stemWord(word);
    if (GARMENT_SYNONYMS[word]) targetGarmentKeys.add(word);
    if (GARMENT_SYNONYMS[stemmed]) targetGarmentKeys.add(stemmed);
    Object.entries(GARMENT_SYNONYMS).forEach(([key, syns]) => {
      if (syns.includes(word) || syns.includes(stemmed)) {
        targetGarmentKeys.add(key);
      }
    });
  });

  const hasGarmentIntent = targetGarmentKeys.size > 0;
  if (hasGarmentIntent) {
    const allowedTerms = new Set<string>();
    targetGarmentKeys.forEach((key) => {
      allowedTerms.add(key);
      (GARMENT_SYNONYMS[key] || []).forEach((syn) => {
        allowedTerms.add(syn);
        allowedTerms.add(stemWord(syn));
      });
    });

    const matchesGarment = Array.from(allowedTerms).some((term) => {
      const stemmedTerm = stemWord(term);
      return (
        nameWords.includes(term) ||
        nameWords.includes(stemmedTerm) ||
        stemmedNameWords.includes(term) ||
        stemmedNameWords.includes(stemmedTerm) ||
        itemName.includes(term) ||
        itemName.includes(stemmedTerm)
      );
    });

    if (!matchesGarment) {
      return 0; // Strictly exclude mismatched garments
    }
  }

  let score = 0;

  // Exact match (highest priority)
  if (itemName === normalizedQuery) score += 500;
  else if (itemName.startsWith(normalizedQuery)) score += 300;
  else if (itemName.includes(normalizedQuery)) score += 200;

  // Individual word matches
  let matchedWords = 0;
  queryWords.forEach(word => {
    if (word.length < 2) return;
    const sWord = stemWord(word);

    if (nameWords.includes(word) || nameWords.includes(sWord)) {
      score += 150;
      matchedWords++;
    } else if (stemmedNameWords.includes(sWord) || stemmedNameWords.includes(word)) {
      score += 120;
      matchedWords++;
    } else if (itemName.includes(word) || itemName.includes(sWord)) {
      score += 80;
      matchedWords++;
    }

    if (itemDesc.includes(word)) score += 10;
    if (itemCategory.includes(word)) score += 15;
    if (itemSubcategory.includes(word)) score += 25;
    if (serviceName.includes(word)) score += 30;
  });

  if (queryWords.length > 1 && matchedWords === queryWords.length) {
    score += 200;
  }

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
  
  if (!query || query.trim().length === 0) {
    return res.json({
      success: true,
      data: {
        query: '',
        normalizedQuery: '',
        results: [],
        groupedResults: {},
        totalResults: 0,
        totalMatched: 0,
        limit,
        hasMore: false,
        suggestions: ['Shirt', 'Saree', 'Dry Cleaning', 'Blanket', 'Steam Press', 'Jeans'],
        categories: [],
      },
    });
  }
  
  const normalizedQuery = normalizeQuery(query);
  const catalog = db.getFullCatalog();

  const CAT_LABELS: Record<string, string> = {
    MENS: "Men's Wear",
    WOMENS: "Women's Wear",
    KIDS: "Kids & Baby",
    HOME_TEXTILES: "Home Textiles",
    BRIDAL: "Premium & Bridal",
    SPECIAL: "Deep Treatment",
    FOOTWEAR: "Footwear",
    ACCESSORIES: "Accessories",
  };
  
  // Get all items with their prices
  const allItems = (catalog.clothTypes || []).map(cloth => {
    const clothNameLower = (cloth.name || '').trim().toLowerCase();
    const prices = (catalog.priceMatrix || [])
      .filter(p => p && (p.clothTypeId === cloth.id || (p.clothName && p.clothName.trim().toLowerCase() === clothNameLower)) && p.isActive)
      .sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    
    const primaryPrice = prices.find(p => Number(p.price) > 0) || prices[0];
    const serviceMaster = (catalog.serviceMasters || []).find(s => s.id === primaryPrice?.serviceId);
    
    // Non-zero guaranteed fallback price
    const catTag = String(cloth.categoryTag || '').toUpperCase();
    const defaultFallbackPrice = catTag.includes('KID') ? 15 : catTag.includes('HOME') ? 40 : catTag.includes('PREMIUM') || catTag.includes('TRADITIONAL') ? 50 : 20;
    const finalPrice = (primaryPrice?.price && Number(primaryPrice.price) > 0) ? Number(primaryPrice.price) : defaultFallbackPrice;
    
    return {
      id: cloth.id,
      name: cloth.name,
      description: cloth.description || '',
      categoryTag: cloth.categoryTag,
      categoryLabel: CAT_LABELS[catTag] || (cloth as any).categoryLabel || catTag,
      subcategory: cloth.subCategory || (cloth as any).subcategory || 'General',
      imageUrl: cloth.imageUrl || (cloth as any).image || '',
      serviceName: serviceMaster?.name || primaryPrice?.serviceName || 'Steam Press',
      serviceId: primaryPrice?.serviceId || 'srv-m-steam-iron',
      price: finalPrice,
      unit: 'Piece',
      turnaroundHours: primaryPrice?.turnaroundHours || 24,
      pricingModel: 'PER_ITEM',
      isPopular: false,
      availableServices: prices.map(p => String(p.serviceName || p.serviceId)),
      allPrices: prices.map(p => ({
        serviceId: p.serviceId,
        serviceName: p.serviceName,
        price: Number(p.price) || finalPrice,
        unit: 'Piece',
        turnaroundHours: p.turnaroundHours || 24,
      })),
    };
  });
  
  // Filter by category if specified
  let filtered = allItems;
  if (category && category !== 'ALL') {
    const cleanCat = category.replace(/[^A-Z]/g, '');
    filtered = filtered.filter(item => {
      const itemCat = String(item.categoryTag || '').toUpperCase().replace(/[^A-Z]/g, '');
      if (itemCat === cleanCat) return true;
      if ((cleanCat.includes('HOME') || cleanCat.includes('TEXTILE') || cleanCat.includes('LINEN')) && (itemCat.includes('HOME') || itemCat.includes('TEXTILE') || itemCat.includes('LINEN'))) return true;
      if ((cleanCat.includes('KID') || cleanCat.includes('BABY')) && (itemCat.includes('KID') || itemCat.includes('BABY'))) return true;
      if ((cleanCat.includes('SHOE') || cleanCat.includes('FOOTWEAR')) && (itemCat.includes('SHOE') || itemCat.includes('FOOTWEAR'))) return true;
      return false;
    });
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
    Object.entries(GARMENT_SYNONYMS).forEach(([key, synonyms]) => {
      if (normalizedQuery.includes(key) || synonyms.some((s: string) => normalizedQuery.includes(s))) {
        suggestions.push(key);
        synonyms.slice(0, 2).forEach((s: string) => suggestions.push(s));
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
  const keywords = Object.keys(GARMENT_SYNONYMS).map(key => ({
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
