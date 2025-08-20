// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dayjs from 'dayjs';

// Keep this list in sync with your UI language selector
export const SUPPORTED_LANGUAGES = ['en', 'hi'];

// Minimal starter copy you can expand later
const resources = {
  en: {
    common: {
      brand: 'MediVerse',
      nav: {
        home: 'Home',
        mediAI: 'MediAI',
        reportScanner: 'Report Scanner',
        wearables: 'Wearables',
        dietPlanner: 'Diet Planner',
        dashboard: 'Dashboard',
        login: 'Login',
        signup: 'Sign up',
        profile: 'Profile',
        logout: 'Logout',
      },
      actions: {
        getStarted: 'Get started',
        continue: 'Continue',
        cancel: 'Cancel',
        save: 'Save',
        connect: 'Connect',
        download: 'Download',
      },
      states: {
        loading: 'Loading…',
        empty: 'Nothing here yet',
      },
      home: {
        heroTitle: 'Your AI-powered health companion',
        heroSubtitle:
          'Chat about symptoms, scan reports, sync wearables, and get a personalized diet plan — all in one place.',
        faq: 'Frequently Asked Questions',
        about: 'About',
        features: 'Features',
      },
    },
  },
  hi: {
    common: {
      brand: 'मेडीवर्स',
      nav: {
        home: 'होम',
        mediAI: 'मेडीएआई',
        reportScanner: 'रिपोर्ट स्कैनर',
        wearables: 'वियरेबल्स',
        dietPlanner: 'डाइट प्लानर',
        dashboard: 'डैशबोर्ड',
        login: 'लॉगिन',
        signup: 'साइन अप',
        profile: 'प्रोफाइल',
        logout: 'लॉगआउट',
      },
      actions: {
        getStarted: 'शुरू करें',
        continue: 'आगे बढ़ें',
        cancel: 'रद्द करें',
        save: 'सेव करें',
        connect: 'कनेक्ट करें',
        download: 'डाउनलोड',
      },
      states: {
        loading: 'लोड हो रहा है…',
        empty: 'यहाँ अभी कुछ नहीं है',
      },
      home: {
        heroTitle: 'आपका एआई-संचालित हेल्थ साथी',
        heroSubtitle:
          'लक्षणों पर चैट करें, रिपोर्ट स्कैन करें, वियरेबल्स सिंक करें, और व्यक्तिगत डाइट प्लान पाएँ — सब कुछ एक ही जगह।',
        faq: 'अक्सर पूछे जाने वाले प्रश्न',
        about: 'परिचय',
        features: 'विशेषताएँ',
      },
    },
  },
};

// Pre-declare safe loaders so Vite can code-split locales
const dayjsLocaleLoaders = {
  en: () => import('dayjs/locale/en'),
  hi: () => import('dayjs/locale/hi'),
};

async function applyDayjsLocale(lng) {
  const code = SUPPORTED_LANGUAGES.includes(lng) ? lng : 'en';
  try {
    await (dayjsLocaleLoaders[code] || dayjsLocaleLoaders.en)();
    dayjs.locale(code);
  } catch {
    dayjs.locale('en');
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default; can be changed via useUserPref().setLanguage(...)
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React escapes by default
    },
    returnEmptyString: false,
    // react-i18next options
    react: {
      useSuspense: true,
    },
  })
  .then(() => applyDayjsLocale(i18n.language));

// Keep Day.js locale in sync with language changes
i18n.on('languageChanged', (lng) => {
  applyDayjsLocale(lng);
});

export default i18n;
