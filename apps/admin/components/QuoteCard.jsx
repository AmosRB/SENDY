import React, { useState } from 'react';

export default function QuoteCard({
  quote,
  highlight = false,
  layout = 'card',
  background,
  onClick,
  modal = false,
  submittedCount = 0,
   onShowSubmitted,
   onIgnore,
   showFooter = true
}) {
  const [showDetails, setShowDetails] = useState(false);

  const createdAt = quote.createdAt
    ? new Date(quote.createdAt).toLocaleDateString('he-IL')
    : '—';
  const productName = quote.productName || '—';
  const quoteId = quote.quoteId || '—';

  const baseClasses = 'border border-black rounded-xl transition cursor-pointer';
  const bgColor =
    background === 'green' ? 'bg-green-100 hover:bg-green-200' :
    background === 'blue'  ? 'bg-sky-100 hover:bg-sky-200' :
    highlight ? 'bg-orange-100 hover:bg-orange-200' :
    'bg-white hover:bg-gray-100';

  const rowClasses = 'grid grid-cols-4 items-center text-sm';



  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) return onClick(e);      // לדף עמיל
    if (modal) return setShowDetails(true); // לדף לקוח
  };

 const ClientQuoteModal = () => {
  const isImporter = quote.type === 'importer';
  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="bg-amber-50 w-full max-w-2xl rounded-xl shadow-lg overflow-hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-indigo-800 text-white px-6 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">פרטי הבקשה #{quoteId}</h2>
          <button onClick={() => setShowDetails(false)} className="text-white hover:text-gray-200 font-bold text-xl">✕</button>
        </div>
        <div className="px-6 py-4 space-y-2 text-base">
          <div><strong>תאריך הגשה:</strong> {createdAt}</div>
          {isImporter ? (
            <>
              <div><strong>גודל מכולה:</strong> {quote.containerSize || '—'}</div>
              <div><strong>כמות:</strong> {quote.quantity || '—'}</div>
              <div><strong>מוצא:</strong> {quote.origin || '—'}</div>
              <div><strong>יעד:</strong> {quote.destination || '—'}</div>
              <div>
  <b>סוג משלוח:</b>{" "}
  {[quote.shippingType?.FOB && "FOB", quote.shippingType?.EXW && "EXW"]
    .filter(Boolean)
    .join(" / ") || "לא נבחר"}
</div>
              <div><strong>שם המבקש:</strong> {quote.clientName || '—'}</div>
              <div><strong>טלפון ליצירת קשר:</strong> {quote.clientPhone || '—'}</div>
            </>
          ) : (
            <>
              <div><strong>שם המוצר:</strong> {productName}</div>
              <div><strong>יצרן:</strong> {quote.manufacturer || '—'}</div>
              <div><strong>מקור:</strong> {quote.origin || '—'}</div>
              <div><strong>נפח:</strong> {quote.totalVolume || '—'}</div>
              <div><strong>משקל:</strong> {quote.totalWeight || '—'}</div>
              <div><strong>סוג משלוח:</strong> {[quote.shippingType?.FOB && 'FOB', quote.shippingType?.EXW && 'EXW'].filter(Boolean).join(', ') || '—'}</div>
              <div><strong>שירותים נלווים:</strong> {[quote.services?.insurance && 'ביטוח', quote.services?.customs && 'עמילות מכס', quote.services?.standards && 'תקינה'].filter(Boolean).join(', ') || '—'}</div>
              <div><strong>לינק למוצר:</strong> {quote.productUrl ? <a href={quote.productUrl} target="_blank" className="text-blue-600 underline">צפייה</a> : '—'}</div>
              <div><strong>הערות:</strong> {quote.notes || '—'}</div>
              <div><strong>שם המבקש:</strong> {quote.clientName || '—'}</div>
              <div><strong>טלפון ליצירת קשר:</strong> {quote.clientPhone || '—'}</div>
            </>
          )}
        </div>
        <div className="bg-gradient-to-t from-gray-800 to-gray-500 px-6 py-4 flex justify-end items-center">
          <button onClick={() => setShowDetails(false)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">סגור</button>
        </div>
      </div>
    </div>
  );
};


if (layout === 'row') {
  const isImporter = quote.type === 'importer';

  return (
    <>
      <div
        className={`
          ${baseClasses}
          ${isImporter
            ? 'bg-yellow-100 hover:bg-yellow-200 border-grey-900'
            : bgColor
          }
          rounded-xl overflow-hidden text-sm
        `}
        onClick={handleClick}
      >
        {/* שורת התוכן של הכרטיס */}
        <div className={`${rowClasses} px-4 py-2`}>
          {/* עמודה 1 – מספר בקשה */}
          <div className="col-span-1 font-semibold text-gray-800 flex items-center gap-1">
            {quoteId}
            {isImporter && (
              <span title="יבואן" className="text-yellow-700 font-bold text-xs ml-1">IB</span>
            )}
          </div>

          {/* עמודה 2 – תאריך */}
          <div className="col-span-1 text-gray-500">{createdAt}</div>

          {/* עמודה 3 – שדות מתאימים */}
          {isImporter ? (
            <div className="col-span-2 flex flex-col text-right leading-tight">
              
              <span>מכולה: {quote.containerSize} | כמות: {quote.quantity}</span>
            </div>
          ) : (
            <div className="col-span-2 text-gray-700">{productName}</div>
          )}
        </div>

        {/* ✅ פוטר בתוך הכרטיס */}
        {showFooter && (
         <div className="flex justify-between items-center bg-emerald-200 px-4 py-[6px] text-[14px] font-semibold border-t border-emerald-600 text-right">
<span
  className={
    `${submittedCount >= 5
      ? "text-green-700 font-bold text-center cursor-pointer"
      : submittedCount >= 1
        ? "text-blue-700 font-bold text-center cursor-pointer underline"
        : "text-orange-600 font-bold text-center cursor-pointer"
    }`
  }
  onClick={e => {
    e.stopPropagation();
    onShowSubmitted && onShowSubmitted(quoteId);
  }}
  title={submittedCount >= 5 ? undefined : "הצג הצעות שהוגשו לבקשה זו"}
>
  {submittedCount >= 5
    ? "הגעת למקסימום ההצעות (5) לבקשה זו"
    : `צפה במספר ההצעות שהוגשו ${submittedCount}`
  }
</span>



{onIgnore && (
  <button
    onClick={e => {
      e.stopPropagation();
      fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.quoteId, status: 'cancelledByClient' })
      }).then(() => {
        onIgnore(quote.quoteId); // הסרה מה־state המקומי
      });
    }}
    className="text-red-600 hover:underline"
  >
    מחק בקשה X    
  </button>
)}

</div>

        )}
      </div>
      {modal && showDetails && <ClientQuoteModal />}
    </>
  );
}




}
