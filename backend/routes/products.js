const express = require('express');
const router = express.Router();

// Static product catalog — replace with DB queries once products are in MongoDB
const PRODUCTS = [
  // Herbal Collection
  { id: 'palo-santo',    name: 'Ceremonial Palo Santo Bundle',    category: 'herbal',    price: 14.99, unit: 'bundle',   digital: false, emoji: '🌿', description: 'Sacred wood for energy clearing. Purifies spaces and elevates consciousness.' },
  { id: 'turmeric',      name: 'Golden Turmeric Ceremony Blend',  category: 'herbal',    price: 21.99, unit: '200g',     digital: false, emoji: '🌾', description: 'Organic, fair-trade. Anti-inflammatory with black pepper, cinnamon, ginger.' },
  { id: 'cacao',         name: 'Ceremonial Grade Cacao',          category: 'herbal',    price: 34.99, unit: '200g',     digital: false, emoji: '🍫', description: 'Heart-opening cacao for ceremony, mood elevation, and spiritual communion.' },
  { id: 'moringa',       name: 'Moringa Leaf Powder',             category: 'herbal',    price: 22.99, unit: '100g',     digital: false, emoji: '🌱', description: 'Complete nutrition. 7x vitamin C of oranges, iron, calcium, protein.' },
  { id: 'spirulina',     name: 'Spirulina Superfood Blend',       category: 'herbal',    price: 26.99, unit: '100g',     digital: false, emoji: '💚', description: 'Chlorophyll-rich, body-alkalizing. Protein, vitamins, minerals, vitality.' },

  // Medicinal Mushrooms
  { id: 'reishi',        name: 'Reishi (Lingzhi) Powder',         category: 'mushrooms', price: 32.99, unit: '100g',     digital: false, emoji: '🍄', description: 'Mushroom of Immortality. Stress relief, immune support, deep sleep.' },
  { id: 'lions-mane',    name: "Lion's Mane Capsules",            category: 'mushrooms', price: 28.99, unit: '60 caps',  digital: false, emoji: '🧠', description: 'Cognitive clarity, neuroplasticity, focus. Natures brain supplement.' },
  { id: 'cordyceps',     name: 'Cordyceps Energy Blend',          category: 'mushrooms', price: 26.99, unit: '60 caps',  digital: false, emoji: '⚡', description: 'Natural energy without caffeine. Stamina, performance, chi flow.' },
  { id: 'chaga',         name: 'Chaga Immune Supreme',            category: 'mushrooms', price: 34.99, unit: '100g',     digital: false, emoji: '🛡️', description: 'Siberian forest treasure. Most antioxidant-rich mushroom available.' },

  // Ocean Superfoods
  { id: 'sea-moss',      name: 'Organic Sea Moss (Irish Moss)',   category: 'ocean',     price: 24.99, unit: '100g jar', digital: false, emoji: '🌊', description: '92 of 102 minerals. Thyroid support, gut health, skin radiance, energy.' },
  { id: 'bladderwrack',  name: 'Bladderwrack',                    category: 'ocean',     price: 16.99, unit: '100g',     digital: false, emoji: '🌿', description: 'Iodine-rich ocean mineral complex for thyroid function and metabolism.' },
  { id: 'sea-salt',      name: 'Atlantic Sea Salt with Trace Minerals', category: 'ocean', price: 12.99, unit: 'container', digital: false, emoji: '🧂', description: 'Unrefined, sun-dried. Electrolyte balance and cellular hydration.' },

  // Essential Oils
  { id: 'frankincense',  name: 'Sacred Frankincense Oil (Pure)',  category: 'oils',      price: 29.99, unit: '15ml',     digital: false, emoji: '✨', description: 'Ancient ceremonial grade. Meditation, spiritual practice, skin rejuvenation.' },
  { id: 'myrrh',         name: 'Myrrh Oil (Commiphora myrrha)',   category: 'oils',      price: 27.99, unit: '15ml',     digital: false, emoji: '🌑', description: 'Grounding and healing. Wound healing, meditation, emotional balance.' },
  { id: 'lavender',      name: 'Lavender Spiritual Blend',        category: 'oils',      price: 19.99, unit: '15ml',     digital: false, emoji: '💜', description: 'Sleep support, anxiety relief, spiritual peace.' },
  { id: 'peppermint',    name: 'Peppermint Clarity Oil',          category: 'oils',      price: 18.99, unit: '15ml',     digital: false, emoji: '💨', description: 'Mental focus, energy, and digestive support.' },
  { id: 'ylang-ylang',   name: 'Ylang Ylang Sacred Love Oil',     category: 'oils',      price: 24.99, unit: '15ml',     digital: false, emoji: '🌸', description: 'Emotional healing, divine feminine energy, self-love.' },

  // Digital Products
  { id: 'sacred-apothecary',  name: 'The Sacred Apothecary: 50 Healing Herbs', category: 'digital', price: 17.99, unit: 'PDF', digital: true, emoji: '📚', description: '200+ pages covering 50 medicinal herbs — history, properties, preparations.' },
  { id: 'oceans-medicine',    name: "Ocean's Medicine: Sea Moss & Bladderwrack", category: 'digital', price: 9.99, unit: 'PDF', digital: true, emoji: '🌊', description: '30 recipes and protocols for thyroid support, gut healing, skin radiance.' },
  { id: 'mushroom-mastery',   name: 'Mushroom Mastery: Complete Guide to Medicinal Fungi', category: 'digital', price: 14.99, unit: 'PDF', digital: true, emoji: '🍄', description: 'Deep dive into 20 therapeutic mushrooms — preparation, dosing, combinations.' },
  { id: 'hermetic-principles', name: 'The Hermetic Principles in Daily Life', category: 'digital', price: 12.99, unit: 'PDF', digital: true, emoji: '✨', description: 'The 7 Hermetic Laws with practical daily applications and 90-day workbook.' },
  { id: 'energy-medicine',    name: 'Energy Medicine & Chakra Alignment', category: 'digital', price: 13.99, unit: 'PDF', digital: true, emoji: '⚡', description: 'Complete chakra guide, energy healing, herbal support for each chakra.' },
  { id: 'island-healing',     name: 'Island Healing Retreat Guide', category: 'digital', price: 11.99, unit: 'PDF', digital: true, emoji: '🌴', description: 'Design your own wellness retreat with nature-based healing practices.' },
  { id: 'complete-bundle',    name: 'Complete Herbal Wellness Collection (All 6 Books)', category: 'digital', price: 44.99, unit: 'PDF Bundle', digital: true, emoji: '⭐', description: 'All 6 e-books + lifetime updates + community access. Save $23.' },

  // Courses
  { id: 'tier-1', name: 'Herbal Medicine Foundations',         category: 'courses', price: 297,  unit: 'course', digital: true, emoji: '📖', description: '12 modules, 48 lessons, 8 weeks. Master 50+ medicinal herbs.' },
  { id: 'tier-2', name: 'Hermetic Sciences Mastery',           category: 'courses', price: 997,  unit: 'course', digital: true, emoji: '🔮', description: '15 modules, 60 lessons, 12 weeks + monthly live calls.' },
  { id: 'tier-3', name: 'Infinite Intelligence Transformation',category: 'courses', price: 2997, unit: 'program', digital: true, emoji: '💎', description: '12-month program with coaching, AI Vault, and business training.' },

  // Upsells
  { id: 'starter-kit',           name: 'Herbal Starter Kit',                  category: 'bundles', price: 67,   unit: 'bundle', digital: false, emoji: '🌿', description: 'Sea Moss, Reishi, Frankincense Oil + Recipe E-Book + 7-Day Protocol.' },
  { id: 'herbal-biz-accelerator', name: 'Herbal Business Accelerator',         category: 'courses', price: 197,  unit: 'course', digital: true,  emoji: '🏪', description: 'Turn your herbal knowledge into a profitable wellness business.' },
  { id: 'ai-knowledge-vault',     name: 'AI Knowledge Vault (Monthly)',        category: 'membership', price: 47, unit: '/month', digital: true, emoji: '🤖', description: '24/7 AI herbalist powered by our full curriculum and product catalog.' },
  { id: 'morning-ritual',         name: 'Sacred Morning Ritual Guide',         category: 'digital', price: 17,   unit: 'PDF', digital: true,  emoji: '🌅', description: '30-day morning ritual: herbal prep, breathwork, hermetic journaling.' },
  { id: 'retreat-deposit',        name: 'Puerto Rico Retreat Deposit',         category: 'retreat', price: 500,  unit: 'deposit', digital: false, emoji: '🌴', description: 'Fully refundable deposit to hold your retreat spot.' }
];

// GET /api/products — full catalog with optional ?category= filter
router.get('/', (req, res) => {
  const { category } = req.query;
  const results = category
    ? PRODUCTS.filter(p => p.category === category)
    : PRODUCTS;
  res.json({ count: results.length, products: results });
});

// GET /api/products/:id — single product
router.get('/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// GET /api/products/categories — list all categories
router.get('/meta/categories', (req, res) => {
  const cats = [...new Set(PRODUCTS.map(p => p.category))];
  res.json(cats);
});

module.exports = { router, PRODUCTS };
