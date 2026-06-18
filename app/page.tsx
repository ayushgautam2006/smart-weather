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
      <div className="min-h-screen bg-white/40 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl sm:text-3xl font-bold text-white-900 dark:text-blue mb-2 drop-shadow-sm">
              Smart Weather Assistant
            </h1>
            <p className="text-gray-700 dark:text-gray-200 text-lg drop-shadow-sm">
              Ask me about weather anywhere in the world, and I'll help you plan!
            </p>
          </div>

          {/* Two-column layout: Current Location (left) + Chat (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Current Location Weather */}
            <div className="lg:col-span-1">
              <CurrentLocation />
            </div>

            {/* Chat Container */}
            <div className="lg:col-span-2 bg-blue-200 dark:bg-red-700/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">☁️</div>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Start a conversation
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      Try asking: "I'm going to London this weekend. What should I pack?"
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-red-700 text-white whitespace-pre-wrap">
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
                              <div className="rounded-2xl px-4 py-3 bg-red-100/80 dark:bg-red-900 text-gray-900 dark:text-white whitespace-pre-wrap">
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
                    <div className="bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="border-t border-blue-200 dark:border-red-700/20 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about weather or what to pack..."
                    className="flex-1 rounded-full px-6 py-3 bg-gray-100/80 dark:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isLoading ? '...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-700 dark:text-gray-300 drop-shadow-sm">
            Powered by Groq and OpenWeatherMap API
          </div>
        </div>
      </div>
    </div>
  );
}