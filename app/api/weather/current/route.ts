import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function GET(request: NextRequest) {
    if (!OPENWEATHER_API_KEY) {
        return NextResponse.json(
            { error: 'Weather service is not configured. Missing API key.' },
            { status: 500 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json(
            { error: 'Latitude and longitude are required.' },
            { status: 400 }
        );
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (
        Number.isNaN(latNum) ||
        Number.isNaN(lonNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lonNum < -180 ||
        lonNum > 180
    ) {
        return NextResponse.json(
            { error: 'Invalid latitude or longitude.' },
            { status: 400 }
        );
    }

    try {
        const url = `${OPENWEATHER_BASE_URL}?lat=${latNum}&lon=${lonNum}&units=metric&appid=${OPENWEATHER_API_KEY}`;

        const response = await fetch(url, {
            // Avoid caching stale weather across requests
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Weather service authentication failed.' },
                    { status: 500 }
                );
            }
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Weather data not found for this location.' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: 'Failed to fetch weather data.' },
                { status: response.status }
            );
        }

        const data = await response.json();

        const result = {
            location: data.name || 'Your location',
            temp: data.main?.temp ?? null,
            feelsLike: data.main?.feels_like ?? null,
            description: data.weather?.[0]?.description ?? '',
            icon: data.weather?.[0]?.icon ?? '',
            humidity: data.main?.humidity ?? null,
            windSpeed: data.wind?.speed ?? null,
        };

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: 'Unexpected error fetching weather data.' },
            { status: 500 }
        );
    }
}