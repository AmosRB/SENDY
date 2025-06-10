// qoutefill.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

export default function NewProduct() {
  const router = useRouter();

  const [link, setLink] = useState('');
  const [data, setData] = useState({ name: '', manufacturer: '', weight: '', dimensions: '', cbm: '', origin: '' });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  const [notes, setNotes] = useState('');

  const [shippingType, setShippingType] = useState({ FOB: false, EXW: false });
  const [destination, setDestination] = useState({ warehouse: false, domestic: false, address: '' });
  const [services, setServices] = useState({
    customs: true,
    standards: true,
    insurance: true,
    inLandDelivery: false 
  });

  const [oceanFreight, setOceanFreight] = useState('');
  const [customsFee, setCustomsFee] = useState('');
  const [standards, setStandards] = useState('');
  const [insurance, setInsurance] = useState('');
  const [inLandDelivery, setInLandDelivery] = useState('');
  const [validity, setValidity] = useState('');

  const [files, setFiles] = useState<{ fileId: string; filename: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPrice =
    (parseFloat(oceanFreight) || 0) +
    (services.customs ? parseFloat(customsFee) || 0 : 0) +
    (services.standards ? parseFloat(standards) || 0 : 0) +
    (services.insurance ? parseFloat(insurance) || 0 : 0) +
    (services.inLandDelivery ? parseFloat(inLandDelivery) || 0 : 0);

  const handleDownloadAll = async () => {
    try {
      const savedQuote = sessionStorage.getItem('quoteData');
      if (!savedQuote) return alert('לא נמצאו מסמכים');

      const parsed = JSON.parse(savedQuote);
      const attachments = parsed.attachments || [];
      if (attachments.length === 0) return alert('לא קיימים מסמכים להורדה');

      for (const file of attachments) {
        if (!file.fileId || !file.filename) continue;

        const link = document.createElement('a');
        link.href = `http://localhost:4135/api/quotes/download/${file.fileId}`;
        link.download = file.filename;
        link.target = '_blank';
        link.click();
      }
    } catch (err) {
      console.error('❌ הורדה נכשלה:', err);
      alert('אירעה שגיאה בהורדת הקבצים');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files).map(f => ({ fileId: '', filename: f.name }))]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files).map(f => ({ fileId: '', filename: f.name }))]);
    }
  };

  const goBack = () => router.back();
  const goNext = () => router.push('/product');

  useEffect(() => {
    const savedQuote = sessionStorage.getItem('quoteData');

    if (savedQuote) {
      const parsed = JSON.parse(savedQuote);
      setQuoteId(parsed.quoteId || '');
      setData({
        name: parsed.productName || '',
        manufacturer: parsed.manufacturer || '',
        origin: parsed.origin || '',
        weight: parsed.totalWeight || '',
        dimensions: parsed.totalVolume || '',
        cbm: parsed.cbm || ''
      });
      setLink(parsed.productUrl || '');
      setShippingType(parsed.shippingType || { FOB: false, EXW: false });
      setDestination({
        warehouse: parsed.destination?.warehouse || false,
        domestic: parsed.inLandDelivery || parsed.destination?.domestic || false,
        address: parsed.destination?.address || ''
      });
      setServices({
        customs: parsed.services?.customs || false,
        standards: parsed.services?.standards || false,
        insurance: parsed.services?.insurance || false,
        inLandDelivery: parsed.inLandDelivery || false
      });
      setTermsAccepted(parsed.termsAccepted || false);
      setNotes(parsed.notes || '');
      const quoteAttachments = parsed.attachments || [];
      setFiles(quoteAttachments);
    }
  }, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative" dir="rtl">
      <Head>
        <title>sharecontainer</title>
      </Head>

      <div className="fixed inset-0 z-[-00] pointer-events-none select-none">
        <p className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 text-[500px] text-white font-lalezar opacity-20 leading-none whitespace-nowrap">
          CONTAINER
        </p>
      </div>


      {/* עטיפת כל התוכן בשכבה עליונה */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* חצים */}
        <div className="absolute top-4 right-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goBack}>→</div>
        <div className="absolute top-4 left-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goNext}>←</div>

        {/* לוגו + כותרת */}
        <div className="flex flex-col items-center relative">
          <img src="/logo-sharecontainer-cropped.png" alt="Share A Container" className="w-[330px] h-auto object-contain" />
          <h1 className="absolute bottom-[20px] text-center text-[26px] sm:text-[30px] font-bold text-black leading-tight">הגשת הצעת מחיר</h1>
        </div>

     

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
  className="form-checkbox accent-blue-600 w-4 h-4"
  checked={shippingType.FOB}
  onChange={(e) => setShippingType({ ...shippingType, FOB: e.target.checked })}
/>

    </label>
    <label className="flex items-center gap-2">
      <span className="text-[16px]">EXW</span>
      <input type="checkbox" className="form-checkbox accent-blue-600 w-4 h-4" />
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
                  className="form-checkbox accent-blue-600 w-5 h-5"
                  checked={destination.warehouse} // קשור ל-destination.warehouse
                  onChange={(e) => setDestination({ ...destination, warehouse: e.target.checked })}
                />
    <span className="text-[20px] whitespace-nowrap">מחסני חברת השילוח</span>
  </label>

  {/* הובלה בישראל */}
<div className="col-span-1 flex justify-end">
  <label className="flex items-center gap-2 cursor-pointer">
  <input
  type="checkbox"
  className="form-checkbox accent-blue-600 w-6 h-6"
  checked={services.inLandDelivery}
  onChange={(e) => setServices({ ...services, inLandDelivery: e.target.checked })}
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
  onClick={handleDownloadAll}
  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md text-sm"
>
  הורד מסמכים
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
            <span className="truncate max-w-[150px]">{f.filename}</span> 

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


{/*מתחת למסגרת*/}



<div className="w-[1000px] flex justify-between gap-10 mt-6 mx-auto">
  {/* טור ימין – בלוק ההצעה */}
  <div className="w-[320px] flex flex-col items-end space-y-3">

    <label className="flex items-center gap-2 w-full">
      <input
        type="checkbox"
        defaultChecked={true}
        className="form-checkbox border border-black accent-blue-600 w-6 h-6"
      />
      <span className="w-full text-right text-[20px] text-black">לא כולל מיסי נמל</span>
    </label>

    <label className="flex items-center gap-2 w-full">
      <input
        type="checkbox"
        defaultChecked={false}
        className="form-checkbox border border-black accent-blue-600 w-6 h-6"
      />
      <span className="w-full text-right text-[20px] text-black">לא כולל מע"מ</span>
    </label>

<div className="w-full flex justify-end items-center">
  <label className="text-[16px] text-gray-800 font-semibold">
    ההצעה בתוקף עד&nbsp;&nbsp; {/* Add one or more &nbsp; for spacing */}
  </label>
  <input
    type="date"
    value={validity}
    onChange={(e) => setValidity(e.target.value)}
    dir="rtl"
    className="h-[36px] w-[180px] px-3 rounded-lg border border-gray-400 text-[15px]"
  />
</div>









    <label className="flex items-center gap-2 w-full mt-2">
      <input
        type="checkbox"
        className="appearance-none w-5 h-5 border-2 border-black rounded-sm checked:bg-blue-600 checked:border-black"
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
      />
      <span className="w-full text-right text-[14px] text-black">
        אני מאשר שקראתי את <a href="/terms" target="_blank" className="underline text-blue-700 hover:text-blue-900">תנאי השימוש</a> באתר
      </span>
    </label>

    <button
      type="submit"
      disabled={!termsAccepted}
      className={`w-full py-2 rounded-md font-bold text-[20px] mt-3 shadow-md transition ${
        termsAccepted
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-400 text-black border border-black'
      }`}
    >
      הגשת הצעת המחיר
    </button>

  </div>

  {/* טור שמאל – שדות המחיר */}
  <div className="flex-1 flex flex-col gap-4">

    <div className="grid grid-cols-6 gap-x-3 items-center">
      <label className="col-span-4 text-[20px] text-gray-800 font-semibold text-left">הובלה ימית</label>
      <input
        type="text"
        value={oceanFreight}
        onChange={(e) => setOceanFreight(e.target.value)}
        className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
        placeholder="עלות"
      />
    </div>

    {services.customs && (
      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-4 text-[20px] text-gray-800 font-semibold text-left">עמילות</label>
        <input
          type="text"
          value={customsFee}
          onChange={(e) => setCustomsFee(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
      </div>
    )}

{services.standards && (
  <div className="grid grid-cols-6 gap-x-3 items-start">
    <div className="col-span-4 flex flex-col text-left">
      <label className="text-[20px] text-gray-800 font-semibold">טיפול מול מכון התקנים*</label>
      <span className="text-[13px] text-gray-500 mt-1">לא כולל תשלום למכון התקנים</span>
    </div>
    <input
      type="text"
      value={standards}
      onChange={(e) => setStandards(e.target.value)}
      className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
      placeholder="עלות"
    />
  </div>
)}



    {services.insurance && (
      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-4 text-[20px] text-gray-800 font-semibold text-left">ביטוח</label>
        <input
          type="text"
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
      </div>
    )}

    {services.inLandDelivery && (
      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-4 text-[20px] text-gray-800 font-semibold text-left">הובלה בישראל</label>
        <input
          type="text"
          value={inLandDelivery}
          onChange={(e) => setInLandDelivery(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
      </div>
    )}

    <div className="grid grid-cols-6 gap-x-3 items-center">
      <label className="col-span-4 text-[24px] text-gray-800 font-semibold text-left">מחיר</label>
      <input
        type="text"
        value={totalPrice.toFixed(2)}
        readOnly
        className="col-span-2 h-[40px] px-4 rounded-lg border border-gray-400 text-[15px] bg-gray-100 cursor-not-allowed"
        placeholder="מחיר לכל ההצעה"
      />
    </div>

  </div>
</div>





      </div>
    </div>
  );
}