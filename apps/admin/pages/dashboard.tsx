"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import classNames from "classnames";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AdminDashboard() {
  const [code, setCode] = useState('');
  const [admin, setAdmin] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [submittedQuotes, setSubmittedQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loginCounts, setLoginCounts] = useState<number[]>([]);
  const [quoteCounts, setQuoteCounts] = useState<number[]>([]);

  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 20;
  const userPageCount = Math.ceil(users.length / usersPerPage);
  const usersToShow = users.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  const [brokerPage, setBrokerPage] = useState(1);
  const brokersPerPage = 20;
  const brokerPageCount = Math.ceil(brokers.length / brokersPerPage);
  const brokersToShow = brokers.slice((brokerPage - 1) * brokersPerPage, brokerPage * brokersPerPage);

  const [quotePage, setQuotePage] = useState(1);
  const quotesPerPage = 20;
 const filteredQuotes = quotes.filter(q => q.status !== 'draft');
const quotePageCount = Math.ceil(filteredQuotes.length / quotesPerPage);
const quotesToShow = filteredQuotes.slice((quotePage - 1) * quotesPerPage, quotePage * quotesPerPage);
  const [submittedPage, setSubmittedPage] = useState(1);
  const submittedPerPage = 20;
  const submittedPageCount = Math.ceil(submittedQuotes.length / submittedPerPage);
  const submittedToShow = submittedQuotes.slice((submittedPage - 1) * submittedPerPage, submittedPage * submittedPerPage);

type AdminUser = {
  _id: string;
  name: string;
  role: string;
  [key: string]: any;
};

