import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { message, history, accessCode, studentName, isVerifyOnly } = await req.json();

    const validCode = (process.env.STUDENT_ACCESS_CODE || 'AI4444').trim().toUpperCase();

   if (accessCode?.trim().toUpperCase() !== validCode) {
      return NextResponse.json(
        { error: 'کۆدی چوونەژوورەوە هەڵەیە! تکایە دڵنیابەرەوە لە کۆدەکەت.' },
        { status: 401 }
      );
    }

    if (!studentName || studentName.trim().length < 2) {
      return NextResponse.json(
        { error: 'تکایە ناوی تەواوی خۆت بنووسە پێش چوونەژوورەوە.' },
        { status: 400 }
      );
    }

    if (isVerifyOnly) {
      return NextResponse.json({ verified: true });
    }

    const { data: knowledgeData } = await supabase
      .from('bot_knowledge')
      .select('category, content');

    const knowledgeBase =
      knowledgeData && knowledgeData.length > 0
        ? knowledgeData.map((k) => `[${k.category}]: ${k.content}`).join('\n')
        : 'هێشتا هیچ زانیارییەکی تایبەت لە لایەن بەڕێوەبەرەوە زیاد نەکراوە.';

    const systemInstruction = `تۆ یاریدەدەری زیرەکی فەرمی "پەیمانگای فام" (Fam Institute)یت. بە زمانی کوردیی سۆرانییەکی ڕەوان و دۆستانە وەڵامی پرسیاری خوێندکارەکە بدەرەوە کە ناوی "${studentName}"ـە.

--- زانیارییەکانی پەیمانگای فام ---
${knowledgeBase}
----------------------------------

تێبینی گرنگ: ئەگەر پرسیارێک پەیوەندی بە کاروباری ناوخۆیی و زانیاریی تایبەتی پەیمانگای فامەوە هەبوو و لە زانیارییەکانی سەرەوەدا نەبوو، بە ڕێزەوە بڵێ هێشتا لە لایەن بەڕێوەبەرایەتی پەیمانگاوە نوێ نەکراوەتەوە. بۆ پرسیارە زانستییەکانی پرۆگرامینگ و زیرەکی دەستکرد یارمەتییەکی زۆر باشی بدە.`;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...(history || []).map((msg: { role: string; text: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: message },
    ];
     const apiKey = process.env.GROQ_API_KEY?.trim();
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: messages,
        temperature: 0.7,
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      throw new Error(data.error?.message || 'هەڵەیەک لە پەیوەندیکردن بە سێرڤەری AI ڕوویدا');
    }

    const replyText = data.choices?.[0]?.message?.content || 'وەڵامێک نەدۆزرایەوە.';

    await supabase.from('chat_logs').insert([
      {
        student_name: studentName.trim(),
        question: message,
        answer: replyText,
      },
    ]);

    return NextResponse.json({ reply: replyText });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'هەڵەی نەناسراو';
    return NextResponse.json(
      { error: `کێشەیەک ڕوویدا: ${errorMessage}` },
      { status: 500 }
    );
  }
}