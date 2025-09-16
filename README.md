# 🎙️ Mumble Tasks

<div align="center">

![Mumble Logo](./public/assets/images/mumble-logo.png)

**Transform your voice into intelligent, actionable content**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[🚀 Live Demo](https://your-live-app-url.vercel.app) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/sfswtf/mumble-tasks/issues) • [✨ Request Feature](https://github.com/sfswtf/mumble-tasks/issues)

</div>

---

## 📋 Table of Contents

- [🎙️ Mumble Tasks](#️-mumble-tasks)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ What is Mumble?](#-what-is-mumble)
  - [🚀 Key Features](#-key-features)
  - [🎯 Intelligent Modes](#-intelligent-modes)
    - [📋 Task List Mode](#-task-list-mode)
    - [👥 Meeting Notes Mode](#-meeting-notes-mode)
    - [📰 Article Mode](#-article-mode)
    - [🎬 Content Creator Mode](#-content-creator-mode)
    - [📖 Biography Mode](#-biography-mode)
  - [🛠️ Tech Stack](#️-tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [AI & APIs](#ai--apis)
    - [Infrastructure](#infrastructure)
  - [⚡ Quick Start](#-quick-start)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Setup](#environment-setup)
    - [Development](#development)
    - [Production Build](#production-build)
  - [🏗️ Project Structure](#️-project-structure)
  - [🔧 Configuration](#-configuration)
    - [Frontend Environment Variables](#frontend-environment-variables)
    - [Backend Environment Variables](#backend-environment-variables)
    - [Supabase Functions](#supabase-functions)
  - [🎨 Components](#-components)
    - [Core Components](#core-components)
    - [Feature Components](#feature-components)
    - [UI Components](#ui-components)
  - [🔌 API Integration](#-api-integration)
    - [Authentication Flow](#authentication-flow)
    - [Audio Processing](#audio-processing)
    - [Content Generation](#content-generation)
  - [📱 Usage](#-usage)
    - [Basic Workflow](#basic-workflow)
    - [Advanced Features](#advanced-features)
  - [🚀 Deployment](#-deployment)
    - [Frontend (Vercel)](#frontend-vercel)
    - [Backend (Railway)](#backend-railway)
    - [Supabase Setup](#supabase-setup)
  - [🧪 Testing](#-testing)
  - [🔒 Security](#-security)
  - [🌍 Internationalization](#-internationalization)
  - [📊 Performance](#-performance)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)
  - [👥 Team](#-team)
  - [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ What is Mumble?

Mumble is an innovative web application that transforms your voice recordings into intelligent, actionable content using advanced AI technology. Think of it as your personal AI assistant that listens to your voice memos, meeting recordings, or spoken thoughts and automatically converts them into organized, useful documents.

### 🎯 Problem it Solves

- **Voice-to-Text Transcription**: Convert audio recordings to text with high accuracy
- **Intelligent Content Generation**: Transform raw transcriptions into structured, purpose-driven content
- **Multilingual Support**: Process content in English and Norwegian with seamless switching
- **Professional Output**: Export results as formatted Word documents or text files
- **User-Friendly Interface**: No technical knowledge required - simply speak and get results

---

## 🚀 Key Features

### 🌍 **Multilingual Support**
- Full interface available in English and Norwegian
- Supports audio transcription in multiple languages
- Seamless language switching without losing work

### 📊 **Smart Organization**
- Visual step-by-step wizard guides users through the process
- Progress tracking shows exactly where you are in each workflow
- History section stores all previous recordings with intelligent titles

### 📤 **Professional Export Options**
- Export as Microsoft Word documents with proper formatting
- Plain text export for simple sharing
- Professional document structure with headings and organization

### 🔄 **User-Friendly Experience**
- Intuitive interface with clear visual indicators
- Error handling and helpful guidance throughout the process
- Real-time progress tracking and immediate results

### 🛡️ **Security & Privacy**
- User authentication system protects personal recordings
- Local storage for draft work and user preferences
- Secure API integration with enterprise-grade AI services
- Error monitoring with Sentry integration

---

## 🎯 Intelligent Modes

Mumble adapts to different use cases through specialized modes:

### 📋 Task List Mode
- Converts voice memos into organized, actionable task lists
- Automatically identifies priorities and suggests due dates
- Perfect for capturing to-do items, project notes, or brainstorming sessions
- **Use case**: "Record your thoughts about weekend plans and get a structured task list"

### 👥 Meeting Notes Mode
- Transforms meeting recordings into professional meeting minutes
- Extracts key decisions, action items, and important discussions
- Identifies meeting participants and their responsibilities
- **Use case**: "Record your team meeting and get organized notes with clear action items"

### 📰 Article Mode
- Converts spoken thoughts into well-structured articles or blog posts
- Organizes content with proper headings, flow, and readability
- Great for content creators, journalists, or anyone who thinks better out loud
- **Use case**: "Speak your ideas about a topic and get a polished article draft"

### 🎬 Content Creator Mode
Transform your voice recordings into engaging scripts for social media platforms:

**Platform Options:**
- **Short Videos** 🎬 - TikTok, Instagram Reels, YouTube Shorts (15-90 seconds)
- **YouTube Videos** 📺 - Medium-form content (7-11 minutes)
- **LinkedIn Posts** 💼 - Professional networking (1-3 minute read)
- **Facebook Posts** 👥 - Community engagement (30 seconds - 2 minutes)
- **Twitter/X Threads** 🐦 - Multi-part stories (5-10 tweets)
- **Blog Posts** 📝 - Long-form content (3-7 minute read)

**Features:**
- Platform-specific optimization
- Customizable tone and style
- Hook strategies for attention-grabbing openings
- Call-to-action focus options
- Target audience specification

### 📖 Biography Mode
- Creates personal stories and biographical content from spoken memories
- Organizes life experiences into compelling narrative formats
- Perfect for preserving family stories or creating personal memoirs
- **Use case**: "Record memories about your childhood and get them as organized stories"

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development with enhanced developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing (if applicable)

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database for user data and transcriptions
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Winston** - Logging library for error tracking and debugging

### AI & APIs
- **OpenAI Whisper** - Speech-to-text transcription
- **Anthropic Claude** - Advanced language model for content generation
- **AssemblyAI** - Alternative transcription service
- **Supabase** - Backend-as-a-Service for authentication and database

### Infrastructure
- **Vercel** - Frontend deployment and hosting
- **Railway** - Backend deployment and hosting
- **Supabase Edge Functions** - Serverless functions for AI processing
- **Sentry** - Error monitoring and performance tracking

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sfswtf/mumble-tasks.git
   cd mumble-tasks
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Environment Setup

1. **Frontend Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SENTRY_DSN=your_sentry_dsn (optional)
   ```

2. **Backend Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Supabase Function Environment Variables**
   In your Supabase dashboard, add:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   OPENAI_API_KEY=your_openai_api_key (if needed)
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Start production server
npm start
```

---

## 🏗️ Project Structure

```
mumble-tasks/
├── 📁 backend/                    # Backend API server
│   ├── 📁 src/
│   │   ├── 📁 config/             # Configuration files
│   │   ├── 📁 controllers/        # Request handlers
│   │   ├── 📁 middleware/         # Express middleware
│   │   ├── 📁 models/             # Database models
│   │   ├── 📁 routes/             # API routes
│   │   ├── 📁 services/           # Business logic
│   │   └── 📁 utils/              # Utility functions
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📁 src/                        # Frontend source code
│   ├── 📁 components/             # React components
│   │   ├── 📁 ScriptOutput/       # Platform-specific outputs
│   │   ├── 📄 FAQ.tsx             # Help and FAQ component
│   │   ├── 📄 Header.tsx          # Main navigation
│   │   ├── 📄 StepWizard.tsx      # Multi-step workflow
│   │   └── 📄 TranscriptionHistoryView.tsx
│   │
│   ├── 📁 hooks/                  # Custom React hooks
│   │   ├── 📄 useAuth.ts          # Authentication logic
│   │   ├── 📄 useTranscriptions.ts
│   │   └── 📄 useErrorHandler.ts
│   │
│   ├── 📁 lib/                    # External integrations
│   │   ├── 📄 supabase.ts         # Supabase client
│   │   └── 📄 sentry.ts           # Error monitoring
│   │
│   ├── 📁 services/               # API services
│   │   ├── 📄 openai.ts           # AI integration
│   │   └── 📄 fileService.ts      # File handling
│   │
│   ├── 📁 store/                  # State management
│   ├── 📁 types/                  # TypeScript definitions
│   ├── 📁 utils/                  # Utility functions
│   └── 📄 App.tsx                 # Main application component
│
├── 📁 supabase/                   # Supabase configuration
│   ├── 📁 functions/              # Edge functions
│   │   ├── 📁 generate/           # Content generation
│   │   └── 📁 transcribe/         # Audio transcription
│   └── 📄 config.toml
│
├── 📁 public/                     # Static assets
├── 📄 package.json               # Dependencies and scripts
├── 📄 tailwind.config.js         # Tailwind CSS configuration
├── 📄 vite.config.ts             # Vite configuration
└── 📄 vercel.json                # Vercel deployment config
```

---

## 🔧 Configuration

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_SENTRY_DSN` | Sentry error monitoring DSN | ❌ |

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `ANTHROPIC_API_KEY` | Anthropic API key | Required |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

### Supabase Functions

Deploy edge functions for AI processing:

```bash
# Deploy transcription function
supabase functions deploy transcribe

# Deploy content generation function
supabase functions deploy generate
```

---

## 🎨 Components

### Core Components

- **`App.tsx`** - Main application container with routing and state management
- **`Header.tsx`** - Navigation bar with language selector and user menu
- **`StepWizard.tsx`** - Multi-step workflow for content creation
- **`ProcessingIndicator.tsx`** - Real-time progress tracking

### Feature Components

- **`BiographyTypeSelector.tsx`** - Mode selection interface
- **`BiographyCustomization.tsx`** - Platform-specific customization options
- **`TranscriptionHistoryView.tsx`** - Optimized history display
- **`FAQ.tsx`** - Comprehensive help and documentation
- **`PromptPreview.tsx`** - AI instruction preview for transparency

### UI Components

- **`ModeIndicator.tsx`** - Current mode and step display
- **`StepProgressIndicator.tsx`** - Visual progress tracking
- **`ErrorBoundary.tsx`** - Error handling and recovery
- **`AuthModal.tsx`** - User authentication interface

---

## 🔌 API Integration

### Authentication Flow

```typescript
// User registration/login
const { user, error } = await signIn(email, password);

// Protected route access
const { data } = await supabase
  .from('transcriptions')
  .select('*')
  .eq('user_id', user.id);
```

### Audio Processing

```typescript
// Transcribe audio using Supabase Edge Function
const response = await fetch(`${supabaseUrl}/functions/v1/transcribe`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
  body: formData,
});
```

### Content Generation

```typescript
// Generate content using AI
const completion = await fetch(`${supabaseUrl}/functions/v1/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
  body: JSON.stringify({
    prompt: systemPrompt,
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307'
  })
});
```

---

## 📱 Usage

### Basic Workflow

1. **Select Mode** - Choose from Tasks, Meeting Notes, Article, Content Creator, or Biography
2. **Choose Language** - Select English or Norwegian for interface and processing
3. **Upload/Record Audio** - Provide audio content via file upload or direct recording
4. **Customize Output** - Adjust tone, style, and platform-specific settings
5. **Process & Review** - AI transcribes and generates intelligent content
6. **Export Results** - Download as Word document or text file

### Advanced Features

- **History Management** - View, search, and reload previous transcriptions
- **Multi-platform Content** - Generate content optimized for different social media platforms
- **Real-time Progress** - Track processing stages with live updates
- **Error Recovery** - Automatic retry and error handling for failed operations
- **Prompt Preview** - See exactly what instructions are sent to AI models

---

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

```bash
# Manual deployment
npm run build
vercel --prod
```

### Backend (Railway)

1. **Connect GitHub repository** to Railway
2. **Configure environment variables**
3. **Deploy with automatic builds**

```json
// railway.json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "cd backend && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

### Supabase Setup

1. **Create new Supabase project**
2. **Deploy edge functions**
3. **Configure environment variables**
4. **Set up database tables**

---

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔒 Security

### API Key Protection
- All AI API keys are stored server-side only
- Frontend uses Supabase anonymous keys (safe for client-side)
- Environment variables are properly configured for each deployment

### Authentication
- JWT-based authentication with secure token handling
- User data is isolated and protected
- Session management with automatic token refresh

### Error Monitoring
- Sentry integration for real-time error tracking
- User context and breadcrumbs for debugging
- Privacy-compliant error reporting

---

## 🌍 Internationalization

Currently supported languages:
- **English** (en) - Full support
- **Norwegian** (no) - Full support

### Adding New Languages

1. **Update translation files** in components
2. **Add language option** to LanguageSelector
3. **Configure AI models** for language support
4. **Test transcription accuracy** for new language

---

## 📊 Performance

### Optimization Features
- **Code Splitting** - Dynamic imports for better load times
- **Component Memoization** - React.memo for expensive components
- **Lazy Loading** - Deferred loading of non-critical components
- **Bundle Analysis** - Vite bundle analyzer for size optimization

### Performance Metrics
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 3s
- **Bundle Size** < 1MB gzipped
- **Lighthouse Score** > 90

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript** for all new code
- **ESLint** configuration must pass
- **Prettier** for code formatting
- **Component documentation** with JSDoc
- **Test coverage** for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer** - [@sfswtf](https://github.com/sfswtf)

---

## 🙏 Acknowledgments

- **OpenAI** for Whisper transcription technology
- **Anthropic** for Claude language model
- **Supabase** for backend infrastructure
- **Vercel** for frontend hosting
- **Railway** for backend deployment
- **React Community** for excellent documentation and tools

---

<div align="center">

**[⬆ Back to Top](#-mumble-tasks)**

Made with ❤️ by the Mumble team

</div>
