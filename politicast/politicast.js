// POLITICAST widget.
// Usage on any page:
//   <link rel="stylesheet" href="politicast/politicast.css">
//   <div data-politicast></div>
//   <script src="politicast/states.js"></script>
//   <script src="politicast/data.js"></script>
//   <script src="politicast/politicast.js"></script>
// Every element with [data-politicast] is turned into a widget. No dependencies.
(function () {
  "use strict";

  var STATES = window.POLITICAST_STATES;
  var DATA = window.POLITICAST_DATA;
  var NS = "http://www.w3.org/2000/svg";
  var LEVELS = ["safe", "likely", "lean", "tilt"];
  var LEVEL_LABEL = { safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt" };
  var PARTY_NAME = { D: "Democratic", R: "Republican" };

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

  function margin(race) {
    return race.lean + "+" + Number(race.margin).toFixed(1);
  }

  function describe(race) {
    return LEVEL_LABEL[race.rating] + " " + PARTY_NAME[race.lean];
  }

  function tally(contest) {
    var t = { D: {}, R: {} };
    LEVELS.forEach(function (l) { t.D[l] = 0; t.R[l] = 0; });
    var hold = contest.holdovers || {};
    t.D.safe += hold.D || 0;
    t.R.safe += hold.R || 0;
    Object.keys(contest.races).forEach(function (code) {
      var r = contest.races[code];
      t[r.lean][r.rating] += 1;
    });
    return t;
  }

  function sum(counts) {
    return LEVELS.reduce(function (a, l) { return a + counts[l]; }, 0);
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
    addCells("D", LEVELS);
    addCells("R", LEVELS.slice().reverse());
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
      b.addEventListener("click", function () { show(key); });
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

    var paths = {};
    Object.keys(STATES.paths).forEach(function (code) {
      var p = svg("path", { d: STATES.paths[code].d, "data-state": code });
      map.appendChild(p);
      paths[code] = p;
    });

    function stateInfo(code) {
      var contest = contests[current];
      var race = contest && contest.races && contest.races[code];
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
        var race = contest && contest.races[code];
        p.setAttribute("class", race ? "pc-" + race.lean.toLowerCase() + "-" + race.rating : "pc-none");
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
    });
    map.addEventListener("focusin", function (e) {
      var code = stateOf(e);
      if (!code) return;
      var r = e.target.getBoundingClientRect();
      showTip(code, r.left + r.width / 2, r.top + r.height / 2);
    });
    map.addEventListener("focusout", hideTip);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });

    show(current);
  }

  function init() {
    var roots = document.querySelectorAll("[data-politicast]");
    for (var i = 0; i < roots.length; i++) mount(roots[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
