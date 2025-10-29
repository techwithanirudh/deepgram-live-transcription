# Next.js Live Transcription Starter

Simple Next.js demo that streams mic audio to Deepgram and renders live transcripts in the browser.

## Prerequisites

- Node.js 20+
- Bun 1.2+ (or another Node package manager)
- Deepgram API key

## Setup

Want to start building using this project? [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys).

1. Clone the repository and move into the project directory.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create an environment file and set the required values:
   ```bash
   cp .env.example .env
   # edit .env and set:
   #   DEEPGRAM_API_KEY=<your key>
   #   NEXT_PUBLIC_BASE_URL=http://localhost:3000  # adjust if needed
   ```

## Run Locally

- Start the development server: `bun run dev`
- Open `http://localhost:3000`, allow microphone access, and speak to see live transcription.

## Production Build

- Build optimized assets: `bun run build`
- Launch the production server: `bun run start`

## Troubleshooting

- Missing transcripts usually mean the API key is unset or invalid. Confirm `DEEPGRAM_API_KEY` is present in `.env`.
- If Bun is unavailable, install dependencies with `npm install` (or `pnpm install`) and replace `bun run` with the matching package manager command.

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.
