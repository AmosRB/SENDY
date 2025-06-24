import { useEffect, useState } from 'react';
import Head from 'next/head';
import QuoteCard from '../components/QuoteCard';
import SubmittedQuoteCard from '../components/SubmittedQuoteCard';

/**
 * ClientOpenQuotesPage component displays open and submitted quotes for a specific client.
 * It handles client authentication via a access code and fetches quote data from the API.
 */
export default function ClientOpenQuotesPage() {
  // State variables for client information and data fetching
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState('');
  const [openQuotes, setOpenQuotes] = useState([]); // Quotes that are open for submission
  const [submittedQuotes, setSubmittedQuotes] = useState([]); // Quotes that have been submitted by suppliers
  const [activeQuote, setActiveQuote] = useState(null); // The active quote to display in a modal
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering submitted quotes
  const [code, setCode] = useState(''); // Input for client access code
  const [clientCodeExists, setClientCodeExists] = useState(null); // Tracks if client code exists in sessionStorage, null initially to indicate loading

  // API base URL from environment variables
  // This constant is typically defined once per module or globally if used across many components.
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // Effect to check for client code existence in sessionStorage on component mount
  // This ensures the page doesn't render until the sessionStorage check is complete.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientCodeExists(!!sessionStorage.getItem('clientCode'));
    }
  }, []);

  /**
   * Fetches open and submitted quotes for a given client ID.
   * Filters quotes based on client ID and status, and updates state.
   * @param {string} id - The client ID to fetch quotes for.
   */
  const fetchQuotesForClient = async (id) => {
    try {
      // Fetch open quotes and submitted quotes in parallel for efficiency
      const [quotesRes, submittedRes] = await Promise.all([
        fetch(`${apiBase}/api/quotes?clientId=${id}`, { cache: "no-store" }),
        fetch(`${apiBase}/api/submitted-quotes/all`, { cache: "no-store" })
      ]);

      const allQuotes = await quotesRes.json();
      const allSubmitted = await submittedRes.json();

      // Filter quotes that belong to the current client and have 'submitted' status
      const myQuotes = allQuotes.filter(
        q =>
          q.clientId?.toString() === id &&
          q.status === 'submitted'
      );

      // Get ignored quotes from localStorage to filter them out
      const ignored = JSON.parse(localStorage.getItem('ignoredQuotes') || '[]');
      const visibleQuotes = myQuotes.filter(q => !ignored.includes(q.quoteId));
      setOpenQuotes(visibleQuotes);

      // Filter submitted quotes that belong to the current client
      const mySubmitted = allSubmitted.filter(q => q.clientId === id);
      setSubmittedQuotes(mySubmitted);

      // Clear quoteData from sessionStorage (likely used for creating new quotes)
      sessionStorage.removeItem('quoteData');
    } catch (err) {
      setError('שגיאה בטעינת הנתונים'); // Error message for data loading failure
    }
  };

  // Effect to retrieve client information from sessionStorage and fetch quotes
  // Runs once on component mount if clientCodeExists is true, or after authentication.
  useEffect(() => {
    // Only proceed if clientCodeExists has been determined (not null)
    if (clientCodeExists === false) {
      return; // If clientCode does not exist, the login screen will be rendered
    }

    const id = sessionStorage.getItem('clientId');
    const name = sessionStorage.getItem('clientName');

    if (!id) {
      setError('אין זיהוי לקוח'); // No client ID found, display error
      return;
    }
    setClientId(id);
    setClientName(name || ''); // Set client name, default to empty string if not found
    fetchQuotesForClient(id); // Fetch quotes for the identified client
  }, [clientCodeExists]); // Dependency on clientCodeExists to re-run after initial check

  // Render nothing until clientCodeExists status is determined
  if (clientCodeExists === null) {
    return null;
  }

  // If client code does not exist, display the access code input form
  if (!clientCodeExists) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white">
        <img src="/logo-sharecontainer-cropped.png" alt="Share A Container" className="w-[250px] h-auto mb-6" />
        <h2 className="mb-4 text-lg font-bold">הזן את קוד הגישה שלך</h2>
        <input
          type="text"
          className="border border-gray-400 rounded-lg px-4 py-2 mb-3 text-center text-lg"
          placeholder="קוד גישה אישי"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
        />
        <button
          className="bg-orange-500 text-white rounded-lg px-6 py-2 font-semibold"
          onClick={async () => {
            if (code.length === 6) {
              try {
                // Step 1: Fetch client from server by code
                const res = await fetch(`/api/clients?code=${code}`);
                const data = await res.json();

                if (data && data._id) {
                  // If client found, store details in sessionStorage and reload
                  sessionStorage.setItem('clientCode', code);
                  sessionStorage.setItem('clientId', data._id);
                  sessionStorage.setItem('clientName', data.name || '');
                  window.location.reload(); // Reload the page to re-evaluate auth status
                } else {
                  setError('קוד לא נמצא במערכת'); // Code not found error
                }
              } catch (e) {
                setError('שגיאה בשליפת פרטי המשתמש'); // Error fetching user details
              }
            } else {
              setError('אנא הזן קוד בן 6 ספרות'); // Invalid code length error
            }
          }}
        >
          כניסה
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    );
  }

  // Calculate placeholders for visual consistency
  const placeholderCount = 10;
  const draftPlaceholders = Array.from({ length: Math.max(0, placeholderCount - openQuotes.length) });
  const submittedPlaceholders = Array.from({ length: Math.max(0, placeholderCount - submittedQuotes.length) });

  return (
    <div className="min-h-screen pb-32 flex flex-col items-center justify-start px-4 pt-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white" dir="rtl">
      <Head>
        <title>Share A Container | סטטוס בקשות להצעת מחיר לקוח</title>
      </Head>

      {/* Background text decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[500px] text-white font-lalezar opacity-40">CONTAINER</p>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <img src="/logo-sharecontainer-cropped.png" alt="Share A Container" className="w-[330px] h-auto" />
        <h1 className="text-[28px] sm:text-[32px] font-bold text-black mt-0 mb-12 text-center w-full">
          מצב בקשות של {clientName && ` ${clientName}`}
        </h1>

        {error && <p className="text-red-600 font-bold text-center mt-4">{error}</p>}

        <div className="w-full max-w-[1200px] mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Search input for filtering quotes */}
          <div className="absolute left-0 -top-10">
            <input
              type="text"
              placeholder="חפש לפי מספר בקשה "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[250px] px-3 py-1 border border-gray-400 rounded-lg text-sm text-right placeholder-gray-600 font-semibold"
            />
          </div>

          {/* Button to submit a new request */}
          <div className="absolute right-0 -top-10">
            <a
              href="/newproduct"
              className="bg-sky-200 hover:bg-sky-400 text-sm text-black rounded-lg px-3 py-1 shadow-lg transition-all duration-200 border border-sky-800"
              style={{ minWidth: '145px', textAlign: 'center', letterSpacing: '0.5px' }}
            >
              הגש בקשה נוספת
            </a>
          </div>

          {/* Section for open quotes */}
          <div className="bg-green-100/20 border border-gray-500 rounded-xl p-4 col-span-1">
            <div className="bg-black text-white px-3 py-1 rounded-md mb-4 text-center w-full">בקשות להצעת מחיר</div>
            <div className="grid grid-cols-4 font-bold border-b pb-2 mb-2 text-sm text-gray-600 text-right">
              <div className="col-span-1">מספר בקשה</div>
              <div className="col-span-1">תאריך הגשה</div>
              <div className="col-span-2">שם המוצר</div>
            </div>

            <div className="space-y-2">
              {openQuotes.map((q) => (
                <div key={q.quoteId}>
                  <QuoteCard
                    quote={q}
                    layout="row"
                    background="green"
                    modal={true}
                    submittedCount={q.submittedBy?.length || 0}
                    // Toggle searchTerm when "Show Submitted" is clicked
                    onShowSubmitted={quoteId => setSearchTerm(searchTerm === quoteId ? '' : quoteId)}
                    active={searchTerm === q.quoteId} // Highlight card if its quoteId matches searchTerm
                    // Handle ignoring (closing) a quote
                    onIgnore={async (id) => {
                      await fetch(`${apiBase}/api/quotes`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quoteId: id, clientClosed: true })
                      });
                      // Update state to remove the ignored quote
                      setOpenQuotes(prev => prev.filter(q => q.quoteId !== id));
                    }}
                  />
                </div>
              ))}
              {/* Render placeholders for open quotes */}
              {draftPlaceholders.map((_, i) => (
                <div key={`draft-placeholder-${i}`} className="grid grid-cols-3 text-gray-400 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm">
                  <div className="font-semibold">{openQuotes.length + i + 1}</div>
                  <div>---</div>
                  <div>---</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section for submitted quotes */}
          <div className="bg-sky-100/20 border border-gray-500 rounded-xl p-4 col-span-1">
            <div className="bg-black text-white px-3 py-1 rounded-md mb-4 text-center w-full">הצעות שהוגשו</div>
            <div className="grid grid-cols-4 font-bold border-b pb-2 mb-2 text-sm text-gray-600">
              <div>מספר בקשה</div>
              <div>סה״כ ש״ח</div>
              <div>סה״כ $</div>
              <div>תאריך תפוגה</div>
            </div>

            <div className="space-y-2">
              {submittedQuotes
                // Filter submitted quotes by client ID and search term
                .filter((q) =>
                  q.clientId?.toString() === clientId &&
                  q.quoteId?.toString().includes(searchTerm.replace('#', ''))
                )
                .map((quote, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 items-center border border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-800 cursor-pointer hover:bg-blue-400 bg-sky-300/60"
                    onClick={() => {
                      // Find the original client request associated with this submitted quote
                      const parentQuote = openQuotes.find(qo => qo.quoteId === quote.quoteId) || {};
                      // Set the active quote by merging original quote data with submitted quote data
                      // Submitted quote data will overwrite original data if there are duplicates
                      setActiveQuote({ ...parentQuote, ...quote });
                    }}
                  >
                    <div className="font-semibold">{quote.quoteId}</div>
                    <div className="text-right">{quote.totalShekel || '0.00'}</div>
                    <div className="text-right">$ {quote.totalDollar || '0.00'}</div>
                    <div className="text-red-700 text-sm text-right">
                      {new Date(quote.validUntil).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                ))
              }
              {/* Render placeholders for submitted quotes */}
              {submittedPlaceholders.map((_, i) => (
                <div
                  key={`submitted-placeholder-${i}`}
                  className="grid grid-cols-3 text-gray-400 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm"
                >
                  <div className="font-semibold">{submittedQuotes.length + i + 1}</div>
                  <div>---</div>
                  <div>---</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SubmittedQuoteCard displayed as a modal */}
        {activeQuote && (
          <SubmittedQuoteCard
            quote={activeQuote}
            onClose={() => setActiveQuote(null)} // Function to close the modal
          />
        )}
      </div>
    </div>
  );
}
