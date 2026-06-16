"use client";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function Blobs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-180px", left: "-160px", width: "520px", height: "520px", borderRadius: "50%", background: "var(--ec-blob-a)", filter: "blur(90px)" }} />
      <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "460px", height: "460px", borderRadius: "50%", background: "var(--ec-blob-b)", filter: "blur(90px)" }} />
      <div style={{ position: "absolute", bottom: "-200px", left: "30%", width: "540px", height: "540px", borderRadius: "50%", background: "var(--ec-blob-c)", filter: "blur(100px)" }} />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--ec-bg)", position: "relative" }}>
      <Blobs />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
      </div>
      <main style={{ flex: 1, maxWidth: "800px", margin: "0 auto", width: "100%", padding: "24px 24px 80px", position: "relative", zIndex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "20px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", color: "var(--ec-accent)", fontVariantNumeric: "tabular-nums" }}>{number}</span>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ec-ink)", letterSpacing: "-0.015em" }}>{title}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "18px 20px", boxShadow: "var(--ec-shadow)" }}>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ec-accent)", marginTop: "8px", flexShrink: 0 }} />
          <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "10px" }}>{label}</p>
      {children}
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
      {children}
    </p>
  );
}

function Notice({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--ec-orange-bg)", border: "1px solid var(--ec-orange-border)", borderRadius: "14px", padding: "16px 20px", marginTop: "12px" }}>
      {label && <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-orange)", marginBottom: "6px" }}>{label}</p>}
      <p style={{ fontSize: "14px", color: "var(--ec-ink)", lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

const CONTACT_EMAIL = "juan@unpackmath.com";
const PRIVACY_URL = "unpackmath.com/privacy-policy";

export default function TermsOfUsePage() {
  return (
    <Shell>
      {/* Hero */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 0 48px", borderBottom: "1px solid var(--ec-line)", marginBottom: "48px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "12px" }}>
          Legal · Terms
        </p>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: "20px" }}>
          Terms of Use.
        </h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["Effective: May 25, 2025", "Last Updated: June 2026", "A product of JDOM LLC"].map((tag) => (
            <span key={tag} style={{ fontSize: "12px", color: "var(--ec-ink-muted)", background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "999px", padding: "4px 14px", boxShadow: "var(--ec-shadow)" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: "680px", margin: "0 auto 48px" }}>
        <Card>
          <Body>
            Please read these Terms of Use ("Terms") carefully before accessing or using unpackmath.com (the "Platform"). These Terms constitute a legally binding agreement between you and JDOM LLC ("UnpackMath," "we," "our," or "us"). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, do not use the Platform.
          </Body>
          <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, margin: 0 }}>
            These Terms apply to all users of the Platform, including individual students, parents or guardians, and institutional users such as schools, districts, and administrators.
          </p>
        </Card>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>

        {/* 01 */}
        <div>
          <SectionHeader number="01" title="Acceptance of Terms" />
          <Body>By creating an account, accessing any content, or using any feature of the Platform, you confirm that:</Body>
          <Card>
            <BulletList items={[
              "You are at least 13 years of age, or that you are a parent or guardian providing consent for a minor.",
              "You have read, understood, and agree to be bound by these Terms and our Privacy Policy.",
              "If you are accessing the Platform on behalf of a school or institution, you have the authority to bind that organization to these Terms.",
            ]} />
          </Card>
          <Notice>UnpackMath reserves the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.</Notice>
        </div>

        {/* 02 */}
        <div>
          <SectionHeader number="02" title="Description of Service" />
          <Body>UnpackMath is an adaptive math learning platform designed to help students prepare for college placement assessments, including the TSIA2. The Platform currently provides:</Body>
          <Card>
            <BulletList items={[
              "A computer-adaptive practice test (CAT) engine that adjusts question difficulty based on your responses in real time.",
              "Score estimation aligned to the TSIA2 910-990 scale, with a passing threshold of 950.",
              "Per-question explanations and distractor analysis to surface exactly where your thinking broke down.",
              "Practice items across four math strands: Quantitative Reasoning, Algebraic Reasoning, Geometric Reasoning, and Probabilistic Reasoning.",
            ]} />
          </Card>
          <Notice label="Coming Soon">
            Additional features including student accounts with saved progress, a teacher dashboard for misconception tracking, and a parent view are in active development and will be added prior to full launch. These Terms will be updated to reflect those features as they become available.
          </Notice>
          <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.65, marginTop: "12px" }}>
            We reserve the right to modify, suspend, or discontinue any feature of the Platform at any time with reasonable notice.
          </p>
        </div>

        {/* 03 */}
        <div>
          <SectionHeader number="03" title="User Accounts and Registration" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                label: "Account Creation",
                text: "To access most features of the Platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to update your information as needed to keep it accurate. Account creation via Google OAuth is available and subject to Google's own terms of service.",
              },
              {
                label: "Account Security",
                text: `You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must notify us immediately at ${CONTACT_EMAIL} if you suspect unauthorized access. UnpackMath is not liable for any loss or damage arising from your failure to protect your account credentials.`,
              },
              {
                label: "One Account Per User",
                text: "Each user may maintain only one active account. Creating duplicate or fraudulent accounts is prohibited and may result in termination of all associated accounts.",
              },
              {
                label: "Minors",
                text: "The Platform is not directed to children under the age of 13. Users between the ages of 13 and 17 must have parental or guardian consent to use the Platform. Schools enrolling students under 13 must ensure appropriate consent is obtained in accordance with COPPA and applicable Texas law.",
              },
            ].map(({ label, text }) => (
              <Card key={label}>
                <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 04 */}
        <div>
          <SectionHeader number="04" title="Institutional Accounts" />
          <Body>Schools, school districts, community colleges, testing centers, and other educational organizations ("Institutions") may access the Platform under a separate institutional agreement or license. In such cases:</Body>
          <Card>
            <BulletList items={[
              "The Institution is responsible for ensuring that all student users are enrolled with appropriate authorization.",
              "The Institution agrees to use the Platform solely for legitimate educational purposes.",
              "The Institution is responsible for compliance with FERPA, COPPA, and applicable Texas student privacy laws on behalf of its students.",
              "UnpackMath will act as a service provider under FERPA and will not use student data for any purpose beyond delivering the contracted educational services.",
              "Upon termination of an institutional agreement, student data will be returned or deleted in accordance with the terms of that agreement.",
            ]} />
          </Card>
        </div>

        {/* 05 */}
        <div>
          <SectionHeader number="05" title="Subscriptions, Payments, and Refunds" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Subscription Plans", text: "UnpackMath offers subscription-based access for individual users and licensing arrangements for institutions. Specific pricing, plan details, and billing cycles are described at the point of purchase and may be updated periodically." },
              { label: "Billing", text: "By providing payment information, you authorize UnpackMath to charge the applicable fees to your payment method on a recurring basis. All fees are charged in U.S. dollars. Payments are processed securely through a third-party payment processor; UnpackMath does not store your credit card information." },
              { label: "Cancellations", text: "Individual subscribers may cancel their subscription at any time through their account settings. Cancellation takes effect at the end of the current billing period. You will retain access to the Platform through the end of your paid period." },
              { label: "Refund Policy", text: `UnpackMath offers a 7-day refund window for new individual subscribers who have not substantially used the Platform (defined as completing fewer than 5 practice sessions). Refund requests must be submitted to ${CONTACT_EMAIL} within 7 days of the initial charge. Institutional fees are governed by the terms of the institutional agreement and are generally non-refundable except as expressly stated therein.` },
              { label: "Price Changes", text: "UnpackMath reserves the right to change subscription prices at any time. We will provide at least 30 days notice before any price change takes effect for existing subscribers." },
              { label: "Taxes", text: "You are responsible for any applicable taxes, levies, or duties imposed by taxing authorities in connection with your use of the Platform." },
            ].map(({ label, text }) => (
              <Card key={label}>
                <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 06 */}
        <div>
          <SectionHeader number="06" title="Acceptable Use" />
          <Body>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:</Body>
          <Card>
            <BulletList items={[
              "Use the Platform for any purpose other than personal learning or legitimate institutional educational use.",
              "Share, sell, sublicense, or transfer your account credentials or access to any third party.",
              "Attempt to reverse engineer, decompile, or extract the source code of any component of the Platform.",
              "Use automated tools, bots, scrapers, or scripts to access or extract content from the Platform.",
              "Use Platform content or data to train, test, develop, or improve any artificial intelligence or machine learning model without our express written consent.",
              "Upload or transmit any content that is unlawful, harmful, defamatory, obscene, or otherwise objectionable.",
              "Interfere with or disrupt the integrity, security, or performance of the Platform or its infrastructure.",
              "Impersonate any person or entity or misrepresent your affiliation with any organization.",
              "Attempt to gain unauthorized access to any account, system, or network connected to the Platform.",
              "Use the Platform in any way that could harm students, minors, or other vulnerable users.",
            ]} />
          </Card>
          <Notice>Violations of these terms may result in immediate suspension or termination of your account without refund.</Notice>
        </div>

        {/* 07 */}
        <div>
          <SectionHeader number="07" title="Intellectual Property" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Our Content", text: "All content on the Platform, including practice questions, curriculum materials, instructional content, graphics, software, algorithms, scoring methodologies, and the adaptive engine, is the exclusive intellectual property of JDOM LLC and is protected by United States and Texas copyright, trademark, and trade secret laws. No content may be copied, reproduced, modified, distributed, or used to create derivative works without our express written permission." },
              { label: "Your Content", text: "You retain ownership of any content you submit to the Platform, such as account information or feedback. By submitting content, you grant UnpackMath a non-exclusive, royalty-free, worldwide license to use, display, and process that content solely for the purpose of operating and improving the Platform." },
              { label: "Feedback", text: "If you submit feedback, suggestions, or ideas about the Platform, you grant UnpackMath the right to use that feedback without compensation or attribution. We are not obligated to act on any feedback received." },
              { label: "Trademarks", text: '"UnpackMath," the UnpackMath logo, and related marks are trademarks of JDOM LLC. You may not use these marks without our prior written consent. Nothing in these Terms grants you any right to use our trademarks, trade names, or branding.' },
            ].map(({ label, text }) => (
              <Card key={label}>
                <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 08 */}
        <div>
          <SectionHeader number="08" title="Educational Disclaimer" />
          <Card>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, marginBottom: "12px" }}>
              UnpackMath is designed as a preparation and practice tool. While we strive to provide high-quality, accurate, and test-aligned content, we make no guarantee that use of the Platform will result in a specific score on any placement assessment or that any student will pass any particular test.
            </p>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>
              Score estimates generated by the Platform are approximations based on performance data and are not official scores. They are intended for informational and motivational purposes only. Actual test results may vary based on many factors outside of our control.
            </p>
          </Card>
        </div>

        {/* 09 */}
        <div>
          <SectionHeader number="09" title="Disclaimer of Warranties" />
          <Card>
            <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.75, fontFamily: "monospace" }}>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, UNPACKMATH DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT; WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE; AND WARRANTIES REGARDING THE ACCURACY OR RELIABILITY OF ANY CONTENT ON THE PLATFORM. YOUR USE OF THE PLATFORM IS ENTIRELY AT YOUR OWN RISK.
            </p>
          </Card>
        </div>

        {/* 10 */}
        <div>
          <SectionHeader number="10" title="Limitation of Liability" />
          <Card>
            <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.75, fontFamily: "monospace", marginBottom: "12px" }}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, JDOM LLC AND ITS OFFICERS, EMPLOYEES, AGENTS, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE PLATFORM.
            </p>
            <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.75, fontFamily: "monospace" }}>
              IN NO EVENT SHALL UNPACKMATH'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID TO UNPACKMATH IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
            </p>
          </Card>
        </div>

        {/* 11 */}
        <div>
          <SectionHeader number="11" title="Indemnification" />
          <Body>You agree to indemnify, defend, and hold harmless JDOM LLC and its officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or relating to:</Body>
          <Card>
            <BulletList items={[
              "Your use of the Platform in violation of these Terms.",
              "Your violation of any applicable law or regulation.",
              "Your infringement of any intellectual property or other rights of any third party.",
              "Any content you submit to the Platform.",
            ]} />
          </Card>
        </div>

        {/* 12 */}
        <div>
          <SectionHeader number="12" title="Third-Party Services and Links" />
          <Card>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>
              The Platform may integrate with or contain links to third-party websites, services, or tools, including payment processors, analytics providers, authentication services (such as Google OAuth), and hosting services. UnpackMath is not responsible for the content, privacy practices, or terms of any third-party service. Your use of third-party services is governed by their own terms and policies. We encourage you to review those policies before use.
            </p>
          </Card>
        </div>

        {/* 13 */}
        <div>
          <SectionHeader number="13" title="Accessibility" />
          <Card>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>
              UnpackMath is committed to making the Platform accessible to users with disabilities. We work to meet applicable accessibility standards, including Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, in alignment with ADA Title II requirements applicable to digital educational tools. If you encounter an accessibility barrier, please contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--ec-accent)", textDecoration: "none" }}>{CONTACT_EMAIL}</a> and we will work to address it promptly.
            </p>
          </Card>
        </div>

        {/* 14 */}
        <div>
          <SectionHeader number="14" title="Termination" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "By You", text: `You may terminate your account at any time by contacting us at ${CONTACT_EMAIL} or through your account settings. Termination does not entitle you to a refund except as described in Section 5.` },
              { label: "By UnpackMath", text: "We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or if we determine that continued access poses a risk to the Platform, other users, or our business. In cases of serious violations, termination may be immediate and without refund." },
              { label: "Effect of Termination", text: "Upon termination, your right to access the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination, including intellectual property rights, disclaimers, limitations of liability, and indemnification, will continue to apply." },
            ].map(({ label, text }) => (
              <Card key={label}>
                <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 15 */}
        <div>
          <SectionHeader number="15" title="Governing Law and Dispute Resolution" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Governing Law", text: "These Terms are governed by the laws of the State of Texas, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Texas." },
              { label: "Informal Resolution", text: `Before initiating any legal action, you agree to contact UnpackMath at ${CONTACT_EMAIL} and attempt to resolve the dispute informally. We will make a good faith effort to resolve any issue within 30 days of receiving written notice.` },
              { label: "Waiver of Class Action", text: "You agree that any dispute resolution proceedings will be conducted on an individual basis and not as a class action, collective action, or representative proceeding. You waive any right to participate in a class action lawsuit or class-wide arbitration against UnpackMath." },
            ].map(({ label, text }) => (
              <Card key={label}>
                <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 16 */}
        <div>
          <SectionHeader number="16" title="Privacy" />
          <Card>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>
              Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the data practices described in the Privacy Policy. Our Privacy Policy is available at{" "}
              <a href={`https://${PRIVACY_URL}`} style={{ color: "var(--ec-accent)", textDecoration: "none" }}>{PRIVACY_URL}</a>.
            </p>
          </Card>
        </div>

        {/* 17-20 condensed */}
        <div>
          <SectionHeader number="17–20" title="Modifications, Force Majeure, Severability, and Entire Agreement" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Modifications to the Platform", text: "UnpackMath reserves the right to modify, update, suspend, or discontinue the Platform or any part of it at any time. We will make reasonable efforts to provide advance notice of significant changes. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Platform." },
              { label: "Force Majeure", text: "UnpackMath shall not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including acts of God, natural disasters, pandemics, internet outages, government actions, power failures, or other events outside our control." },
              { label: "Severability", text: "If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect." },
              { label: "Entire Agreement", text: "These Terms, together with our Privacy Policy and any institutional agreements, constitute the entire agreement between you and UnpackMath regarding your use of the Platform and supersede all prior agreements, representations, or understandings." },
            ].map(({ label, text }) => (
              <Card key={label}>
                <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 21 */}
        <div>
          <SectionHeader number="21" title="Contact Us" />
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                ["Platform", "UnpackMath / JDOM LLC"],
                ["Email", CONTACT_EMAIL],
                ["Website", "www.unpackmath.com"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px solid var(--ec-line)", paddingBottom: "10px" }}>
                  <span style={{ color: "var(--ec-ink-muted)" }}>{label}</span>
                  <span style={{ color: "var(--ec-ink)", fontWeight: 500 }}>
                    {label === "Email" ? (
                      <a href={`mailto:${value}`} style={{ color: "var(--ec-accent)", textDecoration: "none" }}>{value}</a>
                    ) : label === "Website" ? (
                      <a href={`https://${value}`} style={{ color: "var(--ec-accent)", textDecoration: "none" }}>{value}</a>
                    ) : value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* Footer note */}
      <div style={{ maxWidth: "680px", margin: "48px auto 0", borderTop: "1px solid var(--ec-line)", paddingTop: "24px" }}>
        <p style={{ fontSize: "12px", color: "var(--ec-ink-faint)", lineHeight: 1.65, fontStyle: "italic" }}>
          These Terms of Use were prepared in good faith to reflect current federal and Texas state legal standards as of the effective date above. UnpackMath recommends periodic legal review as laws and regulations evolve. This document does not constitute legal advice.
        </p>
      </div>
    </Shell>
  );
}