# 🎵 Spotify Playlist Organizer 🎶

A **Vite + React + TypeScript** project that allows users to organize their Spotify playlists by creating multiple sub-playlists and categorizing tracks with a **drag-and-drop** feature. 🎧

<img src="https://raw.githubusercontent.com/vrobbin3247/hosted-media/main/spotify/spotify_organiser_playlist_sorting.gif" width="80%" alt="working" />

## 🚀 Features
- **🔑 Spotify Authentication**: Log in using your Spotify account.
- **📂 Access & Modify Playlists**: Fetch user playlists and reorganize them.
- **🎼 Create Sub-Playlists**: Create up to 4 new playlists from an existing one.
- **🖱️ Drag & Drop Tracks**: Move tracks from the original playlist to the newly created playlists.
- **💻 Responsive UI**: Styled with **Tailwind CSS** for a clean and intuitive design.

## 🛠️ Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Authentication & API**: Spotify Web API

## 📦 Installation

### Prerequisites
- **📌 Node.js** (>= 16.0)
- **🔑 Spotify Developer Account**
- **🛠️ Spotify API Client ID & Secret**

### Steps
1. **📥 Clone the repository**
   ```sh
   git clone https://github.com/yourusername/spotify-playlist-organizer.git
   cd spotify-playlist-organizer
   ```

2. **📌 Install dependencies**
   ```sh
   npm install
   ```

3. **📝 Set up environment variables**
   Create a `.env` file in the root directory and add:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```

4. **▶️ Run the development server**
   ```sh
   npm run dev
   ```

## 🎯 Usage
1. **🔑 Log in** using your Spotify account.
2. **🎵 Select a playlist** to organize.
3. **➕ Create up to 4 sub-playlists.**
4. **🖱️ Drag and drop** tracks from the original playlist to the sub-playlists.
5. **💾 Save** the newly organized playlists to Spotify.

## 📜 License
📝 MIT License

## 🙌 Acknowledgments
- **🎶 Spotify Web API** for authentication and playlist management.
- **⚡ Vite, React, and Tailwind** for a fast and smooth development experience.

## 🤝 Contributing
Feel free to submit pull requests or report issues! 🚀

---
Happy organizing! 🎧🎵

