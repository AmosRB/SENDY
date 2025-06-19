import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function QouteFillImporter() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  // מזהה ההצעה
  const [quoteId, setQuoteId] = useState('');
  // פרטי המבקש
  const [client, setClient] = useState<{ name: string; phone: string; role?: string; business?: string } | null>(null);

  // פרטי בקשה
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [containerSize, setContainerSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // שדות הצעת המחיר
  const [oceanFreight, setOceanFreight] = useState('');
  const [customsFee, setCustomsFee] = useState('');
  const [standards, setStandards] = useState('');
  const [insurance, setInsurance] = useState('');
  const [inLandDelivery, setInLandDelivery] = useState('');
  const [currencyOcean, setCurrencyOcean] = useState('₪');
  const [currencyCustoms, setCurrencyCustoms] = useState('₪');
  const [currencyStandards, setCurrencyStandards] = useState('₪');
  const [currencyInsurance, setCurrencyInsurance] = useState('₪');
  const [currencyDelivery, setCurrencyDelivery] = useState('₪');
  const [excludePortTaxes, setExcludePortTaxes] = useState(false);
  const [excludeVAT, setExcludeVAT] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validity, setValidity] = useState('');

  // מסמכים (לצפייה/הורדה)
  const [files, setFiles] = useState<{ fileId: string; filename: string }[]>([]);

  // קודם, למעלה בקובץ (ליד ה־useState)
 type FieldRow = [
    string,
    string,
    React.Dispatch<React.SetStateAction<string>>,
    string,
    React.Dispatch<React.SetStateAction<string>>
  ];

  const fields: FieldRow[] = [
    ['הובלה ימית', oceanFreight, setOceanFreight, currencyOcean, setCurrencyOcean],
    ['עמילות', customsFee, setCustomsFee, currencyCustoms, setCurrencyCustoms],
    ['טיפול מול מכון התקנים', standards, setStandards, currencyStandards, setCurrencyStandards],
    ['ביטוח', insurance, setInsurance, currencyInsurance, setCurrencyInsurance],
    ['הובלה בישראל', inLandDelivery, setInLandDelivery, currencyDelivery, setCurrencyDelivery]
  ];


  // שליפה מה-sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('quoteData');
    if (!saved) return;
    const parsed = JSON.parse(saved);

    setQuoteId(parsed.quoteId || '');
    setClient({
      name: parsed.clientName || '',
      phone: parsed.clientPhone || '',
      role: parsed.clientRole || '',
      business: parsed.clientBusiness || ''
    });
    setOrigin(parsed.origin || '');
    setDestination(parsed.destination?.address || parsed.destination || '');
    setDepartureDate(parsed.departureDate || '');
    setContainerSize(parsed.containerSize || '');
    setQuantity(parsed.quantity || 1);

    // קבצים
    setFiles(parsed.attachments || []);
  }, []);

  // חישובי סכומים
  const parseAmount = (str: string) => parseFloat(str) || 0;
  const totalShekel =
    (currencyOcean === '₪' ? parseAmount(oceanFreight) : 0) +
    (currencyCustoms === '₪' ? parseAmount(customsFee) : 0) +
    (currencyStandards === '₪' ? parseAmount(standards) : 0) +
    (currencyInsurance === '₪' ? parseAmount(insurance) : 0) +
    (currencyDelivery === '₪' ? parseAmount(inLandDelivery) : 0);

  const totalDollar =
    (currencyOcean === '$' ? parseAmount(oceanFreight) : 0) +
    (currencyCustoms === '$' ? parseAmount(customsFee) : 0) +
    (currencyStandards === '$' ? parseAmount(standards) : 0) +
    (currencyInsurance === '$' ? parseAmount(insurance) : 0) +
    (currencyDelivery === '$' ? parseAmount(inLandDelivery) : 0);


  // שליחת הצעה
  const submitFinalQuote = async () => {
  const broker = JSON.parse(sessionStorage.getItem('brokerData') || '{}');
  const quoteData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
  const client = {
  name: quoteData.clientName || '',
  phone: quoteData.clientPhone || '',
  email: quoteData.clientEmail || '',
  business: quoteData.clientBusiness || ''
};


  if (!broker?.code) return alert("פרטי עמיל מכס חסרים");
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submitted-quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId,
        clientName: client?.name || '',
        clientPhone: client?.phone || '',
        clientEmail: client?.email || '',
        clientBusiness: client?.business || '',
        clientId: quoteData.clientId, 
        brokerCode: broker.code,
        brokerName: broker.name,
        brokerPhone: broker.phone,
        brokerEmail: broker.email,
        origin,
        destination,
        departureDate,
        containerSize,
        quantity,
        oceanFreight: parseAmount(oceanFreight),
        customsPrice: parseAmount(customsFee),
        standardsPrice: parseAmount(standards),
        insurancePrice: parseAmount(insurance),
        inlandDeliveryPrice: parseAmount(inLandDelivery),
        price: (totalShekel + totalDollar).toFixed(2), // שדה חובה
        currency: currencyOcean || '₪',                // שדה חובה!! זה מה שהשרת דורש
        totalShekel: totalShekel.toFixed(2),
        totalDollar: totalDollar.toFixed(2),
        currencyOcean,
        currencyCustoms,
        currencyStandards,
        currencyInsurance,
        currencyDelivery,
        validUntil: validity ? new Date(validity).toISOString() : null,
        excludePortTaxes,
        excludeVAT,
        submissionNotes,
        submittedAt: new Date().toISOString(),
        status: 'active'
      })
    });
    if (!res.ok) throw new Error("שגיאה בהגשה");
    setShowSuccess(true);
  } catch (err) {
    alert('אירעה שגיאה בעת שליחת ההצעה');
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-32 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative" dir="rtl">
      <Head>
        <title>הגשת הצעת מחיר ליבואן</title>
      </Head>
      

      <div className="fixed inset-0 z-[-00] pointer-events-none select-none">
        <p className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 text-[500px] text-white font-lalezar opacity-20 leading-none whitespace-nowrap">
          CONTAINER
        </p>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center pb-16">

{/* חץ ימני בראש הדף */}
<div
  className="absolute top-6 right-6 text-4xl text-blue-700 hover:text-blue-900 font-bold cursor-pointer z-50"
  aria-label="חזור"
  onClick={() => window.history.back()}
  tabIndex={0}
>
  →
</div>
{/* חץ שמאלי בראש הדף */}
<div
  className="absolute top-6 left-6 text-4xl text-blue-700 font-bold cursor-pointer z-50"
  aria-label="חזור"
  onClick={() => window.history.back()}
  tabIndex={0}
>
  ←
</div>

        {/* לוגו + כותרת */}
        <div className="flex flex-col items-center my-6">
  <img
    src="/logo-sharecontainer-cropped.png"
    alt="Share A Container"
    className="w-[300px] h-auto object-contain mb-4"
    style={{ maxWidth: 300 }}
  />
  <h1 className="text-center text-[30px] font-bold text-black leading-tight">
    הגשת הצעת מחיר ליבואן
  </h1>
</div>



        {/* מסגרת עליונה - מספר בקשה, פרטי המבקש ופרטי הבקשה */}
        <div className="mt-4 w-[1000px] border-2 border-black rounded-xl bg-yellow-100 px-6 py-4 flex flex-col gap-2">
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="text-[20px] text-gray-700 font-semibold">
              מספר בקשה - {quoteId ? (
                <span className="font-bold text-black ml-2">{quoteId}</span>
              ) : (
                <span className="text-gray-400 ml-2 animate-pulse">...</span>
              )}
            </div>
            {client && (
              <div className="flex flex-col items-center text-center mt-2 space-y-3">
                <div className="text-[16px] text-gray-800 leading-snug">
                  פרטי המבקש: <span className="font-semibold">{client.name}</span>
                  {client.phone && `, ${client.phone}`} <span className="font-semibold">- שם העסק:</span> {client.business}
                </div>
                {client.business && (
                  <div className="text-[16px] text-gray-800 leading-snug mt-1">
                    <span className="font-semibold">פרטי הבקשה :</span> 
                  </div>
                )}
              </div>
            )}
          </div>
         <div className="flex flex-row flex-wrap items-center justify-center gap-7 mt-2 text-[20px] text-gray-700">
  <span>יציאה מ: <b>{origin || '-'}</b></span>
  <span>| יעד: <b>{destination || '-'}</b></span>
  <span>| תאריך: <b>{departureDate || '-'}</b></span>
  <span>| גודל מכולה: <b>{containerSize || '-'}</b></span>
  <span>| כמות מכולות: <b>{quantity || '-'}</b></span>
</div>

        </div>

        {/* מסגרת מחירים ותנאי הצעה */}
        <div className="mt-6 w-[1000px] border-2 border-black rounded-xl bg-[#cceeff88] px-6 py-6 flex flex-col gap-6 ">
          <h2 className="text-center text-[20px] font-bold text-gray-800 mb-0">
            פרטי הצעת המחיר להגשה
          </h2>


          
          <div className="flex justify-between gap-20 pl-16">
            <div className="flex-1 flex flex-col gap-4">
               {fields.map(([label, val, setVal, curr, setCurr], idx) => (
      <div key={idx} className="grid grid-cols-6 gap-x-3 items-center">
        <label className="col-span-3 text-[20px] text-gray-800 font-semibold text-left">{label}</label>
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          className="col-span-2 h-[36px] px-4 rounded-lg border border-gray-400 text-[15px]"
          placeholder="עלות"
        />
        <select
          value={curr}
          onChange={e => setCurr(e.target.value)}
          className="h-[32px] w-[60px] px-1 border border-gray-500 rounded-md text-lg"
        >
          <option value="₪">₪</option>
          <option value="$">$</option>
        </select>
      </div>
    ))}
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
            {/* טור ימין */}
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
