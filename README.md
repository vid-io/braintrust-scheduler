# Brain Trust Scheduler

A Next.js application for scheduling and managing Brain Trust meetings, inspired by Pixar's Brain Trust model. This platform allows team members to schedule and organize feedback sessions efficiently.

## Features

- Schedule Brain Trust meetings on Tuesdays and Thursdays
- Book presentation slots with topics
- View upcoming meetings and available slots
- Modern, responsive UI built with Tailwind CSS and shadcn/ui components
- Data persistence with Supabase backend

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Database**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **TypeScript**: For type safety and better developer experience

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Environment variables set up (see below)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Set up your environment variables
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is deployed on Vercel at:
[https://vercel.com/vidiq/v0-brain-trust-signup-form](https://vercel.com/vidiq/v0-brain-trust-signup-form)

To deploy your own version:

1. Push your code to a Git repository
2. Import your project to Vercel
3. Set up your environment variables in the Vercel dashboard
4. Deploy!

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                # Next.js app directory
├── components/         # React components
├── lib/               # Utility functions and data fetching
├── hooks/             # Custom React hooks
├── public/            # Static assets
└── supabase/          # Supabase configuration
```

## License

MIT
