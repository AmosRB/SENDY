import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProductInfoWindow from './ProductInfoWindow';

export default function ProductDetailsPage() {
  const [link, setLink] = useState('');
  const [data, setData] = useState({
    name: '',
    manufacturer: '',
    weight: '',
    dimensions: '',
    cbm: '',
    origin: ''
  });
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedLink = sessionStorage.getItem('productLink');
    if (savedLink && savedLink.trim() !== '') {
      setLink(savedLink);
      fetchData(savedLink);
    } else {
      setLink('');
      setData({
        name: 'N/A',
        manufacturer: 'N/A',
        weight: 'N/A',
        dimensions: 'N/A',
        cbm: 'N/A',
        origin: 'N/A'
      });
      setReady(true);
    }
  }, []);

  const fetchData = (url) => {
    setReady(false);
    fetch(`http://localhost:4135/extract?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then((data) => {
        setData(data);
        setReady(true);
      })
      .catch(() => {
        setData({
          name: 'N/A',
          manufacturer: 'N/A',
          weight: 'N/A',
          dimensions: 'N/A',
          cbm: 'N/A',
          origin: 'N/A'
        });
        setReady(true);
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
    setData({
      name: '',
      manufacturer: '',
      weight: '',
      dimensions: '',
      cbm: '',
      origin: ''
    });
    setLink('');
  };

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-t from-[#cfe7fa] via-white via-[75%] to-white relative px-6 py-10">
      <Head>
        <title>Sendy | בקשה להצעת מחיר</title>
      </Head>

      <div className="fixed inset-x-0 bottom-0 z-0 pointer-events-none select-none leading-none h-[1px]">
        <p className="text-[700px] text-white font-lalezar absolute bottom-[-250px] left-1/2 -translate-x-1/2 opacity-60 whitespace-nowrap">
          SENDY
        </p>
      </div>

      <div className="relative z-10">
        <div className="absolute top-4 right-6 text-3xl text-blue-700 cursor-pointer z-50" onClick={goBack}>→</div>
        <div className="absolute top-4 left-6 text-3xl text-blue-700 cursor-pointer z-50" onClick={goNext}>←</div>

        <div className="text-center max-w-[700px] mx-auto mb-10">
          <h1 className="text-[28px] font-bold text-black leading-tight mb-4">בקשה להצעת מחיר</h1>
          <p className="text-[17px] text-gray-700 leading-relaxed">
            העוזרת האוטומטית שלנו עושה כמיטב יכולתה למצוא עבורכם את פרטי המוצר.<br />
            עברו על הפרטים ואמתו אותם - השלימו את הפרטים החסרים - במידה של חוסרים פנו לאתר או ליצרן המוצר.
          </p>
        </div>

        <form className="max-w-[800px] mx-auto space-y-6 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="שם המוצר" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
            <input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="שם היצרן" value={data.manufacturer} onChange={(e) => setData({ ...data, manufacturer: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="משקל בקילוגרם" value={data.weight} onChange={(e) => setData({ ...data, weight: e.target.value })} />
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="מספר קטלוגי" />
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="נפח למשלוח CBM" value={data.cbm} onChange={(e) => setData({ ...data, cbm: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input className="col-span-2 h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="קישור לדף המוצר" value={link} onChange={(e) => setLink(e.target.value)} />
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="מחיר נקוב באתר" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="נקודת מוצא" value={data.origin} onChange={(e) => setData({ ...data, origin: e.target.value })} />
            <input className="col-span-2 h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="כתובת יעד המשלוח – מספר בית - רחוב - עיר - מדינה" />
          </div>

          <textarea className="w-full px-4 py-2 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500 h-24 resize-none" placeholder="פרטים והערות למשלוח" />

          <div className="w-full flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="bg-orange-200 border border-red-400 text-black text-sm px-1 py-01 rounded-xl shadow-md transition w-[12%] h-[10%]"
            >
              ניקוי טופס
            </button>
          </div>

          <div className="flex justify-between items-end gap-6">
            <fieldset className="border border-black rounded-xl p-3 space-y-2 w-full max-w-[400px]">
              <legend className="text-sm font-medium text-gray-700">סוג הבקשה:</legend>
              <label className="flex items-center space-x-2 space-x-reverse">
                <input type="radio" name="type" className="accent-blue-600" />
                <span>בדיקת דרישות תקן בארץ היעד</span>
              </label>
              <label className="flex items-center space-x-2 space-x-reverse">
                <input type="radio" name="type" className="accent-blue-600" />
                <span>טיפול במכס ואגרות</span>
              </label>
            </fieldset>

            <div className="flex flex-col items-end justify-end h-full">
              <p className="text-sm text-black mb-2">הצעת המחיר תנתן כנגד הפרטים המופיעים בדף זה.</p>
              <button type="submit" className="bg-[#0084FF] hover:bg-blue-700 text-white font-bold text-[16px] px-8 py-2 rounded-xl shadow-md transition">
                הגשת בקשה להצעת מחיר
              </button>
            </div>
          </div>
        </form>
          {ready && (
              <ProductInfoWindow data={data} link={link} onRetry={handleRetry} />
            )}
          </div>
        </div>
      );
    }