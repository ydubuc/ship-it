import { state, activeProfile, getSections, itemId, saveState, PROFILES } from './state.js';
import { copyText, profileToText, profileLabelText } from './utils/copy.js';
import { toast } from './utils/toast.js';
import { renderAll } from './utils/render.js';

document.getElementById("expandAll").onclick = () =>
  document.querySelectorAll(".section").forEach((s) => s.classList.add("open"));

document.getElementById("collapseAll").onclick = () =>
  document.querySelectorAll(".section").forEach((s) => s.classList.remove("open"));

document.getElementById("copyProfile").onclick = () =>
  copyText(profileToText(), "“" + profileLabelText() + "” profile copied");

document.getElementById("resetBtn").onclick = () => {
  const pl = PROFILES.find((p) => p.id === activeProfile);
  const name = pl ? pl.name : activeProfile;
  if (!confirm(`Reset all checkmarks for "${name}"? This clears checked items visible in this profile.`))
    return;
  getSections().forEach((sec) =>
    sec.subs.forEach((sub, subI) =>
      sub.items.forEach((it, iI) => {
        delete state[itemId(sec.id, subI, iI)];
      })
    )
  );
  saveState();
  renderAll();
  toast("Profile checklist reset");
};

document.getElementById("exportBtn").onclick = (e) => {
  e.preventDefault();
  const blob = new Blob(
    [JSON.stringify({ profile: activeProfile, checked: state, exported: new Date().toISOString() }, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ship-it-progress.json";
  a.click();
  toast("Progress exported");
};

renderAll();
