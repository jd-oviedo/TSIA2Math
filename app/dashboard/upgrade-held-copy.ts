// What the dashboard says to a visitor /upgrade turned away from the $5
// tripwire, as a pure function.
//
// Same split as join-result-copy.ts and for the same reason: the banner is a
// server component `node --test` cannot load, and the property worth checking
// is that every value the route can write, and anything unrecognised, produces
// a sentence rather than silence.
//
// The route writes exactly two values: 'held' for a visitor whose own row holds
// live access (any plan, including a still-running tripwire), and 'class' for a
// student whose access is derived from an entitled teacher's class. Anything
// else is a hand-edited URL and gets the neutral sentence.

export function upgradeHeldMessage(reason: string): string {
  switch (reason) {
    case 'held':
      return 'You already have full access, so there is nothing to buy. Everything is unlocked below.';
    case 'class':
      return 'Your class already gives you full access, so there is nothing to buy. Everything is unlocked below.';
    default:
      return 'You already have access to the course, so there is nothing to buy.';
  }
}
