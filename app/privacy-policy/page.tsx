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

const sections = [
  {
    id: "who-we-are",
    number: "01",
    title: "Who We Are",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          UnpackMath is an adaptive math learning platform designed to help students prepare for college placement assessments. The Platform is operated by JDOM LLC, a Texas-based limited liability company. We serve two primary audiences:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            ["Institutions", "Schools, community colleges, and testing centers that license our platform for use with their students."],
            ["Individual Users", "Students and learners who access the platform directly through a personal subscription."],
          ].map(([label, desc]) => (
            <div key={label} style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--ec-shadow)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", display: "block", marginBottom: "6px" }}>{label}</span>
              <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{desc}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, marginTop: "16px" }}>
          For privacy-related questions, contact us at{" "}
          <a href="mailto:privacy@unpackmath.com" style={{ color: "var(--ec-accent)", textDecoration: "none" }}>privacy@unpackmath.com</a>
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    number: "02",
    title: "Information We Collect",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          We collect only the information necessary to operate and improve our services.
        </p>
        {[
          {
            label: "Information You Provide Directly",
            items: [
              "Account registration: name, email address, username, and password.",
              "Institutional information: school or organization name, district, and point-of-contact details.",
              "Payment information: processed securely through a third-party processor. We do not store your card number.",
              "Communications: messages you send through contact forms or email.",
            ],
          },
          {
            label: "Information Collected Automatically",
            items: [
              "Usage data: pages visited, features used, time spent, and actions taken.",
              "Performance data: quiz scores, question responses, accuracy rates, and learning progress.",
              "Device information: browser type, operating system, IP address, and device identifiers.",
              "Cookies and similar technologies: used to maintain sessions and analyze usage.",
            ],
          },
          {
            label: "Information from Institutions",
            items: [
              "When we contract with a school, the institution may provide student roster data such as names, grade levels, or student ID numbers for account setup. In this context, the institution acts as the data controller and we act as a service provider.",
            ],
          },
        ].map(({ label, items }) => (
          <div key={label} style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "10px" }}>{label}</p>
            <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--ec-shadow)", display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ec-accent)", marginTop: "8px", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "how-we-use",
    number: "03",
    title: "How We Use Your Information",
    content: (
      <>
        <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--ec-shadow)", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {[
            "Create and manage your account and deliver the services you requested.",
            "Personalize your learning experience through our adaptive engine.",
            "Track and display your academic progress and assessment results.",
            "Communicate with you about your account, updates, and support.",
            "Improve our Platform, fix bugs, and develop new features.",
            "Process payments and manage billing.",
            "Comply with legal obligations and enforce our Terms of Service.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ec-accent)", marginTop: "8px", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--ec-orange-bg)", border: "1px solid var(--ec-orange-border)", borderRadius: "14px", padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-orange)", marginBottom: "6px" }}>Important</p>
          <p style={{ fontSize: "14px", color: "var(--ec-ink)", lineHeight: 1.65, margin: 0 }}>
            We do not use student data for targeted advertising, and we do not sell student data to third parties under any circumstances.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "legal-basis",
    number: "04",
    title: "Legal Basis and Compliance",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          {
            law: "FERPA",
            full: "Family Educational Rights and Privacy Act",
            desc: "If we receive student education records from a school, we operate as a \"school official\" under FERPA, using that information solely for educational purposes as authorized by the institution.",
          },
          {
            law: "COPPA",
            full: "Children's Online Privacy Protection Act",
            desc: "Our Platform is not directed to children under 13. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If a school enrolls students under 13, the school provides consent as permitted by the FTC's school exception to COPPA.",
          },
          {
            law: "TDPSA",
            full: "Texas Data Privacy and Security Act",
            desc: "As a Texas-based business, we comply fully with the TDPSA (effective July 1, 2024). We collect only data adequate and relevant for our stated purposes, honor universal opt-out signals, and treat data from users under 13 as sensitive.",
          },
          {
            law: "Texas Student Privacy Act",
            full: "Ed. Code Section 32.151",
            desc: "When contracting with K-12 institutions in Texas, we comply with prohibitions on targeted advertising using student data, selling student data, and building non-educational profiles of students.",
          },
          {
            law: "Texas SB 1792",
            full: "",
            desc: "We maintain written data security practices, support parental rights to review and request deletion of student data, and do not use student information for any purpose beyond delivering our educational services.",
          },
        ].map(({ law, full, desc }) => (
          <div key={law} style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "18px 20px", boxShadow: "var(--ec-shadow)" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)" }}>{law}</span>
              {full && <span style={{ fontSize: "12px", color: "var(--ec-ink-faint)", marginLeft: "8px" }}>{full}</span>}
            </div>
            <p style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "how-we-share",
    number: "05",
    title: "How We Share Your Information",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          We do not sell your personal information. We may share information only in the following limited circumstances:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            ["Service Providers", "Trusted vendors who help us operate the Platform. They are contractually bound to protect your data and may only use it to provide services on our behalf."],
            ["Institutional Partners", "If you access the Platform through a school, we may share your performance data with authorized staff at that institution."],
            ["Legal Requirements", "If required by law, court order, or government authority, we may disclose information as necessary."],
            ["Business Transfers", "In a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before it becomes subject to a different privacy policy."],
            ["With Your Consent", "We may share information for any other purpose with your explicit consent."],
          ].map(([label, desc]) => (
            <div key={label} style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--ec-shadow)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-accent)", display: "block", marginBottom: "6px" }}>{label}</span>
              <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{desc}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "data-retention",
    number: "06",
    title: "Data Retention",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          ["Active Accounts", "Data is retained for the duration of your subscription or institutional agreement."],
          ["Inactive Accounts", "Data is deleted or anonymized after 12 months of inactivity, unless a longer period is required by law or requested by an institution."],
          ["Student Data from Institutions", "Returned or deleted upon termination of the institutional agreement, in accordance with the terms of that agreement."],
        ].map(([label, desc]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--ec-shadow)" }}>
            <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", flexShrink: 0, minWidth: "160px" }}>{label}</span>
            <span style={{ fontSize: "14px", color: "var(--ec-ink)", lineHeight: 1.65, textAlign: "right" }}>{desc}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "your-rights",
    number: "07",
    title: "Your Privacy Rights",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          Depending on your location and applicable law, you may have the following rights:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {[
            ["Access", "Request a copy of the personal information we hold about you."],
            ["Correction", "Request that we correct inaccurate or incomplete data."],
            ["Deletion", "Request deletion of your personal information, subject to legal obligations."],
            ["Opt-Out", "Opt out of any data processing not strictly necessary for the service."],
            ["Data Portability", "Request your data in a portable format."],
            ["Parental Rights", "Parents of minor students may review, correct, or request deletion of their child's data."],
          ].map(([label, desc]) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "14px", background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "15px 20px", boxShadow: "var(--ec-shadow)" }}>
              <div style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "50%", background: "var(--ec-accent-soft)", border: "1px solid var(--ec-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--ec-accent)" }}>{(label as string)[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--ec-ink)", marginBottom: "2px" }}>{label}</p>
                <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.65, marginTop: "16px" }}>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@unpackmath.com" style={{ color: "var(--ec-accent)", textDecoration: "none" }}>privacy@unpackmath.com</a>.
          {" "}We will respond within 45 days as required by Texas law.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "08",
    title: "Cookies and Tracking",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          We use cookies and similar technologies to keep you logged in during a session, remember your preferences and settings, and analyze how users interact with the Platform to improve the experience.
        </p>
        <div style={{ background: "var(--ec-orange-bg)", border: "1px solid var(--ec-orange-border)", borderRadius: "14px", padding: "16px 20px" }}>
          <p style={{ fontSize: "14px", color: "var(--ec-ink)", lineHeight: 1.65, margin: 0 }}>
            You may disable cookies through your browser settings, but doing so may affect some Platform functionality. We do not use cookies for targeted advertising.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "data-security",
    number: "09",
    title: "Data Security",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          We implement and maintain reasonable administrative, technical, and physical security measures to protect your personal information. These include:
        </p>
        <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--ec-shadow)", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {[
            "Encrypted data transmission (HTTPS/TLS).",
            "Secure password storage using industry-standard hashing.",
            "Access controls limiting who within our organization can view personal data.",
            "Regular security reviews and updates.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ec-green)", marginTop: "8px", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>
          No system is 100% secure. In the event of a data breach that affects your rights, we will notify affected users and institutions as required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    number: "10",
    title: "Changes to This Policy",
    content: (
      <>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable law. When we make material changes, we will:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px" }}>
          {[
            "Update the \"Last Updated\" date at the top of this policy.",
            "Notify registered users via email or an in-platform notice.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ec-accent)", marginTop: "8px", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.65 }}>
          Your continued use of the Platform after any changes constitutes your acceptance of the updated policy.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    number: "11",
    title: "Contact Us",
    content: (
      <div style={{ background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "14px", padding: "24px", boxShadow: "var(--ec-shadow)", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          ["Platform", "UnpackMath / JDOM LLC"],
          ["Email", "privacy@unpackmath.com"],
          ["Website", "www.unpackmath.com"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px solid var(--ec-line)", paddingBottom: "10px" }}>
            <span style={{ color: "var(--ec-ink-muted)" }}>{label}</span>
            <span style={{ color: "var(--ec-ink)", fontWeight: 500 }}>
              {label === "Email" ? (
                <a href="mailto:privacy@unpackmath.com" style={{ color: "var(--ec-accent)", textDecoration: "none" }}>{value}</a>
              ) : label === "Website" ? (
                <a href="https://www.unpackmath.com" style={{ color: "var(--ec-accent)", textDecoration: "none" }}>{value}</a>
              ) : value}
            </span>
          </div>
        ))}
        <p style={{ fontSize: "13px", color: "var(--ec-ink-muted)", lineHeight: 1.65, margin: 0 }}>
          For complaints related to student data privacy in Texas, you may also contact the Texas Attorney General's Consumer Protection Division at{" "}
          <a href="https://texasattorneygeneral.gov" style={{ color: "var(--ec-accent)", textDecoration: "none" }}>texasattorneygeneral.gov</a>.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Shell>
      {/* Hero */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 0 48px", borderBottom: "1px solid var(--ec-line)", marginBottom: "48px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ec-accent)", marginBottom: "12px" }}>
          Legal · Privacy
        </p>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 800, color: "var(--ec-ink)", letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: "20px" }}>
          Privacy Policy.
        </h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            "Effective: May 26, 2025",
            "Last Updated: June 2026",
            "A product of JDOM LLC",
          ].map((tag) => (
            <span key={tag} style={{ fontSize: "12px", color: "var(--ec-ink-muted)", background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "999px", padding: "4px 14px", boxShadow: "var(--ec-shadow)" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: "680px", margin: "0 auto 48px", background: "var(--ec-surface)", border: "1px solid var(--ec-line)", borderRadius: "20px", padding: "28px 30px", boxShadow: "var(--ec-shadow)" }}>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, marginBottom: "16px" }}>
          UnpackMath ("we," "our," or "us"), a product of JDOM LLC, is committed to protecting the privacy of every person who visits or uses unpackmath.com (the "Platform"). This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have.
        </p>
        <p style={{ fontSize: "15px", color: "var(--ec-ink-muted)", lineHeight: 1.75, margin: 0 }}>
          By accessing or using our Platform, you agree to the practices described in this policy. If you do not agree, please do not use our Platform.
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
        {sections.map(({ id, number, title, content }) => (
          <div key={id} id={id}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", color: "var(--ec-accent)", fontVariantNumeric: "tabular-nums" }}>{number}</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ec-ink)", letterSpacing: "-0.015em" }}>{title}</h2>
            </div>
            {content}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ maxWidth: "680px", margin: "48px auto 0", borderTop: "1px solid var(--ec-line)", paddingTop: "24px" }}>
        <p style={{ fontSize: "12px", color: "var(--ec-ink-faint)", lineHeight: 1.65, fontStyle: "italic" }}>
          This Privacy Policy was prepared in good faith to reflect current federal and Texas state requirements as of the effective date above. UnpackMath recommends periodic legal review as laws and regulations evolve. This document does not constitute legal advice.
        </p>
      </div>
    </Shell>
  );
}