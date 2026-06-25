// Seed script — populates MongoDB with initial webinar and course data
// Run: node backend/seed.js

require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await mongoose.connection.collection('webinars').deleteMany({});
  await mongoose.connection.collection('courses').deleteMany({});

  // Seed webinars
  await mongoose.connection.collection('webinars').insertMany([
    {
      title: 'The Infinite Intelligence Method: Reclaim Your Energy, Upgrade Your Mind & Reconnect With Nature',
      description: 'Our flagship free 90-minute webinar covering herbal foundations, mineral nutrition, hermetic principles, nature immersion, and personal transformation.',
      date: new Date('2026-07-07T23:00:00Z'), // Monday 7pm EST
      duration: 90,
      instructor: 'Dr. Sarah Moonstone',
      maxParticipants: 200,
      price: 0,
      status: 'upcoming',
      recurring: 'weekly',
      createdAt: new Date()
    }
  ]);

  // Seed courses
  await mongoose.connection.collection('courses').insertMany([
    {
      id: 'tier-1',
      title: 'Herbal Medicine Foundations',
      description: 'Your complete introduction to medicinal plants — from basic botany to building your own healing protocols.',
      price: 297,
      modules: ['Herbal medicine history', 'The 50 core herbs', 'Preparations & dosing', 'Contraindications & safety', 'Building your protocol', 'Sourcing & quality'],
      lessons: 48,
      instructor: 'Dr. Sarah Moonstone',
      duration: '8 weeks self-paced',
      level: 'beginner',
      createdAt: new Date()
    },
    {
      id: 'tier-2',
      title: 'Hermetic Sciences Mastery',
      description: 'Deep dive into hermetic philosophy, energy medicine, and advanced healing protocols. Includes monthly live group calls.',
      price: 997,
      modules: ['The 7 Hermetic Laws', 'Chakra alignment', 'Energy medicine', 'Advanced formulation', 'Mineral nutrition', 'Ocean medicine'],
      lessons: 60,
      instructor: 'Dr. Sarah Moonstone',
      duration: '12 weeks self-paced + monthly live calls',
      level: 'intermediate',
      createdAt: new Date()
    },
    {
      id: 'tier-3',
      title: 'Infinite Intelligence Transformation',
      description: '12 months of guided transformation including private coaching, business training, and AI Knowledge Vault access.',
      price: 2997,
      modules: ['All Tier 1 & 2 content', 'Herbal business accelerator', 'Private coaching sessions', 'AI Knowledge Vault', 'Retreat priority access'],
      lessons: 120,
      instructor: 'Dr. Sarah Moonstone',
      duration: '12 months',
      level: 'advanced',
      createdAt: new Date()
    }
  ]);

  console.log('✅ Seed complete — webinars and courses created');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
