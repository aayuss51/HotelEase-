import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minus, Crown } from 'lucide-react';
import { Button } from './Button';
import { getConciergeResponse } from '../services/geminiService';
import { getFacilities, getRooms } from '../services/mockDb';
import { Facility, RoomType } from '../types';

// Placeholder for your 3D Namaste Character
// Replace this URL with your specific image path or URL
const CONCIERGE_AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256";

// Authentic WhatsApp Logo SVG
const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

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
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`b-${keyPrefix}-${index}`} className="font-bold">{parseItalic(part.slice(2, -2), keyPrefix, index)}</strong>;
      }
      return parseItalic(part, keyPrefix, index);
    });
  };

  // 1. Root Inline Parser: Strikethrough (~~text~~) -> Bold -> Italic
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(~~.+?~~)/g);
    return parts.map((part, index) => {
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <s key={`s-${index}`} className="opacity-75">{parseBold(part.slice(2, -2), index)}</s>;
      }
      return parseBold(part, index);
    });
  };

  // Main Text Renderer
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={i} className="flex gap-2 items-start my-1 pl-2">
            <span className="text-emerald-500 font-bold mt-[-2px]">•</span>
            <span className="flex-1">{parseInlineFormatting(content)}</span>
          </div>
        );
      }
      if (!trimmed) return <div key={i} className="h-2" />;
      return <div key={i}>{parseInlineFormatting(line)}</div>;
    });
  };

  return (
    <>
      {/* WhatsApp Button - Visible when chat is closed */}
      {!isOpen && (
        <a
          href="https://api.whatsapp.com/send/?phone=9764453517&text=Hello+How+can+I+help+you%3F&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] shadow-2xl shadow-green-500/30 flex items-center justify-center text-white z-50 hover:scale-105 transition-all duration-300 border border-green-400/50 backdrop-blur-md group animate-fade-in-up"
          title="Chat on WhatsApp"
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {/* Tooltip */}
          <span className="absolute right-full mr-4 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100 text-center">
            WhatsApp Us
          </span>
          <WhatsAppIcon size={32} />
        </a>
      )}

      {/* Main Chat Toggle Button - Now uses Avatar Image */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-white z-50 hover:scale-105 transition-all duration-300 border border-emerald-300 backdrop-blur-md group animate-fade-in-up p-0.5 overflow-hidden"
          title="Chat with Concierge"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          {/* Avatar Image Frame */}
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-white/10 relative">
             <img 
               src={CONCIERGE_AVATAR} 
               alt="Concierge" 
               className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
             />
             {/* Online Indicator */}
             <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-20"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-white/20 overflow-hidden backdrop-blur-3xl ring-1 ring-black/5 animate-fade-in-up">
          <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-0.5 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden w-10 h-10 shadow-sm">
                 <img src={CONCIERGE_AVATAR} alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                  <h3 className="font-semibold tracking-wide text-sm leading-none flex items-center gap-1">
                    Mero Support <div className="w-1.5 h-1.5 rounded-full bg-green-300 shadow-[0_0_5px_rgba(134,239,172,0.8)]"></div>
                  </h3>
                  <span className="text-[10px] text-emerald-100 opacity-90 mt-0.5">Online • Replies instantly</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a 
                  href="https://api.whatsapp.com/send/?phone=9764453517&text=Hello+How+can+I+help+you%3F&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors text-white/90 hover:text-white mr-1"
                  title="WhatsApp"
              >
                  <WhatsAppIcon size={18} />
              </a>
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
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 shadow-sm border border-white mb-1 overflow-hidden">
                      <img src={CONCIERGE_AVATAR} alt="AI" className="w-full h-full object-cover" />
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
                 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 shadow-sm border border-white mb-1 overflow-hidden">
                      <img src={CONCIERGE_AVATAR} alt="AI" className="w-full h-full object-cover" />
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
      )}
    </>
  );
};