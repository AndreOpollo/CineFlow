# 🎬 CineFlow

A high-performance, **offline-first** mobile streaming application for movies and TV shows, built with React Native (Expo) and TypeScript.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🎯 Core Functionality
- **🏠 Home Screen** - Hero carousel with trending movies, latest releases, and TV shows
- **🔍 Advanced Search** - Real-time search with filters (genre, year, rating)
- **📖 Details Page** - Rich metadata, cast information, trailers, and similar content
- **▶️ Video Player** - Fullscreen landscape playback via Vidsrc
- **💾 Watchlist** - Save content for later with persistent storage
- **📊 Watch History** - Automatic tracking of viewed content

### 🚀 Technical Highlights
- **⚡ Offline-First Architecture** - Instant app launch with local SQLite caching
- **🔄 Smart Caching** - Automatic background refresh with configurable intervals
- **📱 Cross-Platform** - Single codebase for iOS and Android
- **🎨 Netflix-Style UI** - Modern, polished interface with smooth animations
- **🔒 Type-Safe** - Full TypeScript implementation with strict typing
- **📦 Zero Dependencies** - No external databases or backend required

---

## 🏗️ Architecture

### Offline-First Design

CineFlow implements a **cache-first, network-second** strategy for optimal performance:

```
User Opens App
    ↓
Load from SQLite Cache (1-5ms) ✅ INSTANT UI
    ↓
Check if Cache is Stale
    ↓
Background API Refresh (if needed)
    ↓
Update Cache & UI
```

**Benefits:**
- ✅ **Instant startup** - No loading spinners on subsequent launches
- ✅ **Works offline** - Full functionality without internet after initial load
- ✅ **Reduced API calls** - Smart caching minimizes TMDB quota usage
- ✅ **Better UX** - Smooth, responsive experience even on slow connections

### Cache Refresh Intervals
- **Trending Movies**: 6 hours (high priority)
- **Latest Movies/TV**: 12 hours (medium priority)
- **Content Details**: 7 days (low priority, rarely changes)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native (Expo) | Cross-platform mobile development |
| **Language** | TypeScript | Type safety and developer experience |
| **Navigation** | Expo Router | File-based routing |
| **Database** | SQLite (expo-sqlite) | Local persistent storage |
| **API** | TMDB API + Vidsrc | Metadata + video streaming |
| **Styling** | StyleSheet API | Native performance |
| **Icons** | Lucide React Native | Modern icon system |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cineflow.git
   cd cineflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device**
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go app
   - **Web**: Press `w` (limited functionality)

---

## 🗂️ Project Structure

```
cineflow/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── search.tsx           # Search & filters
│   │   └── watchlist.tsx        # Saved content
│   ├── details/[type]/[id].tsx  # Movie/TV details
│   ├── player.tsx               # Video player
│   └── _layout.tsx              # Root layout
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── MovieCard.tsx
│   │   ├── HeroCarousel.tsx
│   │   ├── HorizontalShelf.tsx
│   │   ├── FilterModal.tsx
│   │   └── ...
│   ├── constants/
│   │   └── theme.ts             # Design system tokens
│   ├── db/
│   │   ├── client.ts            # SQLite connection
│   │   ├── init.ts              # Schema initialization
│   │   └── schema.ts            # TypeScript interfaces
│   └── services/
│       ├── database.ts          # Database operations
│       ├── tmdb.ts              # TMDB API client
│       ├── vidsrc.ts            # Vidsrc API client
│       └── content.ts           # Combined service layer
└── package.json
```

---

## 🎨 Design System

### Color Palette
```typescript
Primary Red:     #E50914  // Netflix-inspired accent
Background:      #141414  // OLED-optimized dark
Surface:         #1F1F1F  // Card backgrounds
Text Primary:    #FFFFFF
Text Secondary:  #B3B3B3
```

### Spacing Scale
```typescript
xs:  4px   // Tight spacing
sm:  8px   // Compact layouts
md:  16px  // Default padding
lg:  24px  // Section spacing
xl:  32px  // Large gaps
```

### Typography
- **Hero**: 32px / Bold - Main titles
- **H1**: 28px / Bold - Page headers
- **Body**: 16px / Regular - Main content
- **Caption**: 14px / Regular - Metadata

---

## 📊 Database Schema

### Tables

**`trending_movies`** - Cached trending content
```sql
CREATE TABLE trending_movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  vote_average REAL,
  cached_at INTEGER
);
```

