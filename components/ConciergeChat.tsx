import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minus, Crown, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { getConciergeResponse } from '../services/geminiService';
import { getFacilities, getRooms } from '../services/mockDb';
import { Facility, RoomType } from '../types';

export const ConciergeChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const initialMessage = { role: 'ai' as const, text: 'Namaste! I am Mero Support. How can I assist you with your booking today?' };
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{facilities: Facility[], rooms: RoomType[]} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const f = await getFacilities();
        const r = await getRooms();
        setData({ facilities: f, rooms: r });
      } catch (e) {
        console.error("Chat failed to load hotel data");
      }
    };
    fetchData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    
    if (!data) {
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the hotel database right now. Please contact the front desk directly for assistance." }]);
        }, 600);
        return;
    }

    setIsLoading(true);

    const response = await getConciergeResponse(userMsg, data.facilities, data.rooms);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
  };

  const handleEndChat = () => {
    setIsOpen(false);
    // Reset chat history after a brief delay to allow window to close
    setTimeout(() => {
        setMessages([initialMessage]);
    }, 300);
  };

  // --- Markdown Formatting Helpers ---

  // 3. Italic Parser (*text*)
  const parseItalic = (text: string, pKey: number, bKey: number) => {
    // Regex matches content between single asterisks
    const parts = text.split(/(\*.+?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={`i-${pKey}-${bKey}-${index}`} className="italic">{part.slice(1, -1)}</em>;
      }
      return <span key={`t-${pKey}-${bKey}-${index}`}>{part}</span>;
    });
  };

  // 2. Bold Parser (**text**)
  const parseBold = (text: string, keyPrefix: number) => {
    // Regex matches content between double asterisks
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Pass to parseItalic to allow nested italics within bold
        return <strong key={`b-${keyPrefix}-${index}`} className="font-bold">{parseItalic(part.slice(2, -2), keyPrefix, index)}</strong>;
      }
      // Chain to Italic
      return parseItalic(part, keyPrefix, index);
    });
  };

  // 1. Root Inline Parser: Strikethrough (~~text~~) -> Bold -> Italic
  const parseInlineFormatting = (text: string) => {
    // Regex matches content between double tildes
    const parts = text.split(/(~~.+?~~)/g);
    return parts.map((part, index) => {
      if (part.startsWith('~~') && part.endsWith('~~')) {
        // Pass to parseBold to allow nested bold/italics within strikethrough
        return <s key={`s-${index}`} className="opacity-75">{parseBold(part.slice(2, -2), index)}</s>;
      }
      // Chain to Bold
      return parseBold(part, index);
    });
  };

  // Main Text Renderer (Handles Line Breaks & Bullets)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      // Handle Bullet Points (lines starting with *)
      if (trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={i} className="flex gap-2 items-start my-1 pl-2">
            <span className="text-emerald-500 font-bold mt-[-2px]">•</span>
            <span className="flex-1">{parseInlineFormatting(content)}</span>
          </div>
        );
      }
      
      // Handle empty lines
      if (!trimmed) return <div key={i} className="h-2" />;
      
      return <div key={i}>{parseInlineFormatting(line)}</div>;
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-white z-50 hover:scale-105 transition-all duration-300 border border-emerald-300 backdrop-blur-md group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {/* Chat Support Icon */}
        <MessageCircle size={32} className="fill-white/20" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-white/20 overflow-hidden backdrop-blur-3xl ring-1 ring-black/5 animate-fade-in-up">
      <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 p-4 flex justify-between items-center text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center">
             <Crown size={18} className="text-white fill-white/20" />
          </div>
          <div className="flex flex-col">
              <h3 className="font-semibold tracking-wide text-sm leading-none">Mero Support</h3>
              <span className="text-[10px] text-emerald-100 opacity-90 mt-0.5">Official Chat Support</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleMinimize} 
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minus size={18} />
          </button>
          <button 
            onClick={handleEndChat} 
            className="hover:bg-white/20 hover:text-red-100 p-1.5 rounded-lg transition-colors"
            title="End Chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/80 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-2 items-end'}`}>
            
            {msg.role === 'ai' && (
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shrink-0 shadow-sm border border-white mb-1">
                  <Crown size={14} className="text-white fill-white/20" />
               </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-none shadow-green-500/20' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              {renderFormattedText(msg.text)}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start gap-2 items-end">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shrink-0 shadow-sm border border-white mb-1">
                  <Crown size={14} className="text-white fill-white/20" />
             </div>
             <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex gap-1.5 items-center">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-400"
        />
        <Button 
          size="sm" 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()} 
          className="rounded-xl px-3 !bg-gradient-to-r !from-emerald-500 !to-green-600 !hover:from-emerald-600 !hover:to-green-700 !border-0 !focus:ring-emerald-500 shadow-md shadow-green-500/20 text-white"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};