const handleLogin = async () => {
  setIsLoggingIn(true);
  setLoginError('');
  try {
    const res = await axios.get(`${BASE_URL}/api/users?code=${code}`);
    const user = res.data as AdminUser;
    if (user.role !== 'admin') {
      setLoginError('אין הרשאה. נדרש קוד של אדמין');
      setIsLoggingIn(false);
      return;
    }
    setAdmin(user);
  } catch (err) {
    setLoginError('קוד לא תקף או שגיאה בשרת');
  } finally {
    setIsLoggingIn(false);
  }
};



  useEffect(() => {
    if (!admin) return;
    async function fetchData() {
      try {
        const dashboardRes = await axios.get(`${BASE_URL}/api/admin/dashboard-data`);
        const data = dashboardRes.data as any;
        setStats(data.summary);
        setUsers(data.users);
        setBrokers(data.brokers);
        setQuotes(data.quotes);
        setSubmittedQuotes(data.submittedQuotes);
        generateChart(data.users, data.quotes);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [admin]);

  const generateChart = (users: any[], quotes: any[]) => {
    const dateMap: { [key: string]: { users: number; quotes: number } } = {};
    users.forEach(u => {
      if (!u.createdAt) return;
      const date = new Date(u.createdAt).toISOString().split("T")[0];
      if (!dateMap[date]) dateMap[date] = { users: 0, quotes: 0 };
      dateMap[date].users++;
    });
    quotes.forEach(q => {
      if (!q.createdAt) return;
      const date = new Date(q.createdAt).toISOString().split("T")[0];
      if (!dateMap[date]) dateMap[date] = { users: 0, quotes: 0 };
      dateMap[date].quotes++;
    });
    const sortedDates = Object.keys(dateMap).sort();
    setChartLabels(sortedDates);
    setLoginCounts(sortedDates.map(date => dateMap[date]?.users || 0));
    setQuoteCounts(sortedDates.map(date => dateMap[date]?.quotes || 0));
  };

  // מחיקת משתמש
  const handleDeleteUser = async (id: string) => {
    if (confirm("למחוק את המשתמש?")) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/user/${id}`);
        setUsers((users) => users.filter((u) => u._id !== id));
      } catch (err) {
        alert("שגיאה במחיקת משתמש");
      }
    }
  };

  // מחיקת בקשת הצעה (quote)
  const handleDeleteQuote = async (id: string) => {
    if (confirm("למחוק את הבקשה?")) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/quote/${id}`);
        setQuotes((quotes) => quotes.filter((q) => q._id !== id));
      } catch (err) {
        alert("שגיאה במחיקת בקשה");
      }
    }
  };

  // מחיקת הצעה שהוגשה (submittedQuote)
  const handleDeleteSubmitted = async (id: string) => {
    if (confirm("למחוק את ההצעה שהוגשה?")) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/submitted-quote/${id}`);
        setSubmittedQuotes((arr) => arr.filter((q) => q._id !== id));
      } catch (err) {
        alert("שגיאה במחיקת הצעה שהוגשה");
      }
    }
  };

  // מחיקת עמיל מכס
  const handleDeleteBroker = async (id: string) => {
    if (confirm("למחוק את עמיל המכס?")) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/broker/${id}`);
        setBrokers((brokers) => brokers.filter((b) => b._id !== id));
      } catch (err) {
        alert("שגיאה במחיקת עמיל מכס");
      }
    }
  };


  if (!admin) {
    return (
      <div className="relative min-h-screen bg-indigo-200 flex items-center justify-center">
        <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-10" />
        <div className="relative z-20 bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">🔐 כניסה למערכת ניהול</h1>
          <input
            type="text"
            placeholder="הזן קוד בן 6 ספרות"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-center"
          />
          {loginError && <div className="text-red-600 text-sm mb-2">{loginError}</div>}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={classNames(
              "w-full py-2 rounded text-white font-semibold",
              isLoggingIn ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isLoggingIn ? "בודק קוד..." : "כניסה"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">פאנל ניהול</h1>

      {/* מדדים כלליים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-right">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">סה"כ משתמשים</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">סה"כ עמילי מכס</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalBrokers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">סה"כ הצעות מחיר</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.totalQuotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">הצעות מחיר שהוגשו</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalSubmittedQuotes}</p>
        </div>
      </div>

      {/* גרף כניסות ובקשות */}
<div className="bg-white p-6 rounded-lg shadow-md mb-8" dir="rtl">
  <h2 className="text-xl font-semibold mb-4 text-right">📊 פעילות יומית</h2>
  <Chart
    options={{
      chart: {
        id: "daily-activity",
        toolbar: {
          show: true,
          tools: {
            download: true, // מאפשר הורדה
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
      },
      xaxis: {
        categories: chartLabels,
        labels: {
          style: {
            fontSize: '12px',
            colors: '#374151',
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px',
            colors: '#374151',
          }
        }
      },
      stroke: {
        curve: "smooth",
      },
      markers: {
        size: 4,
      },
  tooltip: {
  shared: true,
  intersect: false,
  style: {
    fontSize: '12px',
    fontFamily: 'inherit',
  },
},

      legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontFamily: 'inherit',
      },
      colors: ['#4F46E5', '#EA580C'],
    }}
    series={[
      {
        name: "כניסות משתמשים",
        data: loginCounts,
      },
      {
        name: "בקשות הצעת מחיר",
        data: quoteCounts,
      },
    ]}
    type="line"
    height={350}
  />
</div>



      {/* 5 תשלומים אחרונים */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 text-right">5 תשלומים אחרונים</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">מזהה</th>
              <th className="p-2">סכום</th>
              <th className="p-2">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentPayments?.map((p: any) => (
              <tr key={p._id}>
                <td className="p-2">{p.paymentId}</td>
                <td className="p-2">₪{p.amountPaid}</td>
                <td className="p-2">{new Date(p.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* טבלת משתמשים */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-2 text-right">משתמשים רשומים</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">שם</th>
                <th className="p-2 border">אימייל</th>
                <th className="p-2 border">טלפון</th>
                <th className="p-2 border">עסק</th>
                <th className="p-2 border">קוד</th>
                <th className="p-2 border">תפקיד</th>
                <th className="p-2 border">תאריך הרשמה</th>
                <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {usersToShow.map((user) => (
                <tr key={user._id}>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.phone}</td>
                  <td className="p-2 border">{user.business}</td>
                  <td className="p-2 border">{user.code}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:underline"
                      title="מחק משתמש"
                    >🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* כפתורי פג'ינציה */}
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setUserPage((p) => Math.max(1, p - 1))}
            disabled={userPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {userPage} מתוך {userPageCount}</span>
          <button
            onClick={() => setUserPage((p) => Math.min(userPageCount, p + 1))}
            disabled={userPage === userPageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>

      {/* טבלת עמילי מכס */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-2 text-right">עמילי מכס</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">שם</th>
                <th className="p-2 border">אימייל</th>
                <th className="p-2 border">טלפון</th>
                <th className="p-2 border">חברה</th>
                <th className="p-2 border">קוד</th>
                <th className="p-2 border">תאריך הרשמה</th>
                <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {brokersToShow.map((broker) => (
                <tr key={broker._id}>
                  <td className="p-2 border">{broker.name}</td>
                  <td className="p-2 border">{broker.email}</td>
                  <td className="p-2 border">{broker.phone}</td>
                  <td className="p-2 border">{broker.company}</td>
                  <td className="p-2 border">{broker.code}</td>
                  <td className="p-2 border">{new Date(broker.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleDeleteBroker(broker._id)}
                      className="text-red-600 hover:underline"
                      title="מחק עמיל מכס"
                    >🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setBrokerPage((p) => Math.max(1, p - 1))}
            disabled={brokerPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {brokerPage} מתוך {brokerPageCount}</span>
          <button
            onClick={() => setBrokerPage((p) => Math.min(brokerPageCount, p + 1))}
            disabled={brokerPage === brokerPageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>

      {/* טבלת quotes */}
      <div className="bg-white p-4 rounded shadow mt-8">
        <h2 className="text-xl font-semibold mb-2 text-right">כל הבקשות להצעת מחיר (Quotes)</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">מספר הצעה</th>
                <th className="p-2 border">שם מוצר</th>
                <th className="p-2 border">לקוח</th>
                <th className="p-2 border">סטטוס</th>
                <th className="p-2 border">תאריך</th>
                <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {quotesToShow.map((q, i) => (
                <tr key={q._id || i}>
                  <td className="p-2 border">{q.quoteId}</td>
                  <td className="p-2 border">{q.productName}</td>
                  <td className="p-2 border">{q.clientName || q.clientId}</td>
                  <td className="p-2 border">{q.status}</td>
                  <td className="p-2 border">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleDeleteQuote(q._id)}
                      className="text-red-600 hover:underline"
                      title="מחק בקשה"
                    >🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setQuotePage((p) => Math.max(1, p - 1))}
            disabled={quotePage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {quotePage} מתוך {quotePageCount}</span>
          <button
            onClick={() => setQuotePage((p) => Math.min(quotePageCount, p + 1))}
            disabled={quotePage === quotePageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>

      {/* טבלת submitted-quotes */}
      <div className="bg-white p-4 rounded shadow mt-8">
        <h2 className="text-xl font-semibold mb-2 text-right">כל ההצעות שהוגשו (Submitted Quotes)</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">מספר הצעה</th>
                <th className="p-2 border">שם מוצר</th>
                <th className="p-2 border">עמיל מכס</th>
                <th className="p-2 border">סה"כ ב ש"ח</th>
                <th className="p-2 border">$ סה"כ ב</th>
                <th className="p-2 border">תאריך</th>
                <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {submittedToShow.map((q, i) => (
                <tr key={q._id || i}>
                  <td className="p-2 border">{q.quoteId}</td>
                  <td className="p-2 border">{q.productName}</td>
                  <td className="p-2 border">{q.brokerName || q.brokerCode}</td>
                  <td className="p-2 border">{q.totalShekel ?? ''}</td>
                  <td className="p-2 border">{q.totalDollar ?? ''}</td>
                  <td className="p-2 border">{q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : ""}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleDeleteSubmitted(q._id)}
                      className="text-red-600 hover:underline"
                      title="מחק הצעה שהוגשה"
                    >🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setSubmittedPage((p) => Math.max(1, p - 1))}
            disabled={submittedPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {submittedPage} מתוך {submittedPageCount}</span>
          <button
            onClick={() => setSubmittedPage((p) => Math.min(submittedPageCount, p + 1))}
            disabled={submittedPage === submittedPageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>
    </div>
  );
}