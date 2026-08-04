'use client';

import { useState, useRef } from 'react';
import { MessageSquare, X, Mail, User, ShieldCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'contact'>('contact');
  
  // Tawk.to Reference Instance
  const tawkMessengerRef = useRef<{ maximize?: () => void } | null>(null);

  // Form States
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  
  // EmailJS Status States
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Triggers when the user clicks "Start Live Chat Session"
  const handleStartLiveChat = () => {
    tawkMessengerRef.current?.maximize?.(); // Opens the official Tawk chat window
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = "2349116883716"; 
    const message = encodeURIComponent(
      "Hello David Gadgets, I need assistance."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setIsSending(true);
    setStatusMessage('');

    const templateParams = {
      from_name: contactForm.name,
      reply_to: contactForm.email,
      message: contactForm.message,
    };

    try {
      await emailjs.send(
        'service_99ig5jh',   
        'template_afy7jmw',  
        templateParams,
        'mgv7wJizF5LLhjjbU'    
      );

      setStatusMessage('Message sent successfully! We will get back to you shortly.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Email delivery error:', error);
      setStatusMessage('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-white">
      
      {/* 🛠️ INVISIBLE TAWK ENGINE LOADER */}
      <TawkMessengerReact
        propertyId="6a4aeb922734a21d4f1adf86"
        widgetId="1jsqagdgb"
        ref={tawkMessengerRef}
        onLoad={() => undefined}
        customStyle={{ visibility: 'hidden' }} // Hides the native green circle bubble
      />

      {/* 💬 FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-xl shadow-blue-600/25 hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all duration-300 glow-hover interactive-bounce"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* 📦 SUPPORT WINDOW MODAL */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-88 sm:w-96 z-40 overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950/95 backdrop-blur-xl shadow-2xl transition-all duration-300 animate-fade-in glass-panel">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 to-black p-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-sm tracking-wide text-zinc-100">David Gadgets Support</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Typically replies within a few minutes</p>
            
            {/* Tabs */}
            <div className="mt-4 flex rounded-xl bg-zinc-900/60 p-1 text-xs font-semibold border border-zinc-900">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 rounded-lg py-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${activeTab === 'chat' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 rounded-lg py-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${activeTab === 'contact' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Leave a Message
              </button>
            </div></div>

          {/* 💬 TAB 1: LIVE CHAT AREA */}
          {activeTab === 'chat' && (
            <div className="flex h-80 flex-col justify-between bg-zinc-950 p-4 animate-fade-in">
              <div className="flex-1 flex flex-col justify-center items-center space-y-3 text-center px-4">
                <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 text-zinc-400 flex gap-3 items-start text-left text-xs leading-relaxed">
                  <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Welcome to escrow support. Click the button below to connect directly with a secure agent for order updates or system verifications.</span>
                </div>

                <button 
                  onClick={handleStartLiveChat}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce"
                >
                  <MessageSquare className="h-4 w-4" />
                  Start Live Chat Session
                </button>

                <button 
                  type="button"
                  onClick={handleWhatsAppSupport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.638 1.966 14.19 1.01 11.581 1.01 6.145 1.01 1.72 5.38 1.717 10.81c0 1.69.467 3.336 1.354 4.793l-.993 3.624 3.73-.973zm11.233-5.263c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-1.206-.6-2.079-1.062-2.92-2.51-.225-.39.225-.36.643-1.196.075-.15.038-.282-.018-.393-.056-.113-.477-1.15-.654-1.575-.172-.412-.348-.356-.477-.363-.124-.007-.267-.008-.41-.008-.143 0-.376.053-.573.267-.197.213-.753.736-.753 1.795s.77 2.083.877 2.228c.107.144 1.516 2.314 3.67 3.243.513.22 1.127.352 1.513.275.602-.09 1.772-.724 2.022-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
                  </svg>
                  <span>Start WhatsApp Support</span>
                </button>
              </div>
            </div>
          )}

          {/* ✉️ TAB 2: CONTACT FORM */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSendContact} className="space-y-3 bg-zinc-950 p-4 text-sm animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 pl-9 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 pl-9 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Describe your inquiry or order issue..."
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700 resize-none"
                />
              </div>

              {statusMessage && (
                <p className={`text-xs ${statusMessage.includes('successfully') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full rounded-xl bg-white py-3 font-bold text-zinc-950 hover:bg-zinc-250 transition-all duration-300 text-xs mt-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce shadow-md"
              >
                {isSending ? 'Sending Message...' : 'Submit Form'}
              </button>
            </form>)}

        </div>
      )}
    </div> 
  );
}
