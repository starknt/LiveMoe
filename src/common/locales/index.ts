import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import zh_CN from './languages/zh_CN.json';
import en_US from './languages/en_US.json';

i18next.use(initReactI18next).init({
  fallbackLng: 'zh_CN',
  lng: 'zh_CN',
  resources: {
    zh_CN: {
      translation: zh_CN,
    },
    en_US: {
      translation: en_US,
    },
  },
});
