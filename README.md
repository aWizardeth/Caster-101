# CASTER101 - Next.js

Caster project converted to Next.js from Vite.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy `.env.local` and fill in optional API keys for better rate limits:

- `SPACESCAN_API_KEY` - For Spacescan API
- `MERKL_API_KEY` - For Merkl API  
- `MINTGARDEN_API_KEY` - For Mintgarden API

## Features

- 📈 **Emoji Market** - Track Chia and Base token prices
- 💰 **Bag** - Coming soon
- 🧙‍♂️ **aWizard Treasury** - Coming soon
- 🎓 **How to Wizard** - Coming soon
- 📜 **Book of Wizard** - Coming soon
- 🏰 **Caster Valley** - Interactive valley experience

## API Routes

- `/api/chia-cat-prices` - Fetches Chia CAT token prices from Spacescan/Dexie

## Deployment

Deploy to Vercel:

```bash
npm run build
```

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
