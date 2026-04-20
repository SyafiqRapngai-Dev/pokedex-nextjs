# Pokedex App

A comprehensive Pokedex application built with Next.js and JavaScript.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **API**: PokeAPI (https://pokeapi.co)

## Project Structure

```
pokedex/
├── app/              # Next.js app directory
│   ├── layout.js    # Root layout component
│   ├── page.js      # Home page
│   └── globals.css  # Global styles
├── components/       # React components
├── lib/             # Library code and utilities
├── utils/           # Utility functions
└── public/          # Static assets
```

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Configuration

The `next.config.mjs` file is configured to allow images from the PokeAPI sprites repository.
