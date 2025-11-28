# KnowledgeHub Bot

A Next.js application that provides an AI-powered knowledge base with intelligent search and chat capabilities. Build your personal knowledge base by uploading files, scraping websites, or pasting text, and chat with an AI that answers questions based on your content.

## ✨ Features

- **User Authentication**: Secure email/password based authentication with JWT tokens
- **Multiple Content Sources**:
  - **File Upload**: Upload text files to the knowledge base
  - **Web Scraping**: Scrape website content and add to knowledge base
  - **Text Paste**: Directly paste and save text content
- **Vector Storage**: Uses Pinecone for efficient vector storage and similarity search
- **AI Chat**: Chat with AI that answers questions based on your knowledge base using RAG
- **Embeddable Chat Widget**: Embed the chat interface into your own website
- **Knowledge Base Management**: Create, read, update, and delete knowledge base items
- **User Isolation**: All knowledge base items are user-specific and securely isolated

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Vector Database**: Pinecone
- **AI & Embeddings**: OpenRouter API
  - Embedding Model: BGE-M3 (1024 dimensions)
  - Chat Model: Configurable (default: Meta Llama 3.1 8B Instruct)
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or MongoDB Atlas)
- Pinecone account
- OpenRouter account

## 🚀 Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd knowledgehub-bot
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/knowledgehub-bot
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/knowledgehub-bot

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-secret-key-change-this-in-production

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=knowledgehub-bot

# OpenRouter Configuration
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_EMBEDDING_MODEL=BAAI/bge-m3
OPENROUTER_CHAT_MODEL=meta-llama/llama-3.1-8b-instruct
```

### 3. Service Setup

#### MongoDB Setup
- **Local**: Install and run MongoDB locally, or
- **Atlas**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Update `MONGODB_URI` in `.env.local`

#### Pinecone Setup
1. Create an account at [Pinecone](https://www.pinecone.io/)
2. Create an index with:
   - **Dimension**: 1024 (for BGE-M3 model)
   - **Metric**: cosine (recommended)
3. Copy your API key and environment name
4. Add them to `.env.local`

#### OpenRouter Setup
1. Create an account at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Add it to `.env.local`
4. Optionally customize the chat model (see available models at [OpenRouter Models](https://openrouter.ai/models))

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📖 Usage

### Getting Started

1. **Register/Login**: Create a new account or login with existing credentials
2. **Add Content to Knowledge Base**:
   - **Upload Files**: Go to Dashboard and upload text files
   - **Scrape Websites**: Add website URLs to scrape and add to knowledge base
   - **Paste Text**: Directly paste text content from the Dashboard
3. **Manage Knowledge Base**: View, edit, and delete items in the Knowledge Base page
4. **Chat**: Ask questions about your knowledge base in the Chat page
5. **Embed Chat**: Get embed code from the Embed page to add the chat widget to your website

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Knowledge Base
- `GET /api/knowledge-base` - Get all knowledge base items (user-specific)
- `PUT /api/knowledge-base` - Update a knowledge base item
- `DELETE /api/knowledge-base?vectorId=<id>` - Delete a knowledge base item
- `POST /api/knowledge-base/upload` - Upload a file
- `POST /api/knowledge-base/scrape` - Scrape a website
- `POST /api/knowledge-base/paste` - Paste text content

#### Chat
- `POST /api/chat` - Send a chat message and get AI response

## 📁 Project Structure

```
knowledgehub-bot/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication routes
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── register/
│   │   ├── chat/              # Chat API endpoint
│   │   └── knowledge-base/    # Knowledge base CRUD operations
│   │       ├── paste/        # Paste text endpoint
│   │       ├── scrape/       # Web scraping endpoint
│   │       └── upload/       # File upload endpoint
│   ├── chat/                 # Chat page
│   ├── dashboard/            # Dashboard page
│   ├── embed/                # Embed widget pages
│   │   ├── chat/             # Embedded chat interface
│   │   └── page.tsx          # Embed code generator
│   ├── knowledge-base/       # Knowledge base management page
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── Navbar.tsx            # Navigation component
├── lib/
│   ├── auth.ts               # Authentication utilities
│   ├── mongodb.ts            # MongoDB connection and utilities
│   ├── openrouter.ts         # OpenRouter API integration
│   ├── pinecone.ts           # Pinecone integration
│   ├── rag.ts                # RAG implementation
│   ├── scraper.ts            # Web scraping utilities
│   └── vector.ts             # Vector operations
├── env.example               # Example environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Key Implementation Details

- **Authentication**: JWT tokens stored in HTTP-only cookies for security
- **Vector Embeddings**: Generated using BGE-M3 model via OpenRouter (1024 dimensions)
- **RAG Pipeline**: 
  1. User query is embedded
  2. Similar vectors are retrieved from Pinecone
  3. Context is passed to the chat model
  4. AI generates response based on retrieved context
- **User Isolation**: All database queries are filtered by user ID
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## 🔒 Security Notes

- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- Passwords are hashed using bcrypt
- All API routes require authentication (except register/login)
- User data is isolated at the database level
- Environment variables should never be committed to version control

## 📝 Notes

- The Pinecone index dimension must match the embedding model (1024 for BGE-M3)
- Large files may take time to process and embed
- Web scraping may fail for sites with anti-scraping measures
- The chat model can be changed via `OPENROUTER_CHAT_MODEL` environment variable
- All knowledge base items are automatically chunked and embedded for efficient retrieval

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.
