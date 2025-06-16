import { useEffect, useState } from 'react';
import Head from 'next/head';
import QuoteCard from '../components/QuoteCard';
import SubmittedQuoteCard from '../components/SubmittedQuoteCard';

export default function BrokerStatusPage() {
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState('');
  const [openQuotes, setOpenQuotes] = useState([]);
  const [submittedQuotes, setSubmittedQuotes] = useState([]);
  const [activeQuote, setActiveQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

const fetchQuotesForClient = async (id) => {
  try {
    const [quotesRes, submittedRes] = await Promise.all([
      fetch(`${apiBase}/api/quotes`, { cache: "no-store" }),
      fetch(`${apiBase}/api/submitted-quotes/all`, { cache: "no-store" })
    ]);

    const allQuotes = await quotesRes.json();
    const allSubmitted = await submittedRes.json();

    const myQuotes = allQuotes.filter(
  q =>
    q.clientId?.toString() === id &&
    q.status === 'submitted'
);

const ignored = JSON.parse(localStorage.getItem('ignoredQuotes') || '[]');
const visibleQuotes = myQuotes.filter(q => !ignored.includes(q.quoteId));
setOpenQuotes(visibleQuotes);

    const mySubmitted = allSubmitted.filter(q => q.clientId === id);

  setOpenQuotes(myQuotes);

    setSubmittedQuotes(mySubmitted);
    sessionStorage.removeItem('quoteData');

  } catch (err) {
    setError('שגיאה בטעינת הנתונים');
  }
};




  useEffect(() => {
    const id = sessionStorage.getItem('clientId') || localStorage.getItem('clientId'); //
    const name = sessionStorage.getItem('clientName') || localStorage.getItem('clientName'); // // הוספתי גם לוקאל סטורג' למקרה ששם נשמר שם
    if (!id) {
      setError('אין זיהוי לקוח'); //
      return;
    }
    setClientId(id); //
    setClientName(name || ''); //
    fetchQuotesForClient(id); //
  }, []); //

  const placeholderCount = 10; //
  const draftPlaceholders = Array.from({ length: Math.max(0, placeholderCount - openQuotes.length) }); //
  const submittedPlaceholders = Array.from({ length: Math.max(0, placeholderCount - submittedQuotes.length) }); //

  return (
   <div className="min-h-screen pb-32 flex flex-col items-center justify-start px-4 pt-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white" dir="rtl">

      <Head>
        <title>Share A Container | סטטוס הצעות לקוח</title>
      </Head>

      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[500px] text-white font-lalezar opacity-40">CONTAINER</p>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <img src="/logo-sharecontainer-cropped.png" alt="Share A Container" className="w-[330px] h-auto" />
        <h1 className="text-[28px] sm:text-[32px] font-bold text-black mt-2 text-center w-full">
          מצב ההצעות של {clientName && `  ${clientName}`}
        </h1>

        {error && <p className="text-red-600 font-bold text-center mt-4">{error}</p>}

               <div className="w-full max-w-[1200px] mt-10 grid grid-cols-2 gap-6 relative">

  {/* 🔍 חיפוש מיושר לקופסה התכלת */}
  <div className="absolute left-0 -top-10">
  <input
    type="text"
    placeholder="חפש לפי מספר בקשה (בלי #)"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-[250px] px-3 py-1 border border-gray-400 rounded-lg text-sm text-right placeholder-gray-600 font-semibold"
  />
</div>

          
          <div className="bg-green-100/20 border border-gray-500 rounded-xl p-4">
            <div className="bg-black text-white px-3 py-1 rounded-md mb-4 text-center w-full">בקשות להצעת מחיר</div>
          <div className="grid grid-cols-4 font-bold border-b pb-2 mb-2 text-sm text-gray-600 text-right">
  <div className="col-span-1">מספר בקשה</div>
  <div className="col-span-1">תאריך הגשה</div>
  <div className="col-span-2">שם המוצר</div>
</div>

            <div className="space-y-2">
              {openQuotes.map((q) => (
<QuoteCard
  quote={q}
  layout="row"
  background="green"
  modal={true}
  submittedCount={q.submittedBy?.length || 0}
onIgnore={(id) => {
  fetch(`${apiBase}/api/quotes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId: id, clientClosed: true })
  });
  setOpenQuotes(prev => prev.filter(q => q.quoteId !== id));
}}

/>



              ))}
              {draftPlaceholders.map((_, i) => (
                <div key={`draft-placeholder-${i}`} className="grid grid-cols-3 text-gray-400 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm">
                  <div className="font-semibold">{openQuotes.length + i + 1}</div>
                  <div>---</div>
                  <div>---</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sky-100/20 border border-gray-500 rounded-xl p-4">
            <div className="bg-black text-white px-3 py-1 rounded-md mb-4 text-center w-full">הצעות שהוגשו</div>
          <div className="grid grid-cols-4 font-bold border-b pb-2 mb-2 text-sm text-gray-600">
  <div>מספר בקשה</div>
  <div>סה״כ ש״ח</div>
  <div>סה״כ $</div>
  <div>תאריך תפוגה</div>
</div>

            <div className="space-y-2">
 

{submittedQuotes
  .filter((q) =>
    q.clientId?.toString() === clientId &&
    q.quoteId?.toString().includes(searchTerm.replace('#', ''))
  )
.map((quote, index) => (
  <div
    key={index}
    className="grid grid-cols-4 items-center border border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-800 cursor-pointer hover:bg-blue-400 bg-sky-300/60"
    onClick={() => setActiveQuote(quote)}
  >
    {/* עמודה 1 - מספר בקשה */}
    <div className="font-semibold">#{quote.quoteId}</div>

    {/* עמודה 2 - מחיר בש"ח */}
    <div className="text-right">₪ {quote.totalShekel || '0.00'}</div>

    {/* עמודה 3 - מחיר בדולר */}
    <div className="text-right">$ {quote.totalDollar || '0.00'}</div>

    {/* עמודה 4 - תאריך תפוגה */}
    <div className="text-red-700 text-sm text-right">
      {new Date(quote.validUntil).toLocaleDateString('he-IL')}
    </div>
  </div>
))
}





              {submittedPlaceholders.map((_, i) => (
                <div key={`submitted-placeholder-${i}`} className="grid grid-cols-3 text-gray-400 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm">
                  <div className="font-semibold">{submittedQuotes.length + i + 1}</div>
                  <div>---</div>
                  <div>---</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

{activeQuote && (
  activeQuote.price
    ? <SubmittedQuoteCard quote={activeQuote} broker={null} onClose={() => setActiveQuote(null)} />
    : <QuoteCard quote={activeQuote} modal={true} />
)}

<footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
  כל הזכויות שמורות ל־
  <span className="text-orange-500 font-semibold">Share A Container</span>
   <div className="absolute left-4 top-3 text-purple-400 text-sm"> D&A code design ©</div>
</footer>

    </div>
  );
}