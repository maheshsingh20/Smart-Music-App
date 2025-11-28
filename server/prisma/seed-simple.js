import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/musicdb';
const client = new MongoClient(url);

async function main() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('musicdb');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    try {
      await db.collection('User').insertOne({
        email: 'admin@music.app',
        password: adminPassword,
        displayName: 'Admin User',
        role: 'ADMIN',
        subscriptionTier: 'PREMIUM',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✓ Created admin user');
    } catch (e) {
      if (e.code === 11000) console.log('✓ Admin user already exists');
      else throw e;
    }

    // Create test users
    const userPassword = await bcrypt.hash('password123', 10);
    try {
      await db.collection('User').insertOne({
        email: 'user@test.com',
        password: userPassword,
        displayName: 'Test User',
        role: 'USER',
        subscriptionTier: 'FREE',
        avatar: 'https://ui-avatars.com/api/?name=Test+User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✓ Created test user');
    } catch (e) {
      if (e.code === 11000) console.log('✓ Test user already exists');
      else throw e;
    }

    try {
      await db.collection('User').insertOne({
        email: 'premium@test.com',
        password: userPassword,
        displayName: 'Premium User',
        role: 'USER',
        subscriptionTier: 'PREMIUM',
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        avatar: 'https://ui-avatars.com/api/?name=Premium+User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✓ Created premium user');
    } catch (e) {
      if (e.code === 11000) console.log('✓ Premium user already exists');
      else throw e;
    }

    // Create artists
    const artistNames = ['The Weeknd', 'Taylor Swift', 'Drake', 'Billie Eilish', 'Ed Sheeran'];
    const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz'];
    const artistIds = [];

    for (let i = 0; i < artistNames.length; i++) {
      const result = await db.collection('Artist').insertOne({
        name: artistNames[i],
        bio: `Biography of ${artistNames[i]}. A talented artist known for their unique style.`,
        image: `https://picsum.photos/seed/artist${i}/400/400`,
        genres: [genres[i]],
        verified: true,
        createdAt: new Date()
      });
      artistIds.push(result.insertedId);
    }
    console.log(`✓ Created ${artistIds.length} artists`);

    // Create albums
    const albumIds = [];
    for (let i = 0; i < 10; i++) {
      const result = await db.collection('Album').insertOne({
        title: `Album ${i + 1}`,
        cover: `https://picsum.photos/seed/album${i}/300/300`,
        releaseYear: 2020 + (i % 4),
        artistId: artistIds[i % artistIds.length],
        createdAt: new Date()
      });
      albumIds.push(result.insertedId);
    }
    console.log(`✓ Created ${albumIds.length} albums`);

    // Create songs
    const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic'];
    const songIds = [];

    for (let i = 0; i < 50; i++) {
      const result = await db.collection('Song').insertOne({
        title: `Song ${i + 1}`,
        duration: 180 + (i % 120),
        audioUrl: `https://example.com/audio/song-${i + 1}.mp3`,
        cover: albumIds[i % albumIds.length] ? (await db.collection('Album').findOne({ _id: albumIds[i % albumIds.length] })).cover : 'https://picsum.photos/300',
        genre: genres[i % genres.length],
        mood: moods[i % moods.length],
        playCount: Math.floor(Math.random() * 1000000),
        artistId: artistIds[i % artistIds.length],
        albumId: albumIds[i % albumIds.length],
        createdAt: new Date()
      });
      songIds.push(result.insertedId);
    }
    console.log(`✓ Created ${songIds.length} songs`);

    // Get test user
    const testUser = await db.collection('User').findOne({ email: 'user@test.com' });

    if (testUser && songIds.length > 0) {
      // Create sample playlist
      const playlistResult = await db.collection('Playlist').insertOne({
        name: 'My Favorites',
        description: 'A collection of my favorite songs',
        isPublic: true,
        userId: testUser._id,
        cover: 'https://picsum.photos/seed/playlist1/300/300',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✓ Created sample playlist');

      // Add songs to playlist
      for (let i = 0; i < Math.min(10, songIds.length); i++) {
        await db.collection('PlaylistSong').insertOne({
          playlistId: playlistResult.insertedId,
          songId: songIds[i],
          position: i + 1,
          addedAt: new Date()
        });
      }
      console.log('✓ Added songs to playlist');

      // Add liked songs
      for (let i = 0; i < Math.min(5, songIds.length); i++) {
        await db.collection('LikedSong').insertOne({
          userId: testUser._id,
          songId: songIds[i],
          likedAt: new Date()
        });
      }
      console.log('✓ Added liked songs');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDemo accounts:');
    console.log('  Admin: admin@music.app / admin123');
    console.log('  User: user@test.com / password123');
    console.log('  Premium: premium@test.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
