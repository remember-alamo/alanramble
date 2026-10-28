// GEORGIACAST widget: Georgia State House and Senate.
// Usage on any page:
//   <link rel="stylesheet" href="georgiacast/georgiacast.css">
//   <div data-georgiacast></div>
//   <script src="georgiacast/districts.js"></script>
//   <script src="georgiacast/data.js"></script>
//   <script src="georgiacast/cities.js"></script>   (optional: city labels in the zoomed view)
//   <script src="georgiacast/georgiacast.js"></script>
// Every element with [data-georgiacast] is turned into a widget. No dependencies.
(function () {
  "use strict";

  var MAP = window.GEORGIACAST_DISTRICTS;
  var DATA = window.GEORGIACAST_DATA;
  var CITIES = window.GEORGIACAST_CITIES || [];
  var NS = "http://www.w3.org/2000/svg";
  var PARTY_NAME = { D: "Democrat", R: "Republican" };
  var CHAMBERS = ["house", "senate"];
  var MODES = [
    { key: "current", label: "Current" },
    { key: "model", label: "Model" },
    { key: "shift", label: "Model Shifts" }
  ];
  // Model Shifts scale: white at 0, the party color at half of SHIFT_MAX, darkest at SHIFT_MAX points and beyond.
  // Matches the SHIFT legend gradient.
  var SHIFT_MAX = 14;
  var SHIFT_STOPS = {
    D: [[255, 255, 255], [47, 79, 224], [0, 0, 122]],
    R: [[255, 255, 255], [200, 32, 43], [107, 0, 0]]
  };
  var mounted = 0;

  function mix(a, b, t) {
    return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")";
  }

  function shiftColor(shift) {
    var t = Math.min(Math.abs(shift) / SHIFT_MAX, 1);
    var s = SHIFT_STOPS[shift < 0 ? "R" : "D"];
    return t < 0.5 ? mix(s[0], s[1], t * 2) : mix(s[1], s[2], t * 2 - 1);
  }

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
    var g = svg("svg", { viewBox: "0 0 200 136", "class": "gc-gauge", "aria-hidden": "true" });
    var arc = "M22,128 A78,78 0 0 1 178,128";
    var back = "M178,128 A78,78 0 0 0 22,128";
    g.appendChild(svg("path", { d: arc, "class": "gc-arc gc-arc-empty", pathLength: 100 }));
    var d = svg("path", { d: arc, "class": "gc-arc gc-arc-d", pathLength: 100 });
    var r = svg("path", { d: back, "class": "gc-arc gc-arc-r", pathLength: 100 });
    g.appendChild(d);
    g.appendChild(r);
    var label = svg("text", { x: 100, y: 5, "class": "gc-majority" });
    label.textContent = "MAJORITY";
    g.appendChild(label);
    g.appendChild(svg("line", { x1: 100, y1: 10, x2: 100, y2: 31, "class": "gc-majority-line" }));
    g.appendChild(svg("path", { d: "M96.5,28 L100,32 L103.5,28", "class": "gc-majority-line" }));
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
    var stateMap = svg("svg", { viewBox: MAP.viewBox, role: "group", "data-map": "state" });
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
    var metroMap = svg("svg", { viewBox: MAP.metro.join(" "), role: "group", preserveAspectRatio: "xMidYMid slice", "data-map": "zoom" });
    metroFrame.appendChild(metroMap);
    metroFig.appendChild(metroFrame);
    metroFig.appendChild(h("figcaption", "gc-cap", "Zoomed View"));
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
    // city labels sit above the districts in the zoomed view only, and never take the pointer
    var cityLayer = svg("g", { "class": "gc-cities", "aria-hidden": "true" });
    metroMap.appendChild(cityLayer);
    var m = MAP.metro;
    var metroBox = svg("rect", { x: m[0], y: m[1], width: m[2], height: m[3], "class": "gc-metro-box" });
    stateMap.appendChild(metroBox);

    // FLIP hatching: one pattern per party per map, resized so stripes stay ~5px apart on screen at any zoom
    var uid = "gc" + (++mounted);
    var hatches = [];
    [stateMap, metroMap].forEach(function (map) {
      var defs = svg("defs", {});
      ["d", "r"].forEach(function (p) {
        var pat = svg("pattern", { id: uid + "-" + map.getAttribute("data-map") + "-flip-" + p, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
        var back = svg("rect", { "class": "gc-hatch-bg" });
        var stripe = svg("rect", { "class": "gc-hatch-" + p });
        pat.appendChild(back);
        pat.appendChild(stripe);
        defs.appendChild(pat);
        hatches.push({ map: map, pat: pat, back: back, stripe: stripe });
      });
      map.insertBefore(defs, map.firstChild);
    });

    function sizeHatches() {
      hatches.forEach(function (x) {
        var px = x.map.getBoundingClientRect().width;
        if (!px) return;
        var period = 5 * parseFloat(x.map.getAttribute("viewBox").split(" ")[2]) / px;
        [x.pat, x.back].forEach(function (n) {
          n.setAttribute("width", period);
          n.setAttribute("height", period);
        });
        x.stripe.setAttribute("width", period / 2);
        x.stripe.setAttribute("height", period);
      });
    }
    if (window.ResizeObserver) new ResizeObserver(sizeHatches).observe(stateMap);

    function seat(num) {
      return DATA[chamber].current[num] || null;
    }

    function modelOf(num) {
      var model = DATA[chamber].model;
      return (model && model.districts[num]) || null;
    }

    // How a district is drawn and described in the current view:
    //   cls / fill  -> the path's class and inline fill
    //   swatch      -> class + inline background for the hover box's color chip
    //   text        -> the hover box line (and screen-reader label)
    function look(num, map) {
      var s = seat(num);
      if (mode === "current") {
        if (!s || !s.party) return { cls: "gc-gray", text: "Vacant" };
        var p = s.party.toLowerCase();
        return { cls: "gc-" + p, swatch: "gc-sw-" + p, text: s.name + " (" + s.party + ")" };
      }
      var md = modelOf(num);
      if (!md) return { cls: "gc-gray", text: "Model coming soon" };
      if (mode === "model") {
        var win = md.margin > 0 ? "D" : "R";
        var w = win.toLowerCase();
        var flip = !!(s && s.party && s.party !== win);
        return {
          cls: flip ? "gc-flip" : "gc-" + w,
          fill: flip ? "url(#" + uid + "-" + (map ? map.getAttribute("data-map") : "state") + "-flip-" + w + ")" : "",
          swatch: "gc-sw-" + w + (flip ? " gc-sw-flip" : ""),
          text: PARTY_NAME[win] + " " + (flip ? "FLIP" : "HOLD"),
          detail: "Modeled margin of " + win + "+" + Math.abs(md.margin).toFixed(1) + "%"
        };
      }
      var color = shiftColor(md.shift);
      return {
        cls: "gc-shift",
        fill: color,
        swatchBg: color,
        text: PARTY_NAME[md.shift < 0 ? "R" : "D"] + " shift of " + Math.abs(md.shift).toFixed(1) + "%"
      };
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
      [[stateLayer, stateMap], [metroLayer, metroMap]].forEach(function (pair) {
        Array.prototype.forEach.call(pair[0].childNodes, function (p) {
          var num = p.getAttribute("data-district");
          var l = look(num, pair[1]);
          p.setAttribute("class", l.cls);
          p.style.fill = l.fill || "";
          p.setAttribute("aria-label", label + " District " + num + ": " + l.text + (l.detail ? ", " + l.detail : ""));
        });
      });
      sizeHatches();
    }

    // seats by party: who holds them now, or who the model has winning them
    function count() {
      var t = { D: 0, R: 0 };
      if (mode === "current") {
        var cur = DATA[chamber].current;
        Object.keys(cur).forEach(function (k) {
          if (cur[k].party in t) t[cur[k].party] += 1;
        });
        return t;
      }
      var model = DATA[chamber].model;
      if (!model) return null;
      Object.keys(model.districts).forEach(function (k) {
        t[model.districts[k].margin > 0 ? "D" : "R"] += 1;
      });
      return t;
    }

    function drawTally() {
      var seats = DATA[chamber].seats;
      var t = count();
      if (!t) {
        gauge.d.style.strokeDasharray = "0 100";
        gauge.r.style.strokeDasharray = "0 100";
        numD.textContent = "–";
        numR.textContent = "–";
        tally.classList.add("gc-tally-empty");
        tally.setAttribute("aria-label", "Model coming soon");
        return;
      }
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
      metroMap.setAttribute("aria-label", "Zoomed view of State " + DATA[chamber].label + " districts");
      hideTip();
      if (drawn !== chamber) { drawDistricts(); drawn = chamber; }
      paint();
      drawTally();
    }

    // ---- hover box ----
    function fillTip(num) {
      tip.textContent = "";
      tip.appendChild(h("strong", "gc-tip-name", DATA[chamber].label + " District " + num));
      var l = look(num);
      if (!l.swatch && !l.swatchBg) {
        tip.appendChild(h("div", "gc-tip-none", l.text));
        return;
      }
      var row = h("div", "gc-tip-holder");
      var sw = h("span", "gc-sw " + (l.swatch || ""));
      if (l.swatchBg) sw.style.background = l.swatchBg;
      row.appendChild(sw);
      row.appendChild(h("span", null, l.text));
      tip.appendChild(row);
      if (l.detail) tip.appendChild(h("div", null, l.detail));
      if (mode === "current") tip.appendChild(h("div", null, "Held by " + PARTY_NAME[seat(num).party] + "s"));
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
        if (panning) return;
        var t = districtOf(e);
        if (t) showTip(t, e.clientX, e.clientY);
        else hideTip();
      });
      map.addEventListener("pointerleave", hideTip);
      map.addEventListener("click", function (e) {
        if (dragged) { dragged = false; return; }
        var t = districtOf(e);
        if (t) showTip(t, e.clientX, e.clientY);
        else hideTip();
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });

    // ---- inset pan / zoom ----
    // The inset's viewBox is the camera. It can't zoom out past the starting Atlanta box,
    // and can't pan off the state. The box on the statewide map follows it.
    var MAX_ZOOM = 8;
    var home = MAP.metro.slice();
    var bounds = MAP.viewBox.split(" ").map(Number);
    var view = home.slice();
    var pointers = {};
    var panning = false, dragged = false, last = null;

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function setView(x, y, w) {
      w = clamp(w, home[2] / MAX_ZOOM, home[2]);
      var hgt = w * home[3] / home[2];
      x = clamp(x, bounds[0], bounds[0] + bounds[2] - w);
      y = clamp(y, bounds[1], bounds[1] + bounds[3] - hgt);
      view = [x, y, w, hgt];
      metroMap.setAttribute("viewBox", view.join(" "));
      metroBox.setAttribute("x", x);
      metroBox.setAttribute("y", y);
      metroBox.setAttribute("width", w);
      metroBox.setAttribute("height", hgt);
      zoomOut.disabled = w >= home[2];
      zoomIn.disabled = w <= home[2] / MAX_ZOOM + 1e-6;
      reset.disabled = view.join() === home.join();
      sizeHatches();
      placeCities();
    }

    // ---- city labels ----
    // Bigger cities show first: 60k+ at the starting zoom, 40k+ from 2x, everything from 3x.
    // Labels are drawn in screen pixels (scaled back by the zoom) so they stay the same size,
    // A label goes right of its dot, or left if that's blocked or would run off the frame;
    // if neither side has room it waits until you zoom in.
    var CITY_TIERS = [[3, 0], [2, 40000], [1, 60000]];
    var cities = CITIES.map(function (c) {
      var g = svg("g", {});
      g.appendChild(svg("circle", { cx: 0, cy: 0, r: 3.5 }));
      var t = svg("text", { x: 7, y: 0 });
      t.textContent = c[0];
      g.appendChild(t);
      g.style.display = "none";
      cityLayer.appendChild(g);
      return { name: c[0], pop: c[1], x: c[2], y: c[3], g: g, text: t, w: null };
    });

    function placeCities() {
      var px = metroMap.getBoundingClientRect().width;
      if (!px || !controls) return;
      var u = view[2] / px;
      var zoom = home[2] / view[2];
      var minPop = CITY_TIERS.filter(function (t) { return zoom >= t[0] - 1e-6; })[0][1];
      // keep clear of the zoom buttons
      var frame = metroMap.getBoundingClientRect(), btns = controls.getBoundingClientRect();
      var placed = [[btns.left - frame.left - 3, btns.top - frame.top - 3, btns.right - frame.left + 3, btns.bottom - frame.top + 3]];
      cities.forEach(function (c) {
        var sx = (c.x - view[0]) / u, sy = (c.y - view[1]) / u;
        var show = c.pop >= minPop && sx >= 0 && sx <= px && sy >= 0 && sy <= px * view[3] / view[2];
        if (show) {
          c.g.style.display = "";
          if (c.w == null) c.w = c.text.getComputedTextLength();
          var sides = [[sx - 5, sy - 7, sx + 9 + c.w, sy + 7], [sx - 9 - c.w, sy - 7, sx + 5, sy + 7]];
          var side = [0, 1].filter(function (i) {
            var box = sides[i];
            return box[0] >= 0 && box[2] <= px && !placed.some(function (b) {
              return box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1];
            });
          })[0];
          show = side != null;
          if (show) {
            placed.push(sides[side]);
            c.text.setAttribute("x", side ? -7 : 7);
            c.text.setAttribute("text-anchor", side ? "end" : "start");
          }
        }
        c.g.style.display = show ? "" : "none";
        if (show) c.g.setAttribute("transform", "translate(" + c.x + "," + c.y + ") scale(" + u + ")");
      });
    }
    if (window.ResizeObserver) new ResizeObserver(placeCities).observe(metroMap);

    // zoom by `factor` keeping the map point under (clientX, clientY) in place
    function zoomAt(factor, clientX, clientY) {
      var r = metroMap.getBoundingClientRect();
      var fx = (clientX - r.left) / r.width, fy = (clientY - r.top) / r.height;
      var w = clamp(view[2] / factor, home[2] / MAX_ZOOM, home[2]);
      var hgt = w * home[3] / home[2];
      setView(view[0] + fx * view[2] - fx * w, view[1] + fy * view[3] - fy * hgt, w);
    }

    function zoomCenter(factor) {
      var r = metroMap.getBoundingClientRect();
      zoomAt(factor, r.left + r.width / 2, r.top + r.height / 2);
    }

    function panBy(dxPx, dyPx) {
      var r = metroMap.getBoundingClientRect();
      setView(view[0] - dxPx * view[2] / r.width, view[1] - dyPx * view[3] / r.height, view[2]);
    }

    // centroid and spread of the active pointers (spread drives pinch zoom)
    function gesture() {
      var ids = Object.keys(pointers), x = 0, y = 0, d = 0;
      ids.forEach(function (id) { x += pointers[id].x; y += pointers[id].y; });
      x /= ids.length; y /= ids.length;
      if (ids.length > 1) d = Math.hypot(pointers[ids[0]].x - pointers[ids[1]].x, pointers[ids[0]].y - pointers[ids[1]].y);
      return { x: x, y: y, d: d, n: ids.length };
    }

    metroMap.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      last = gesture();
      dragged = false;
    });

    window.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var g = gesture();
      if (!panning && Math.hypot(g.x - last.x, g.y - last.y) < 4 && g.n === last.n && g.n < 2) return;
      if (!panning) { panning = true; metroFrame.classList.add("gc-dragging"); hideTip(); }
      dragged = true;
      if (g.n === last.n) {
        if (g.n > 1 && last.d) zoomAt(g.d / last.d, g.x, g.y);
        panBy(g.x - last.x, g.y - last.y);
      }
      last = g;
    });

    function endPointer(e) {
      if (!pointers[e.pointerId]) return;
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length) { last = gesture(); return; }
      panning = false;
      metroFrame.classList.remove("gc-dragging");
    }
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);

    // wheel zooms the inset; once fully zoomed out, scrolling further out scrolls the page as usual
    metroMap.addEventListener("wheel", function (e) {
      if (e.deltaY > 0 && view[2] >= home[2]) return;
      e.preventDefault();
      hideTip();
      zoomAt(Math.pow(1.0015, -e.deltaY * (e.deltaMode === 1 ? 16 : 1)), e.clientX, e.clientY);
    }, { passive: false });

    metroMap.addEventListener("dblclick", function (e) {
      e.preventDefault();
      zoomAt(2, e.clientX, e.clientY);
    });

    var controls = h("div", "gc-zoom");
    var zoomIn = h("button", "gc-zoom-btn", "+");
    var zoomOut = h("button", "gc-zoom-btn", "−");
    var reset = h("button", "gc-zoom-btn gc-zoom-reset", "↺");
    zoomIn.setAttribute("aria-label", "Zoom in");
    zoomOut.setAttribute("aria-label", "Zoom out");
    reset.setAttribute("aria-label", "Reset zoomed view");
    [zoomIn, zoomOut, reset].forEach(function (b) { b.type = "button"; controls.appendChild(b); });
    zoomIn.addEventListener("click", function () { zoomCenter(2); });
    zoomOut.addEventListener("click", function () { zoomCenter(0.5); });
    reset.addEventListener("click", function () { setView(home[0], home[1], home[2]); });
    metroFrame.appendChild(controls);

    // arrow keys pan, +/- zoom, when the inset has focus
    metroMap.setAttribute("tabindex", "0");
    metroMap.addEventListener("keydown", function (e) {
      var r = metroMap.getBoundingClientRect(), step = r.width / 8;
      var k = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
      if (k) panBy(k[0], k[1]);
      else if (e.key === "+" || e.key === "=") zoomCenter(2);
      else if (e.key === "-") zoomCenter(0.5);
      else return;
      e.preventDefault();
    });

    setView(home[0], home[1], home[2]);
    render();
  }

  function init() {
    var roots = document.querySelectorAll("[data-georgiacast]");
    for (var i = 0; i < roots.length; i++) mount(roots[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
