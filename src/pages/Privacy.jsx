import { Link } from 'react-router-dom'
import { Heart, Shield, ArrowLeft } from 'lucide-react'

export default function Privacy() {
    return (
        <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
            {/* Nav */}
            <nav style={{
                background: 'var(--navy-900)', padding: '16px 48px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0891b2,#22d3ee)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={14} fill="white" color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>HeartPath</span>
                </Link>
                <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
                    <ArrowLeft size={14} /> Back to Home
                </Link>
            </nav>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Shield size={28} color="var(--teal-500)" />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>Privacy Policy</h1>
                </div>
                <p style={{ color: 'var(--slate-500)', marginBottom: 48 }}>
                    Last updated: 21 February 2026 &nbsp;|&nbsp; Effective: 21 February 2026
                </p>

                {[
                    {
                        title: '1. About HeartPath and VOON IQ',
                        content: `HeartPath ("the Platform") is a digital cardiac rehabilitation and remote patient monitoring service developed and operated by VOON IQ (hereinafter "we", "our", or "the Controller").

Contact: info@voon.fi
Registered in Finland. EU-based data processing.

HeartPath is a wellness support tool. It does not constitute a medical device or provide clinical diagnoses.`
                    },
                    {
                        title: '2. Legal Basis & Applicable Law',
                        content: `We process personal and health data in compliance with:

• EU General Data Protection Regulation (GDPR) 2016/679
• Finnish Data Protection Act (1050/2018)
• Finnish Act on the Electronic Processing of Client Data in Healthcare (784/2021)
• Turkish Personal Data Protection Law (KVKK) No. 6698
• WHO Global Digital Health Strategy 2020–2025
• European Society of Cardiology (ESC) digital health recommendations

Legal bases for processing (Art. 6 & 9 GDPR):
• Article 6(1)(a): Explicit consent
• Article 6(1)(b): Performance of contract (platform services)
• Article 9(2)(a): Explicit consent for health data`
                    },
                    {
                        title: '3. Data We Collect',
                        content: `We collect only what is necessary for your rehabilitation (data minimisation):

Account data: Name, email address, role (patient/clinician), language preference.
Health data (with explicit consent): Resting heart rate, HRV, activity data, sleep hours, symptom reports, daily check-in data, fatigue level scores.
Wearable data: Aggregated summaries from Apple HealthKit or Google Health Connect — only with your explicit per-source consent.
Usage data: Page interactions, session duration. Anonymised.
Communication data: Secure messages and attachments between patient and clinician.

We do NOT collect: Payment data, precise GPS location, social media content, or biometric data beyond what is listed above.`
                    },
                    {
                        title: '4. How We Use Your Data',
                        content: `• Providing personalised cardiac rehabilitation programs
• Enabling secure communication between patients and clinicians
• AI-assisted readiness and risk scoring (non-diagnostic, wellness only)
• Platform improvement using anonymised analytics
• Compliance with legal health data obligations
• Sending clinician alerts for patient safety

We do NOT sell, rent, or commercially share your personal or health data with third parties.`
                    },
                    {
                        title: '5. Data Storage & Security',
                        content: `• All data is stored in EU-based servers (GDPR Art. 44–49 compliant)
• Health data is encrypted at rest (AES-256) and in transit (TLS 1.3)
• Authentication uses Supabase Auth with JWT session management
• Row Level Security (RLS) ensures each user can only access their own data
• Regular security audits are performed
• No health data is stored in browser localStorage or cookies`
                    },
                    {
                        title: '6. Cookies',
                        content: `We use the following cookies:

Strictly Necessary: Session authentication, security tokens. No consent required.
Functional: Language preference, UI settings. Stored locally.
Analytics: Anonymous usage statistics. Only with your consent.

You can manage cookie preferences at any time via the cookie banner or by clearing your browser storage.`
                    },
                    {
                        title: '7. Data Sharing',
                        content: `Your data is shared only with:
• Your assigned clinician/rehabilitation specialist (within the platform)
• Supabase Inc. (infrastructure processor under EU Standard Contractual Clauses)
• No other third parties

We do not share data with insurance companies, pharmaceutical firms, advertisers, or AI training services.`
                    },
                    {
                        title: '8. Your Rights',
                        content: `Under GDPR and Finnish law, you have the right to:
• Access your personal data (Art. 15 GDPR)
• Correct inaccurate data (Art. 16)
• Delete your data ("right to be forgotten") (Art. 17)
• Restrict processing (Art. 18)
• Data portability (Art. 20)
• Object to processing (Art. 21)
• Withdraw consent at any time (Art. 7)

Turkish users: You may also exercise rights under KVKK Art. 11 by contacting info@voon.fi.

To exercise any right: email info@voon.fi with subject "Data Rights Request". We respond within 30 days.`
                    },
                    {
                        title: '9. Health Data — Special Category',
                        content: `Heart rate, symptoms, rehabilitation records, and other health data constitute special category data under GDPR Art. 9. We process this data only:
• With your explicit, informed, and freely given consent
• For the purpose of providing your cardiac rehabilitation service
• With strict access controls (clinician-patient relationship only)

You may revoke health data consent at any time in Settings → Privacy. This does not affect lawfulness of prior processing.`
                    },
                    {
                        title: '10. Data Retention',
                        content: `• Account data: Retained until account deletion + 30 days
• Health metrics: Retained for 2 years or until deletion request
• Symptom reports: Retained for 1 year for clinical safety review
• Chat messages: Retained for 1 year
• Anonymised analytics: Up to 3 years
• Audit logs: 5 years (legal obligation)

Upon account deletion, all personal data is permanently erased within 30 days.`
                    },
                    {
                        title: '11. Children',
                        content: `HeartPath is not intended for users under 18 years of age. We do not knowingly collect data from minors. If you believe a minor has provided data, contact info@voon.fi immediately.`
                    },
                    {
                        title: '12. Changes to This Policy',
                        content: `We may update this Privacy Policy to reflect legal changes or new features. Users will be notified via email at least 14 days before material changes take effect. Continued use constitutes acceptance.`
                    },
                    {
                        title: '13. Supervisory Authority & Contact',
                        content: `Finland: You have the right to lodge a complaint with the Finnish Data Protection Ombudsman (tietosuoja.fi).
EU: Your national data protection authority.
Turkey: Kişisel Verileri Koruma Kurumu (kvkk.gov.tr).

Data Controller: VOON IQ
Email: info@voon.fi
Website: https://voon.fi`
                    },
                ].map(({ title, content }) => (
                    <section key={title} style={{ marginBottom: 36 }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 10, paddingBottom: 8, borderBottom: '1.5px solid var(--slate-200)' }}>
                            {title}
                        </h2>
                        <p style={{ color: 'var(--slate-600)', lineHeight: 1.85, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                            {content}
                        </p>
                    </section>
                ))}

                <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(8,145,178,0.06)', borderRadius: 10, border: '1px solid rgba(8,145,178,0.15)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.7 }}>
                        <strong>Contact:</strong> info@voon.fi &nbsp;|&nbsp;
                        <strong>Developer:</strong> VOON IQ &nbsp;|&nbsp;
                        <Link to="/terms" style={{ color: 'var(--teal-500)', fontWeight: 600 }}>Terms of Service</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
