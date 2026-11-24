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

    const cleanName = studentName.trim();
    const isPresident =
      cleanName.includes('دانەر') ||
      cleanName.toLowerCase().includes('danar') ||
      cleanName.toLowerCase().includes('outis');

    const roleInstruction = isPresident
      ? `ئەم بەکارهێنەرە بەڕێز "${cleanName}"ـە کە سەرۆکی بەشی زیرەکی دەستکردە (AI) لە پەیمانگای فام. بە ڕێزێکی زۆر تایبەت و شکۆدارەوە وەک سەرۆکی بەش مامەڵەی لەگەڵ بکە و هەر فەرمان یان پرسیارێکی هەبوو بە باشترین شێوە جێبەجێی بکە (هەرگیز وشەی "نوێنەر" بەکارمەهێنە).`
      : `ئەم بەکارهێنەرە خوێندکارێکی خۆشەویستی پەیمانگای فامە بە ناوی "${cleanName}". ڕاستەوخۆ بە ناوی خۆیەوە بە گەرمی و ڕێزەوە بەخێرهاتنی بکە و وەک مامۆستا و یاریدەدەرێکی زۆر زیرەک هاوکاری بکە.`;

    const systemInstruction = `تۆ زیرەکترین یاریدەدەری فەرمی "پەیمانگای فام" (Fam Institute)یت بۆ بەشی زیرەکی دەستکرد (AI) و زانستی کۆمپیوتەر. بە زمانی کوردیی سۆرانییەکی زۆر ڕەوان، جوان و دۆستانە وەڵام بدەرەوە.

${roleInstruction}

--- زانیاری و ڕێنماییەکانی پەیمانگای فام ---
${knowledgeBase}
---------------------------------------------

توانا و ئەرکەکانت:
1. پسپۆڕی باڵایت لە هەموو بوارەکانی کۆمپیوتەر، زیرەکی دەستکرد (AI)، پرۆگرامسازی (Python, JavaScript, C++, Web Development)، داتابەیس، نێتۆرک، ئاسایشی زانیاری (Cybersecurity)، سیستەمەکانی کارپێکردن (Windows, Linux)، و هەموو وانە و بابەتەکانی خوێندن.
2. کاتێک خوێندکار پرسیار لەسەر دەرسێک یان کۆدێک دەکات، بە شێوەیەکی سادە، قۆناغ بە قۆناغ، و بە نموونەی ڕوون و کرداری تێی بگەیەنە و هانی بدە.
3. ئەگەر زانیارییەک لە بەشی "زانیاری و ڕێنماییەکانی پەیمانگای فام"ـی سەرەوەدا هەبوو، بە وردی جێبەجێی بکە و پشتی پێ ببەستە. ئەگەر پرسیارێک دەربارەی کاروباری ناوخۆیی و بڕیارە تایبەتەکانی پەیمانگا بوو و لە سەرەوەدا نەبوو، بە ڕێزەوە بڵێ هێشتا لە لایەن بەڕێوەبەرایەتی پەیمانگاوە نوێ نەکراوەتەوە.`;

    // تەنها کۆتا ٦ پەیام دەنێردرێت بۆ پاراستنی سنووری تۆکن و خێرایی زیاتر
    const recentHistory = (history || []).slice(-6);

    const messages = [
      { role: 'system', content: systemInstruction },
      ...recentHistory.map((msg: { role: string; text: string }) => ({
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
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      throw new Error(data.error?.message || 'هەڵەیەک لە پەیوەندیکردن بە سێرڤەری AI ڕوویدا');
    }

    const replyText = data.choices?.[0]?.message?.content || 'وەڵامێک نەدۆزرایەوە.';

    await supabase.from('chat_logs').insert([
      {
        student_name: cleanName,
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
