import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/musicdb';
const client = new MongoClient(url);

async function clearDummyData() {
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db('musicdb');

    // Keep users but clear music data
    console.log('\nClearing dummy music data...');

    const collections = [
      'Song',
      'Artist',
      'Album',
      'PlaylistSong',
      'LikedSong',
      'Follow',
      'Activity',
      'Download'
    ];

    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`✓ Cleared ${result.deletedCount} documents from ${collectionName}`);
    }

    // Also clear playlists (but keep user accounts)
    const playlistResult = await db.collection('Playlist').deleteMany({});
    console.log(`✓ Cleared ${playlistResult.deletedCount} playlists`);

    console.log('\n✅ Dummy data cleared!');
    console.log('\nYour user accounts are preserved:');
    console.log('  - admin@music.app / admin123');
    console.log('  - user@test.com / password123');
    console.log('  - premium@test.com / password123');
    console.log('\n🎵 Now using real Spotify data for music!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

clearDummyData();
