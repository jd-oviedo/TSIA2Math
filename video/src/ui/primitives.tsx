// Flat UI primitives matching the app: radius 0, hairline borders, no shadows.
import { useCurrentFrame } from "remotion";
import { C, FONT_BODY, FONT_HEADING, FONT_MONO } from "../theme";

type Variant = "primary" | "secondary" | "disabled" | "pressed";

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary: { background: C.sunset, color: C.midnight, border: `1px solid ${C.sunset}` },
  pressed: { background: C.sunsetPressed, color: C.midnight, border: `1px solid ${C.sunsetPressed}` },
  secondary: { background: C.white, color: C.ink, border: `1px solid ${C.border}` },
  disabled: { background: C.chipBg, color: C.dim, border: `1px solid ${C.chipBg}` },
};

export const Btn: React.FC<{
  variant?: Variant;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ variant = "secondary", style, children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      height: 44,
      padding: "0 16px",
      fontFamily: FONT_BODY,
      fontSize: 14,
      fontWeight: 600,
      borderRadius: 0,
      ...VARIANTS[variant],
      ...style,
    }}
  >
    {children}
  </div>
);

export const Input: React.FC<{
  value: string;
  placeholder: string;
  mono?: boolean;
  caret?: boolean;
  style?: React.CSSProperties;
}> = ({ value, placeholder, mono, caret, style }) => {
  const frame = useCurrentFrame();
  const empty = value.length === 0;
  const blink = frame % 16 < 9;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 46,
        padding: "0 14px",
        background: C.white,
        border: `1px solid ${C.ink}`,
        fontFamily: mono ? FONT_MONO : FONT_BODY,
        fontSize: mono ? 16 : 15,
        fontWeight: mono ? 600 : 400,
        letterSpacing: mono ? "0.14em" : 0,
        color: empty ? C.placeholder : C.ink,
        ...style,
      }}
    >
      <span>{empty ? placeholder : value}</span>
      {caret ? (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 20,
            marginLeft: 2,
            background: C.ink,
            opacity: blink ? 1 : 0,
          }}
        />
      ) : null}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: FONT_BODY,
      fontSize: 11.5,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: C.muted,
      ...style,
    }}
  >
    {children}
  </div>
);

export const H: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  size,
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT_HEADING,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.2,
      color: C.heading,
      letterSpacing: "-0.01em",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; border?: string }> = ({
  children,
  bg = C.chipBg,
  color = C.ink,
  border,
}) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 8px",
      background: bg,
      color,
      border: border ? `1px solid ${border}` : "none",
      fontFamily: FONT_BODY,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      lineHeight: 1.2,
    }}
  >
    {children}
  </span>
);

export const PlusIcon: React.FC<{ color?: string }> = ({ color = C.ink }) => (
  <svg width={12} height={12} viewBox="0 0 12 12">
    <path d="M6 1v10M1 6h10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);
