import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

async function getWeather(city: string) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return {
        error: 'Weather API key not configured. Please set OPENWEATHER_API_KEY in .env.local',
      };
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return {
        error: `Could not fetch weather for ${city}. Please check the city name.`,
      };
    }

    const data = await response.json();

    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6),
      conditions: data.weather[0].main,
    };
  } catch (error) {
    return {
      error: `Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Check if the last message requires weather data
  let updatedMessages = [...messages];
  const lastMessage = messages[messages.length - 1];
  
  // Simple detection: if user mentions a city/location and weather-related keywords
  const weatherKeywords = ['weather', 'pack', 'bring', 'temperature', 'rain', 'umbrella', 'clothes', 'wear'];
  const needsWeather = weatherKeywords.some(keyword => 
    lastMessage.content.toLowerCase().includes(keyword)
  );

  if (needsWeather && lastMessage.role === 'user') {
    // Extract city name (simple approach - you can enhance this)
    const cityMatch = lastMessage.content.match(/(?:in|to|for)\s+([A-Z][a-zA-Z\s]+?)(?:\s+this|\s+tomorrow|$|\?|\.)/i);
    
    if (cityMatch) {
      const city = cityMatch[1].trim();
      const weatherData = await getWeather(city);
      
      // Add the weather data as context
      updatedMessages.push({
        role: 'function' as const,
        name: 'getWeather',
        content: JSON.stringify(weatherData),
      });
    }
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a helpful weather assistant. When you receive weather data in a function response, analyze it and provide personalized recommendations.

For packing advice, consider:
- Temperature: Cold (<10°C) = warm layers, jackets. Mild (10-20°C) = light jacket. Warm (>20°C) = light clothes
- Rain/conditions: Suggest umbrella, raincoat, waterproof shoes
- Wind: Recommend windbreaker, scarf
- Humidity: Breathable fabrics for high humidity

Be conversational, friendly, and practical!`,
      },
      ...updatedMessages,
    ],
  });

  // Create a ReadableStream compatible with Vercel AI SDK
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Format as data stream for AI SDK
            controller.enqueue(encoder.encode(`0:"${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}