// GUMU, drawn flat-vector so one file covers every size he appears at: 24px
// inline, 40px in a header, 48px on a chat panel, 64px on the mini quiz card.
// The blue glasses and the dark mask are what keep him recognizable when he is
// small, which is why they carry the heaviest strokes.
//
// The design import also specs a full-body crop with a collar and a gold tag,
// plus an ambient idle pose that sits in the page margin. Both were marked
// exploratory rather than committed, so neither is built here.

type Props = {
  size: number;
  // Blinking is the only motion he has. Off for the decorative repeats, since
  // several avatars blinking out of phase on one screen reads as noise.
  blink?: boolean;
  title?: string;
};

export default function GumuAvatar({ size, blink = true, title = 'GUMU' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="14 4 92 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: 'none', display: 'block' }}
      role="img"
      aria-label={title}
    >
      {/* Ears */}
      <path
        d="M27,46 L23.5,9.5 C23.5,7 26,5.8 28,7.2 L55,26.5 Z"
        fill="#4A3028"
        stroke="#2E1C14"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M93,46 L96.5,9.5 C96.5,7 94,5.8 92,7.2 L65,26.5 Z"
        fill="#4A3028"
        stroke="#2E1C14"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M33.5,39 L31,17.5 L47.5,29 Z" fill="#E7A9A0" />
      <path d="M86.5,39 L89,17.5 L72.5,29 Z" fill="#E7A9A0" />

      {/* Head, then the darker mask across the eyes */}
      <ellipse cx="60" cy="62" rx="41" ry="38" fill="#F6EDD9" stroke="#2E1C14" strokeWidth="2.2" />
      <ellipse cx="60" cy="58" rx="27.5" ry="30.5" fill="#4A3028" />

      <g stroke="#2E1C14" strokeWidth="1.3" fill="none" opacity="0.8" strokeLinecap="round">
        <path d="M45,72 C34,70 24,67 15,63" />
        <path d="M45,77 C33,77.5 22,79 13,80.5" />
        <path d="M75,72 C86,70 96,67 105,63" />
        <path d="M75,77 C87,77.5 98,79 107,80.5" />
      </g>

      <g
        className="gumu-eyes"
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          animation: blink ? 'gumu-blink 5.5s infinite' : undefined,
        }}
      >
        <ellipse cx="49" cy="54" rx="6.4" ry="7.2" fill="#E7A83C" />
        <ellipse cx="71" cy="54" rx="6.4" ry="7.2" fill="#E7A83C" />
        <ellipse cx="49" cy="54.5" rx="2.6" ry="5" fill="#2A1912" />
        <ellipse cx="71" cy="54.5" rx="2.6" ry="5" fill="#2A1912" />
        <circle cx="51.6" cy="51" r="1.5" fill="#FFFDF8" />
        <circle cx="73.6" cy="51" r="1.5" fill="#FFFDF8" />
      </g>

      {/* Sky Blue deepened to #5FBBDD so the stroke still reads on cream */}
      <g stroke="#5FBBDD" strokeWidth="2.8" fill="none" strokeLinecap="round">
        <circle cx="49" cy="54" r="11.5" />
        <circle cx="71" cy="54" r="11.5" />
        <path d="M57.6,52.2 Q60,49.6 62.4,52.2" />
        <path d="M37.6,50.5 L29,47.5" />
        <path d="M82.4,50.5 L91,47.5" />
      </g>

      <path
        d="M60,74.5 L54.6,68.6 Q60,66.2 65.4,68.6 Z"
        fill="#E7A9A0"
        stroke="#2A1912"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <g stroke="#2A1912" strokeWidth="1.7" fill="none" strokeLinecap="round">
        <path d="M60,74.5 Q56,80 51.6,77" />
        <path d="M60,74.5 Q64,80 68.4,77" />
      </g>
    </svg>
  );
}
