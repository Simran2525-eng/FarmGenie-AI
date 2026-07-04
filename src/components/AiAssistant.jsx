import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hello! I am the FarmGenie AI Assistant, your personal agricultural expert. Ask me anything about crop recommendations, seed varieties, optimal farming practices, fertilizer NPK ratios, irrigation methods, weather precautions, or government schemes. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickQuestions = [
    "What fertilizer ratio should I use for Rice?",
    "Explain the PM-KISAN scheme benefits",
    "What is the best sowing month for Wheat?",
    "How should I irrigate Cotton crops?",
    "Weather precautions for heavy rain warnings"
  ];

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Prepare history to send to backend
    // Only send the last 8 messages to keep payload size optimal
    const chatHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    })).slice(-8);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: chatHistory
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "I encountered a minor issue processing that. Please try asking again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Connection failed. Please ensure the FarmGenie FastAPI server is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[450px] flex flex-col justify-between animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles className="text-emerald-400 shrink-0" size={24} /> FarmGenie AI Assistant
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">Your intelligent, localized agricultural advisor.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chat area */}
        <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl border border-slate-800 h-full">
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  className={`flex gap-3.5 max-w-[85%] md:max-w-[75%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-inner ${
                    isUser 
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed border ${
                    isUser 
                      ? 'bg-emerald-500/15 border-emerald-500/20 text-slate-100 rounded-tr-none' 
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3.5 mr-auto max-w-[75%]">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-850 text-slate-400 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input field */}
          <div className="p-4 border-t border-slate-800/85 bg-slate-950/40 flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about fertilizer requirements, seed varieties..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 transition-all"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={loading || !inputValue.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 active:scale-95 text-slate-950 p-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 shrink-0"
            >
              <Send size={16} />
            </button>
          </div>

        </div>

        {/* Quick topics sidebar */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col gap-4 h-full overflow-y-auto">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bot size={16} className="text-emerald-400" /> Suggested Questions
          </h3>
          <div className="flex flex-col gap-2.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-left text-xs bg-slate-900 border border-slate-800/85 hover:border-emerald-500/30 hover:bg-slate-850 text-slate-350 p-3.5 rounded-xl transition-all duration-300 leading-normal"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="mt-auto border-t border-slate-800/80 pt-3 text-[10px] text-slate-500 leading-relaxed">
            FarmGenie matches question topics like seed types, sowing schedules, fertilizers, and rules automatically. Paste your Gemini API key in Settings for fully open-ended queries.
          </div>
        </div>

      </div>

    </div>
  );
}
