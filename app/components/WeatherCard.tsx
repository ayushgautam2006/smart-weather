import type { WeatherData } from '@/lib/parseWeather';

const conditionColors: Record<string, string> = {
    Clear: 'from-amber-400 to-orange-500',
    Clouds: 'from-slate-400 to-slate-600',
    Rain: 'from-blue-500 to-blue-800',
    Drizzle: 'from-blue-400 to-cyan-600',
    Thunderstorm: 'from-gray-700 to-gray-900',
    Snow: 'from-blue-100 to-slate-300',
    Mist: 'from-gray-400 to-gray-600',
    Fog: 'from-gray-400 to-gray-600',
};

export function WeatherCard({ data }: { data: WeatherData }) {
    const gradient = conditionColors[data.conditions] ?? 'from-blue-500 to-indigo-600';

    return (
        <div className={`mt-2 rounded-2xl bg-gradient-to-br ${gradient} text-white p-4 w-full max-w-sm shadow-lg`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-medium opacity-75 uppercase tracking-wide mb-1">
                        {data.location}
                    </p>
                    <p className="text-6xl font-bold leading-none">{data.temp_c}°</p>
                    <p className="text-sm opacity-90 mt-2 capitalize">{data.condition}</p>
                </div>
                <div className="text-right text-sm space-y-1 opacity-80">
                    <p>Feels like {data.feels_like_c}°</p>
                    <p>💧 {data.humidity}%</p>
                    <p>💨 {data.wind_kph} km/h</p>
                </div>
            </div>

            {/* Forecast strip */}
            {data.forecast?.length > 0 && (
                <div className="border-t border-white/20 pt-3 grid grid-cols-3 gap-2">
                    {data.forecast.slice(0, 3).map((f) => (
                        <div key={f.day} className="text-center text-sm">
                            <p className="opacity-70 text-xs">{f.day}</p>
                            <p className="text-2xl my-1">{f.icon}</p>
                            <p className="font-semibold">{f.high}°</p>
                            <p className="opacity-60 text-xs">{f.low}°</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}