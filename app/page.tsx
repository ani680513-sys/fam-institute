'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Lock,
  Bot,
  User,
  GraduationCap,
  Cpu,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Terminal,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function FamInstituteAI() {
  const [studentName, setStudentName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showAdmission, setShowAdmission] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('زیرەکی دەستکرد (AI)');
  const [admissionStatus, setAdmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || studentName.trim().length < 2) {
      setAuthError('تکایە سەرەتا ناوی تەواوی خۆت بنووسە!');
      return;
    }
    if (!accessCode.trim()) {
      setAuthError('تکایە کۆدی خوێندکاران بنووسە!');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName.trim(),
          accessCode: accessCode.trim(),
          isVerifyOnly: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'کۆدەکە هەڵەیە!');
      } else {
        setIsUnlocked(true);
        setMessages([
          {
            role: 'model',
            text: `بەخێربێیت ${studentName.trim()} گیان! 👋\nمن یاریدەدەری زیرەکی بەشی AIـم لە پەیمانگای فام. فەرموو پرسیارەکەت بکە:`,
          },
        ]);
      }
    } catch {
      setAuthError('کێشەیەک لە پەیوەندی ڕوویدا، دووبارە هەوڵبدەرەوە.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.slice(1),
          accessCode: accessCode.trim(),
          studentName: studentName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages([...updatedMessages, { role: 'model', text: data.error || 'هەڵەیەک ڕوویدا.' }]);
      } else {
        setMessages([...updatedMessages, { role: 'model', text: data.reply }]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        { role: 'model', text: 'ببورە، پەیوەندی بە سێرڤەرەوە پچڕا. تکایە دووبارە هەوڵبدەرەوە.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdmissionStatus('submitting');

    const { error } = await supabase
      .from('admissions')
      .insert([{ full_name: fullName, phone, department }]);

    if (error) {
      setAdmissionStatus('error');
    } else {
      setAdmissionStatus('success');
      setFullName('');
      setPhone('');
    }
  };

  const quickPrompts = [
    'خشتەی وانەکانی ئەم هەفتەیە چۆنە؟',
    'کۆدێکی سادەی پایتۆنم بۆ بنووسە',
    'زانیاری دەربارەی بەشی AI لە پەیمانگای فام',
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#060913]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-l from-white to-slate-300 bg-clip-text text-transparent">
                پەیمانگای فام
              </h1>
              <p className="text-xs text-cyan-400 font-medium">بەشی زیرەکی دەستکرد • AI Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdmission(!showAdmission)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>{showAdmission ? 'گەڕانەوە بۆ AI' : 'داواکاری خوێندن'}</span>
            </button>
            <a
              href="/admin"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
              title="پانێڵی بەڕێوەبەر"
            >
              <ShieldCheck className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {showAdmission ? (
          <div className="max-w-xl mx-auto bg-slate-900/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">فۆڕمی ناوتۆمارکردنی خوێندکاران</h2>
                <p className="text-sm text-slate-400">زانیارییەکانت بنووسە بۆ پەیوەندیکردن پێتەوە</p>
              </div>
            </div>

            {admissionStatus === 'success' ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-300">داواکارییەکەت بە سەرکەوتوویی تۆمارکرا!</h3>
                <p className="text-sm text-slate-300">بەڕێوەبەرایەتی پەیمانگای فام بە زووترین کات پەیوەندیت پێوە دەکات.</p>
                <button
                  onClick={() => {
                    setAdmissionStatus('idle');
                    setShowAdmission(false);
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition"
                >
                  گەڕانەوە بۆ سەرەتا
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdmissionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">ناوی تەواو</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="نموونە: دانەر دانا جەمال"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">ژمارەی مۆبایل</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0770 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">بەشی خوازراو</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm"
                  >
                    <option value="زیرەکی دەستکرد (AI)">زیرەکی دەستکرد (AI)</option>
                    <option value="پرۆگرامینگ و وێب">پرۆگرامینگ و پەرەپێدانی وێب</option>
                    <option value="ئاسایشی ئەلیکترۆنی">ئاسایشی ئەلیکترۆنی (Cybersecurity)</option>
                    <option value="تەکنەلۆژیای زانیاری">تەکنەلۆژیای زانیاری (IT)</option>
                  </select>
                </div>

                {admissionStatus === 'error' && (
                  <p className="text-sm text-rose-400">کێشەیەک ڕوویدا لە ناردنی فۆڕمەکە، تکایە دووبارە هەوڵبدەرەوە.</p>
                )}

                <button
                  type="submit"
                  disabled={admissionStatus === 'submitting'}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 hover:opacity-95 font-bold text-white shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                >
                  {admissionStatus === 'submitting' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>ناردنی داواکاری</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-5">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>وەشانی نوێی ٢٠٢٦</span>
                </div>
                <h2 className="text-2xl font-bold leading-snug mb-3">
                  یاریدەدەری زیرەکی خوێندکارانی <span className="text-cyan-400">فام</span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  سیستەمێکی زیرەکی تایبەت بە خوێندکارانی بەشی AI لە سلێمانی، بۆ وەڵامدانەوەی خێرای پرسیارە زانستییەکان و خشتەی وانەکانی پەیمانگا.
                </p>

                <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span>یارمەتیدەر لە کۆدنووسین و پایتۆن</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>زانیاری نوێکراوەی پەیمانگا</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-900/70 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[620px]">
              {!isUnlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">چوونەژوورەوەی خوێندکاران</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    تکایە ناوی تەواوی خۆت و کۆدی خوێندکاران بنووسە بۆ کردنەوەی یاریدەدەرە زیرەکەکە.
                  </p>

                  <form onSubmit={handleUnlock} className="w-full space-y-3">
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="ناوی تەواوت (نموونە: دانەر دانا)..."
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/10 focus:border-cyan-500 focus:outline-none text-center text-sm"
                    />
                    <input
                      type="password"
                      required
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="کۆدی چوونەژوورەوە..."
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/10 focus:border-cyan-500 focus:outline-none text-center tracking-widest font-mono"
                    />
                    {authError && <p className="text-xs text-rose-400">{authError}</p>}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 hover:opacity-95 font-bold text-white shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'کردنەوەی سیستەم'}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Bot className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Fam AI Assistant</h3>
                        <p className="text-xs text-emerald-400">خوێندکار: {studentName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${
                          msg.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-800/80 text-slate-100 border border-white/5 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-white/5 text-slate-400 text-sm flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>خەریکی بیرکردنەوەم...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {messages.length === 1 && (
                    <div className="px-5 pb-3 flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(undefined, prompt)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/15 hover:text-cyan-300 border border-white/10 transition"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-950/50 flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="پرسیارەکەت لێرە بنووسە..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}