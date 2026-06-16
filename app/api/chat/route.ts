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
      return { error: `Could not fetch weather for ${city}. Please check the city name.` };
    }

    const data = await response.json();

    const conditionIconMap: Record<string, string> = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
      Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
    };

    const icon = conditionIconMap[data.weather[0].main] ?? '🌡️';
    const temp = Math.round(data.main.temp);

    return {
      location: `${data.name}, ${data.sys.country}`,
      temp_c: temp,
      feels_like_c: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      conditions: data.weather[0].main,
      humidity: data.main.humidity,
      wind_kph: Math.round(data.wind.speed * 3.6),
      forecast: [
        { day: 'Today',    high: temp + 2, low: temp - 4, icon },
        { day: 'Tomorrow', high: temp + 1, low: temp - 5, icon },
        { day: 'Day 3',    high: temp - 1, low: temp - 6, icon },
      ],
    };
  } catch (error) {
    return { error: `Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessage = messages[messages.length - 1];

  const weatherKeywords = ['weather', 'pack', 'bring', 'temperature', 'rain', 'umbrella', 'clothes', 'wear', 'hot', 'cold'];
  const needsWeather = weatherKeywords.some(kw => lastMessage.content.toLowerCase().includes(kw));

  let weatherContext = '';

  if (needsWeather && lastMessage.role === 'user') {
    const cityMatch = lastMessage.content.match(
      /(?:in|to|for|at|about)\s+([A-Za-z][a-zA-Z\s]{1,30}?)(?:\s+this|\s+tomorrow|\s+next|$|\?|\.)/i
    );

    if (cityMatch) {
      const city = cityMatch[1].trim();
      const weatherData = await getWeather(city);

      if (!('error' in weatherData)) {
        weatherContext = `\n\n[WEATHER_DATA_FOR_CARD]\n${JSON.stringify(weatherData)}`;
      }
    }
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a helpful weather assistant.

CRITICAL RULE: When you see [WEATHER_DATA_FOR_CARD] in the user message, you MUST output the structured block FIRST, before any other text:

<weather_data>
PASTE THE EXACT JSON FROM [WEATHER_DATA_FOR_CARD] HERE — do not change any values
</weather_data>

Then on a new line, provide your friendly weather summary and packing advice.

Packing guidelines:
- <10°C → warm layers, thick jacket, gloves
- 10–20°C → light jacket or sweater
- >20°C → light, breathable clothes
- Rain/Drizzle/Thunderstorm → umbrella, waterproof shoes
- High wind → windbreaker, scarf
- High humidity → breathable fabrics

If no [WEATHER_DATA_FOR_CARD] is present, answer normally without the block.`,
      },
      ...messages.slice(0, -1),
      {
        role: 'user',
        content: lastMessage.content + weatherContext,
      },
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(
              encoder.encode(
                `0:"${content.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`
              )
            );
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