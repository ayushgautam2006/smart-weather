export type WeatherData = {
    location: string;
    temp_c: number;
    feels_like_c: number;
    condition: string;
    humidity: number;
    wind_kph: number;
    conditions: string;
    forecast: { day: string; high: number; low: number; icon: string }[];
};

export function parseWeatherData(content: string): {
    cleanText: string;
    weatherData: WeatherData | null;
} {
    const tagMatch = content.match(/<weather_data>([\s\S]*?)<\/weather_data>/);

    if (tagMatch) {
        try {
            const weatherData = JSON.parse(tagMatch[1].trim()) as WeatherData;
            const cleanText = content.replace(/<weather_data>[\s\S]*?<\/weather_data>/, '').trim();
            return { cleanText, weatherData };
        } catch {
            // tag found but JSON malformed — strip it anyway so raw JSON doesn't leak
            const cleanText = content.replace(/<weather_data>[\s\S]*?<\/weather_data>/, '').trim();
            return { cleanText, weatherData: null };
        }
    }

    return { cleanText: content, weatherData: null };
}