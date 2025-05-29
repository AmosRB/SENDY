// app/dashboard/page.tsx (Next.js App Router)
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [summaryRes, usersRes] = await Promise.all([
          axios.get("/api/admin/summary"),
          axios.get("/api/users")
        ]);
        setStats(summaryRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Failed to load admin stats or users", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div>טוען נתונים...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">לוח שליטה - אדמין</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-100 rounded">סה"כ משתמשים: {stats.totalUsers}</div>
        <div className="p-4 bg-gray-100 rounded">סה"כ הצעות מחיר: {stats.totalQuotes}</div>
        <div className="p-4 bg-gray-100 rounded">סה"כ תשלומים: ₪{stats.totalPaid}</div>
        <div className="p-4 bg-gray-100 rounded">סה"כ חשבוניות: ₪{stats.totalInvoiced}</div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">פילוח משתמשים לפי תפקיד</h2>
        <ul className="list-disc list-inside">
          {stats.usersByRole?.map((role: any) => (
            <li key={role._id}>{role._id}: {role.count}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5 תשלומים אחרונים</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">מזהה</th>
              <th className="p-2">סכום</th>
              <th className="p-2">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentPayments?.map((p: any) => (
              <tr key={p._id} className="border-b">
                <td className="p-2">{p.paymentId}</td>
                <td className="p-2">₪{p.amountPaid}</td>
                <td className="p-2">{new Date(p.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">משתמשים רשומים</h2>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">שם</th>
              <th className="p-2 border">אימייל</th>
              <th className="p-2 border">טלפון</th>
              <th className="p-2 border">תפקיד</th>
              <th className="p-2 border">תאריך הרשמה</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.phone}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
