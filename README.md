# 🎵 Smart Music App

A modern, AI-powered music streaming application built with React, Node.js, Express, and MongoDB. Features intelligent recommendations, mood-based playlists, and a beautiful user interface.

![Music App](https://img.shields.io/badge/Music-Streaming-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)

## ✨ Features

### 🎯 Core Features
- **Music Streaming**: High-quality audio playback with Jamendo/Spotify integration
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Playlist Management**: Create, edit, and manage custom playlists
- **Liked Songs**: Save and organize your favorite tracks
- **Search**: Fast and accurate song, artist, and album search
- **Queue Management**: Smart queue with shuffle and repeat modes

### 🤖 AI-Powered Features
- **Mood-Based Recommendations**: 8 mood categories (Happy, Sad, Energetic, Chill, Romantic, Focus, Workout, Party)
- **Personalized Daily Mix**: AI-curated playlists based on listening history
- **Discover Weekly**: Smart recommendations for new music discovery
- **Trending Songs**: Real-time trending tracks based on play counts
- **Similar Songs**: Find music similar to any track
- **AI Radio**: Endless stream of similar music from any seed song

### 🎨 User Experience
- **Modern UI**: Beautiful dark theme with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant UI updates with React Query
- **Persistent Playback**: Resume where you left off
- **Loading Indicators**: Clear feedback during operations
- **Error Handling**: Graceful error handling and fallbacks

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Music Providers
- **Jamendo** - Free music API (default)
- **Spotify** - Premium music streaming (optional)

## 📋 Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- npm or yarn package manager
- Jamendo API credentials (or Spotify API credentials)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/maheshsingh20/Smart-Music-App.git
cd Smart-Music-App
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server Environment (.env)
Create `server/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/music-app

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Music Provider (jamendo or spotify)
MUSIC_PROVIDER=jamendo

# Jamendo API
JAMENDO_CLIENT_ID=your-jamendo-client-id

# Spotify API (optional)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Client Environment (.env)
Create `client/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Start MongoDB:
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

The database will be automatically initialized on first run.

### 5. Get API Credentials

#### Jamendo (Free - Recommended for Development)
1. Visit [Jamendo Developer Portal](https://devportal.jamendo.com/)
2. Create an account and register your app
3. Copy your Client ID to `server/.env`

#### Spotify (Optional)
1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Copy Client ID and Client Secret to `server/.env`

## 🎮 Running the Application

### Development Mode

#### Option 1: Run both servers separately
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm run dev
```

#### Option 2: Run from root (if configured)
```bash
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
Smart-Music-App/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── providers/     # Music provider integrations
│   │   ├── db/            # Database configuration
│   │   └── index.js       # Server entry point
│   └── package.json
│
├── docs/                  # Documentation
├── README.md
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update user profile
- `GET /api/users/me/playlists` - Get user playlists
- `GET /api/users/me/liked-songs` - Get liked songs
- `POST /api/users/me/liked-songs/:songId` - Like a song
- `DELETE /api/users/me/liked-songs/:songId` - Unlike a song

### Songs
- `GET /api/songs` - Get songs (with filters)
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/:id/stream` - Get stream URL
- `GET /api/songs/recommendations/for-you` - Get recommendations

### AI Features
- `GET /api/ai/recommendations` - Get personalized recommendations
- `GET /api/ai/mood/:mood` - Get mood-based songs
- `GET /api/ai/similar/:songId` - Get similar songs
- `GET /api/ai/trending` - Get trending songs
- `GET /api/ai/radio/:songId` - Get AI radio station

### Playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist
- `PATCH /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song

### Search
- `GET /api/search?q=query` - Search songs, artists, albums
- `GET /api/search/suggestions?q=query` - Get search suggestions

## 🎨 Features in Detail

### Mood-Based Recommendations
Select from 8 different moods to get perfectly matched music:
- 😊 Happy - Upbeat, positive vibes
- 😢 Sad - Melancholic, emotional tracks
- ⚡ Energetic - High-energy, pumping beats
- 😌 Chill - Relaxed, ambient sounds
- 💕 Romantic - Love songs and ballads
- 🎯 Focus - Concentration-friendly music
- 💪 Workout - Motivating gym tracks
- 🎉 Party - Dance and celebration music

### Player Features
- Play/Pause control
- Next/Previous track
- Shuffle mode
- Repeat modes (Off/All/One)
- Forward 10 seconds
- Volume control
- Progress bar with seeking
- Queue management
- Persistent playback state

### Smart Queue
- Add songs to queue
- Reorder queue
- Shuffle with smart algorithm
- Repeat modes
- Auto-play next song
- Queue persistence

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Refresh token rotation
- HTTP-only cookies (optional)
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Update MongoDB connection string
3. Deploy using platform CLI or Git integration

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables
4. Configure redirects for SPA

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Mahesh Singh**
- GitHub: [@maheshsingh20](https://github.com/maheshsingh20)

## 🙏 Acknowledgments

- [Jamendo](https://www.jamendo.com/) - Free music API
- [Spotify](https://www.spotify.com/) - Music streaming service
- [React](https://reactjs.org/) - UI framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database

## 📞 Support

For support, email maheshsingh20@example.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Social features (follow users, share playlists)
- [ ] Lyrics integration
- [ ] Podcast support
- [ ] Offline mode
- [ ] Mobile apps (React Native)
- [ ] Voice commands
- [ ] Collaborative playlists
- [ ] Music visualization
- [ ] Advanced analytics
- [ ] Premium subscription tiers

---

Made with ❤️ by Mahesh Singh
