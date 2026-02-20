import { Link } from 'react-router-dom'
import { Heart, FileText, ArrowLeft } from 'lucide-react'

export default function Terms() {
    return (
        <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
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
                    <FileText size={28} color="var(--teal-500)" />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>Terms of Service</h1>
                </div>
                <p style={{ color: 'var(--slate-500)', marginBottom: 48 }}>
                    Last updated: 21 February 2026 &nbsp;|&nbsp; Effective: 21 February 2026
                </p>

                {[
                    {
                        title: '1. Acceptance of Terms',
                        content: `By registering for or using HeartPath, you agree to these Terms of Service. HeartPath is operated by VOON IQ (contact: info@voon.fi).

If you do not agree to these Terms, please do not use this platform.

These Terms are governed by Finnish law and comply with EU consumer protection regulations.`
                    },
                    {
                        title: '2. Service Description',
                        content: `HeartPath is a digital wellness and cardiac rehabilitation support platform that:
• Provides doctor-assigned exercise and rehabilitation guidance
• Enables secure communication between patients and clinicians
• Tracks user-reported health metrics
• Offers cardiac health education content

HeartPath is a WELLNESS platform. It is NOT a medical device, does not provide clinical diagnoses, and does not replace the advice of a qualified healthcare professional.`
                    },
                    {
                        title: '3. Medical Disclaimer',
                        content: `IMPORTANT: HeartPath does not provide medical diagnoses, prescriptions, or clinical judgements.

• All content is for informational and wellness support purposes only
• Readiness scores and AI insights are non-diagnostic wellness indicators
• Always follow your doctor's or rehabilitation specialist's instructions
• In an emergency, call your local emergency number immediately (Finland: 112, Turkey: 112, International: contact local services)
• Stop using the platform and seek immediate medical attention if you experience chest pain, severe dizziness, difficulty breathing, or other acute symptoms

VOON IQ accepts no liability for clinical decisions made based on platform content.`
                    },
                    {
                        title: '4. User Accounts & Eligibility',
                        content: `• You must be 18 years of age or older to use HeartPath
• You must provide accurate registration information
• You are responsible for maintaining the confidentiality of your login credentials
• You must notify info@voon.fi immediately of any unauthorised account access
• One account per person. Sharing accounts is not permitted.
• Clinician accounts are issued only to verified healthcare professionals`
                    },
                    {
                        title: '5. Clinician Responsibilities',
                        content: `Clinicians using HeartPath acknowledge that:
• They hold valid professional qualifications in their jurisdiction
• HeartPath is a communication and monitoring tool — clinical judgement remains entirely theirs
• They are responsible for patient safety decisions
• They will not use the platform to provide diagnoses outside their professional scope
• Patient data will be accessed only for legitimate care purposes`
                    },
                    {
                        title: '6. Health Data & Consent',
                        content: `By using HeartPath, you grant informed consent for processing of your health data as described in our Privacy Policy. You may withdraw this consent at any time via Settings → Privacy or by contacting info@voon.fi.

Data is processed under GDPR Art. 9(2)(a) and Finnish healthcare data protection law. See full details in our Privacy Policy.`
                    },
                    {
                        title: '7. Acceptable Use',
                        content: `You agree NOT to:
• Provide false health data that could mislead your care team
• Share your account credentials with others
• Attempt to access other users' data
• Use the platform to harass, threaten, or harm other users
• Attempt to reverse-engineer or exploit the platform
• Upload harmful, illegal, or offensive content
• Use the platform for commercial purposes without written consent from VOON IQ

Violations may result in immediate account suspension.`
                    },
                    {
                        title: '8. Intellectual Property',
                        content: `All platform content, design, code, health education materials, and branding are the intellectual property of VOON IQ. You may not copy, reproduce, or distribute platform content without prior written permission.

HeartPath is a product of VOON IQ. All rights reserved.`
                    },
                    {
                        title: '9. Availability & Limitations',
                        content: `• We strive for 99.5% uptime but do not guarantee uninterrupted service
• Scheduled maintenance will be communicated in advance where possible
• Platform features may change with reasonable notice
• VOON IQ is not liable for service interruptions caused by third-party infrastructure (e.g. Supabase, hosting providers)

HeartPath is NOT intended to be your sole source of cardiac care. Always maintain regular in-person contact with your healthcare provider.`
                    },
                    {
                        title: '10. Limitation of Liability',
                        content: `To the fullest extent permitted by Finnish law and EU consumer protection regulation:

• VOON IQ is not liable for clinical outcomes or health decisions
• VOON IQ is not liable for indirect, incidental, or consequential damages
• Our maximum aggregate liability is limited to any fees paid by you in the 12 months preceding the claim

Nothing in these Terms limits liability for death or personal injury caused by our gross negligence.`
                    },
                    {
                        title: '11. Termination',
                        content: `You may delete your account at any time. Data deletion follows the schedule in our Privacy Policy.

We may terminate or suspend your account for:
• Violation of these Terms
• Fraudulent or abusive behaviour
• Legal or regulatory requirement

Where possible, we will notify you in advance and allow data export.`
                    },
                    {
                        title: '12. Changes to Terms',
                        content: `We may update these Terms from time to time. Material changes will be communicated by email at least 14 days in advance. Continued use of the platform after the effective date constitutes acceptance.`
                    },
                    {
                        title: '13. Governing Law & Disputes',
                        content: `These Terms are governed by Finnish law. For EU consumers, mandatory consumer protection laws of your country of residence also apply.

Disputes: We encourage resolution via email at info@voon.fi. Unresolved disputes may be brought before the Consumer Disputes Board (Finland: kuluttajariitalautakunta.fi) or the courts of Helsinki, Finland.

Turkish users: Disputes may also be referred to the Consumer Arbitration Committee under Turkish Consumer Protection Law No. 6502.`
                    },
                    {
                        title: '14. Contact',
                        content: `VOON IQ
Email: info@voon.fi
Website: https://voon.fi

For support, data requests, or questions about these Terms, email us at info@voon.fi.`
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
                        <Link to="/privacy" style={{ color: 'var(--teal-500)', fontWeight: 600 }}>Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
