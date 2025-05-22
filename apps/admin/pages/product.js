
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ProductDetailsPage() {
  const [link, setLink] = useState('');
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const savedLink = sessionStorage.getItem('productLink');
    if (savedLink) setLink(savedLink);
  }, []);

  const goBack = () => router.push('/');
  const goNext = () => router.push('/quote');

  const data = {
    name: "Electric Screwdriver X200",
    manufacturer: "XTech Co.",
    weight: "1.2 kg",
    dimensions: "25x10x8 cm",
    cbm: "0.0020",
    origin: "China"
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-t from-[#cfe7fa] via-white via-[75%] to-white relative px-6 py-10">
      <Head>
        <title>Sendy | בקשה להצעת מחיר</title>
      </Head>

      {/* טקסט SENDY ברקע */}
      <div className="fixed inset-x-0 bottom-0 z-0 pointer-events-none select-none leading-none h-[1px]">
        <p className="text-[700px] text-white font-lalezar absolute bottom-[-250px] left-1/2 -translate-x-1/2 opacity-60 whitespace-nowrap">
          SENDY
        </p>
      </div>

      {/* תוכן ראשי של הדף */}
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
            <input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="שם המוצר" defaultValue={data.name} />
            <input className="w-full h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="שם היצרן" defaultValue={data.manufacturer} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="משקל בקילוגרם" defaultValue={data.weight} />
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="מספר קטלוגי" />
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="נפח למשלוח CBM" defaultValue={data.cbm} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input className="col-span-2 h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="קישור לדף המוצר" defaultValue={link || ''} />
            <input className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500" placeholder="מחיר נקוב באתר" />
          </div>

<div className="grid grid-cols-3 gap-4">
  <input
    className="h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500"
    placeholder="נקודת מוצא"
    defaultValue={data.origin}
  />
  <input
    className="col-span-2 h-[32px] px-4 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500"
    placeholder="כתובת יעד המשלוח – מספר בית - רחוב - עיר - מדינה"
    defaultValue=""
  />
</div>





          <textarea className="w-full px-4 py-2 border border-black rounded-xl shadow-sm text-sm bg-white placeholder-gray-500 h-24 resize-none" placeholder="פרטים והערות למשלוח" />

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
      </div>

      {visible && (
        <div
          ref={windowRef}
          className={`fixed z-50 w-[300px] ${minimized ? 'h-[40px]' : 'auto'} bg-white rounded-xl shadow-xl border text-right`}
          style={{
            top: position.y || 100,
            left: position.x || 80,
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <div
            className="bg-blue-600 text-white flex items-center justify-between px-4 py-2 rounded-t-xl cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <span className="font-bold">פרטי המוצר</span>
            <div className="space-x-2 space-x-reverse">
              <button onClick={() => setMinimized(!minimized)} className="hover:text-gray-200">−</button>
              <button onClick={() => setVisible(false)} className="hover:text-gray-200">✕</button>
            </div>
          </div>
          {!minimized && (
            <div className="p-4 space-y-2">
              <Detail label="Name" value={data.name} />
              <Detail label="Manufacturer" value={data.manufacturer} />
              <Detail label="Weight" value={data.weight} />
              <Detail label="Dimensions" value={data.dimensions} />
              <Detail label="CBM" value={data.cbm} />
              <Detail label="Shipping Origin" value={data.origin} />
              <p className="text-sm text-gray-400 text-center">Link: {link || 'N/A'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-base text-gray-900">{value}</p>
    </div>
  );
}
