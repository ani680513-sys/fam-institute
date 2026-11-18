'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Database,
  Users,
  ArrowRight,
  BrainCircuit,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KnowledgeItem {
  id: number;
  category: string;
  content: string;
  created_at: string;
}

interface AdmissionItem {
  id: number;
  full_name: string;
  phone: string;
  department: string;
  created_at: string;
}

interface ChatLogItem {
  id: number;
  student_name: string;
  question: string;
  answer: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [category, setCategory] = useState('خشتەی وانەکان');
  const [content, setContent] = useState('');
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);

  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLogItem[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'danar91') {
      setIsAuthenticated(true);
      setError('');
      fetchData();
    } else {
      setError('وشەی نهێنی هەڵەیە!');
    }
  };

  const fetchData = async () => {
    const { data: kData } = await supabase
      .from('bot_knowledge')
      .select('*')
      .order('created_at', { ascending: false });
    if (kData) setKnowledgeList(kData);

    const { data: aData } = await supabase
      .from('admissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (aData) setAdmissions(aData);

    const { data: cData } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (cData) setChatLogs(cData);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoadingKnowledge(true);

    const { error } = await supabase
      .from('bot_knowledge')
      .insert([{ category, content: content.trim() }]);

    if (!error) {
      setContent('');
      await fetchData();
    }
    setLoadingKnowledge(false);
  };

  const handleDeleteKnowledge = async (id: number) => {
    await supabase.from('bot_knowledge').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteLog = async (id: number) => {
    await supabase.from('chat_logs').delete().eq('id', id);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#060913] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">پانێڵی بەڕێوەبەر</h1>
          <p className="text-sm text-slate-400 mb-6">وشەی نهێنی بەڕێوەبەر بنووسە بۆ چوونەژوورەوە</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="وشەی نهێنی..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-500 focus:outline-none text-center font-mono"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 font-bold text-white shadow-lg shadow-cyan-500/20"
            >
              چوونەژوورەوە
            </button>
          </form>

          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mt-6">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>گەڕانەوە بۆ پەڕەی سەرەکی</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#060913] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">بەڕێوەبردنی پەیمانگای فام</h1>
              <p className="text-xs text-slate-400">چاودێری چاتی خوێندکاران و مێشکی AI</p>
            </div>
          </div>

          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-2 transition"
          >
            <span>بینینی سایت</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
              <h2 className="text-lg font-bold">تۆماری پرسیاری خوێندکاران ({chatLogs.length})</h2>
            </div>
            <button
              onClick={fetchData}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              نوێکردنەوە
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {chatLogs.length === 0 ? (
              <p className="text-sm text-slate-500">هێشتا هیچ خوێندکارێک پرسیاری نەکردووە.</p>
            ) : (
              chatLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-950/90 border border-white/5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-xs font-bold">
                        {log.student_name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(log.created_at).toLocaleString('ku-IQ')}
                      </span>
                    </div>
                    <p className="text-sm text-cyan-300 font-medium">پرسیار: {log.question}</p>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      وەڵامی AI: {log.answer}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <BrainCircuit className="w-6 h-6 text-cyan-400" />
                <h2 className="text-lg font-bold">پێدانی زانیاری نوێ بە AI</h2>
              </div>

              <form onSubmit={handleAddKnowledge} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">جۆری زانیاری</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm"
                  >
                    <option value="خشتەی وانەکان">خشتەی وانەکان</option>
                    <option value="ئاگاداری و هەواڵ">ئاگاداری و هەواڵ</option>
                    <option value="زانیاری مامۆستایان">زانیاری مامۆستایان</option>
                    <option value="ڕێنمایی گشتی">ڕێنمایی گشتی پەیمانگا</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">ناوەڕۆکی زانیارییەکە</label>
                  <textarea
                    rows={3}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="نموونە: ڕۆژی یەکشەممە کاتژمێر ٩:٠٠ وانەی پایتۆن لە هۆڵی ٢ بەڕێوەدەچێت..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingKnowledge}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition"
                >
                  {loadingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>زیادکردن بۆ مێشکی AI</span>
                </button>
              </form>
            </div>

            <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold">زانیارییە پاشەکەوتکراوەکان ({knowledgeList.length})</h3>
              </div>

              <div className="space-y-3">
                {knowledgeList.length === 0 ? (
                  <p className="text-sm text-slate-500">هێشتا هیچ زانیارییەک زیاد نەکراوە.</p>
                ) : (
                  knowledgeList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex items-start justify-between gap-4"
                    >
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-1.5">
                          {item.category}
                        </span>
                        <p className="text-sm text-slate-200 leading-relaxed">{item.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteKnowledge(item.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold">داواکاری خوێندکاران ({admissions.length})</h2>
              </div>

              <div className="space-y-3">
                {admissions.length === 0 ? (
                  <p className="text-sm text-slate-500">هیچ داواکارییەکی نوێ نییە.</p>
                ) : (
                  admissions.map((student) => (
                    <div key={student.id} className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                      <h4 className="font-bold text-sm text-white">{student.full_name}</h4>
                      <p className="text-xs text-cyan-400">{student.department}</p>
                      <p className="text-xs text-slate-400 font-mono" dir="ltr">
                        {student.phone}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}