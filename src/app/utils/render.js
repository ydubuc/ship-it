import { state, activeProfile, itemId, setActiveProfile, saveState, getSections, PROFILES } from '../state.js';
import { sectionToText, profileLabelText, copyText, itemLine } from './copy.js';

const checkSVG = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="#0c0e12" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function renderAll() {
  renderProfiles();
  renderSections();
  renderDashboard();
}

export function renderProfiles() {
  const host = document.getElementById("profileGrid");
  host.innerHTML = "";
  PROFILES.forEach((p) => {
    const el = document.createElement("button");
    el.className = "profile" + (p.id === activeProfile ? " active" : "");
    el.setAttribute("aria-pressed", p.id === activeProfile);
    el.innerHTML = `<span class="pico">${p.ico}</span><span class="pname">${p.name}</span><span class="pdesc">${p.desc}</span>`;
    el.onclick = () => {
      setActiveProfile(p.id);
      renderAll();
    };
    host.appendChild(el);
  });
  const pl = PROFILES.find((p) => p.id === activeProfile);
  document.getElementById("profileLabel").textContent = pl ? pl.name : "";
}

export function renderSections() {
  const sections = getSections();
  const host = document.getElementById("sectionsHost");
  const openSet = new Set(
    [...document.querySelectorAll(".section.open")].map((s) => s.dataset.sid)
  );
  host.innerHTML = "";
  let secNum = 0;

  sections.forEach((sec) => {
    secNum++;
    let total = 0, done = 0;
    sec.subs.forEach((sub, subI) =>
      sub.items.forEach((it, iI) => {
        total++;
        if (state[itemId(sec.id, subI, iI)]) done++;
      })
    );
    const complete = total > 0 && done === total;

    const secEl = document.createElement("section");
    secEl.className = "section" + (openSet.has(sec.id) ? " open" : "");
    secEl.dataset.sid = sec.id;

    const head = document.createElement("div");
    head.className = "section-head";
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    head.innerHTML = `
      <span class="sec-idx">${String(secNum).padStart(2, "0")}</span>
      <span class="sec-icon">${sec.icon}</span>
      <span class="sec-title">${sec.title}</span>
      <span class="sec-stat ${complete ? "complete" : ""}">${done}/${total}</span>
      <button class="copy-sec" type="button" title="Copy this list as text">copy list</button>
      <span class="chev">▶</span>`;
    const toggle = () => secEl.classList.toggle("open");
    head.onclick = toggle;
    head.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    const copySecBtn = head.querySelector(".copy-sec");
    copySecBtn.onclick = (e) => {
      e.stopPropagation();
      copyText(sectionToText(sec), "“" + sec.title + "” list copied");
    };
    copySecBtn.onkeydown = (e) => e.stopPropagation();

    const body = document.createElement("div");
    body.className = "sec-body";
    body.innerHTML = `<p class="sec-blurb">${sec.blurb}</p>`;

    sec.subs.forEach((sub, subI) => {
      const subEl = document.createElement("div");
      subEl.className = "subsection";
      subEl.innerHTML = `<div class="sub-title">${sub.title}</div>`;
      const ul = document.createElement("ul");
      ul.className = "checks";
      sub.items.forEach((it, iI) => {
        const id = itemId(sec.id, subI, iI);
        const isDone = !!state[id];
        const li = document.createElement("li");
        li.className = "check" + (isDone ? " done" : "");
        li.setAttribute("role", "checkbox");
        li.setAttribute("aria-checked", isDone);
        li.setAttribute("tabindex", "0");
        const tag = it.tag
          ? `<span class="tag ${it.tag}">${it.tag === "crit" ? "must-have" : "recommended"}</span>`
          : "";
        const hint = it.hint ? `<span class="hint">${it.hint}</span>` : "";
        li.innerHTML = `<span class="box">${checkSVG}</span><span class="ctext">${it.t}${tag}${hint}</span><button class="copy-item" type="button" title="Copy this item">copy</button>`;
        const flip = () => {
          state[id] = !state[id];
          if (!state[id]) delete state[id];
          saveState();
          renderAll();
        };
        li.onclick = flip;
        li.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        };
        const copyBtn = li.querySelector(".copy-item");
        copyBtn.onclick = (e) => {
          e.stopPropagation();
          const ctx = `# ${sec.title} › ${sub.title}`;
          copyText(ctx + "\n" + itemLine(it, isDone), "Item copied");
        };
        copyBtn.onkeydown = (e) => e.stopPropagation();
        ul.appendChild(li);
      });
      subEl.appendChild(ul);
      body.appendChild(subEl);
    });

    secEl.appendChild(head);
    secEl.appendChild(body);
    host.appendChild(secEl);
  });
}

export function renderDashboard() {
  const sections = getSections();
  let total = 0, done = 0, critTotal = 0, critDone = 0;
  const perSection = [];
  sections.forEach((sec) => {
    let st = 0, sd = 0;
    sec.subs.forEach((sub, subI) =>
      sub.items.forEach((it, iI) => {
        total++;
        st++;
        const d = !!state[itemId(sec.id, subI, iI)];
        if (d) { done++; sd++; }
        if (it.tag === "crit") {
          critTotal++;
          if (d) critDone++;
        }
      })
    );
    if (st > 0) perSection.push({ title: sec.title, icon: sec.icon, st, sd });
  });

  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("pctNum").textContent = pct;
  document.getElementById("pbarFill").style.width = pct + "%";
  document.getElementById("doneCount").textContent = done;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("critMeta").textContent = critTotal - critDone;

  const colors = ["--acc", "--blue", "--rust", "--violet", "--amber", "--pink"];
  const leg = document.getElementById("sectionLegend");
  leg.innerHTML = "";
  perSection.forEach((s, i) => {
    const p = s.st ? Math.round((s.sd / s.st) * 100) : 0;
    const col = `var(${colors[i % colors.length]})`;
    const row = document.createElement("div");
    row.className = "legrow";
    row.innerHTML = `<span class="ll">${s.icon} ${s.title}</span>
      <span class="mini"><i style="width:${p}%;background:${col}"></i></span>
      <span class="lv">${s.sd}/${s.st}</span>`;
    leg.appendChild(row);
  });
}
