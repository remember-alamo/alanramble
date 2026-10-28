// GEORGIACAST widget: Georgia State House and Senate.
// Usage on any page:
//   <link rel="stylesheet" href="georgiacast/georgiacast.css">
//   <div data-georgiacast></div>
//   <script src="georgiacast/districts.js"></script>
//   <script src="georgiacast/data.js"></script>
//   <script src="georgiacast/georgiacast.js"></script>
// Every element with [data-georgiacast] is turned into a widget. No dependencies.
(function () {
  "use strict";

  var MAP = window.GEORGIACAST_DISTRICTS;
  var DATA = window.GEORGIACAST_DATA;
  var NS = "http://www.w3.org/2000/svg";
  var PARTY_NAME = { D: "Democrat", R: "Republican" };
  var CHAMBERS = ["house", "senate"];
  var MODES = [
    { key: "current", label: "Current" },
    { key: "model", label: "Model" },
    { key: "shift", label: "Model Shifts" }
  ];

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

  function tab(label) {
    var b = h("button", "gc-tab", label);
    b.type = "button";
    return b;
  }

  function buildLegend() {
    var legend = h("div", "gc-legend");
    [["HOLD", ["gc-sw gc-sw-r", "gc-sw gc-sw-d"]],
     ["FLIP", ["gc-sw gc-sw-r gc-sw-flip", "gc-sw gc-sw-d gc-sw-flip"]],
     ["SHIFT", ["gc-sw gc-sw-shift"]]].forEach(function (item) {
      var row = h("span", "gc-legend-item");
      row.appendChild(h("span", "gc-legend-label", item[0]));
      item[1].forEach(function (c) { row.appendChild(h("span", c)); });
      legend.appendChild(row);
    });
    return legend;
  }

  // semicircle seat gauge: D fills from the left, R from the right, majority marked at the top
  function buildGauge() {
    var g = svg("svg", { viewBox: "0 0 200 118", "class": "gc-gauge", "aria-hidden": "true" });
    var arc = "M22,110 A78,78 0 0 1 178,110";
    var back = "M178,110 A78,78 0 0 0 22,110";
    g.appendChild(svg("path", { d: arc, "class": "gc-arc gc-arc-empty", pathLength: 100 }));
    var d = svg("path", { d: arc, "class": "gc-arc gc-arc-d", pathLength: 100 });
    var r = svg("path", { d: back, "class": "gc-arc gc-arc-r", pathLength: 100 });
    g.appendChild(d);
    g.appendChild(r);
    var label = svg("text", { x: 100, y: 7, "class": "gc-majority" });
    label.textContent = "MAJORITY";
    g.appendChild(label);
    g.appendChild(svg("line", { x1: 100, y1: 12, x2: 100, y2: 22, "class": "gc-majority-line" }));
    g.appendChild(svg("path", { d: "M96.5,19 L100,24 L103.5,19", "class": "gc-majority-line" }));
    return { node: g, d: d, r: r };
  }

  function mount(root) {
    if (!MAP || !DATA) {
      root.textContent = "GEORGIACAST data failed to load.";
      return;
    }

    var chamber = "house";
    var mode = "current";

    root.classList.add("gc");

    var grid = h("div", "gc-grid");
    var left = h("div", "gc-left");
    var right = h("div", "gc-right");
    grid.appendChild(left);
    grid.appendChild(right);
    root.appendChild(grid);

    // left: legend, chamber switch, statewide map
    left.appendChild(buildLegend());
    var chamberTabs = h("div", "gc-tabs");
    chamberTabs.setAttribute("role", "group");
    chamberTabs.setAttribute("aria-label", "Chamber");
    var chamberButtons = {};
    CHAMBERS.forEach(function (key) {
      var b = tab(DATA[key].label);
      b.addEventListener("click", function () { chamber = key; render(); });
      chamberTabs.appendChild(b);
      chamberButtons[key] = b;
    });
    left.appendChild(chamberTabs);

    var stateFig = h("figure", "gc-fig");
    var stateFrame = h("div", "gc-frame gc-frame-state");
    var stateMap = svg("svg", { viewBox: MAP.viewBox, role: "group" });
    stateFrame.appendChild(stateMap);
    stateFig.appendChild(stateFrame);
    stateFig.appendChild(h("figcaption", "gc-cap", "All Districts"));
    left.appendChild(stateFig);

    // right: seat gauge, tally, Atlanta inset
    var gauge = buildGauge();
    right.appendChild(gauge.node);
    var tally = h("div", "gc-tally");
    var numD = h("span", "gc-num gc-num-d");
    var numR = h("span", "gc-num gc-num-r");
    tally.appendChild(numD);
    tally.appendChild(h("span", "gc-vs", "vs"));
    tally.appendChild(numR);
    right.appendChild(tally);

    var metroFig = h("figure", "gc-fig gc-fig-metro");
    var metroFrame = h("div", "gc-frame gc-frame-metro");
    var metroMap = svg("svg", { viewBox: MAP.metro.join(" "), role: "group", preserveAspectRatio: "xMidYMid slice" });
    metroFrame.appendChild(metroMap);
    metroFig.appendChild(metroFrame);
    metroFig.appendChild(h("figcaption", "gc-cap", "Atlanta Metro"));
    right.appendChild(metroFig);

    // bottom: view switch
    var modeTabs = h("div", "gc-tabs gc-modes");
    modeTabs.setAttribute("role", "group");
    modeTabs.setAttribute("aria-label", "View");
    var modeButtons = {};
    MODES.forEach(function (m) {
      var b = tab(m.label);
      b.addEventListener("click", function () { mode = m.key; render(); });
      modeTabs.appendChild(b);
      modeButtons[m.key] = b;
    });
    root.appendChild(modeTabs);

    var tip = h("div", "gc-tip");
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    root.appendChild(tip);

    var stateLayer = svg("g", {});
    var metroLayer = svg("g", {});
    stateMap.appendChild(stateLayer);
    metroMap.appendChild(metroLayer);
    var m = MAP.metro;
    stateMap.appendChild(svg("rect", { x: m[0], y: m[1], width: m[2], height: m[3], "class": "gc-metro-box" }));

    function seat(num) {
      return DATA[chamber].current[num] || null;
    }

    function fillClass(num) {
      if (mode !== "current") return "gc-gray";
      var s = seat(num);
      return s && s.party ? "gc-" + s.party.toLowerCase() : "gc-gray";
    }

    function drawDistricts() {
      var shapes = MAP[chamber];
      [stateLayer, metroLayer].forEach(function (layer) {
        layer.textContent = "";
        Object.keys(shapes).forEach(function (num) {
          layer.appendChild(svg("path", { d: shapes[num], "data-district": num }));
        });
      });
    }

    function paint() {
      var label = DATA[chamber].label;
      [stateLayer, metroLayer].forEach(function (layer) {
        Array.prototype.forEach.call(layer.childNodes, function (p) {
          var num = p.getAttribute("data-district");
          p.setAttribute("class", fillClass(num));
          var s = seat(num);
          p.setAttribute("aria-label", label + " District " + num +
            (mode === "current" && s ? ": " + s.name + " (" + s.party + ")" : ""));
        });
      });
    }

    function count() {
      var t = { D: 0, R: 0 };
      var cur = DATA[chamber].current;
      Object.keys(cur).forEach(function (k) {
        if (cur[k].party in t) t[cur[k].party] += 1;
      });
      return t;
    }

    function drawTally() {
      var seats = DATA[chamber].seats;
      if (mode !== "current") {
        gauge.d.style.strokeDasharray = "0 100";
        gauge.r.style.strokeDasharray = "0 100";
        numD.textContent = "–";
        numR.textContent = "–";
        tally.classList.add("gc-tally-empty");
        tally.setAttribute("aria-label", "Model coming soon");
        return;
      }
      var t = count();
      gauge.d.style.strokeDasharray = (t.D / seats * 100) + " 100";
      gauge.r.style.strokeDasharray = (t.R / seats * 100) + " 100";
      numD.textContent = t.D;
      numR.textContent = t.R;
      tally.classList.remove("gc-tally-empty");
      tally.setAttribute("aria-label", "Democrats " + t.D + ", Republicans " + t.R);
    }

    var drawn = null;
    function render() {
      CHAMBERS.forEach(function (k) { chamberButtons[k].setAttribute("aria-pressed", String(k === chamber)); });
      MODES.forEach(function (x) { modeButtons[x.key].setAttribute("aria-pressed", String(x.key === mode)); });
      stateMap.setAttribute("aria-label", "Map of Georgia State " + DATA[chamber].label + " districts");
      metroMap.setAttribute("aria-label", "Atlanta metro State " + DATA[chamber].label + " districts");
      hideTip();
      if (drawn !== chamber) { drawDistricts(); drawn = chamber; }
      paint();
      drawTally();
    }

    // ---- hover box ----
    function fillTip(num) {
      tip.textContent = "";
      tip.appendChild(h("strong", "gc-tip-name", DATA[chamber].label + " District " + num));
      if (mode !== "current") {
        tip.appendChild(h("div", "gc-tip-none", "Model coming soon"));
        return;
      }
      var s = seat(num);
      if (!s || !s.party) {
        tip.appendChild(h("div", "gc-tip-none", "Vacant"));
        return;
      }
      var row = h("div", "gc-tip-holder");
      row.appendChild(h("span", "gc-sw gc-sw-" + s.party.toLowerCase()));
      row.appendChild(h("span", null, s.name + " (" + s.party + ")"));
      tip.appendChild(row);
      tip.appendChild(h("div", null, "Held by " + PARTY_NAME[s.party] + "s"));
    }

    function placeTip(clientX, clientY) {
      var box = root.getBoundingClientRect();
      var x = clientX - box.left + 14;
      var y = clientY - box.top + 14;
      if (x + tip.offsetWidth > box.width) x = clientX - box.left - tip.offsetWidth - 14;
      if (y + tip.offsetHeight > box.height) y = clientY - box.top - tip.offsetHeight - 14;
      tip.style.left = Math.max(0, x) + "px";
      tip.style.top = Math.max(0, y) + "px";
    }

    var hovered = null;
    function showTip(target, clientX, clientY) {
      var num = target.getAttribute("data-district");
      // bring the hovered shape to the front so its outline isn't covered by neighbors
      if (hovered !== target) {
        target.parentNode.appendChild(target);
        hovered = target;
      }
      fillTip(num);
      tip.hidden = false;
      placeTip(clientX, clientY);
    }

    function hideTip() { tip.hidden = true; hovered = null; }

    function districtOf(e) {
      var t = e.target;
      return t && t.getAttribute && t.getAttribute("data-district") ? t : null;
    }

    [stateMap, metroMap].forEach(function (map) {
      map.addEventListener("pointermove", function (e) {
        var t = districtOf(e);
        if (t) showTip(t, e.clientX, e.clientY);
        else hideTip();
      });
      map.addEventListener("pointerleave", hideTip);
      map.addEventListener("click", function (e) {
        var t = districtOf(e);
        if (t) showTip(t, e.clientX, e.clientY);
        else hideTip();
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });

    render();
  }

  function init() {
    var roots = document.querySelectorAll("[data-georgiacast]");
    for (var i = 0; i < roots.length; i++) mount(roots[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
