# Draftly

Transform fragmented ideas into professional LinkedIn content with AI-powered writing assistance.

![Draftly](https://img.shields.io/badge/React-18.2.0-blue)
![Draftly](https://img.shields.io/badge/Express-4.18.2-green)
![Draftly](https://img.shields.io/badge/OpenRouter-API-orange)

## ✨ Features

- **3 Persona Styles**: Storyteller, Data-Driven, and Advisor writing styles
- **Customizable Tone**: Professional, Conversational, Provocative, or Thought Leader
- **Length Control**: Short, Medium, or Long posts
- **Emoji Frequency**: None, Low, Medium, or High
- **Session History**: Save and restore your last 5 drafts
- **Light/Dark Theme**: Toggle between themes
- **One-Click Copy**: Easily copy generated content
- **Concurrent Generation**: Generate all 3 persona variants simultaneously
- **Input Sanitization**: Built-in prompt injection protection
- **Rate Limiting**: 30 requests per minute per IP

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- OpenRouter API key ([Get one here](https://openrouter.ai))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/draftly.git
   cd draftly/ghostwriter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5
- **Backend**: Express.js
- **AI Provider**: OpenRouter API with Gemini 2.5 Flash Lite
- **Styling**: Custom CSS with CSS Variables for theming
- **Icons**: Material Symbols Outlined

## 📁 Project Structure

```
ghostwriter/
├── api/
│   └── index.js              # Express server with /generate endpoint
├── prompts/
│   └── buildPrompt.js        # Prompt building logic for each persona
├── services/
│   └── openrouter.js         # OpenRouter API integration with retry logic
├── src/
│   ├── App.jsx               # Main React component
│   ├── App.css               # Component styles
│   ├── index.css             # Global styles & theming
│   └── main.jsx              # React entry point
├── index.html
├── package.json
├── vite.config.js
└── .env.example              # Environment variables template
```

## 🎯 Usage

1. **Enter Your Ideas**: Type or paste your rough thoughts, meeting notes, or ideas into the workspace
2. **Choose Settings**:
   - **Length**: Short (100 words), Medium (200 words), or Long (300 words)
   - **Tone**: Professional, Conversational, Provocative, or Thought Leader
   - **Emojis**: None, Low, Medium, or High frequency
3. **Generate**: Click "Refine Post" to generate all 3 persona variants
4. **Compare**: Switch between Storyteller, Data-Driven, and Advisor tabs
5. **Copy or Regenerate**: Copy your favorite or regenerate individual variants

## 🔌 API Endpoints

### `POST /generate`

Generate LinkedIn content based on input parameters.

**Request Body:**
```json
{
  "content": "Your raw ideas here",
  "persona": "storyteller" | "data" | "advisor",
  "tone": "professional" | "casual" | "bold" | "humble",
  "length": "short" | "medium" | "long",
  "emojiLevel": "none" | "low" | "medium" | "high"
}
```

**Response:**
```json
{
  "output": "Generated LinkedIn post content..."
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security Features

- **Input Sanitization**: Detects and blocks prompt injection patterns
- **Rate Limiting**: 30 requests per minute per IP address
- **Length Limits**: Maximum 5000 characters per input
- **CORS Enabled**: Configured for development

## 🎨 Customization

### Themes

The app uses CSS variables for easy theming. Modify `:root` and `[data-theme='dark']` in [src/App.css](src/App.css):

```css
:root {
  --accent-primary: #1173d4;
  --bg-primary: #f9fafb;
  --text-primary: #0f172a;
  /* ... more variables */
}
```

### Personas

Add or modify personas in [prompts/buildPrompt.js](prompts/buildPrompt.js):

```javascript
const personas = {
  yourPersona: `Your custom instructions here...`
};
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using React, Express, and OpenRouter
