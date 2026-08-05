# 🚀 YT Downloader Pro

A modern, high-performance, full-featured **YouTube Video & Audio Downloader** web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **`@ybd-project/ytdl-core`**.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

##🔥Features...

- **📺 Multi-Resolution Video Downloads**: Download videos in **1080p Full HD**, **720p HD**, **480p SD**, and **360p** resolutions.
- **🎵 YouTube to MP3 Audio**: Extract high-quality MP3 / M4A audio files from podcasts, music videos, and songs.
- **📊 Real-time Live Progress Bar**: Client-side stream reading engine with live percentage download tracking (`0%` -> `100%`).
- **🎬 Built-in Video Preview Player**: Watch and preview YouTube videos right inside the app before downloading.
- **🛡️ Advanced Deciphering Engine**: Powered by `@ybd-project/ytdl-core` with active Android/Web player client deciphering to prevent 403 Forbidden errors.
- **💎 Premium Glassmorphism UI**: Sleek dark mode design with glowing crimson accents, responsive layouts, paste buttons, and interactive FAQ accordions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Download Engine**: [`@ybd-project/ytdl-core`](https://github.com/ybd-project/ytdl-core)

---

## 📁 Project Structure

```
YT-downloder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── info/route.ts        # Fetches YouTube metadata, thumbnails & formats
│   │   │   └── download/route.ts    # Streams video/audio downloads with Range request support
│   │   ├── globals.css              # Glassmorphism & dark UI tokens
│   │   ├── layout.tsx               # Root HTML & typography
│   │   └── page.tsx                 # Main application page
│   ├── components/
│   │   ├── Navbar.tsx               # Header with logo & links
│   │   ├── HeroSearch.tsx           # Search input bar with Paste button
│   │   ├── VideoCard.tsx            # Video details & embed player modal
│   │   ├── FormatSelector.tsx       # Resolution selector dropdown & live progress engine
│   │   ├── Features.tsx             # Highlights grid
│   │   ├── HowItWorks.tsx           # 3-step usage guide
│   │   ├── FAQ.tsx                  # FAQ accordion
│   │   └── Footer.tsx               # Footer & copyright info
│   ├── lib/
│   │   └── youtube.ts               # Video ID parser & duration formatters
│   └── types/
│       └── youtube.ts               # TypeScript interfaces
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js 18+** and **npm** installed on your system.

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GalibDev/YT-downloder.git
   cd YT-downloder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🌐 API Reference

### 1. Get Video Information
`GET /api/info?url=<YOUTUBE_URL>`

Returns video details, channel title, duration, view count, thumbnails, and available format resolutions.

### 2. Stream & Download Video / Audio
`GET /api/download?v=<VIDEO_ID>&itag=<ITAG>&title=<CUSTOM_TITLE>`

Streams binary video or audio data directly to the browser with custom `Content-Disposition` filenames.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/GalibDev/YT-downloder/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> [!NOTE]
> This application is built for educational and personal media archival purposes. Please respect YouTube's Terms of Service and content creators' copyright rights.
05-08-2026 
