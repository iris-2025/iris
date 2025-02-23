import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Trash, Mic, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI("AIzaSyCXmqFCPQ-BCbLeKLIypzxtis6QpdDWtVc");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSubmit({ preventDefault: () => {} }, transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Speech recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-speech function
  const speak = (text) => {
    if (!synthesisRef.current) {
      setError('Text-to-speech is not supported in your browser.');
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Text-to-speech failed. Please try again.');
    };

    synthesisRef.current.speak(utterance);
  };

  // Toggle text-to-speech for the last assistant message
  const toggleSpeak = () => {
    if (isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    } else {
      const lastAssistantMessage = [...messages].reverse()
        .find(m => m.role === 'assistant');
      if (lastAssistantMessage) {
        // Remove HTML tags from the processed response
        const plainText = lastAssistantMessage.content.replace(/<[^>]+>/g, '');
        speak(plainText);
      }
    }
  };

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process markdown-like syntax in the response
  const processResponse = (text) => {
    // ... (keep existing processResponse function unchanged)
  };

  const handleSubmit = async (e, voiceInput = null) => {
    e.preventDefault();
    const messageText = voiceInput || inputMessage;
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await model.generateContent(userMessage.content);
      const assistantMessage = {
        role: 'assistant',
        content: result.response.text()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Automatically speak the assistant's response
      speak(assistantMessage.content);
    } catch (err) {
      console.error('Error generating response:', err);
      setError('Failed to generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
    synthesisRef.current.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">AI Chat Assistant</h2>
          <p className="text-sm text-gray-400">Powered by Gemini</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSpeak}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            aria-label={isSpeaking ? "Stop speaking" : "Speak response"}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            aria-label="Clear chat"
          >
            <Trash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-500" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-200'
              }`}
            >
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: processResponse(message.content)
                }}
              />
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-500" />
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg text-white transition-colors ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            disabled={isLoading}
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;