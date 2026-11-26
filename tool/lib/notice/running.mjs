// Running code (design part 2, sections 6 and 7): code whose comments or layout alone changed is not running code that
// changed. A file's running code is its tokens as the language reader parses them, every comment (structured comments,
// which state types, among them) and all layout left out. Used by the scope (scope.mjs: nothing where no running code
// changed) and by a told job's related tests (related.mjs: a line whose change is comments or layout only is not a
// changed line).
import { loadReader, ts } from './ts.mjs';

/** The code files the language reader reads, by their ending. */
export const CODE = /\.(m|c)?(j|t)sx?$/;

/**
 * A code file's tokens, each { start, end, text } with its first and last line (from 1), comments and layout left out;
 * null where the file is not code the reader reads.
 */
export function tokensOf(file, text) {
  if (!CODE.test(file)) return null;
  loadReader();
  const kind = /\.(m|c)?ts$/.test(file) ? ts.ScriptKind.TS : /\.tsx$/.test(file) ? ts.ScriptKind.TSX : /\.jsx$/.test(file) ? ts.ScriptKind.JSX : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, kind);
  const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const out = [];
  const visit = (n) => {
    if (n.kind >= ts.SyntaxKind.FirstJSDocNode && n.kind <= ts.SyntaxKind.LastJSDocNode) return;
    const kids = n.getChildren(sf);
    if (!kids.length) {
      if (n.kind !== ts.SyntaxKind.EndOfFileToken) { const s = n.getStart(sf); out.push({ start: lineOf(s), end: lineOf(n.end), text: `${n.kind}:${n.getText(sf)}` }); }
      return;
    }
    for (const k of kids) visit(k);
  };
  visit(sf);
  return out;
}

/** A file's running code as one text, or null where it is not code the reader reads. */
export function runningCode(file, text) {
  const t = tokensOf(file, text);
  return t && t.map((x) => x.text).join('\n');
}

/**
 * Whether one change of a file's lines (old lines os..os+oc-1, new lines ns..ns+nc-1) changes running code: the tokens
 * that touch those lines differ on the two sides. Always true for a file that is not code the reader reads.
 */
export function hunkRuns(file, oldTokens, newTokens, { os, oc, ns, nc }) {
  if (!oldTokens || !newTokens) return true;
  const within = (tokens, from, count) => (count ? tokens.filter((t) => t.end >= from && t.start <= from + count - 1).map((t) => t.text).join('\n') : '');
  return within(oldTokens, os, oc) !== within(newTokens, ns, nc);
}
