import React, { useEffect, useRef, useState } from 'react';

export default function SubmittedQuoteCard({ quote, broker, onClose }) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 });
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const {
    quoteId,
    submittedAt,
    productName,
    manufacturer,
    origin,
    totalVolume,
    totalWeight,
    shippingType = {},
    services = {},
    productUrl,
    notes,
    insurancePrice,
    inlandDeliveryPrice,
    customsPrice,
    oceanFreight,
    standardsPrice,
    price,
    currency,
    currencyOcean,
    currencyCustoms,
    currencyStandards,
    currencyInsurance,
    currencyDelivery,
    validUntil,
    clientName,
    clientPhone,
    clientEmail,
    clientBusiness,
    brokerName,
    brokerPhone,
    brokerEmail,
    submissionNotes,
  } = quote;

  const handleContact = () => {
    if (!quote?.brokerEmail) {
      alert("לא ניתן לשלוח מייל - כתובת עמיל מכס חסרה");
      return;
    }

    const subject = encodeURIComponent(`בקשה ליצירת קשר - הצעה ${quoteId}`);
    const body = encodeURIComponent(
      `שלום ${quote?.brokerName || ''},\n\nראיתי את הצעתך עבור "${productName}" (מס' הצעה ${quoteId}).\n` +
      `אשמח אם תיצור עימי קשר:\n\nשם: ${clientName}\nטלפון: ${clientPhone}\nדוא"ל: ${clientEmail}\n\nתודה,\nמערכת Share A Container`
    );

    window.location.href = `mailto:${encodeURIComponent(quote.brokerEmail)}?subject=${subject}&body=${body}`;
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
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

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const summarize = (curr) => {
    let sum = 0;
    if (currencyOcean === curr) sum += parseFloat(oceanFreight || 0);
    if (currencyCustoms === curr) sum += parseFloat(customsPrice || 0);
    if (currencyStandards === curr) sum += parseFloat(standardsPrice || 0);
    if (currencyInsurance === curr) sum += parseFloat(insurancePrice || 0);
    if (currencyDelivery === curr) sum += parseFloat(inlandDeliveryPrice || 0);
    return sum.toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
    <div
  ref={cardRef}
  className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-hidden fixed cursor-move"
  style={{ top: position.y, left: position.x }}
  onMouseDown={handleMouseDown}
>
  <div className="bg-indigo-800 text-white px-6 py-3 flex justify-between items-center">
    <h2 className="text-lg font-bold">פרטי הצעה {quoteId}</h2>
    <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-xl">✕</button>
  </div>

        <div className="px-6 py-4 text-base">
          <div className="border-b border-gray-300 pb-4">
            <h3 className="text-indigo-700 font-bold text-lg mb-2">בקשת הלקוח</h3>
            <div className="text-right text-[16px]">
              <strong>שם הלקוח:</strong> {clientName} | <strong>טלפון:</strong> {clientPhone} | <strong>אימייל:</strong>{' '}
              <a href={`mailto:${clientEmail}`} className="text-blue-700 underline">{clientEmail}</a>
            </div>
            {clientBusiness && <div><strong>שם העסק:</strong> {clientBusiness}</div>}
            <div><strong>שם המוצר:</strong> {productName}</div>
<div className="flex flex-wrap gap-x-5 gap-y-2 items-center text-[16px] mt-2 mb-2">
  <span><strong>יצרן:</strong> {manufacturer}</span>
  <span><strong>מקור:</strong> {origin}</span>
  <span><strong>נפח:</strong> {totalVolume}</span>
  <span><strong>משקל:</strong> {totalWeight}</span>
  <span>
    <strong>לינק למוצר:</strong> {productUrl 
      ? <a href={productUrl} target="_blank" className="text-blue-600 underline">צפייה</a>
      : '—'}
  </span>
</div>

            <div><strong>הערות הלקוח:</strong> {quote.notes}</div>

          </div>

          <div className="flex justify-between items-center mb-2">
            <h3 className="text-right text-[18px] font-bold text-blue-900">הצעת המחיר</h3>
            <div className="text-left text-red-600 text-sm font-semibold">
              בתוקף עד: {new Date(validUntil).toLocaleDateString('he-IL')}
            </div>
          </div>

          <div className="text-right text-[16px] mt-2 mb-4">
            <span>
              <strong>שם המציע:</strong> {brokerName} | <strong>טלפון:</strong> {brokerPhone} | <strong>אימייל:</strong>{' '}
              <a href={`mailto:${brokerEmail}`} className="text-blue-600 underline">{brokerEmail}</a>
            </span>
          </div>


          <table className="w-full text-right border-collapse border border-gray-400 mt-0">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-2 py-1">סעיף מחיר</th>
                <th className="border border-gray-400 px-2 py-1">לתשלום בש"ח</th>
                <th className="border border-gray-400 px-2 py-1">לתשלום ב־$</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['הובלה ימית', oceanFreight, currencyOcean],
                ['עמילות מכס', customsPrice, currencyCustoms],
                ['טיפול מול מכון התקנים - לא כולל תשלום למכון', standardsPrice, currencyStandards],
                ['הובלה בישראל', inlandDeliveryPrice, currencyDelivery],
                ['ביטוח', insurancePrice, currencyInsurance],
              ].map(([label, value, curr], i) => (
                <tr key={i}>
                  <td className="border border-gray-300 px-2 py-1">{label}</td>
                  <td className="border border-gray-300 px-2 py-1">{curr === '₪' ? `${value} ₪` : '—'}</td>
                  <td className="border border-gray-300 px-2 py-1">{curr === '$' ? `${value} $` : '—'}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-semibold">
                <td className="border border-gray-400 px-2 py-1 text-center">סה"כ לתשלום - ש"ח + $</td>
               <td className="border border-gray-400 px-2 py-1">{summarize('₪')} ₪</td>
<td className="border border-gray-400 px-2 py-1">{summarize('$')} $</td>

              </tr>
            </tbody>
          </table>


{(quote.excludePortTaxes || quote.excludeVAT) && (
  <div className="flex justify-right gap-8 mt-0 mb-0 text-lg text-black">
    {quote.excludePortTaxes && (
      <div>* הצעה לא כוללת מיסי נמל</div>
    )}
    {quote.excludeVAT && (
      <div>* המחיר אינו כולל מע"מ</div>
    )}
  </div>
)}

          {quote.submissionNotes && (
  <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg text-right">
    <strong>הערות כלליות להצעה:</strong>
    <div className="mt-1 whitespace-pre-wrap text-gray-800">{quote.submissionNotes}</div>
  </div>
)}



        
        </div>
          <div className="bg-gradient-to-t from-gray-800 to-gray-500 px-6 py-4 flex justify-between items-center">
          <button onClick={() => window.print()} className="bg-amber-200 hover:bg-amber-100 text-gray-800 text-sm px-4 py-2 rounded">📄 הדפס הצעה</button>
          <button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">📧  השב במייל ל{brokerName}</button>
        </div>
      </div>
    </div>
  );
}
