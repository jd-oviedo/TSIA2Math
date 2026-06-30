"use client";

interface Props {
  leg1?: string;
  leg2?: string;
  hypotenuse?: string;
  unknown: "leg1" | "leg2" | "hypotenuse";
}

export default function RightTriangleFigure({ leg1, leg2, hypotenuse, unknown }: Props) {
  const label = (key: "leg1" | "leg2" | "hypotenuse", value?: string) =>
    key === unknown ? "?" : value;

  return (
    <svg viewBox="0 0 220 160" style={{ width: "100%", maxWidth: "240px", margin: "0 auto 16px", display: "block" }}>
      <polygon points="20,140 20,20 200,140" fill="none" stroke="var(--ec-ink)" strokeWidth="2" />
      <rect x="20" y="128" width="12" height="12" fill="none" stroke="var(--ec-ink)" strokeWidth="1.5" />
      <text x="6" y="82" fontSize="14" fill="var(--ec-ink)" textAnchor="middle">{label("leg1", leg1)}</text>
      <text x="110" y="155" fontSize="14" fill="var(--ec-ink)" textAnchor="middle">{label("leg2", leg2)}</text>
      <text x="125" y="75" fontSize="14" fill="var(--ec-ink)" textAnchor="middle">{label("hypotenuse", hypotenuse)}</text>
    </svg>
  );
}