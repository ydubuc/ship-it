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
  const expandedSet = new Set(
    [...document.querySelectorAll(".check.expanded")].map((li) => li.dataset.iid)
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
        const isExpanded = expandedSet.has(id);
        const hasMore = !!(it.desc || it.hint);
        const li = document.createElement("li");
        li.className =
          "check" + (isDone ? " done" : "") + (isExpanded ? " expanded" : "");
        li.dataset.iid = id;
        const tag = it.tag
          ? `<span class="tag ${it.tag}">${it.tag === "crit" ? "must-have" : "recommended"}</span>`
          : "";
        const desc = it.desc ? `<div class="cdesc-text">${it.desc}</div>` : "";
        const example = it.hint
          ? `<div class="cexample"><span class="cex-label">e.g.</span>${it.hint}</div>`
          : "";
        const panel = hasMore
          ? `<div class="cdesc"><div class="cdesc-inner">${desc}${example}</div></div>`
          : "";
        const chev = hasMore ? `<span class="chev-i">▶</span>` : "";
        li.innerHTML =
          `<span class="box" role="checkbox" aria-checked="${isDone}" tabindex="0" title="Mark done">${checkSVG}</span>` +
          `<div class="cbody">` +
            `<div class="crow"${hasMore ? ` role="button" tabindex="0" aria-expanded="${isExpanded}"` : ""}>` +
              `<span class="ctext">${it.t}${tag}</span>${chev}` +
            `</div>${panel}` +
          `</div>` +
          `<button class="copy-item" type="button" title="Copy this item">copy</button>`;

        const box = li.querySelector(".box");
        const flip = () => {
          state[id] = !state[id];
          if (!state[id]) delete state[id];
          saveState();
          renderAll();
        };
        box.onclick = (e) => {
          e.stopPropagation();
          flip();
        };
        box.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            flip();
          }
        };

        if (hasMore) {
          const crow = li.querySelector(".crow");
          const toggle = () => {
            const now = li.classList.toggle("expanded");
            crow.setAttribute("aria-expanded", now);
          };
          crow.onclick = toggle;
          crow.onkeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          };
        }

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
