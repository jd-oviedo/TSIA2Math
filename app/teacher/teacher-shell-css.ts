// The shell chrome's own stylesheet, in a plain module.
//
// SPLIT OUT OF TeacherShell.tsx FOR ONE REASON: a harness has to be able to
// measure these exact rules, and Node strips types from a .ts file but will not
// parse JSX, so nothing can import a .tsx directly. Restating the rules inside
// the harness instead would leave two copies of a print rule to drift apart,
// which is the failure this file exists to prevent.
//
// The hover-label keyframe deliberately stays in TeacherShell, which
// concatenates it on: it comes from a .tsx module of its own, and pulling it
// through here would reintroduce exactly the import problem above.

/** The class every piece of shell chrome carries on the standalone variant. */
export const CHROME_CLASS = 'um-teacher-chrome';

/** The shell's outer flex row, on the standalone variant only. */
export const SHELL_CLASS = 'um-teacher-shell';

// Two jobs, and both are about not changing pages that already work.
//
//   box-sizing. The dashboard's own <style> block opens with
//   `* { box-sizing: border-box }`. Nothing sets it globally, so on a page that
//   is not the dashboard the rail would land in content-box and the 32px
//   profile chip would measure 34. Scoped to the chrome rather than declared
//   globally, because the worksheet routes were laid out WITHOUT a global
//   border-box and switching it under them would be a regression.
//
//   print. The dashboard's rail prints today and this does not change that:
//   the rule is emitted for the standalone variant only. The worksheet routes
//   carry a chrome-hiding contract, so a stray Ctrl+P drops the rail, the menu
//   bar and the toolbars and prints the sheet alone.
export const SHELL_CHROME_CSS = `
.${CHROME_CLASS}, .${CHROME_CLASS} *, .${CHROME_CLASS} *::before, .${CHROME_CLASS} *::after { box-sizing: border-box; }
@media print {
  .${CHROME_CLASS} { display: none !important; }

  /* The shell is a flex ROW holding the rail beside the content, and the rail
     is gone by the rule above -- but the row survives it, and fragmentation
     inside a flex container is not reliably supported. Anything that has to
     break across pages, which on these routes is the answer key's three parts,
     needs an ordinary block flow the whole way up. !important because both
     declarations below are inline style props on the element.

     Caught by measurement, not by reading: the width came out right, so
     nothing on paper would have looked wrong until a key printed its three
     parts onto one sheet. */
  .${SHELL_CLASS} { display: block !important; min-height: 0 !important; }
}
`;
