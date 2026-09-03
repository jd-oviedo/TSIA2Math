import { C } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import { upgradeHeldMessage } from './upgrade-held-copy';

// Why a click on the $5 tripwire landed here instead of on Stripe.
//
// /upgrade?plan=tripwire turns away anyone who already holds live access and
// sends them here with ?upgrade=held (their own plan) or ?upgrade=class (an
// entitled teacher's class). Without this line the student would click "buy",
// land on their dashboard, and have no idea whether the purchase happened,
// failed, or was refused. The answer is: it was not needed.
//
// Same shape as JoinResultBanner, deliberately: a server component with no
// state, one sentence, the green accent because nothing went wrong.

export default function UpgradeHeldBanner({ reason }: { reason: string }) {
  return (
    <div
      role="status"
      style={{
        borderLeft: `3px solid ${C.green}`,
        background: V.subtleBg,
        padding: '12px 16px',
        font: `400 13.5px ${FONT_BODY}`,
        lineHeight: 1.6,
        color: V.heading,
      }}
    >
      {upgradeHeldMessage(reason)}
    </div>
  );
}
