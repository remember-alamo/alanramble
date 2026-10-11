// POLITICAST widget.
// Usage on any page:
//   <link rel="stylesheet" href="politicast/politicast.css">
//   <div data-politicast></div>
//   <script src="politicast/states.js"></script>
//   <script src="politicast/data.js"></script>
//   <script src="politicast/politicast.js"></script>
// Every element with [data-politicast] is turned into a widget. No dependencies.
// Add the attribute data-opinions (and load politicast/opinions.js) to also show the opinion panel
// under the map; clicking a state then opens that race's opinion.
(function () {
  "use strict";

  var STATES = window.POLITICAST_STATES;
  var DATA = window.POLITICAST_DATA;
  var NS = "http://www.w3.org/2000/svg";
  var LEVELS = ["safe", "likely", "lean", "tilt"];
  // seats not up this cycle are drawn first (outer edges) in the tally bar, in a darker shade than Safe
  var BAR_LEVELS = ["hold"].concat(LEVELS);
  var LEVEL_LABEL = { safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt" };
  var PARTY_NAME = { D: "Democratic", R: "Republican" };

  // States too small for an in-state label get a chip in the ocean (or above, for VT) joined to
  // the state by a leader line. `to` = point inside the state, `at` = chip center, in map units.
  // Nudges for in-state labels whose computed centers look off. [x, y] in map units.
  var LABEL_AT = {
    AL: [674, 431],     // level with MS
    GA: [743.8, 431],   // level with MS
    KS: [456, 308],     // centered
    TX: [456, 466],     // in line with KS, a bit higher
    PA: [808, 226],     // centered
    ND: [429, 103],
    SD: [429, 174],
    MT: [288, 98],
    OR: [104, 131]
  };

  var CALLOUTS = {
    VT: { to: [871, 124], at: [869, 94] },
    NH: { to: [895, 148], at: [946, 146] },
    MA: { to: [912, 172], at: [946, 165] },
    RI: { to: [905, 184], at: [946, 184] },
    CT: { to: [888, 194], at: [946, 203] },
    NJ: { to: [863, 238], at: [912, 232] },
    DE: { to: [857, 262], at: [912, 254] },
    MD: { to: [858, 278], at: [912, 276] },
    DC: { to: [828, 268], at: [912, 298] }
  };

  function h(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function svg(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // DC only has electors in presidential races, so its race counts only when the contest is flagged `presidential`.
  function raceFor(contest, code) {
    var race = contest && contest.races && contest.races[code];
    if (race && code === "DC" && !contest.presidential) return null;
    return race || null;
  }

  function margin(race) {
    return race.lean + "+" + Number(race.margin).toFixed(1);
  }

  function describe(race) {
    return LEVEL_LABEL[race.rating] + " " + PARTY_NAME[race.lean];
  }

  function tally(contest) {
    var t = { D: {}, R: {} };
    BAR_LEVELS.forEach(function (l) { t.D[l] = 0; t.R[l] = 0; });
    var hold = contest.holdovers || {};
    t.D.hold = hold.D || 0;
    t.R.hold = hold.R || 0;
    Object.keys(contest.races).forEach(function (code) {
      var r = contest.races[code];
      t[r.lean][r.rating] += 1;
    });
    return t;
  }

  function sum(counts) {
    return BAR_LEVELS.reduce(function (a, l) { return a + counts[l]; }, 0);
  }

  function buildLegend() {
    var legend = h("div", "pc-legend");
    [["safe", "likely"], ["lean", "tilt"]].forEach(function (pair) {
      var col = h("div", "pc-legend-col");
      pair.forEach(function (level) {
        var row = h("div", "pc-legend-row");
        row.appendChild(h("span", "pc-legend-label", LEVEL_LABEL[level].toUpperCase()));
        row.appendChild(h("span", "pc-swatch pc-r-" + level));
        row.appendChild(h("span", "pc-swatch pc-d-" + level));
        col.appendChild(row);
      });
      legend.appendChild(col);
    });
    var holdCol = h("div", "pc-legend-col");
    var holdRow = h("div", "pc-legend-row");
    holdRow.appendChild(h("span", "pc-legend-label", "NO CONTEST"));
    holdRow.appendChild(h("span", "pc-swatch pc-r-hold"));
    holdRow.appendChild(h("span", "pc-swatch pc-d-hold"));
    holdCol.appendChild(holdRow);
    legend.appendChild(holdCol);
    return legend;
  }

  // One cell per seat: D safe -> tilt, then R tilt -> safe, with a majority marker at the center.
  function buildTally(contest) {
    var t = tally(contest);
    var wrap = h("div", "pc-tally");
    wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", "Projected seats: Democrats " + sum(t.D) + ", Republicans " + sum(t.R));

    var cells = h("div", "pc-cells");
    function addCells(party, order) {
      order.forEach(function (level) {
        for (var i = 0; i < t[party][level]; i++) {
          cells.appendChild(h("span", "pc-" + party.toLowerCase() + "-" + level));
        }
      });
    }
    addCells("D", BAR_LEVELS);
    addCells("R", BAR_LEVELS.slice().reverse());
    cells.style.gridTemplateColumns = "repeat(" + (sum(t.D) + sum(t.R)) + ", 1fr)";

    var mid = h("div", "pc-tally-mid");
    mid.appendChild(cells);
    mid.appendChild(h("span", "pc-majority", "MAJORITY"));

    wrap.appendChild(h("span", "pc-tally-num pc-tally-d", sum(t.D)));
    wrap.appendChild(mid);
    wrap.appendChild(h("span", "pc-tally-num pc-tally-r", sum(t.R)));
    return wrap;
  }

  function mount(root) {
    if (!STATES || !DATA) {
      root.textContent = "POLITICAST data failed to load.";
      return;
    }

    var contests = { senate: DATA.senate, governors: DATA.governors };
    var order = ["senate", "governors"];
    var labels = { senate: "Senate", governors: "Governors" };
    var current = "senate";

    root.classList.add("pc");

    var top = h("div", "pc-top");
    top.appendChild(buildLegend());
    var tabs = h("div", "pc-tabs");
    tabs.setAttribute("role", "group");
    tabs.setAttribute("aria-label", "Contest");
    var tabButtons = {};
    order.forEach(function (key) {
      var b = h("button", "pc-tab", labels[key]);
      b.type = "button";
      b.addEventListener("click", function () { show(key); if (OPINIONS && selected[key]) setHash(key, selected[key]); });
      tabs.appendChild(b);
      tabButtons[key] = b;
    });
    top.appendChild(tabs);
    root.appendChild(top);

    var tallySlot = h("div", "pc-tally-slot");
    root.appendChild(tallySlot);

    var mapBox = h("div", "pc-map");
    var map = svg("svg", { viewBox: STATES.viewBox, role: "group", "aria-label": "Map of US states" });
    mapBox.appendChild(map);
    var tip = h("div", "pc-tip");
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    mapBox.appendChild(tip);
    root.appendChild(mapBox);

    var note = h("p", "pc-note");
    root.appendChild(note);

    var OPINIONS = root.hasAttribute("data-opinions") ? window.POLITICAST_OPINIONS : null;

    var paths = {};
    Object.keys(STATES.paths).forEach(function (code) {
      var p = svg("path", { d: STATES.paths[code].d, "data-state": code });
      map.appendChild(p);
      paths[code] = p;
    });

    // state labels: two-letter codes inside states, chips + leader lines for the small ones
    var vbWidth = parseFloat(STATES.viewBox.split(" ")[2]);
    var labelLayer = svg("g", { "class": "pc-labels", "aria-hidden": "true" });
    map.appendChild(labelLayer);
    var labelNodes = {};
    Object.keys(STATES.paths).forEach(function (code) {
      var node = { g: svg("g") };
      var call = CALLOUTS[code];
      if (call) {
        node.line = svg("line", { x1: call.to[0], y1: call.to[1], x2: call.at[0], y2: call.at[1] });
        node.rect = svg("rect", { "data-state": code });
        node.g.appendChild(node.line);
        node.g.appendChild(node.rect);
      }
      var pos = call ? call.at : (LABEL_AT[code] || STATES.paths[code].label);
      node.text = svg("text", { x: pos[0], y: pos[1] });
      node.text.textContent = code;
      node.g.appendChild(node.text);
      labelLayer.appendChild(node.g);
      labelNodes[code] = node;
    });

    // keep labels at the same on-screen size as the MAJORITY caption (capped so chips don't collide)
    function layoutLabels() {
      var scale = map.getBoundingClientRect().width / vbWidth;
      if (!scale) return;
      var rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      var fs = Math.min(0.65 * rootPx / scale, 13);
      labelLayer.style.fontSize = fs + "px";
      labelLayer.style.strokeWidth = Math.max(1 / scale, 0.6) + "px";
      var w = fs * 2.1, hgt = fs * 1.35;
      Object.keys(labelNodes).forEach(function (code) {
        var n = labelNodes[code];
        if (!n.rect) return;
        var at = CALLOUTS[code].at;
        n.rect.setAttribute("x", at[0] - w / 2);
        n.rect.setAttribute("y", at[1] - hgt / 2);
        n.rect.setAttribute("width", w);
        n.rect.setAttribute("height", hgt);
      });
    }
    if (window.ResizeObserver) new ResizeObserver(layoutLabels).observe(map);
    window.addEventListener("resize", layoutLabels);

    function stateInfo(code) {
      var contest = contests[current];
      var race = raceFor(contest, code);
      return { name: STATES.paths[code].name, race: race, contest: contest };
    }

    function show(key) {
      current = key;
      order.forEach(function (k) {
        tabButtons[k].setAttribute("aria-pressed", String(k === key));
      });
      hideTip();

      var contest = contests[key];
      tallySlot.textContent = "";
      if (contest) tallySlot.appendChild(buildTally(contest));

      Object.keys(paths).forEach(function (code) {
        var p = paths[code];
        var race = raceFor(contest, code);
        p.setAttribute("class", race ? "pc-" + race.lean.toLowerCase() + "-" + race.rating : "pc-none");
        var ln = labelNodes[code];
        // DC has no Senate or governor race, so it is hidden entirely (shape, label and callout)
        var hideState = code === "DC" && !race;
        p.style.display = hideState ? "none" : "";
        ln.g.style.display = hideState ? "none" : "";
        ln.g.setAttribute("class", race ? "pc-lrace" : "pc-lnone");
        if (ln.rect) ln.rect.setAttribute("class", race ? "pc-chip pc-" + race.lean.toLowerCase() + "-" + race.rating : "pc-chip");
        if (race) {
          p.setAttribute("tabindex", "0");
          p.setAttribute("aria-label", STATES.paths[code].name + ": " + describe(race) + ", " + margin(race));
        } else {
          p.removeAttribute("tabindex");
          p.setAttribute("aria-label", STATES.paths[code].name + ": no race");
        }
      });

      var msgs = [];
      if (!contest) msgs.push(labels[key] + " ratings coming soon.");
      if (DATA.asOf) msgs.push("As of " + DATA.asOf);
      note.textContent = msgs.join(" ");
      note.hidden = msgs.length === 0;
      layoutLabels();
      if (OPINIONS) renderOpinions();
    }

    function fillTip(code) {
      var info = stateInfo(code);
      tip.textContent = "";
      tip.appendChild(h("strong", "pc-tip-name", info.name));
      if (!info.race) {
        tip.appendChild(h("div", "pc-tip-none", info.contest ? "No race in " + DATA.year : "Ratings coming soon"));
        return;
      }
      var r = info.race;
      var rating = h("div", "pc-tip-rating");
      rating.appendChild(h("span", "pc-swatch pc-" + r.lean.toLowerCase() + "-" + r.rating));
      rating.appendChild(h("span", null, describe(r)));
      tip.appendChild(rating);
      var list = h("ul", "pc-tip-cands");
      (r.candidates || []).forEach(function (c) {
        list.appendChild(h("li", null, c.name + " (" + c.party + ")"));
      });
      tip.appendChild(list);
      tip.appendChild(h("div", "pc-tip-margin", "Projected margin: " + margin(r)));
    }

    function placeTip(clientX, clientY) {
      var box = mapBox.getBoundingClientRect();
      var x = clientX - box.left + 14;
      var y = clientY - box.top + 14;
      if (x + tip.offsetWidth > box.width) x = clientX - box.left - tip.offsetWidth - 14;
      if (y + tip.offsetHeight > box.height) y = clientY - box.top - tip.offsetHeight - 14;
      tip.style.left = Math.max(0, x) + "px";
      tip.style.top = Math.max(0, y) + "px";
    }

    function showTip(code, clientX, clientY) {
      fillTip(code);
      tip.hidden = false;
      placeTip(clientX, clientY);
    }

    function hideTip() { tip.hidden = true; }

    function stateOf(event) {
      var t = event.target;
      return t && t.getAttribute && t.getAttribute("data-state");
    }

    map.addEventListener("pointermove", function (e) {
      var code = stateOf(e);
      if (code) showTip(code, e.clientX, e.clientY);
      else hideTip();
    });
    map.addEventListener("pointerleave", hideTip);
    // taps on touch screens (no hover): show on tap, hide on tap elsewhere
    map.addEventListener("click", function (e) {
      var code = stateOf(e);
      if (code) showTip(code, e.clientX, e.clientY);
      else hideTip();
      if (code && OPINIONS) selectState(code, true);
    });
    map.addEventListener("keydown", function (e) {
      var code = stateOf(e);
      if (code && OPINIONS && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        selectState(code, true);
      }
    });
    map.addEventListener("focusin", function (e) {
      var code = stateOf(e);
      if (!code) return;
      var r = e.target.getBoundingClientRect();
      showTip(code, r.left + r.width / 2, r.top + r.height / 2);
    });
    map.addEventListener("focusout", hideTip);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });

    // ---- opinions panel (only when the root has data-opinions) ----
    var selected = { senate: null, governors: null };
    var opSection, opTabs, opBody, opSide, opFrame, opSelect, opMain;

    function hasText(office, code) {
      var t = OPINIONS && OPINIONS[office] && OPINIONS[office][code];
      return typeof t === "string" && t.trim() !== "";
    }

    function raceCodes(office) {
      var contest = contests[office];
      if (!contest) return [];
      return Object.keys(contest.races).filter(function (c) { return raceFor(contest, c); })
        .sort(function (a, b) { return STATES.paths[a].name.localeCompare(STATES.paths[b].name); });
    }

    function officeHasOpinions(office) {
      return raceCodes(office).some(function (c) { return hasText(office, c); });
    }

    function firstChoice(office) {
      var codes = raceCodes(office);
      return codes.filter(function (c) { return hasText(office, c); })[0] || codes[0] || null;
    }

    function setHash(office, code) {
      try { history.replaceState(null, "", "#" + office + "-" + code); } catch (e) {}
    }

    function selectState(code, scroll) {
      if (!raceFor(contests[current], code)) return;
      selected[current] = code;
      renderOpinions();
      setHash(current, code);
      if (scroll && opSection) {
        var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
        opSection.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
      }
    }

    function buildOpinions() {
      opSection = h("section", "pc-op");
      opSection.appendChild(h("hr", "pc-op-rule"));
      opSection.appendChild(h("h2", "pc-op-title", "ALAN'S OPINIONS"));
      opTabs = h("div", "pc-tabs pc-op-tabs");
      opTabs.setAttribute("role", "group");
      opTabs.setAttribute("aria-label", "Opinions by office");
      opSection.appendChild(opTabs);
      opBody = h("div", "pc-op-body");
      opSide = h("div", "pc-op-side");
      opFrame = h("div", "pc-op-frame");
      opSelect = h("select", "pc-op-select");
      opSelect.setAttribute("aria-label", "Choose a race");
      opSelect.addEventListener("change", function () { selectState(opSelect.value, false); });
      opSide.appendChild(opFrame);
      opSide.appendChild(opSelect);
      opMain = h("div", "pc-op-main");
      opBody.appendChild(opSide);
      opBody.appendChild(opMain);
      opSection.appendChild(opBody);
      root.appendChild(opSection);
    }

    // the state's own shape, in its rating color
    function drawOutline(code, race) {
      opFrame.textContent = "";
      var p = paths[code];
      var bb;
      try { bb = p.getBBox(); } catch (e) { return; }
      var side = Math.max(bb.width, bb.height) * 1.12;
      var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      var s = svg("svg", { viewBox: [cx - side / 2, cy - side / 2, side, side].join(" "), "aria-hidden": "true" });
      s.appendChild(svg("path", {
        d: STATES.paths[code].d,
        "class": "pc-" + race.lean.toLowerCase() + "-" + race.rating,
        "stroke-width": side / 220
      }));
      var pos = LABEL_AT[code] || STATES.paths[code].label;
      var t = svg("text", { x: pos[0], y: pos[1], "font-size": side * 0.05 });
      t.textContent = code;
      s.appendChild(t);
      opFrame.appendChild(s);
    }

    function renderOpinions() {
      var offices = order.filter(officeHasOpinions);

      // office switch: only offices with at least one opinion, and only if there is a choice
      opTabs.textContent = "";
      offices.forEach(function (key) {
        var b = h("button", "pc-tab", labels[key]);
        b.type = "button";
        b.setAttribute("aria-pressed", String(key === current));
        b.addEventListener("click", function () { show(key); if (selected[key]) setHash(key, selected[key]); });
        opTabs.appendChild(b);
      });
      opTabs.hidden = offices.length < 2;

      opMain.textContent = "";
      if (!selected[current] || !raceFor(contests[current], selected[current])) {
        selected[current] = firstChoice(current);
      }
      var code = selected[current];
      var race = code && raceFor(contests[current], code);

      // highlight the selected state on the map
      Object.keys(paths).forEach(function (c) {
        paths[c].classList.toggle("pc-selected", !!race && c === code);
      });

      if (!race || !officeHasOpinions(current)) {
        opSide.hidden = true;
        opMain.appendChild(h("p", "pc-op-soon", labels[current] + " opinions are coming soon."));
        return;
      }
      opSide.hidden = false;
      drawOutline(code, race);

      opSelect.textContent = "";
      raceCodes(current).forEach(function (c) {
        var o = h("option", null, STATES.paths[c].name);
        o.value = c;
        if (c === code) o.selected = true;
        opSelect.appendChild(o);
      });

      var lean = race.lean.toLowerCase() + "-" + race.rating;
      opMain.appendChild(h("h3", "pc-op-state", STATES.paths[code].name));
      opMain.appendChild(h("p", "pc-op-cands", (race.candidates || []).map(function (c) {
        return c.name + " (" + c.party + ")";
      }).join(" vs. ")));

      var rating = h("p", "pc-op-rating");
      rating.appendChild(document.createTextNode("POLITICAST Rating: "));
      rating.appendChild(h("span", "pc-op-level pc-" + lean, describe(race)));
      rating.appendChild(h("span", "pc-op-margin pc-" + lean, "+" + Number(race.margin).toFixed(1) + "%"));
      opMain.appendChild(rating);

      opMain.appendChild(h("h4", "pc-op-heading", "THE OPINION:"));
      if (hasText(current, code)) {
        OPINIONS[current][code].trim().split(/\n\s*\n/).forEach(function (para) {
          opMain.appendChild(h("p", "pc-op-text", para.replace(/\s*\n\s*/g, " ").trim()));
        });
      } else {
        opMain.appendChild(h("p", "pc-op-text pc-op-soon", "Opinion coming soon."));
      }
    }

    function initialSelection() {
      var m = /^#(senate|governors)-([A-Za-z]{2})$/.exec(window.location.hash || "");
      var office = "senate", code = "TX";
      if (m && STATES.paths[m[2].toUpperCase()]) {
        office = m[1];
        code = m[2].toUpperCase();
      }
      if (contests[office] && raceFor(contests[office], code)) {
        current = office;
        selected[office] = code;
      } else if (raceFor(contests.senate, "TX")) {
        selected.senate = "TX";
      }
    }

    if (OPINIONS) {
      buildOpinions();
      initialSelection();
    }

    show(current);
  }

  function init() {
    var roots = document.querySelectorAll("[data-politicast]");
    for (var i = 0; i < roots.length; i++) mount(roots[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
