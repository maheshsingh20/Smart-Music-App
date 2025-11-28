import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  try {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@music.app',
        password: adminPassword,
        displayName: 'Admin User',
        role: 'ADMIN',
        subscriptionTier: 'PREMIUM',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User'
      }
    });
    console.log('Created admin user:', admin.email);
  } catch (e) {
    console.log('Admin user already exists');
  }

  // Create test users
  const userPassword = await bcrypt.hash('password123', 10);
  let user1;
  try {
    user1 = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: userPassword,
        displayName: 'Test User',
        subscriptionTier: 'FREE',
        avatar: 'https://ui-avatars.com/api/?name=Test+User'
      }
    });
    console.log('Created test user:', user1.email);
  } catch (e) {
    console.log('Test user already exists');
    user1 = await prisma.user.findUnique({ where: { email: 'user@test.com' } });
  }

  try {
    const premiumUser = await prisma.user.create({
      data: {
        email: 'premium@test.com',
        password: userPassword,
        displayName: 'Premium User',
        subscriptionTier: 'PREMIUM',
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        avatar: 'https://ui-avatars.com/api/?name=Premium+User'
      }
    });
    console.log('Created premium user:', premiumUser.email);
  } catch (e) {
    console.log('Premium user already exists');
  }

  // Create artists
  const artists = [];
  const artistNames = ['The Weeknd', 'Taylor Swift', 'Drake', 'Billie Eilish', 'Ed Sheeran'];
  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz'];

  for (let i = 0; i < artistNames.length; i++) {
    try {
      const artist = await prisma.artist.create({
        data: {
          name: artistNames[i],
          bio: `Biography of ${artistNames[i]}. A talented artist known for their unique style.`,
          image: `https://picsum.photos/seed/artist${i}/400/400`,
          genres: [genres[i]],
          verified: true
        }
      });
      artists.push(artist);
      console.log(`Created artist: ${artist.name}`);
    } catch (e) {
      console.log(`Error creating artist ${artistNames[i]}:`, e.message);
      const existing = await prisma.artist.findFirst({ where: { name: artistNames[i] } });
      if (existing) {
        artists.push(existing);
        console.log(`Found existing artist: ${existing.name}`);
      }
    }
  }

  console.log(`Created/found ${artists.length} artists`);

  // Create albums
  const albums = [];
  for (let i = 0; i < 10; i++) {
    try {
      const album = await prisma.album.create({
        data: {
          title: `Album ${i + 1}`,
          cover: `https://picsum.photos/seed/album${i}/300/300`,
          releaseYear: 2020 + (i % 4),
          artistId: artists[i % artists.length].id
        }
      });
      albums.push(album);
    } catch (e) {
      const existing = await prisma.album.findFirst({ where: { title: `Album ${i + 1}` } });
      if (existing) albums.push(existing);
    }
  }

  console.log(`Created/found ${albums.length} albums`);

  // Create songs
  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic'];
  const songs = [];

  for (let i = 0; i < 50; i++) {
    try {
      const song = await prisma.song.create({
        data: {
          title: `Song ${i + 1}`,
          duration: 180 + (i % 120),
          audioUrl: `https://example.com/audio/song-${i + 1}.mp3`,
          cover: albums[i % albums.length].cover,
          genre: genres[i % genres.length],
          mood: moods[i % moods.length],
          playCount: Math.floor(Math.random() * 1000000),
          artistId: artists[i % artists.length].id,
          albumId: albums[i % albums.length].id
        }
      });
      songs.push(song);
    } catch (e) {
      const existing = await prisma.song.findFirst({ where: { title: `Song ${i + 1}` } });
      if (existing) songs.push(existing);
    }
  }

  console.log(`Created/found ${songs.length} songs`);

  // Create sample playlist for test user
  if (user1) {
    try {
      const playlist = await prisma.playlist.create({
        data: {
          name: 'My Favorites',
          description: 'A collection of my favorite songs',
          isPublic: true,
          userId: user1.id,
          cover: 'https://picsum.photos/seed/playlist1/300/300'
        }
      });

      // Add songs to playlist
      for (let i = 0; i < Math.min(10, songs.length); i++) {
        try {
          await prisma.playlistSong.create({
            data: {
              playlistId: playlist.id,
              songId: songs[i].id,
              position: i + 1
            }
          });
        } catch (e) {
          // Song already in playlist
        }
      }

      console.log('Created sample playlist');
    } catch (e) {
      console.log('Sample playlist already exists');
    }

    // Add liked songs for test user
    for (let i = 0; i < Math.min(5, songs.length); i++) {
      try {
        await prisma.likedSong.create({
          data: {
            userId: user1.id,
            songId: songs[i].id
          }
        });
      } catch (e) {
        // Song already liked
      }
    }

    console.log('Added liked songs');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
