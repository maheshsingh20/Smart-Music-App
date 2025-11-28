# Testing Documentation

## Test Strategy

### Unit Tests
Test individual functions and components in isolation.

### Integration Tests
Test API endpoints and database interactions.

### E2E Tests
Test complete user workflows from UI to database.

## Server Tests

### Authentication Tests

```javascript
// server/tests/auth.test.js
import request from 'supertest';
import app from '../src/index.js';

describe('Authentication', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          displayName: 'Test User'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: loginRes.body.refreshToken
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });
});
```

### Song Tests

```javascript
// server/tests/songs.test.js
describe('Songs', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123'
      });
    authToken = res.body.accessToken;
  });

  describe('GET /api/songs', () => {
    it('should return list of songs', async () => {
      const res = await request(app).get('/api/songs');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter by genre', async () => {
      const res = await request(app)
        .get('/api/songs')
        .query({ genre: 'Pop' });
      
      expect(res.status).toBe(200);
      res.body.forEach(song => {
        expect(song.genre).toBe('Pop');
      });
    });
  });

  describe('GET /api/songs/:id/stream', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/songs/song-1/stream');
      
      expect(res.status).toBe(401);
    });

    it('should return stream URL for authenticated user', async () => {
      const res = await request(app)
        .get('/api/songs/song-1/stream')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('url');
      expect(res.body).toHaveProperty('quality');
    });
  });

  describe('POST /api/songs/:id/download', () => {
    it('should require premium subscription', async () => {
      const res = await request(app)
        .post('/api/songs/song-1/download')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(403);
    });
  });
});
```

### Playlist Tests

```javascript
// server/tests/playlists.test.js
describe('Playlists', () => {
  let authToken;
  let playlistId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123'
      });
    authToken = res.body.accessToken;
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      const res = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Playlist',
          description: 'Test Description',
          isPublic: true
        });
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Playlist');
      playlistId = res.body.id;
    });
  });

  describe('POST /api/playlists/:id/songs', () => {
    it('should add song to playlist', async () => {
      const res = await request(app)
        .post(`/api/playlists/${playlistId}/songs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ songId: 'song-1' });
      
      expect(res.status).toBe(201);
    });

    it('should not allow duplicate songs', async () => {
      const res = await request(app)
        .post(`/api/playlists/${playlistId}/songs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ songId: 'song-1' });
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/playlists/:id/reorder', () => {
    it('should reorder playlist songs', async () => {
      const res = await request(app)
        .put(`/api/playlists/${playlistId}/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ songIds: ['song-2', 'song-1'] });
      
      expect(res.status).toBe(200);
    });
  });
});
```

## Client Tests

### Component Tests

```javascript
// client/src/components/__tests__/SongCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import SongCard from '../SongCard';

const queryClient = new QueryClient();

const mockSong = {
  id: 'song-1',
  title: 'Test Song',
  cover: 'https://example.com/cover.jpg',
  duration: 180,
  artistId: 'artist-1'
};

describe('SongCard', () => {
  it('renders song information', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongCard song={mockSong} />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByAltText('Test Song')).toBeInTheDocument();
  });

  it('shows play button on hover', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongCard song={mockSong} />
      </QueryClientProvider>
    );
    
    const card = screen.getByText('Test Song').closest('.card');
    fireEvent.mouseEnter(card);
    
    expect(screen.getByLabelText('Play')).toBeVisible();
  });

  it('calls play handler when clicked', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SongCard song={mockSong} />
      </QueryClientProvider>
    );
    
    const card = container.querySelector('.card');
    fireEvent.click(card);
    
    // Verify player store was updated
    // (requires mocking the store)
  });
});
```

### Hook Tests

```javascript
// client/src/hooks/__tests__/usePlayer.test.js
import { renderHook, act } from '@testing-library/react';
import { usePlayerStore } from '../../store/playerStore';

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentSong: null,
      queue: [],
      isPlaying: false
    });
  });

  it('sets current song', () => {
    const { result } = renderHook(() => usePlayerStore());
    const song = { id: 'song-1', title: 'Test Song' };
    
    act(() => {
      result.current.setCurrentSong(song);
    });
    
    expect(result.current.currentSong).toEqual(song);
    expect(result.current.isPlaying).toBe(true);
  });

  it('toggles play state', () => {
    const { result } = renderHook(() => usePlayerStore());
    
    act(() => {
      result.current.togglePlay();
    });
    
    expect(result.current.isPlaying).toBe(true);
    
    act(() => {
      result.current.togglePlay();
    });
    
    expect(result.current.isPlaying).toBe(false);
  });

  it('manages queue', () => {
    const { result } = renderHook(() => usePlayerStore());
    const songs = [
      { id: 'song-1', title: 'Song 1' },
      { id: 'song-2', title: 'Song 2' }
    ];
    
    act(() => {
      result.current.setQueue(songs, 0);
    });
    
    expect(result.current.queue).toEqual(songs);
    expect(result.current.currentSong).toEqual(songs[0]);
    
    act(() => {
      result.current.playNext();
    });
    
    expect(result.current.currentSong).toEqual(songs[1]);
  });
});
```

## E2E Test Plan

### User Registration Flow
1. Navigate to signup page
2. Fill in registration form
3. Submit form
4. Verify redirect to home page
5. Verify user is authenticated

### Music Playback Flow
1. Login as user
2. Navigate to home page
3. Click on a song card
4. Verify player bar appears
5. Verify song is playing
6. Test play/pause button
7. Test skip buttons
8. Test volume control

### Playlist Management Flow
1. Login as user
2. Navigate to library
3. Click "Create Playlist"
4. Enter playlist name
5. Verify playlist is created
6. Search for a song
7. Add song to playlist
8. Navigate to playlist
9. Verify song appears
10. Reorder songs
11. Remove song
12. Delete playlist

### Search Flow
1. Navigate to search page
2. Enter search query
3. Verify instant suggestions appear
4. Apply filters (genre, year, mood)
5. Verify results are filtered
6. Click on a result
7. Verify correct page opens

### Subscription Flow
1. Login as free user
2. Navigate to subscription page
3. Click "Upgrade to Premium"
4. Verify redirect to checkout (mock)
5. Complete checkout (mock)
6. Verify subscription updated
7. Test premium features (download)
8. Cancel subscription
9. Verify downgrade to free

### Admin Flow
1. Login as admin
2. Navigate to admin panel
3. View user list
4. Update user role
5. Update subscription tier
6. Delete user
7. Verify changes persist

## Running Tests

### Server Tests
```bash
cd server
npm test
```

### Client Tests
```bash
cd client
npm test
```

### Coverage Report
```bash
npm run test:coverage
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run server tests
        run: cd server && npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run client tests
        run: cd client && npm test
```

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Component Tests**: All interactive components
