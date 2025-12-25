# 🌤️ Smart Weather Assistant

An intelligent weather chatbot that uses **AI Tool Calling** to fetch real-time weather data and provide personalized travel recommendations. Built with Next.js, OpenAI GPT-4o, and the Vercel AI SDK.

## ✨ Features

- **Agentic AI**: The assistant autonomously decides when to call the weather API based on your questions
- **Real-time Weather**: Fetches live weather data from OpenWeatherMap API
- **Smart Recommendations**: Provides personalized packing lists and travel advice based on actual weather conditions
- **Beautiful UI**: Modern chat interface with real-time streaming responses
- **Tool Calling Visualization**: See when the AI is fetching weather data in real-time

## 🎯 Example Queries

Try asking:
- "I'm going to London this weekend. What should I pack?"
- "What's the weather like in Tokyo right now?"
- "Should I bring an umbrella to Paris?"
- "What clothes should I wear for New York in winter?"

## 🚀 Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Get API Keys

**OpenAI API Key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key

**OpenWeatherMap API Key (Free):**
1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key
5. Note: Free tier gives you 1,000 calls/day

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🏗️ Architecture

### Frontend ([page.tsx](app/page.tsx))
- React component using `useChat` hook from Vercel AI SDK
- Real-time streaming of AI responses
- Displays tool invocations (weather API calls) inline with messages

### Backend ([app/api/chat/route.ts](app/api/chat/route.ts))
- Next.js API route that handles chat requests
- OpenAI GPT-4o for natural language understanding
- **Tool Calling**: `getWeather` tool that:
  1. Accepts a city name
  2. Calls OpenWeatherMap API
  3. Returns structured weather data
  4. AI uses this data to generate helpful responses

### The Agentic Magic 🪄

The AI **autonomously decides** when to use tools:
1. User asks: "What should I pack for London?"
2. AI recognizes it needs weather data
3. AI calls `getWeather` tool with "London"
4. API fetches real weather (temp, conditions, humidity, wind)
5. AI analyzes the data and generates a personalized packing list

This is **tool calling** in action - the AI breaks down complex tasks into steps!

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: OpenAI GPT-4o
- **AI SDK**: Vercel AI SDK (`ai` package)
- **Weather API**: OpenWeatherMap
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📦 Key Dependencies

- `ai` - Vercel AI SDK for streaming and tool calling
- `@ai-sdk/openai` - OpenAI provider for Vercel AI SDK
- `zod` - Schema validation for tool parameters

## 🎨 Customization Ideas

Want to extend this project? Try adding:

1. **Multi-day Forecast**: Add a tool to fetch 5-day forecasts
2. **Local Events**: Integrate a search API to suggest events based on weather
3. **Image Generation**: Generate outfit visualizations with DALL-E
4. **Location Detection**: Auto-detect user's location for weather
5. **Multiple Cities**: Compare weather across multiple destinations

## 📚 Learn More

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenAI Tool Calling](https://platform.openai.com/docs/guides/function-calling)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenWeatherMap API](https://openweathermap.org/api)

## 🚢 Deploy on Vercel

The easiest way to deploy:

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `OPENWEATHER_API_KEY`
5. Deploy!

## 💡 What You'll Learn

This project teaches:
- ✅ **Tool Calling / Function Calling** - Core agentic AI pattern
- ✅ **Real-time Streaming** - Stream AI responses as they're generated
- ✅ **API Integration** - Call external APIs from AI tools
- ✅ **Schema Validation** - Use Zod for type-safe tool parameters
- ✅ **Modern UI/UX** - Build chat interfaces with React

---

Built with ❤️ using OpenAI and Vercel AI SDK

