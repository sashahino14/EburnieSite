EburnieSite

EburnieSite is an AI-powered website generation platform that lets you create and modify complete websites from natural-language prompts.

It is based on the EburnieSite project and has been adapted to use the DeepSeek API directly.

✨ Features

- 🤖 AI-powered website generation
- ⚡ Streaming responses from DeepSeek
- 🧑‍💻 Monaco code editor
- 🌐 HTML, CSS and JavaScript generation
- 🎨 Tailwind CSS support
- 📱 Responsive interface
- 🖥️ Live website preview
- 🔄 Website regeneration and modification
- 🚀 Deployment to Hugging Face Spaces
- 🔐 Server-side DeepSeek API key
- 🌙 Dark/light theme support

🧠 AI Provider

EburnieSite communicates directly with the DeepSeek API.

The API key is handled exclusively by the server and must never be placed in the frontend source code.

The model can be configured with:

DEEPSEEK_MODEL=deepseek-v4-flash

⚙️ Environment Variables

Create a ".env" file on the server:

DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-v4-flash
APP_PORT=3000

Never commit your ".env" file or your API key to GitHub.

🚀 Running locally

Install dependencies:

npm install

Build the application:

npm run build

Start the production server:

npm start

For development:

npm run dev

🏗️ Architecture

React + TypeScript + Vite
          │
          ▼
     EburnieSite UI
          │
          ▼
     Express Server
          │
          ▼
      DeepSeek API

The frontend is built with React and Vite, while Express handles the server-side API communication and website deployment functionality.

🔒 Security

The DeepSeek API key is stored as a server-side environment variable.

The key is not exposed to the browser and should never be committed to the repository.

For production deployments, configure "DEEPSEEK_API_KEY" through the hosting provider's secret/environment-variable system.

☁️ Deployment

EburnieSite can be deployed on a Node.js-compatible hosting platform such as Render.

Recommended production commands:

Build Command:
npm install && npm run build

Start Command:
npm start

Configure the required environment variables in the hosting provider:

DEEPSEEK_API_KEY
DEEPSEEK_MODEL
APP_PORT

🇨🇮 Project

EburnieSite is an independent customization of the EburnieSite codebase, adapted for direct DeepSeek API usage.

Created and maintained by Sylvanus Hino.

---

© 2026 EburnieSite. All rights reserved.
