import { state, activeProfile, itemId, getSections } from '../state.js';
import { PROFILES } from '../state.js';
import { toast } from './toast.js';

function tagLabel(tag) {
  return tag === "crit" ? "must-have" : "recommended";
}

export function itemLine(it, isDone) {
  let s = (isDone ? "[x] " : "[ ] ") + it.t;
  if (it.tag) s += " (" + tagLabel(it.tag) + ")";
  if (it.hint) s += " — " + it.hint;
  return s;
}

export function profileLabelText() {
  const pl = PROFILES.find((p) => p.id === activeProfile);
  return pl ? pl.name : "";
}

export function sectionToText(sec) {
  let total = 0, done = 0;
  sec.subs.forEach((sub, subI) =>
    sub.items.forEach((it, iI) => {
      total++;
      if (state[itemId(sec.id, subI, iI)]) done++;
    })
  );
  const lines = [
    `## ${sec.title}  (${done}/${total} checked · profile: ${profileLabelText()})`,
  ];
  if (sec.blurb) lines.push(sec.blurb);
  sec.subs.forEach((sub, subI) => {
    lines.push("", `### ${sub.title}`);
    sub.items.forEach((it, iI) => {
      lines.push(itemLine(it, !!state[itemId(sec.id, subI, iI)]));
    });
  });
  return lines.join("\n");
}

export function profileToText() {
  const sections = getSections();
  const blocks = [];
  let total = 0, done = 0;
  sections.forEach((sec) => {
    sec.subs.forEach((sub, subI) =>
      sub.items.forEach((it, iI) => {
        total++;
        if (state[itemId(sec.id, subI, iI)]) done++;
      })
    );
    blocks.push(sectionToText(sec));
  });
  const pct = total ? Math.round((done / total) * 100) : 0;
  const header =
    `# SHIP_IT — production-readiness checklist\n` +
    `# Profile: ${profileLabelText()} · ${done}/${total} checked (${pct}%)`;
  return [header, ...blocks].join("\n\n");
}

export function copyText(str, okMsg) {
  const ok = () => toast(okMsg);
  const fail = () => toast("Copy failed");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(ok, () =>
      legacyCopy(str) ? ok() : fail()
    );
  } else {
    legacyCopy(str) ? ok() : fail();
  }
}

function legacyCopy(str) {
  try {
    const ta = document.createElement("textarea");
    ta.value = str;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}
