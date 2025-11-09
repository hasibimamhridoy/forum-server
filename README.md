# AI-Powered Chat Forum Application

A full-stack, real-time chat forum platform with AI-powered moderation and content summarization.

## Features

- **User Authentication**: Secure registration, login, and profile management with NextAuth
- **Forum Functionality**: Create threads, post messages, and reply in nested structures
- **Real-Time Communication**: Live updates using Socket.io
- **AI Integration**: Spam detection and thread summarization using OpenAI
- **Notifications**: Asynchronous notification system with webhook support
- **Admin Tools**: Content moderation and user management
- **Caching**: Redis-based caching for improved performance
- **Professional Logging**: Winston logger with structured logging

## Tech Stack

### Backend

- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB Atlas with Mongoose ORM
- **Caching**: Redis
- **Real-time**: Socket.io
- **Logger**: Winston
- **Queue**: Bull (for async tasks)

### Frontend

- **Framework**: Next.js 15 (TypeScript)
- **Authentication**: NextAuth v5
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Shadcn UI
- **Real-time**: Socket.io Client

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- Redis
- OpenAI API Key

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>

\`\`\`

2. Install dependencies:
   \`\`\`bash

# Install client dependencies

npm install

# Install server dependencies

npm install
\`\`\`

3. Set up environment variables:
   \`\`\`bash

# Copy example env files

cp server/.env.example server/.env
cp .env.example .env

# Edit the .env files with your configuration

\`\`\`

4. Start development servers:
   \`\`\`bash

# Start backend server

npm run start

# Start frontend (in another terminal)

npm run dev
\`\`\`

## API Documentation

API documentation is available at `API_DOCUMENTATION.md`

### Coverage Goals

- Minimum 50% coverage for all metrics (branches, functions, lines, statements)
- Core features should have 80%+ coverage
- Critical paths (auth, posts, real-time) should have 90%+ coverage