**`latest_movies`** - Now playing movies
**`latest_tv_shows`** - Currently airing TV shows
**`content_details`** - Full metadata (JSON)
**`watchlist`** - User's saved content
**`watch_history`** - Viewing history

*See `src/db/schema.ts` for complete schema definitions.*

---

## 🔌 API Integration

### TMDB API
- **Base URL**: `https://api.themoviedb.org/3`
- **Rate Limit**: 40 requests/10 seconds
- **Endpoints Used**:
  - `/trending/movie/day` - Trending content
  - `/movie/now_playing` - Latest movies
  - `/tv/on_the_air` - Latest TV shows
  - `/movie/{id}` - Movie details
  - `/tv/{id}` - TV show details
  - `/search/multi` - Multi-search

### Vidsrc API
- **Base URL**: `https://vidsrc-embed.ru`
- **Endpoints**:
  - `/movies/latest/page-{N}.json` - Latest movies
  - `/tvshows/latest/page-{N}.json` - Latest TV shows
- **Embed Player**: `https://vidsrc.me/embed/{type}?tmdb={id}`

---

## 🚀 Performance Optimizations

1. **Image Caching**
   - Uses TMDB CDN with optimized sizes (w342, w780)
   - Expo Image for automatic caching

2. **List Virtualization**
   - FlatList with `windowSize={5}` for efficient rendering
   - `removeClippedSubviews` for memory optimization

3. **Database Indexes**
   - Indexed lookups on `tmdb_id`, `added_at`, `cached_at`
   - Fast queries (<1ms) for all operations

4. **Smart Refresh**
   - Only fetches stale content
   - Parallel API requests with chunking
   - Background updates don't block UI

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Fresh install initializes database
- [ ] Home screen loads cached data instantly
- [ ] Pull-to-refresh updates content
- [ ] Search returns results with filters
- [ ] Movie/TV details page displays correctly
- [ ] Play button opens video player in landscape
- [ ] Watchlist add/remove works
- [ ] App works offline after initial load
- [ ] Video playback works smoothly

### Running on Physical Device
```bash
# iOS (requires Xcode)
npx expo run:ios

# Android
npx expo run:android

# Production build
eas build --platform all
```

---

## 📱 Screenshots


<img width="300" alt="Screenshot_20260119_092931" src="https://github.com/user-attachments/assets/f4792750-9aab-4c75-896f-6e7f2ff68313" />
<img width="300" alt="Screenshot_20260119_092955" src="https://github.com/user-attachments/assets/04593040-9f31-412a-983e-fed440d90be9" />
<img width="300" alt="Screenshot_20260119_093106" src="https://github.com/user-attachments/assets/620d00df-fb4b-4b14-9dcb-bcd6c25cf718" />
<img width="300" alt="Screenshot_20260119_093154" src="https://github.com/user-attachments/assets/1d1f8fbe-5cad-4e5c-b674-fe7b38034270" />
<img width="300" alt="Screenshot_20260119_093535" src="https://github.com/user-attachments/assets/dd0008e3-acda-4a27-a6d2-1a2e2b5ace94" />



---

## 🛣️ Roadmap

### Completed ✅
- [x] Offline-first architecture
- [x] Home screen with trending carousel
- [x] Search with advanced filters
- [x] Details page with metadata
- [x] Video player (landscape mode)
- [x] Watchlist functionality
- [x] Watch history tracking

### Future Enhancements 🚧
- [ ] User authentication
- [ ] Multi-profile support
- [ ] Download for offline viewing
- [ ] Chromecast support
- [ ] Resume playback from last position
- [ ] Recommendations algorithm
- [ ] Social features (ratings, reviews)
- [ ] Dark/Light theme toggle
- [ ] Multiple language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[TMDB](https://www.themoviedb.org/)** - Movie and TV show metadata
- **[Vidsrc](https://vidsrc.me/)** - Video streaming service
- **[Expo](https://expo.dev/)** - React Native framework
- **[Lucide](https://lucide.dev/)** - Icon library
- **Design Inspiration**: Netflix, Disney+, HBO Max

---

## 📞 Contact

**Your Name** - [@yourhandle](https://twitter.com/yourhandle)

Project Link: [https://github.com/yourusername/cineflow](https://github.com/yourusername/cineflow)

---

## ⚠️ Disclaimer

This project is for educational purposes only. All content metadata is provided by TMDB API. Video streaming is handled by third-party services. Please ensure you have the right to access and stream content in your region.

---

**Built with ❤️ using React Native & TypeScript**

*CineFlow - Your Movies, Anywhere, Anytime* 🎬
