import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true,
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'user123',
    isAdmin: false,
  },
];

const sampleProducts = [
  {
    name: 'Aura Mechanical Keyboard',
    description: 'Sleek tenkeyless mechanical keyboard featuring premium double-shot PBT keycaps, hot-swappable linear switches, and customizable RGB lighting backplate.',
    price: 129.99,
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600',
    category: 'Electronics',
    stock: 20,
  },
  {
    name: 'Minimalist Desk Mat',
    description: 'Spacious desk mat made from organic premium felt wool with a non-slip rubberized cork backing. Protects your workspace and provides smooth tracking.',
    price: 34.50,
    imageUrl: 'https://images.unsplash.com/photo-1632292224971-0d45778bd364?q=80&w=600',
    category: 'Office',
    stock: 55,
  },
  {
    name: 'ANC Wireless Headphones',
    description: 'Wireless over-ear headphones featuring adaptive active noise cancellation, high-fidelity sound engineering, and up to 40 hours of continuous battery life.',
    price: 299.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
    category: 'Electronics',
    stock: 12,
  },
  {
    name: 'Slim Leather Wallet',
    description: 'Minimalist cardholder wallet crafted from premium full-grain vegetable-tanned leather. Holds up to 8 cards and folded bills in a slim outline.',
    price: 49.00,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600',
    category: 'Accessories',
    stock: 30,
  },
  {
    name: 'Smart RGB Lightbar',
    description: 'Ambient desk lighting bars with smart home assistant voice controls. Syncs dynamically with gaming audio, movies, or customized timers.',
    price: 79.99,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600',
    category: 'Electronics',
    stock: 18,
  },
];

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection active for seeding...');

    // Clear old data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing User, Product, and Order tables.');

    // Seed users (passwords will be hashed by User schema's pre-save middleware)
    const createdUsers = await User.create(sampleUsers);
    console.log(`Successfully seeded ${createdUsers.length} users.`);

    // Seed products
    const createdProducts = await Product.create(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} products.`);

    console.log('Database seeding complete! Ready for testing.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
