// qoutefill.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

type ProductData = {
  name: string;
  manufacturer: string;
  weight: string;
  dimensions: string;
  cbm: string;
  originCountry: string;
  originCity: string;
};

const defaultData: ProductData = {
  name: '',
  manufacturer: '',
  weight: '',
  dimensions: '',
  cbm: '',
  originCountry: '',
  originCity: '',
};

export default function QuoteFill() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [currency, setCurrency] = useState('₪');
const [currencyOcean, setCurrencyOcean] = useState('₪');
const [currencyCustoms, setCurrencyCustoms] = useState('₪');
const [currencyStandards, setCurrencyStandards] = useState('₪');
const [currencyInsurance, setCurrencyInsurance] = useState('₪');
const [currencyDelivery, setCurrencyDelivery] = useState('₪');
const [excludePortTaxes, setExcludePortTaxes] = useState(false);
const [excludeVAT, setExcludeVAT] = useState(false);
const [submissionNotes, setSubmissionNotes] = useState('');
const [client, setClient] = useState<{
  name: string;
  phone: string;
  email?: string;
  role?: string;
  business?: string;
} | null>(null);




  const [link, setLink] = useState('');
  type ProductData = {
  name: string;
  manufacturer: string;
  weight: string;
  dimensions: string;
  cbm: string;
  originCountry: string;
  originCity: string;
};

const defaultData: ProductData = {
  name: '',
  manufacturer: '',
  weight: '',
  dimensions: '',
  cbm: '',
  origin: '',
  originCountry: '',
  originCity: '',
};

