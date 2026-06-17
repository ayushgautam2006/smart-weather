'use client';

import { useEffect, useState } from 'react';

interface CurrentWeather {
    location: string;
    temp: number;
    feelsLike: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
}

export function CurrentLocation() {
    const [weather, setWeather] = useState<CurrentWeather | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setStatus('error');
            setErrorMessage('Geolocation is not supported by your browser.');
            return;
        }

        setStatus('loading');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(
                        `/api/weather/current?lat=${latitude}&lon=${longitude}`
                    );

                    if (!res.ok) {
                        throw new Error('Failed to fetch weather data');
                    }

                    const data = await res.json();
                    setWeather(data);
                    setStatus('idle');
                } catch (err) {
                    setStatus('error');
                    setErrorMessage('Could not load weather for your location.');
                }
            },
            (geoError) => {
                setStatus('error');
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setErrorMessage('Location access denied. Enable it to see local weather.');
                } else {
                    setErrorMessage('Unable to retrieve your location.');
                }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
        );
    }, []);

    if (status === 'loading') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-center">
                <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">
                    Getting your local weather...
                </span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{errorMessage}</p>
            </div>
        );
    }

    if (!weather) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-80 mb-1">Your current location</p>
                    <h2 className="text-2xl font-bold">{weather.location}</h2>
                    <p className="capitalize opacity-90">{weather.description}</p>
                </div>
                <div className="flex items-center">
                    {weather.icon && (
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                            alt={weather.description}
                            className="w-16 h-16"
                        />
                    )}
                    <span className="text-4xl font-bold ml-2">{Math.round(weather.temp)}°</span>
                </div>
            </div>
            <div className="flex space-x-6 mt-4 text-sm opacity-90">
                <span>Feels like {Math.round(weather.feelsLike)}°</span>
                <span>Humidity {weather.humidity}%</span>
                <span>Wind {weather.windSpeed} m/s</span>
            </div>
        </div>
    );
}