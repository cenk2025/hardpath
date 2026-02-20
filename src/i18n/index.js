import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fi from './locales/fi.json'
import tr from './locales/tr.json'

const savedLang = localStorage.getItem('heartpath_lang') || 'en'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fi: { translation: fi },
            tr: { translation: tr },
        },
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
