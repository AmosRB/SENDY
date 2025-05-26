/* ✅ גרסה רספונסיבית מלאה */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProductInfoWindow from './ProductInfoWindow';

export default function ProductDetailsPage() {
  const [link, setLink] = useState('');
  const [data, setData] = useState({ name: '', manufacturer: '', weight: '', dimensions: '', cbm: '', origin: '' });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestTypes, setRequestTypes] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedLink = sessionStorage.getItem('productLink');
    if (savedLink && savedLink.trim() !== '') {
      setLink(savedLink);
      fetchData(savedLink);
    } else {
      setLink('');
      setData({ name: 'N/A', manufacturer: 'N/A', weight: 'N/A', dimensions: 'N/A', cbm: 'N/A', origin: 'N/A' });
      setReady(true);
    }
  }, []);

  const fetchData = (url) => {
    setReady(false);
    setLoading(true);
    fetch(`http://localhost:4135/extract?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setReady(true);
        setLoading(false);
      })
      .catch(() => {
        setData({ name: 'N/A', manufacturer: 'N/A', weight: 'N/A', dimensions: 'N/A', cbm: 'N/A', origin: 'N/A' });
        setReady(true);
        setLoading(false);
      });
  };

  const handleRetry = (newLink) => {
    if (newLink && newLink.trim() !== '') {
      setLink(newLink);
      fetchData(newLink);
    }
  };

  const goBack = () => router.push('/');
  const goNext = () => router.push('/quote');

  const resetForm = () => {
    setData({ name: '', manufacturer: '', weight: '', dimensions: '', cbm: '', origin: '' });
    setLink('');
  };

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-t from-[#cfe7fa] via-white via-[75%] to-white relative px-4 sm:px-6 lg:px-8 py-10">
      <Head><title>Sendy | בקשה להצעת מחיר</title></Head>

      <div className="fixed inset-x-0 bottom-0 z-0 pointer-events-none select-none leading-none h-[1px]">
        <p className="text-[700px] text-white font-lalezar absolute bottom-[-250px] left-1/2 -translate-x-1/2 opacity-60 whitespace-nowrap">SENDY</p>
      </div>

      <div className="relative z-10">
        <div className="absolute top-4 right-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goBack}>→</div>
        <div className="absolute top-4 left-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goNext}>←</div>

        <div className="text-center max-w-[700px] mx-auto mb-10">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-black leading-tight mb-4">בקשה להצעת מחיר</h1>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            סוכן ה AI שלנו עושה כמיטב יכולתו למצוא עבורכם את פרטי המוצר ולמלא את הטופס.<br />
            עברו על הפרטים ואמתו אותם - השלימו את הפרטים החסרים - במידת הצורך פנו  ליצרן המוצר.
          </p>
        </div>

        <form className="max-w-[800px] w-full mx-auto space-y-6 mb-10">
          {/* שדות קלט */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-black mb-1">שם המוצר</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-black mb-1">שם היצרן</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" value={data.manufacturer} onChange={(e) => setData({ ...data, manufacturer: e.target.value })} /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-black mb-1">משקל בקילוגרם</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" value={data.weight} onChange={(e) => setData({ ...data, weight: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-black mb-1">מספר קטלוגי</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" /></div>
            <div><label className="block text-sm font-medium text-black mb-1">נפח למשלוח CBM</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" value={data.cbm} onChange={(e) => setData({ ...data, cbm: e.target.value })} /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-black mb-1">קישור לדף המוצר</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" value={link} onChange={(e) => setLink(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-black mb-1">מחיר נקוב באתר</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-black mb-1">נקודת מוצא</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" value={data.origin} onChange={(e) => setData({ ...data, origin: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-black mb-1">כתובת יעד המשלוח – מספר בית - רחוב - עיר - מדינה</label><input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm" /></div>
          </div>

          <div><label className="block text-sm font-medium text-black mb-1">פרטים והערות למשלוח</label><textarea className="w-full px-4 py-2 border border-black rounded-xl shadow-sm text-sm bg-white h-24 resize-none" /></div>
 <div className="w-full flex justify-end">
            <button
              type="button"
              onClick={resetForm}
             className="bg-orange-200 border border-red-400 text-black text-sm px-2 py-1 rounded-xl shadow-md transition w-[100px]"
            >
              ניקוי טופס
            </button>
          </div>

          {/* סוג הבקשה + כפתור */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-0">
            <fieldset className="border border-black rounded-xl p-4 space-y-2 w-full md:max-w-[400px] -mt-10">
              <legend className="text-sm font-medium text-gray-700 px-1">סוג הבקשה:</legend>
              {['standard', 'customs', 'insurance'].map((type) => (
                <label key={type} className="flex items-center space-x-2 space-x-reverse">
                  <input type="checkbox" value={type} checked={requestTypes.includes(type)} onChange={(e) => {
                    const val = e.target.value;
                    setRequestTypes((prev) => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
                  }} className="accent-blue-600" />
                  <span>{type === 'standard' && 'בדיקת דרישות תקן בארץ היעד'}{type === 'customs' && 'טיפול במכס ואגרות'}{type === 'insurance' && 'כולל הצעה לביטוח'}</span>
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col items-end justify-end w-full md:w-auto pt-2">
              <label className="text-sm text-black mb-2 flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="accent-blue-600" />
                <span>אני מאשר את <a href="/terms" target="_blank" className="underline text-blue-700 hover:text-blue-900">תנאי השימוש</a> באתר</span>
              </label>

              <button type="submit" disabled={!termsAccepted} className={`w-full sm:w-auto font-bold text-[16px] px-8 py-2 rounded-xl shadow-md transition ${termsAccepted ? 'bg-[#0084FF] hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                הגשת בקשה להצעת מחיר
              </button>
            </div>
          </div>

        </form>

        <ProductInfoWindow data={data} link={link} onRetry={handleRetry} loading={loading} />
      </div>
    </div>
  );
}
