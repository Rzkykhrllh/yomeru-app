# Yomeru (Dokkai) - Japanese Reading & Vocab Learning App

A web application for learning Japanese vocabulary through reading. Paste Japanese text, tokenize it, annotate vocabulary, and track your learning progress.

## Tech Stack

- **Monorepo**: Turborepo + npm workspaces
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Tokenizer**: Kuromoji (Japanese morphological analyzer)
- **Deployment**: Docker

## Project Structure

```
yomeru-app/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/         # Shared packages (if needed)
├── docker-compose.yml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- Docker & Docker Compose (optional, for containerized setup)

### Local Development (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and update the `DATABASE_URL` if needed.

3. Start PostgreSQL (you can use Docker for just the database):
```bash
docker run -d \
  --name yomeru-postgres \
  -e POSTGRES_USER=yomeru \
  -e POSTGRES_PASSWORD=yomeru_dev_pass \
  -e POSTGRES_DB=yomeru \
  -p 5432:5432 \
  postgres:16-alpine
```

4. Run Prisma migrations:
```bash
cd apps/api
npm exec prisma migrate dev --name init
npm exec prisma generate
```

5. Start development servers:
```bash
# From root directory
npm dev
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:3001

### Docker Development

1. Start all services:
```bash
docker-compose up -d
```

2. Run Prisma migrations:
```bash
docker-compose exec api npm exec prisma migrate dev --name init
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Features

### MVP Features
- ✅ Paste Japanese text → tokenize → clickable tokens
- ✅ Annotate vocab: furigana, meaning, notes
- ✅ Save texts
- ✅ Highlight vocab that already exists in database
- ✅ View vocab appearances across texts with sentence context
- ⏳ Furigana display with `<ruby>` tag (toggle on/off)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tokenize` | Tokenize Japanese text |
| GET | `/api/vocabs` | Get all vocabs |
| POST | `/api/vocabs` | Create vocab |
| GET | `/api/vocabs/:id` | Get vocab + appearances |
| GET | `/api/texts` | Get all texts |
| POST | `/api/texts` | Create text |
| GET | `/api/texts/:id` | Get text + vocabs |
| POST | `/api/text-vocabs` | Link vocab to text with sentence |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Paste new text |
| `/vocabs` | Vocabulary list |
| `/vocabs/[id]` | Vocabulary detail |
| `/texts` | Saved texts list |
| `/texts/[id]` | Text detail |

## Database Schema

### vocabs
- id, word, furigana, meaning, notes, created_at

### texts
- id, title, content, source, created_at

### text_vocabs (junction table)
- id, vocab_id, text_id, sentence, created_at

## Development Commands

```bash
# Install dependencies
npm install

# Start dev servers (all apps)
npm dev

# Build all apps
npm build

# Lint
npm lint

# Clean build artifacts
npm clean
```

## Future Considerations

- Authentication for multi-user support
- Desktop app with Tauri/Electron
- Export vocab to Anki
- SRS (Spaced Repetition System) / review system
- Statistics (total vocab, streak, frequency)
- Search/filter in vocab list

## License

Private project
