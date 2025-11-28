import { MongoClient, ObjectId } from 'mongodb';

const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/musicdb';
let client;
let db;

export async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db('musicdb');
    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}

export { ObjectId };
