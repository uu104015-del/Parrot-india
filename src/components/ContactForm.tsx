import React, { useState } from 'react';
import { Send, Phone, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in both Name and Phone details.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, message }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatus('success');
        setName('');
        setPhone('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setStatus('error');
      setErrorMessage('Failed to connect to the server. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Informative Side */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              🦜 Book Your Companion Consultation
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
              Have Questions? <br className="hidden lg:inline" /> Speak to our Experts
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-light leading-relaxed">
              Whether you are looking to purchase a playful Macaw or have questions about the cage requirements, nutrition, or behavior training for an African Grey – our aviary specialists are here to guide you 24/7.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                  📞
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Official Hotline</p>
                  <p className="text-sm font-semibold text-slate-950 font-mono">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  📍
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Main Aviary Breeding Wing</p>
                  <p className="text-sm font-semibold text-slate-950">Gurugram, National Capital Region (NCR), India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
              
              <h3 className="font-display font-bold text-slate-950 text-xl tracking-tight mb-2">
                Submit an Enquiry Form
              </h3>
              <p className="text-xs text-slate-400 font-light mb-6">
                Our aviary manager will reach back to you within 30 minutes via Phone or WhatsApp.
              </p>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-950">Thank you Hitesh-ji / Visitor!</h4>
                    <p className="mt-1 font-light leading-relaxed">Your enquiry has been successfully logged into our database. An expert breeder will call you at your provided number shortly.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-rose-950">Submission Failed</h4>
                    <p className="mt-1 font-light leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label htmlFor="client-name" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="e.g., Hitesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="client-phone" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="client-phone"
                      type="tel"
                      required
                      placeholder="e.g., +91 99999 88888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="client-msg" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Specific Questions (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <textarea
                      id="client-msg"
                      rows={4}
                      placeholder="Ask about training, DNA certificate, cage advice, shipping timeline, etc."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-950 hover:to-slate-900 text-white font-semibold rounded-xl tracking-wide text-xs sm:text-sm cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Please wait, registering enquiry...' : 'Submit Consultation Request'}
                  <Send className="w-4 h-4" />
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
