import Image from 'next/image';

// mu, as the brand mark. Replaces the illustrated cat headshot that shipped
// with the curriculum redesign.
//
// Served through next/image rather than a plain <img>: the source renders here
// at 40 to 64 CSS pixels, so the optimizer is the difference between a few KB
// and the whole file on every topic page.
//
// THE CREAM PLATE IS GONE, AND IT MUST NOT COME BACK.
//
// The cat needed one. Its silhouette held at roughly 6:1 on the cream cards but
// dropped to 2.9:1 on the Deep Midnight tutor cards, where about a third of its
// outline -- the ears and the dark face mask -- fell below 1.5:1 and simply
// disappeared. A light rounded plate underneath was what made it survive.
//
// mu is high-contrast Sunset Orange on transparent, and the plate does the exact
// opposite for it. Measured over every pixel at alpha >= 0.5, composited:
//
//   bare on tutorSurface #0E0E11   median 8.13   4.4% of art below 1.5:1   8.63:1
//   bare on gumuBanner   #0F1E35   median 7.04   4.5% of art below 1.5:1   7.48:1
//   ON THE CREAM PLATE   #F7F1E4   median 2.10  27.1% of art below 1.5:1   1.98:1
//
// Orange on cream is the near-miss: the plate put 91% of the art below 3:1. So
// the plate was not merely unnecessary here, it was the worst available ground,
// and dropping it is a legibility fix rather than a simplification.
//
// C.gumuSurface still exists in curriculum-theme.ts -- tests/curriculum-contrast
// asserts it -- it just has no consumer now.

type Props = {
  size: number;
  // Empty string marks the mark decorative, for the places where adjacent text
  // already says "mu".
  title?: string;
};

const SRC = '/images/Mu-trimmed-transparent.png';

export default function GumuAvatar({ size, title = 'Mu' }: Props) {
  // The source is 641x776 and edge-trimmed, so `contain` draws it full height
  // and narrower than the box. The box stays square because every call site
  // lays out against `size`, and the slack either side is transparent.
  return (
    <Image
      src={SRC}
      alt={title}
      width={size}
      height={size}
      style={{ flex: 'none', display: 'block', objectFit: 'contain' }}
    />
  );
}
