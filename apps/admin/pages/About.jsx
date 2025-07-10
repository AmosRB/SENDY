import React from 'react';
import { useRouter } from 'next/router';


export default function About() {

  const router = useRouter();

  return (
  <div className="relative">
    <div className="absolute top-4 right-4 z-50">
  <button
    onClick={() => router.push('/')}
    className="text-gray-800 text-3xl p-2 rounded-full hover:bg-gray-200"
    title="חזרה"
  >
    →
  </button>
</div>

    
      <div className="max-w-4xl mx-auto p-6 text-right text-gray-800 leading-relaxed text-xl">
      <h1 className="text-3xl font-bold mb-4 text-indigo-800">מייבא מחו"ל? אנחנו הכתובת למשלוחים חכמים</h1>
      <p className="mb-6">
        בין אם אתה מייבא סחורה מסין, בגדים מטורקיה או ציוד מאירופה – האפליקציה שלנו חוסכת לך זמן, טלפונים וניחושים מיותרים.
      </p>

      <h2 className="text-2xl font-semibold text-blue-700 mb-2">כל חברות השילוח – במקום אחד</h2>
      <p className="mb-6">
        אנחנו מחברים אותך ישירות לחברות שילוח מהימנות, מוכרות ומנוסות. תוך שניות תוכל לקבל הצעות מחיר, להשוות ביניהן ולבחור את ההצעה שמתאימה בדיוק לצרכים שלך.
      </p>

      <h2 className="text-2xl font-semibold text-blue-700 mb-2">איך זה עובד?</h2>
      <ol className="list-decimal list-inside mb-6 space-y-3">
        <li>
          <strong>נרשמים בפחות מדקה:</strong> בחר את סוג המשתמש (ייבואן, עסק, חנות או פרטי), מלא את הפרטים – ותקבל קוד כניסה אישי. שמור את הקוד – הוא ישמש אותך לכניסות הבאות.
        </li>
        <li>
          <strong>מפרסמים בקשת שילוח:</strong> מלא את פרטי המוצר, מקור היציאה והיעד, נפח, משקל, סוג משלוח (מומלץ FOB). ניתן לצרף קבצים מהספק או קישור למוצר – זה עוזר לחברות השילוח לבדוק תקנים ודרישות.
        </li>
        <li>
          <strong>שולחים ומקבלים הצעות:</strong> הבקשה נשלחת אוטומטית לחברות שילוח ועמילי מכס. תוכל לעיין במספר הצעות מפורטות – ולבחור את הטובה ביותר עבורך.
        </li>
      </ol>

      <h2 className="text-2xl font-semibold text-blue-700 mb-2">למה כדאי?</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>✅ אין התחייבות | אין עלויות נסתרות</li>
        <li>✅ שירות רק מחברות שילוח מאומתות</li>
        <li>✅ שירות לקוחות זמין בעברית</li>
        <li>✅ מעקב ובקרה מלאים על כל בקשה והצעה</li>
      </ul>

      <p className="text-xl font-bold text-green-800">ייבוא חכם מתחיל כאן.</p>
      <p className="mt-2">הצטרף לאלפי לקוחות שכבר משתמשים באפליקציה שלנו לניהול יעיל, בטוח ומשתלם של תהליכי שילוח מחו"ל.</p>
    </div>
  </div>
  );
}
