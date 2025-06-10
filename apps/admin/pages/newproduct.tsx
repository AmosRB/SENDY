// newproduct.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import ProductInfoWindow from './ProductInfoWindow';

export default function NewProduct() {
  const router = useRouter();

  const [link, setLink] = useState('');
  const [data, setData] = useState({ name: '', manufacturer: '', weight: '', dimensions: '', cbm: '', origin: '' });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockRef = useRef(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  const hasRunRef = useRef(false);

  const [shippingType, setShippingType] = useState({ FOB: false, EXW: false });
  const [destination, setDestination] = useState({ warehouse: false, domestic: false, address: '' });
  const [services, setServices] = useState({
    customs: true,
    standards: true,
    insurance: true
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const goBack = () => router.back();
  const goNext = () => router.push('/product');

  const fetchData = (url: string) => {
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

  const handleRetry = (newLink: string) => {
    if (newLink && newLink.trim() !== '') {
      setLink(newLink);
      fetchData(newLink);
    }
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    sessionStorage.removeItem('quoteId');
    sessionStorage.removeItem('quoteData');

    const fetchNewQuoteId = async () => {
      try {
        const res = await fetch('http://localhost:4135/api/quotes/new-id');
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();
        const newId = data.quoteId;

        setQuoteId(newId);
        sessionStorage.setItem('quoteId', newId);
        sessionStorage.setItem('quoteData', JSON.stringify({ quoteId: newId }));
      } catch (err) {
        console.error('❌ Failed to fetch quoteId:', err);
      }
    };

    fetchNewQuoteId();
  }, []);

  const handleSubmit = async () => {
    if (!termsAccepted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let finalQuoteId = quoteId;

      const quoteData: any = {
        quoteId: finalQuoteId,
        productName: data.name,
        manufacturer: data.manufacturer,
        origin: data.origin,
        productUrl: link,
        totalWeight: data.weight,
        totalVolume: data.dimensions,
        shippingType,
        inLandDelivery: destination.domestic,
        destination,
        services,
        notes,
        termsAccepted,
        createdAt: new Date(),
        status: 'draft'
      };

      const res = await fetch('http://localhost:4135/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });

      if (!res.ok) throw new Error("Failed to save quote");

      const attachments: any[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(`http://localhost:4135/api/quotes/upload/${finalQuoteId}`, {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) {
          console.error('❌ כשל בהעלאת הקובץ:', file.name);
          continue;
        }

        const uploaded = await uploadRes.json();
        attachments.push(uploaded.file);
      }

      quoteData.attachments = attachments;

      sessionStorage.setItem('quoteData', JSON.stringify(quoteData));
      sessionStorage.setItem('quoteFiles', JSON.stringify(files.map(f => ({ name: f.name }))));
      router.push('/qoutefill');

    } catch (err) {
      console.error('❌ Failed to submit:', err);
      alert('אירעה שגיאה בשמירה');
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative" dir="rtl">
      <Head>
        <title>sharecontainer</title>
      </Head>

      {/* רקע טקסט ענק – מתחת לכל התוכן */}
      <div className="fixed inset-0 z-[-00] pointer-events-none select-none">
        <p className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 text-[500px] text-white font-lalezar opacity-20 leading-none whitespace-nowrap">
          CONTAINER
        </p>
      </div>

      <ProductInfoWindow data={data} link={link} onRetry={handleRetry} loading={loading} />


      {/* עטיפת כל התוכן בשכבה עליונה */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* חצים */}
        <div className="absolute top-4 right-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goBack}>→</div>
        <div className="absolute top-4 left-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goNext}>←</div>

        {/* לוגו + כותרת */}
        <div className="flex flex-col items-center relative">
          <img src="/logo-sharecontainer-cropped.png" alt="Share A Container" className="w-[330px] h-auto object-contain" />
          <h1 className="absolute bottom-[20px] text-center text-[26px] sm:text-[30px] font-bold text-black leading-tight">בקשה להצעת מחיר</h1>
        </div>

        {/* טקסט תיאור */}
        <p className="-mt-2 text-[20px] text-gray-700 leading-relaxed text-center max-w-[1000px] px-4 mx-auto">
          סוכן ה-AI שלנו עושה כמיטב יכולתו למצוא עבורכם את פרטי המוצר ולמלא את הטופס.<br />
          עברו על הפרטים ואמתו אותם - השלימו את הפרטים החסרים - במידת הצורך פנו ליצרן המוצר.
        </p>

        {/* מסגרת הטופס */}
        <div className="mt-4 w-[1000px] border-2 border-black rounded-xl bg-transparent px-6 py-6 flex flex-col gap-6">
          <div className="text-center">
            <span className="text-[20px] text-gray-700 font-semibold">מספר בקשה - </span>
            {quoteId ? (
              <span className="text-[20px] font-bold text-black ml-2">{quoteId}</span>
            ) : (
              <span className="text-[20px] text-gray-400 ml-2 animate-pulse">...</span>
            )}
          </div>


          {/* רשת של 6 עמודות במקום 7 */}
          <div className="grid grid-cols-6 gap-x-3 gap-y-4 w-full items-center">
            {/* שם המוצר */}
            <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">שם המוצר</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="col-span-5 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
              placeholder="לדוגמה: מסך מחשב 27 אינץ'"
            />


            {/* יצרן */}
            <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">יצרן</label>
            <input
              type="text"
              value={data.manufacturer}
              onChange={(e) => setData({ ...data, manufacturer: e.target.value })}
              className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
              placeholder="לדוגמה: LG"
            />


            {/* נקודת מוצא */}
            <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">נקודת מוצא</label>
            <input
              type="text"
              value={data.origin}
              onChange={(e) => setData({ ...data, origin: e.target.value })}
              className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
              placeholder="לדוגמה: שנחאי"
            />


            {/* דף המוצר */}
            <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">דף המוצר</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-5 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
              placeholder="לדוגמה: https://example.com/product"
            />


            {/* משקל כולל */}
            <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">
              משקל כולל
            </label>

            {/* אינפוט */}
            <input
              type="text"
              value={data.weight}
              onChange={(e) => setData({ ...data, weight: e.target.value })}
              className="col-span-1 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
              placeholder="בק״ג"
            />


            {/* נפח כולל למשלוח */}
            <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
              <label className="text-[20px] text-gray-800 font-semibold whitespace-nowrap">
                נפח כולל למשלוח
              </label>
              <input
                type="text"
                value={data.dimensions}
                onChange={(e) => setData({ ...data, dimensions: e.target.value })}
                className="w-[120px] h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
                placeholder="במ״ק"
              />


            </div>


            {/* סוג משלוח */}
            <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
              <label className="text-[20px] text-gray-800 font-semibold whitespace-nowrap">
                סוג משלוח *
              </label>
              <div className="flex items-center gap-3 border border-gray-400 rounded-lg px-4 py-1">
                <label className="flex items-center gap-2">
                  <span className="text-[16px]">FOB</span>
                  <input
                    type="checkbox"
                    checked={shippingType.FOB}
                    onChange={(e) => setShippingType({ ...shippingType, FOB: e.target.checked })}
                    className="form-checkbox accent-blue-600 w-4 h-4"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-[16px]">EXW</span>
                  <input
                    type="checkbox"
                    checked={shippingType.EXW}
                    onChange={(e) => setShippingType({ ...shippingType, EXW: e.target.checked })}
                    className="form-checkbox accent-blue-600 w-4 h-4"
                  />
                </label>
              </div>

            </div>


            {/* יעד המשלוח */}
            <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">יעד המשלוח</label>
            <div className="col-span-5 grid grid-cols-6 gap-3 items-center">

              {/* מחסני חברת השילוח */}
              <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={destination.warehouse}
                  onChange={(e) => setDestination({ ...destination, warehouse: e.target.checked })}
                  className="form-checkbox accent-blue-600 w-5 h-5"
                />
                <span className="text-[20px] whitespace-nowrap">מחסני חברת השילוח</span>
              </label>

              {/* הובלה בישראל */}
              <div className="col-span-1 flex justify-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destination.domestic}
                    onChange={(e) => setDestination({ ...destination, domestic: e.target.checked })}
                    className="form-checkbox accent-blue-600 w-6 h-6"
                  />
                  <span className="text-[20px] whitespace-nowrap">הובלה בישראל</span>
                </label>
              </div>


              {/* כתובת בישראל */}
              <div className="col-span-3 flex justify-start"> {/* Changed from col-span-2 to col-span-3 */}
                <input
                  type="text"
                  value={destination.address}
                  onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                  placeholder="כתובת בישראל"
                  className="h-[36px] w-full px-4 border border-gray-400 rounded-xl shadow-sm text-[15px] text-right"
                  dir="rtl"
                />

              </div>

            </div>

            <label className="col-span-1 text-[19px] text-gray-800 font-semibold text-left">פרטים והערות</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-5 h-[70px] px-4 py-2 border border-gray-400 rounded-xl shadow-sm text-sm resize-none"
              placeholder=""
            />

            <div className="col-span-6 grid grid-cols-6 gap-3 items-start">
              {/* כפתור מימין */}
              <div className="col-span-1 text-left">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md text-sm"
                >
                  הוסף מסמכים
                </button>
              </div>

              {/* אינפוט גרירה משמאל */}
              <div
                className="col-span-5 border border-dashed border-gray-600 rounded-md px-4 py-2 flex flex-col gap-2 text-gray-800 text-sm cursor-pointer hover:bg-blue-50 transition"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* טקסט רק אם אין קבצים */}
                {files.length === 0 && "גרור להוספת מסמכים או לחץ"}

                {/* תצוגת קבצים בשורה */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-black text-xs">
                        <span className="truncate max-w-[150px]">{f.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(prev => prev.filter((_, index) => index !== i));
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>




          </div>

        </div>


        {/* טקסט הסבר וצ'קבוקסים בשורה אחת - הפוך */}
        <div className="w-[1000px] flex flex-row-reverse justify-between mt-6">
          {/* צ'קבוקסים וכפתור - עכשיו מימין */}
          <div className="w-[300px] flex flex-col items-end space-y-3">
            <label className="flex items-center gap-2 w-full">
              <input type="checkbox" checked={services.customs}
                onChange={(e) => setServices({ ...services, customs: e.target.checked })} className="form-checkbox border border-black accent-blue-600 w-6 h-6" />
              <span className="w-full text-right text-[20px] text-black">בקשה לטיפול במכס ואגרות</span>
            </label>
            <label className="flex items-center gap-2 w-full">
              <input type="checkbox" checked={services.standards}
                onChange={(e) => setServices({ ...services, standards: e.target.checked })} className="form-checkbox border border-black accent-blue-600 w-6 h-6" />
              <span className="w-full text-right text-[20px] text-black">בקשה לבדיקת דרישות תקן</span>
            </label>
            <label className="flex items-center gap-2 w-full">
              <input type="checkbox" checked={services.insurance}
                onChange={(e) => setServices({ ...services, insurance: e.target.checked })} className="form-checkbox border border-black accent-blue-600 w-6 h-6" />
              <span className="w-full text-right text-[20px] text-black">הצעה לביטוח</span>
            </label>
            <label className="flex items-center gap-2 w-full mt-2">
              <input type="checkbox" className="appearance-none w-5 h-5 border-2 border-black rounded-sm checked:bg-blue-600 checked:border-black" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span className="w-full text-right text-[14px] text-black">
                אני מאשר שקראתי את <a href="/terms" target="_blank" className="underline text-blue-700 hover:text-blue-900">תנאי השימוש</a> באתר
              </span>

            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!termsAccepted}
              className={`w-full py-2 rounded-md font-bold text-[20px] mt-3 shadow-md transition ${
                termsAccepted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-400 text-black border border-black'
              }`}
            >
              הגשת בקשה להצעת מחיר
            </button>


          </div>

          {/* טקסט ההסבר - עכשיו משמאל */}
          <div className="w-[500px] text-right text-[16px] text-black leading-relaxed space-y-2">
            <p className="font-semibold">* סוג המשלוח:</p>
            <div>
              <p className="font-bold">FOB (Free On Board)</p>
              <p>המוכר אחראי לספק את הסחורה עד לנמל המוצא ולהעמיסה על אוניית המשלוח. מרגע זה – האחריות, הסיכון והעלויות עוברות ללקוח.</p>
            </div>
            <div>
              <p className="font-bold">EXW (EX WORK)</p>
              <p>הסחורה זמינה לאיסוף ממחסן המוכר. כל הסידורים, ההובלה, העלויות והסיכונים – באחריות הלקוח מרגע האיסוף.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}