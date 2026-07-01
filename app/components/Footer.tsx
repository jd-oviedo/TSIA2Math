import { Kodchasan } from "next/font/google";
const kodchasan = Kodchasan({
  subsets: ["latin"],
  weight: ["500", "600"],
});
export function Footer() {
  return (
    <footer className={kodchasan.className} style={{
      textAlign: 'center',
      padding: '24px 0',
      fontSize: '13px',
      color: 'var(--ec-warm-gray, #5F5E5A)',
    }}>
      © 2026 UnpackMath
      <span style={{ margin: '0 8px' }}>·</span>
      
       <a href="https://unpackmath.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'underline' }}
      >
        Privacy
      </a>
      <span style={{ margin: '0 8px' }}>·</span>
      
       <a href="https://unpackmath.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'underline' }}
      >
        Terms
      </a>
    </footer>
  );
}
