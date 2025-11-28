# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatar": "https://..."
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatar": "https://...",
    "role": "USER",
    "subscriptionTier": "FREE"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

### POST /auth/logout
Logout user and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:** `200 OK`

## Users

### GET /users/me
Get current user profile. **[Auth Required]**

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "avatar": "https://...",
  "role": "USER",
  "subscriptionTier": "PREMIUM",
  "subscriptionEnd": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PATCH /users/me
Update current user profile. **[Auth Required]**

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "avatar": "https://..."
}
```

**Response:** `200 OK`

### GET /users/me/playlists
Get user's playlists. **[Auth Required]**

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "My Playlist",
    "description": "Description",
    "cover": "https://...",
    "isPublic": true,
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "songs": [...]
  }
]
```

### GET /users/me/liked-songs
Get user's liked songs. **[Auth Required]**

**Response:** `200 OK`
```json
[
  {
    "id": "song-1",
    "title": "Song Title",
    "duration": 180,
    "audioUrl": "https://...",
    "cover": "https://...",
    "genre": "Pop",
    "mood": "Happy",
    "playCount": 1000000,
    "artistId": "artist-1",
    "albumId": "album-1"
  }
]
```

### POST /users/me/liked-songs/:songId
Like a song. **[Auth Required]**

**Response:** `201 Created`

### DELETE /users/me/liked-songs/:songId
Unlike a song. **[Auth Required]**

**Response:** `200 OK`

### GET /users/me/activity
Get user's recent activity. **[Auth Required]**

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "PLAYED_SONG",
    "metadata": { "songId": "song-1" },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /users/follow/artist/:artistId
Follow an artist. **[Auth Required]**

**Response:** `201 Created`

### DELETE /users/follow/artist/:artistId
Unfollow an artist. **[Auth Required]**

**Response:** `200 OK`

## Songs

### GET /songs
Get songs with optional filters.

**Query Parameters:**
- `genre` (optional): Filter by genre
- `limit` (optional): Number of results (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": "song-1",
    "title": "Song Title",
    "duration": 180,
    "audioUrl": "https://...",
    "cover": "https://...",
    "genre": "Pop",
    "mood": "Happy",
    "playCount": 1000000,
    "artistId": "artist-1",
    "albumId": "album-1"
  }
]
```

### GET /songs/:id
Get song by ID.

**Response:** `200 OK`

### GET /songs/:id/stream
Get streaming URL for a song. **[Auth Required]**

**Response:** `200 OK`
```json
{
  "url": "https://...",
  "quality": "320kbps",
  "expiresAt": "2024-01-01T01:00:00Z"
}
```

### POST /songs/:id/download
Download a song for offline playback. **[Auth Required, Premium Only]**

**Response:** `200 OK`
```json
{
  "downloadToken": "jwt_token",
  "expiresAt": "2024-01-31T00:00:00Z",
  "song": {...}
}
```

### GET /songs/recommendations/for-you
Get personalized recommendations. **[Auth Required]**

**Response:** `200 OK`
```json
{
  "dailyMix": [...],
  "discoverWeekly": [...],
  "becauseYouListened": [...]
}
```

## Playlists

### POST /playlists
Create a new playlist. **[Auth Required]**

**Request Body:**
```json
{
  "name": "My Playlist",
  "description": "Description",
  "isPublic": true
}
```

**Response:** `201 Created`

### GET /playlists/:id
Get playlist by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "My Playlist",
  "description": "Description",
  "cover": "https://...",
  "isPublic": true,
  "userId": "uuid",
  "user": {
    "id": "uuid",
    "displayName": "John Doe",
    "avatar": "https://..."
  },
  "songs": [
    {
      "id": "uuid",
      "position": 1,
      "song": {...}
    }
  ]
}
```

### PATCH /playlists/:id
Update playlist. **[Auth Required, Owner Only]**

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated Description",
  "isPublic": false
}
```

**Response:** `200 OK`

### DELETE /playlists/:id
Delete playlist. **[Auth Required, Owner Only]**

**Response:** `200 OK`

### POST /playlists/:id/songs
Add song to playlist. **[Auth Required, Owner Only]**

**Request Body:**
```json
{
  "songId": "song-1"
}
```

**Response:** `201 Created`

### DELETE /playlists/:id/songs/:songId
Remove song from playlist. **[Auth Required, Owner Only]**

**Response:** `200 OK`

### PUT /playlists/:id/reorder
Reorder songs in playlist. **[Auth Required, Owner Only]**

**Request Body:**
```json
{
  "songIds": ["song-3", "song-1", "song-2"]
}
```

**Response:** `200 OK`

## Artists

### GET /artists/:id
Get artist by ID.

**Response:** `200 OK`
```json
{
  "id": "artist-1",
  "name": "Artist Name",
  "bio": "Biography",
  "image": "https://...",
  "genres": ["Pop", "Rock"],
  "verified": true,
  "topTracks": [...],
  "albums": [...],
  "relatedArtists": [...]
}
```

### GET /artists/:id/albums
Get artist's albums.

**Response:** `200 OK`

### GET /artists/:id/top-tracks
Get artist's top tracks.

**Response:** `200 OK`

### GET /artists/:id/related
Get related artists.

**Response:** `200 OK`

## Search

### GET /search
Search for songs with filters.

**Query Parameters:**
- `q` (required): Search query
- `genre` (optional): Filter by genre
- `year` (optional): Filter by release year
- `mood` (optional): Filter by mood
- `artistId` (optional): Filter by artist
- `limit` (optional): Number of results (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": "song-1",
    "title": "Song Title",
    ...
  }
]
```

### GET /search/suggestions
Get instant search suggestions.

**Query Parameters:**
- `q` (required): Search query (min 2 characters)

**Response:** `200 OK`
```json
[
  {
    "id": "song-1",
    "title": "Song Title",
    "artist": "artist-1",
    "type": "song"
  }
]
```

## Subscriptions

### POST /subscriptions/create-checkout-session
Create Stripe checkout session. **[Auth Required]**

**Request Body:**
```json
{
  "tier": "PREMIUM"
}
```

**Response:** `200 OK`
```json
{
  "id": "cs_mock_...",
  "url": "https://checkout.stripe.com/...",
  "customer": "uuid",
  "mode": "subscription"
}
```

### POST /subscriptions/webhook
Stripe webhook handler.

**Response:** `200 OK`

### POST /subscriptions/cancel
Cancel subscription. **[Auth Required]**

**Response:** `200 OK`

## Admin

All admin endpoints require admin role.

### GET /admin/users
Get all users. **[Auth Required, Admin Only]**

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER",
    "subscriptionTier": "FREE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### PATCH /admin/users/:id
Update user. **[Auth Required, Admin Only]**

**Request Body:**
```json
{
  "role": "ADMIN",
  "subscriptionTier": "PREMIUM"
}
```

**Response:** `200 OK`

### DELETE /admin/users/:id
Delete user. **[Auth Required, Admin Only]**

**Response:** `200 OK`

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message",
  "details": {...}
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes

## Caching

- **Songs**: 5 minutes
- **Artists**: 10 minutes
- **Search results**: 3 minutes
- **Suggestions**: 3 minutes
