'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { CurrentLocation } from './components/CurrentLocation';
import { parseWeatherData } from '@/lib/parseWeather';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/weather-bg.png')" }}
    >
      <div className="min-h-screen bg-slate-900/20 dark:bg-slate-950/50">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div className="py-2 px-1 border-b border-white/15 pb-4">
                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
                  Smart Weather
                </h1>
                <p className="text-white/70 text-sm mt-2 leading-relaxed">
                  Real-time weather tracking and AI assistant to help you plan clothes, packing, and itineraries.
                </p>
              </div>

              <CurrentLocation />
            </div>

            {/* Chat Container */}
            <div className="lg:col-span-2 bg-white/10 dark:bg-slate-900/35 border border-white/20 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">☁️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Start a conversation
                    </h2>
                    <p className="text-white/75 max-w-md">
                      Try asking: "I'm going to London this weekend. What should I pack?"
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-white/60">
                      <p>• "What's the weather like in Tokyo?"</p>
                      <p>• "Should I bring an umbrella to Paris?"</p>
                      <p>• "What clothes for New York in winter?"</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      if (message.role === 'user') {
                        return (
                          <div key={message.id} className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-indigo-600/70 border border-indigo-500/30 text-white backdrop-blur-md shadow-md whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        );
                      }

                      const { cleanText, weatherData } = parseWeatherData(message.content);

                      return (
                        <div key={message.id} className="flex justify-start">
                          <div className="max-w-[80%] space-y-2">
                            {weatherData && <WeatherCard data={weatherData} />}
                            {cleanText && (
                              <div className="rounded-2xl px-4 py-3 bg-white/15 dark:bg-white/5 border border-white/10 dark:border-white/5 text-white backdrop-blur-md shadow-sm whitespace-pre-wrap">
                                {cleanText}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/15 dark:bg-white/5 border border-white/10 dark:border-white/5 backdrop-blur-md rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 bg-white/5 dark:bg-black/10 backdrop-blur-md">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about weather or what to pack..."
                    className="flex-1 rounded-full px-6 py-3 bg-white/10 dark:bg-black/20 border border-white/15 dark:border-white/10 text-white placeholder-white/50 focus:bg-white/15 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white rounded-full font-medium active:scale-95 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.3)] disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? '...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-white/70 drop-shadow-sm">
            Powered by Groq and OpenWeatherMap API
          </div>
        </div>
      </div>
    </div>
  );
}