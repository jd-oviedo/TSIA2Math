import Image from 'next/image';
import { C } from '@/app/components/curriculum-theme';

// GUMU, as the illustrated headshot. Replaces the flat-vector drawing that
// shipped with the curriculum redesign.
//
// Served through next/image rather than a plain <img>: the source is a 1.2 MB
// 1080px PNG and it renders here at 26 to 64 CSS pixels, so the optimizer is
// the difference between a few KB and the whole file on every topic page.
//
// The art is measured, not assumed. Against the cream cards his silhouette
// holds at roughly 6:1. Against the Deep Midnight cards it drops to 2.9:1,
// and about a third of his outline -- the ears and the dark face mask -- falls
// below 1.5:1 and simply disappears. That is what `plate` is for.

type Props = {
  size: number;
  // A light rounded plate behind the art, for the Deep Midnight surfaces.
  // Square-ish rather than a circle on purpose: a circle inscribed in this
  // source clips the ear tips, which sit outside its radius.
  plate?: boolean;
  // Empty string marks him decorative, for the places where adjacent text
  // already says "GUMU".
  title?: string;
};

const SRC = '/images/GUMU_headshot_transparent.png';

export default function GumuAvatar({ size, plate = false, title = 'GUMU' }: Props) {
  if (!plate) {
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

  // Inset so the ears clear the rounded corners.
  const inner = Math.round(size * 0.92);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flex: 'none',
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: C.gumuSurface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Image
        src={SRC}
        alt={title}
        width={inner}
        height={inner}
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </div>
  );
}
