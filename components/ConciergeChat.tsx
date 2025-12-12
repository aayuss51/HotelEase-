import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minus, Crown } from 'lucide-react';
import { Button } from './Button';
import { getConciergeResponse } from '../services/geminiService';
import { getFacilities, getRooms } from '../services/mockDb';
import { Facility, RoomType } from '../types';

// Placeholder for your 3D Namaste Character
// TODO: Please replace this URL with the direct link to the 3D character image you uploaded
const CONCIERGE_AVATAR = "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436185.jpg?w=200";

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
    setTimeout(() => {
        setMessages([initialMessage]);
    }, 300);
  };

  const parseItalic = (text: string, pKey: number, bKey: number) => {
    const parts = text.split(/(\*.+?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={`i-${pKey}-${bKey}-${index}`} className="italic">{part.slice(1, -1)}</em>;
      }
      return <span key={`t-${pKey}-${bKey}-${index}`}>{part}</span>;
    });
  };

  const parseBold = (text: string, keyPrefix: number) => {
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`b-${keyPrefix}-${index}`} className="font-bold">{parseItalic(part.slice(2, -2), keyPrefix, index)}</strong>;
      }
      return parseItalic(part, keyPrefix, index);
    });
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(~~.+?~~)/g);
    return parts.map((part, index) => {
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <s key={`s-${index}`} className="opacity-75">{parseBold(part.slice(2, -2), index)}</s>;
      }
      return parseBold(part, index);
    });
  };

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
      {/* WhatsApp Button - Glassy Neumorphism */}
      {!isOpen && (
        <a
          href="https://api.whatsapp.com/send/?phone=9764453517&text=Hello+How+can+I+help+you%3F&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 w-16 h-16 rounded-[24px] bg-[#25D366]/80 backdrop-blur-xl hover:bg-[#20bd5a]/90 shadow-[0_8px_32px_0_rgba(37,211,102,0.37)] border border-white/20 flex items-center justify-center text-white z-50 hover:scale-105 transition-all duration-300 group"
          title="Chat on WhatsApp"
        >
          {/* Inner Gloss */}
          <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          
          {/* Tooltip */}
          <span className="absolute right-full mr-4 bg-white/70 backdrop-blur-md text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/50 text-center">
            WhatsApp Us
          </span>
          <WhatsAppIcon size={32} />
        </a>
      )}

      {/* Main Chat Toggle Button - Full Bleed Avatar with Glassy Container cues */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex items-center justify-center z-50 hover:scale-105 transition-all duration-300 border border-white/40 p-0 group overflow-hidden"
          title="Chat with Concierge"
        >
          {/* Full-bleed Avatar Image */}
          <img 
            src={CONCIERGE_AVATAR} 
            alt="Concierge" 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
          {/* Subtle Glass Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-transparent to-white/20 pointer-events-none"></div>
          
          {/* Online Indicator - Neumorphic Style */}
          <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white/80 shadow-[0_0_8px_rgba(34,197,94,0.6)] z-10"></div>
        </button>
      )}

      {/* Chat Window - iOS 26 Glass Aesthetics */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white/60 backdrop-blur-[40px] rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] z-50 flex flex-col border border-white/40 overflow-hidden ring-1 ring-white/30 animate-fade-in-up transition-all">
          
          {/* Header - Transparent Glass */}
          <div className="bg-white/30 backdrop-blur-xl p-4 flex justify-between items-center border-b border-white/20 shadow-sm relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-0.5 bg-white/40 rounded-full backdrop-blur-md border border-white/40 flex items-center justify-center overflow-hidden w-11 h-11 shadow-inner">
                 <img src={CONCIERGE_AVATAR} alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                  <h3 className="font-bold tracking-wide text-sm leading-none flex items-center gap-1.5 text-slate-800">
                    Mero Support 
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">Online • Instant Reply</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a 
                  href="https://api.whatsapp.com/send/?phone=9764453517&text=Hello+How+can+I+help+you%3F&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-white/50 p-2 rounded-xl transition-all text-slate-600 hover:text-green-600 hover:shadow-sm"
                  title="WhatsApp"
              >
                  <WhatsAppIcon size={18} />
              </a>
              <button 
                onClick={handleMinimize} 
                className="hover:bg-white/50 p-2 rounded-xl transition-all text-slate-600 hover:text-slate-900 hover:shadow-sm"
                title="Minimize"
              >
                <Minus size={18} />
              </button>
              <button 
                onClick={handleEndChat} 
                className="hover:bg-red-50/50 p-2 rounded-xl transition-all text-slate-600 hover:text-red-500 hover:shadow-sm"
                title="End Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Area - Soft Texture */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-white/10 to-white/20 custom-scrollbar scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-3 items-end'}`}>
                
                {msg.role === 'ai' && (
                   <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur flex items-center justify-center shrink-0 shadow-sm border border-white/50 mb-1 overflow-hidden">
                      <img src={CONCIERGE_AVATAR} alt="AI" className="w-full h-full object-cover" />
                   </div>
                )}

                <div className={`max-w-[80%] rounded-[20px] p-3.5 text-sm leading-relaxed backdrop-blur-md shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500/80 text-white rounded-br-none shadow-[0_4px_12px_rgba(16,185,129,0.2)] border-emerald-400/30' 
                    : 'bg-white/60 text-slate-800 rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-white/60'
                }`}>
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start gap-3 items-end">
                 <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur flex items-center justify-center shrink-0 shadow-sm border border-white/50 mb-1 overflow-hidden">
                      <img src={CONCIERGE_AVATAR} alt="AI" className="w-full h-full object-cover" />
                 </div>
                 <div className="bg-white/60 border border-white/60 backdrop-blur-md rounded-[20px] rounded-bl-none p-4 shadow-sm flex gap-1.5 items-center">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Floating Glass Pill */}
          <div className="p-4 bg-white/30 border-t border-white/40 backdrop-blur-lg">
             <div className="relative flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/50 border border-white/60 rounded-[20px] pl-5 pr-12 py-3 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/70 transition-all shadow-inner backdrop-blur-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()} 
                  className="absolute right-1.5 rounded-[16px] w-10 h-10 !p-0 flex items-center justify-center !bg-emerald-500/90 hover:!bg-emerald-600 !border-0 text-white shadow-md shadow-emerald-500/20"
                >
                  <Send size={18} className={input.trim() ? "ml-0.5" : ""} />
                </Button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};