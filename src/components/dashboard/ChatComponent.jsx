import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Trash } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI("AIzaSyCXmqFCPQ-BCbLeKLIypzxtis6QpdDWtVc");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process markdown-like syntax in the response
  const processResponse = (text) => {
    // Convert headers
    text = text.replace(/#{1,6} (.+)/g, (match, content) => {
      const level = match.split(' ')[0].length;
      const size = Math.max(6 - level + 1, 1);
      return `<h${level} class="text-${size}xl font-bold my-2 text-white">${content}</h${level}>`;
    });

    // Convert bold text
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Convert italic text
    text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

    // Convert code blocks
    text = text.replace(/```(\w+)?\n([\s\S]+?)\n```/g, 
      '<pre class="bg-gray-800 p-4 rounded-lg my-2 overflow-x-auto"><code>$2</code></pre>');

    // Convert inline code
    text = text.replace(/`(.+?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>');

    // Convert bullet points
    text = text.replace(/^\s*[-*+]\s+(.+)/gm, '<li class="ml-4">$1</li>');

    // Convert numbered lists
    text = text.replace(/^\s*\d+\.\s+(.+)/gm, '<li class="ml-4">$1</li>');

    // Convert line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim()
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
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">AI Chat Assistant</h2>
          <p className="text-sm text-gray-400">Powered by Gemini</p>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          aria-label="Clear chat"
        >
          <Trash className="h-5 w-5" />
        </button>
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