const [data, setData] = useState<ProductData>(defaultData);
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
       link.href = `${process.env.NEXT_PUBLIC_API_URL}/api/quotes/download/${file.fileId}`;

        link.download = file.filename;
        link.target = '_blank';
        link.click();
      }
    } catch (err) {
      console.error('❌ הורדה נכשלה:', err);
      alert('אירעה שגיאה בהורדת הקבצים');
    }
  };

  
  const submitFinalQuote = async () => {
  const broker = JSON.parse(sessionStorage.getItem('brokerData') || '{}');
  const quoteData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
  if (!broker?.code) return alert("פרטי עמיל מכס חסרים");
  if (!shippingType.FOB && !shippingType.EXW) {
    alert("יש לבחור לפחות סוג משלוח אחד (FOB או EXW)");
    return;
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submitted-quotes`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId,
        clientName: client?.name || '',
clientPhone: client?.phone || '',
clientEmail: client?.email || '',
        clientId: quoteData.clientId, 
        clientBusiness: client?.business || '',
        brokerCode: broker.code,
        brokerName: broker.name,
         brokerPhone: broker.phone,
        brokerEmail: broker.email,
        productName: data.name,
        manufacturer: data.manufacturer,
        originCountry: data.originCountry,
      originCity: data.originCity,
        totalVolume: data.dimensions,
        totalWeight: data.weight,
        shippingType: shippingType,
        services,
        productUrl: link,
        notes: notes, // הערות הלקוח
        submissionNotes: submissionNotes, // הערות עמיל המכס
        currency: currencyOcean,
     insurancePrice: parseFloat(insurance) || 0,
  standardsPrice: parseFloat(standards) || 0,
  inlandDeliveryPrice: parseFloat(inLandDelivery) || 0,
  customsPrice: parseFloat(customsFee) || 0,
  oceanFreight: parseFloat(oceanFreight) || 0,
  price: totalPrice.toFixed(2),
    totalShekel: totalShekel.toFixed(2),   // ⬅️ חדש
  totalDollar: totalDollar.toFixed(2),
  currencyOcean,
  currencyCustoms,
  currencyStandards,
  currencyInsurance,
  currencyDelivery,
  validUntil: validity ? new Date(validity).toISOString() : null,
  excludePortTaxes,
excludeVAT,
  submittedAt: new Date().toISOString(),
  status: 'active'
      })
    });

    if (!res.ok) throw new Error("שגיאה בהגשה");
    setShowSuccess(true);
  } catch (err) {
    console.error('❌ שגיאה בשליחה:', err);
    alert('אירעה שגיאה בעת שליחת ההצעה');
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
  const goNext = () => router.push('/qoutefill');


 useEffect(() => {
  const saved = sessionStorage.getItem('quoteData');
  if (!saved) return;
  const parsed = JSON.parse(saved);
 if (parsed.clientName) {
  setClient({
    name: parsed.clientName,
    phone: parsed.clientPhone || '',
    email: parsed.clientEmail || '',
    role: parsed.clientRole || '',
    business: parsed.clientBusiness || ''
  });
}

}, []);


  useEffect(() => {
    const savedQuote = sessionStorage.getItem('quoteData');
    if (savedQuote) {
      const parsed = JSON.parse(savedQuote);
      setQuoteId(parsed.quoteId || '');
      setData({
        name: parsed.productName || '',
        manufacturer: parsed.manufacturer || '',
        originCountry: parsed.originCountry || '',
      originCity: parsed.originCity || '',
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
      setShippingType(parsed.shippingType || { FOB: false, EXW: false });

      setTermsAccepted(false);
      setNotes(parsed.notes || '');
      const quoteAttachments = parsed.attachments || [];
      setFiles(quoteAttachments);
    }
  }, []);

  const parseAmount = (str: string) => parseFloat(str) || 0;

const totalShekel = 
  (currencyOcean === '₪' ? parseAmount(oceanFreight) : 0) +
  (services.customs && currencyCustoms === '₪' ? parseAmount(customsFee) : 0) +
  (services.standards && currencyStandards === '₪' ? parseAmount(standards) : 0) +
  (services.insurance && currencyInsurance === '₪' ? parseAmount(insurance) : 0) +
  (services.inLandDelivery && currencyDelivery === '₪' ? parseAmount(inLandDelivery) : 0);

const totalDollar = 
  (currencyOcean === '$' ? parseAmount(oceanFreight) : 0) +
  (services.customs && currencyCustoms === '$' ? parseAmount(customsFee) : 0) +
  (services.standards && currencyStandards === '$' ? parseAmount(standards) : 0) +
  (services.insurance && currencyInsurance === '$' ? parseAmount(insurance) : 0) +
  (services.inLandDelivery && currencyDelivery === '$' ? parseAmount(inLandDelivery) : 0);

  const fetchData = (url: string) => {
    setReady(false);
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/extract?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setReady(true);
        setLoading(false);
      })
      .catch(() => {
        setData(defaultData);
        setReady(true);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-32 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative" dir="rtl">
      <Head>
        <title>sharecontainer</title>
      </Head>

      <div className="fixed inset-0 z-[-00] pointer-events-none select-none">
        <p className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 text-[500px] text-white font-lalezar opacity-20 leading-none whitespace-nowrap">
          CONTAINER
        </p>
      </div>


      {/* עטיפת כל התוכן בשכבה עליונה */}
     <div className="relative z-10 w-full flex flex-col items-center pb-16">


        {/* חצים */}
        <div className="absolute top-4 right-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goBack}>→</div>
        <div className="absolute top-4 left-4 text-3xl text-blue-700 cursor-pointer z-50" onClick={goNext}>←</div>

        {/* לוגו + כותרת */}
        <div className="flex flex-col items-center relative">
          <img src="/logo-sharecontainer-cropped.png" alt="Share A Container" className="w-[330px] h-auto object-contain" />
          <h1 className="absolute bottom-[20px] text-center text-[26px] sm:text-[30px] font-bold text-black leading-tight">הגשת הצעת מחיר</h1>
        </div>

     

      {/* מסגרת הטופס */}
     <div className="mt-4 w-[1000px] border-2 border-black rounded-xl bg-green-50 px-6 py-6 flex flex-col gap-6">


<div className="flex flex-col items-center text-center space-y-1">
  <div className="text-[20px] text-gray-700 font-semibold">
    מספר בקשה - {quoteId ? (
      <span className="font-bold text-black ml-2">{quoteId}</span>
    ) : (
      <span className="text-gray-400 ml-2 animate-pulse">...</span>
    )}
  </div>

  {client && (
    <>
      <div className="text-[16px] text-gray-800 leading-snug">
        פרטי המבקש: <span className="font-semibold">{client.name}</span>
        {client.phone && `, ${client.phone}`}
      </div>
    {(client.role === 'store' || client.role === 'importer') && client.business && (
  <div className="text-[16px] text-gray-800 leading-snug">
    <span className="font-semibold">שם העסק:</span> {client.business}
  </div>
)}

    </>
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


    {/* שורה חדשה לשלושת השדות: יצרן, ארץ מוצא, עיר מוצא */}
{/* שורה חדשה מאוחדת לשלושה שדות: יצרן, ארץ מוצא, עיר מוצא */}
<div className="col-span-6 grid grid-cols-6 gap-x-3 gap-y-2">
  {/* יצרן */}
  <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">יצרן</label>
  <input
    type="text"
    value={data.manufacturer}
    onChange={(e) => setData({ ...data, manufacturer: e.target.value })}
    className="col-span-1 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px] w-[200px]"
    placeholder="לדוגמה: LG"
  />

  {/* ארץ מוצא */}
  <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">ארץ מוצא</label>
  <input
    type="text"
    value={data.originCountry}
    onChange={(e) => setData({ ...data, originCountry: e.target.value })}
    className="col-span-1 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px] w-[180px]"
    placeholder="מדינה"
  />

  {/* עיר מוצא */}
  <label className="col-span-1 text-[20px] text-gray-800 font-semibold text-left">עיר מוצא</label>
  <input
    type="text"
    value={data.originCity}
    onChange={(e) => setData({ ...data, originCity: e.target.value })}
    className="col-span-1 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
    placeholder="עיר"
  />
</div>




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
    סוג משלוח 
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
     <input
  type="checkbox"
  className="form-checkbox accent-blue-600 w-4 h-4"
  checked={shippingType.EXW}
  onChange={(e) => setShippingType({ ...shippingType, EXW: e.target.checked })}
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
  readOnly
  className="col-span-5 h-[70px] px-4 py-2 border border-gray-400 rounded-xl shadow-sm text-sm resize-none bg-gray-100 cursor-not-allowed"
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

  {/* אזור תצוגת מסמכים */}
  <div className="col-span-5 border border-dashed border-gray-600 rounded-md px-4 py-2 text-gray-800 text-sm bg-gray-50">
    {files.length === 0 ? (
      <div className="text-center text-gray-500">לא צורפו מסמכים</div>
    ) : (
      <div className="flex flex-wrap gap-3">
        {files.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-black text-xs border"
          >
            <span className="truncate max-w-[150px]">{f.filename}</span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
</div>  
</div>  




{/* מסגרת להגשת ההצעה */}
<div className="mt-6 w-[1000px] border-2 border-black rounded-xl bg-[#cceeff88] px-6 py-6 flex flex-col gap-6 ">

  {/* כותרת למסגרת */}
  <h2 className="text-center text-[20px] font-bold text-gray-800 mb-0">
    פרטי הצעת המחיר להגשה
  </h2>

  {/* שינויים כאן: הוספת pl-16 והשארת gap-20 */}
  <div className="flex justify-between gap-20 pl-16">

    {/* טור שמאל – שדות המחיר (היה טור שמאל, עכשיו יופיע מימין) */}
    <div className="flex-1 flex flex-col gap-4">
      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-3 text-[20px] text-gray-800 font-semibold text-left">הובלה ימית</label>
        <input
          type="text"
          value={oceanFreight}
          onChange={(e) => setOceanFreight(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
        <select
          value={currencyOcean}
          onChange={(e) => setCurrencyOcean(e.target.value)}
          className="h-[32px] w-[60px] px-1 border border-gray-500 rounded-md text-lg"
        >
          <option value="₪">₪</option>
          <option value="$">$</option>
        </select>
      </div>

      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-3 text-[20px] text-gray-800 font-semibold text-left">עמילות</label>
        <input
          type="text"
          value={customsFee}
          onChange={(e) => setCustomsFee(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
        <select
          value={currencyCustoms}
          onChange={(e) => setCurrencyCustoms(e.target.value)}
          className="h-[32px] w-[60px] px-1 border border-gray-500 rounded-md text-lg"
        >
          <option value="₪">₪</option>
          <option value="$">$</option>
        </select>
      </div>

      <div className="grid grid-cols-6 gap-x-3 items-start">
        <div className="col-span-3 flex flex-col text-left">
          <label className="text-[20px] text-gray-800 font-semibold">טיפול מול מכון התקנים</label>
          <span className="text-[14px] text-gray-800 mt-0">לא כולל תשלום למכון התקנים</span>
        </div>
        <input
          type="text"
          value={standards}
          onChange={(e) => setStandards(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
        <select
          value={currencyStandards}
          onChange={(e) => setCurrencyStandards(e.target.value)}
          className="h-[32px] w-[60px] px-1 border border-gray-500 rounded-md text-lg"
        >
          <option value="₪">₪</option>
          <option value="$">$</option>
        </select>
      </div>

      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-3 text-[20px] text-gray-800 font-semibold text-left">ביטוח</label>
        <input
          type="text"
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
        <select
          value={currencyInsurance}
          onChange={(e) => setCurrencyInsurance(e.target.value)}
          className="h-[32px] w-[60px] px-1 border border-gray-500 rounded-md text-lg"
        >
          <option value="₪">₪</option>
          <option value="$">$</option>
        </select>
      </div>

      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-3 text-[20px] text-gray-800 font-semibold text-left">הובלה בישראל</label>
        <input
          type="text"
          value={inLandDelivery}
          onChange={(e) => setInLandDelivery(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
        <select
          value={currencyDelivery}
          onChange={(e) => setCurrencyDelivery(e.target.value)}
          className="h-[32px] w-[60px] px-1 border border-gray-500 rounded-md text-lg"
        >
          <option value="₪">₪</option>
          <option value="$">$</option>
        </select>
      </div>

      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-4 text-[20px] text-gray-800 font-semibold text-left">סה"כ לתשלום בש"ח</label>
        <input
          type="text"
          value={totalShekel.toFixed(2)}
          readOnly
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px] bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-4 text-[20px] text-gray-800 font-semibold text-left">סה"כ לתשלום בדולר</label>
        <input
          type="text"
          value={totalDollar.toFixed(2)}
          readOnly
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px] bg-gray-100 cursor-not-allowed"
        />
      </div>
    </div>

    {/* טור ימין – בלוק ההצעה (היה טור ימין, עכשיו יופיע משמאל) */}
    <div className="w-[320px] flex flex-col items-end space-y-3">
      <div className="w-full flex flex-col items-end mb-8">
        <label className="text-[16px] text-gray-800 font-semibold mb-1 text-right w-full">הערות כלליות להצעה</label>
        <textarea
          value={submissionNotes}
          onChange={(e) => setSubmissionNotes(e.target.value)}
          rows={3}
          className="w-full text-sm border border-gray-400 rounded-lg px-3 py-2 resize-none"
          placeholder="הערות שיצורפו להצעת המחיר"
        />
      </div>

      <div className="w-full flex justify-end items-center">
        <label className="text-[16px] text-gray-800 font-semibold">
          ההצעה בתוקף עד&nbsp;&nbsp;
        </label>
        <input
          type="date"
          value={validity}
          onChange={(e) => setValidity(e.target.value)}
          dir="rtl"
          className="h-[36px] w-[180px] px-3 rounded-lg border border-gray-400 text-[15px]"
        />
      </div>

      <label className="flex items-center gap-2 w-full">
        <input
          type="checkbox"
          checked={excludePortTaxes}
          onChange={(e) => setExcludePortTaxes(e.target.checked)}
          className="form-checkbox border border-black accent-blue-600 w-6 h-6"
        />
        <span className="w-full text-right text-[20px] text-black">לא כולל מיסי נמל</span>
      </label>

      <label className="flex items-center gap-2 w-full">
        <input
          type="checkbox"
          checked={excludeVAT}
          onChange={(e) => setExcludeVAT(e.target.checked)}
          className="form-checkbox border border-black accent-blue-600 w-6 h-6"
        />
        <span className="w-full text-right text-[20px] text-black">לא כולל מע"מ</span>
      </label>

      <label className="flex items-center gap-2 w-full mt-2">
        <input
          type="checkbox"
         className="form-checkbox border border-black accent-blue-600 w-6 h-6"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <span className="w-full text-right text-[14px] text-black">
          אני מאשר שקראתי את <a href="/terms" target="_blank" className="underline text-blue-700 hover:text-blue-900">תנאי השימוש</a> באתר
        </span>
      </label>

      <button
        type="button"
        onClick={submitFinalQuote}
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
  </div>
</div>


      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-lime-200 rounded-xl shadow-xl p-8 max-w-sm text-center space-y-4">
              <h2 className="text-2xl font-bold text-indigo-700">ההצעה הוגשה בהצלחה ✅</h2>
              <button
                onClick={() => router.push('/brokerstatus')}
                className="mt-4 px-6 py-2 bg-cyan-800 text-white rounded-md hover:bg-blue-700 transition"
              >
                חזרה למסך הצעות
              </button>
            </div>
          </div>
        </>
      )}

      </div>
<footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
  כל הזכויות שמורות ל־
  <span className="text-orange-500 font-semibold">Share A Container</span>
   <div className="absolute left-4 top-3 text-purple-400 text-sm"> D&A code design ©</div>
</footer>


    </div>
  );
}