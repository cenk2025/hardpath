import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index.js'

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'fi', label: 'FI' },
    { code: 'tr', label: 'TR' },
]

export default function LanguageSelector({ dark = false }) {
    const { i18n: i18nHook } = useTranslation()

    function changeLanguage(code) {
        i18nHook.changeLanguage(code)
        localStorage.setItem('heartpath_lang', code)
    }

    return (
        <div className="lang-selector" style={dark ? { background: 'rgba(255,255,255,0.06)' } : {}}>
            {LANGUAGES.map(({ code, label }) => (
                <button
                    key={code}
                    className={`lang-btn${i18nHook.language === code ? ' active' : ''}`}
                    onClick={() => changeLanguage(code)}
                    style={dark && i18nHook.language !== code ? { color: 'rgba(255,255,255,0.4)' } : {}}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}
