'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useLanguage } from '@/lib/language-context';

interface ChatKitPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onTasksUpdated: () => void;
}

export default function ChatKitPanel({
  isOpen,
  onClose,
  userId,
  onTasksUpdated,
}: ChatKitPanelProps) {
  const { locale, t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Configure ChatKit to use our custom backend via Next.js proxy
  const { control, ref } = useChatKit({
    api: {
      url: '/chatkit', // Proxied through Next.js to http://localhost:8000/chatkit
      domainKey: 'domain_pk_localhost_dev', // Standard key for local development
      fetch: async (input, init) => {
        // Add custom headers including user ID and language
        const headers = new Headers(init?.headers);
        headers.set('X-User-Id', userId);
        headers.set('X-Language', locale);

        return fetch(input, {
          ...init,
          headers,
        });
      },
    },
    theme: 'dark',
    onError: (err) => {
      console.error('ChatKit error:', err);
      setError(err.error?.message || 'An error occurred');
    },
    onReady: () => {
      console.log('ChatKit ready');
      console.log('[ChatKit] Control object:', control);
      console.log('[ChatKit] Control methods:', Object.keys(control || {}));
    },
  });

  // Poll for task updates while ChatKit is open
  useEffect(() => {
    if (!isOpen) return;

    // Refresh tasks every 3 seconds while ChatKit is open
    const interval = setInterval(() => {
      console.log('[ChatKit] Auto-refreshing tasks');
      onTasksUpdated();
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, onTasksUpdated]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[Voice] Listening started');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Collect all transcripts (interim and final)
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Show current transcript (for visual feedback)
      const currentText = finalTranscript + interimTranscript;
      console.log('[Voice] Current:', currentText);
      setTranscript(currentText.trim());

      // DON'T send yet - wait for user to click stop button
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Voice] Recognition error:', event.error);

      // Don't stop for "no-speech" error - user might still be thinking
      if (event.error === 'no-speech') {
        console.log('[Voice] No speech detected, but staying active');
        return;
      }

      setIsListening(false);

      // Show user-friendly error messages
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (event.error === 'network') {
        alert('Network error. Please check your internet connection.');
      }
    };

    recognition.onend = () => {
      console.log('[Voice] Listening ended');
      // Only set to false if we're actually done (not an error restart)
      setTimeout(() => setIsListening(false), 100);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [ref]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('[Voice] Error starting recognition:', err);
      }
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();

      // AUTO-SEND voice command to backend
      setTimeout(async () => {
        if (transcript) {
          try {
            console.log('[Voice] Auto-sending to AI:', transcript);

            // Import chatApi dynamically
            const { chatApi } = await import('@/lib/api');

            // Send message to AI backend
            const response = await chatApi.sendMessage(transcript);

            console.log('[Voice] AI Response:', response.response);

            // Show success notification with AI response
            const { default: toast } = await import('react-hot-toast');
            toast.success(
              <div>
                <div className="font-semibold">✅ {t('chat.voiceCommandProcessed')}</div>
                <div className="text-sm mt-1">{response.response}</div>
              </div>,
              { duration: 4000 }
            );

            // Refresh tasks to show changes
            onTasksUpdated();

            // Clear transcript
            setTranscript('');
          } catch (err) {
            console.error('[Voice] Failed to process command:', err);
            const { default: toast } = await import('react-hot-toast');
            toast.error('Failed to process voice command. Please try again.');

            // Keep transcript visible on error
            setTimeout(() => setTranscript(''), 3000);
          }
        }
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Load ChatKit web component from OpenAI CDN */}
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={(e) => {
          console.error('Failed to load ChatKit script:', e);
          setError('Failed to load ChatKit');
        }}
      />

      <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
              <p className="text-xs text-slate-400">Powered by ChatKit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ChatKit Container */}
        <div className="flex-1 overflow-hidden relative">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Connection Error</h3>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : !scriptLoaded ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <ChatKit
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                ref={ref as any}
                control={control}
                className="h-full w-full"
                style={{
                  height: '100%',
                }}
              />

              {/* Voice Command Button - Positioned next to send button */}
              <div className="absolute bottom-[0.90rem] right-[3.7rem] z-50">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`
                    relative w-9 h-9 rounded-full
                    transition-all duration-200
                    ${isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-white hover:bg-gray-100'
                    }
                  `}
                  title={isListening ? 'Click to stop' : 'Voice command'}
                >
                  {isListening ? (
                    // Listening - show microphone with white color
                    <svg className="w-4 h-4 text-white mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  ) : (
                    // Idle - show microphone with dark color (matching send button style)
                    <svg className="w-4 h-4 text-gray-700 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  )}

                  {/* Ripple effect when listening */}
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  )}
                </button>

                {/* Status text */}
                {isListening && (
                  <div className="absolute bottom-14 right-0 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold">Listening...</span>
                    </div>
                    {transcript && (
                      <div className="text-blue-300 mt-1 italic text-xs">
                        &quot;{transcript}&quot;
                      </div>
                    )}
                  </div>
                )}

                {/* Processing indicator */}
                {transcript && !isListening && (
                  <div className="absolute bottom-14 right-0 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <div className="font-semibold text-xs">Processing...</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
