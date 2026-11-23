# KaelNime - Anime Streaming Application

A modern, minimalist anime streaming web application built with Next.js 16 and styled with a black & white theme inspired by shadcn/ui design principles.

## Features

- 🎯 **Top 10 Anime** - Curated list of the most popular anime
- 🔍 **Search Functionality** - Find your favorite anime quickly
- 📺 **Multiple Quality Options** - Choose from 360p to 1080p
- 🎬 **Multiple Servers** - Alternative servers for better streaming experience
- 📥 **Download Links** - Download episodes in various formats (MKV, MP4, x265)
- 🎨 **Clean Black & White Design** - Minimalist UI with excellent readability
- 📱 **Fully Responsive** - Works seamlessly on all devices
- ⚡ **Fast Performance** - Built with Next.js 16 and Turbopack

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: Custom components inspired by [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: [Sanka Vollerei Anime API](https://www.sankavollerei.com/anime/samehadaku)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kaelnime_samehadaku
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── anime/[animeId]/page.js    # Anime detail page
│   ├── episode/[episodeId]/page.js # Episode streaming page
│   ├── search/page.js              # Search results page
│   ├── page.js                     # Homepage (Top 10)
│   ├── layout.js                   # Root layout
│   ├── globals.css                 # Global styles
│   ├── loading.js                  # Loading state
│   ├── error.js                    # Error state
│   └── not-found.js                # 404 page
├── components/
│   ├── ui/
│   │   ├── card.jsx                # Card component
│   │   ├── button.jsx              # Button component
│   │   ├── input.jsx               # Input component
│   │   └── badge.jsx               # Badge component
│   ├── Navbar.jsx                  # Navigation bar
│   ├── AnimeCard.jsx               # Anime card component
│   └── VideoPlayer.jsx             # Video player with quality selector
└── lib/
    ├── utils.js                    # Utility functions
    └── api.js                      # API functions
```

## Available Pages

- **`/`** - Homepage with Top 10 anime
- **`/anime/[animeId]`** - Anime details with episode list
- **`/episode/[episodeId]`** - Episode streaming page
- **`/search?q=[query]`** - Search results page

## API Endpoints Used

- `GET /home` - Fetch homepage data (Top 10 anime)
- `GET /anime/{animeId}` - Fetch anime details
- `GET /episode/{episodeId}` - Fetch episode details
- `GET /server/{serverId}` - Fetch server streaming URL
- `GET /search?q={query}` - Search anime

## Customization

### Theme Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --background: 0 0% 100%;     /* White */
  --foreground: 0 0% 3.9%;     /* Near black */
  /* ... other colors */
}

.dark {
  --background: 0 0% 3.9%;     /* Near black */
  --foreground: 0 0% 98%;      /* White */
  /* ... other colors */
}
```

## Build for Production

```bash
npm run build
npm start
```

## License

This project is for educational purposes only.

## Acknowledgments

- API provided by [Sanka Vollerei](https://www.sankavollerei.com)
- UI design inspired by [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)
