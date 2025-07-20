// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        {/*
          ** קוד Google Tag Manager - חלק ראשון (סקריפט) **
          יש להחליף את 'GTM-MMX8NXK9' בקוד המזהה הייחודי שלך מ-Google Tag Manager,
          אם הוא שונה.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MMX8NXK9');
            `,
          }}
        />
        {/* סוף קוד Google Tag Manager - חלק ראשון */}

        <link
          href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        {/*
          ** קוד Google Tag Manager - חלק שני (noscript) **
          יש להחליף את 'GTM-MMX8NXK9' בקוד המזהה הייחודי שלך,
          אם הוא שונה.
        */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MMX8NXK9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* סוף קוד Google Tag Manager - חלק שני */}

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}