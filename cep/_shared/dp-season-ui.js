/* DesignPraise season strip for CEP panels. build.py writes dp/dp-season.js = lib/dp-seasons.js + this file.
 * DPSeasonUI.mount(footerEl) puts a one-line greeting just above the footer on special days.
 * Click it for the verse. Preview a date: localStorage.setItem("dp.seasonDate", "2026-12-25") then reload. */
(function () {
  "use strict";
  if (typeof DPSeasons === "undefined") return;

  var CSS =
    ".dp-season{display:flex;align-items:center;gap:8px;padding:6px 10px;border-top:1px solid var(--line);background:var(--bg);" +
    "font:600 11px/1.3 var(--sans,system-ui);color:var(--ink);cursor:pointer;user-select:none;flex:0 0 auto;position:relative;overflow:hidden}" +
    ".dp-season:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,var(--dp-s),var(--dp-s2) 60%,var(--dp-s3));opacity:.12;transition:opacity .4s cubic-bezier(.16,1,.3,1)}" +
    ".dp-season:hover:before{opacity:.2}" +
    ".dp-season:after{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,var(--dp-s),var(--dp-s2),var(--dp-s3))}" +
    ".dp-season i{width:22px;height:22px;flex:none;position:relative;animation:dpSeasonTurn .9s cubic-bezier(.7,0,.2,1) both}" +
    ".dp-season i svg{width:100%;height:100%;display:block}" +
    ".dp-season-more .art{float:left;width:54px;height:54px;margin:0 10px 4px 0}.dp-season-more .art svg{width:100%;height:100%}" +
    ".dp-season-more:after{content:'';display:block;clear:both}" +
    ".dp-season b{font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".dp-season small{margin-left:auto;font:500 10px var(--mono,monospace);color:var(--mute);white-space:nowrap}" +
    ".dp-season-more{display:none;padding:8px 10px 10px;border-top:1px dashed var(--line);background:var(--bg);font:11px/1.45 var(--sans,system-ui);color:var(--mute);flex:0 0 auto}" +
    ".dp-season-more q{display:block;color:var(--ink);margin-top:4px;quotes:'\\201C' '\\201D'}" +
    ".dp-season-more cite{display:block;font:500 10px var(--mono,monospace);margin-top:4px;font-style:normal}" +
    ".dp-season.open+.dp-season-more{display:block;animation:dpSeasonRise .35s cubic-bezier(.16,1,.3,1) both}" +
    "@keyframes dpSeasonTurn{from{transform:perspective(80px) rotateY(-90deg);opacity:0}}" +
    "@keyframes dpSeasonRise{from{opacity:0;transform:translateY(6px)}}" +
    "@media (prefers-reduced-motion:reduce){.dp-season i,.dp-season.open+.dp-season-more{animation:none}}";

  function today() {
    var when = null;
    try { when = DPSeasons.parse(localStorage.getItem("dp.seasonDate")); } catch (e) {}
    return DPSeasons.get(when || new Date());
  }

  function mount(footer) {
    var s = today();
    if (!s || !footer || !footer.parentNode) return null;
    if (!document.getElementById("dp-season-css")) {
      var st = document.createElement("style"); st.id = "dp-season-css"; st.textContent = CSS;
      document.head.appendChild(st);
    }
    var strip = document.createElement("div");
    strip.className = "dp-season";
    strip.setAttribute("role", "button");
    strip.setAttribute("tabindex", "0");
    strip.setAttribute("aria-expanded", "false");
    var c = s.colors || [s.accent, s.accent, s.accent];
    strip.style.setProperty("--dp-s", c[0]); strip.style.setProperty("--dp-s2", c[1]); strip.style.setProperty("--dp-s3", c[2]);
    var art = (typeof DPSeasonArt !== "undefined") ? DPSeasonArt.svg(s) : "";
    strip.innerHTML = "<i></i><b></b><small></small>";
    strip.querySelector("i").innerHTML = art;
    strip.querySelector("b").textContent = s.title;
    strip.querySelector("small").textContent = s.ref;
    strip.title = s.line;

    var more = document.createElement("div");
    more.className = "dp-season-more";
    more.innerHTML = (art ? '<div class="art"></div>' : "") + "<span></span><q></q><cite></cite>";
    if (art) more.querySelector(".art").innerHTML = art;
    more.querySelector("span").textContent = s.line;
    more.querySelector("q").textContent = s.verse;
    more.querySelector("cite").textContent = s.ref + " (KJV)";

    function toggle() {
      var open = strip.classList.toggle("open");
      strip.setAttribute("aria-expanded", open ? "true" : "false");
    }
    strip.addEventListener("click", toggle);
    strip.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });

    footer.parentNode.insertBefore(strip, footer);
    footer.parentNode.insertBefore(more, footer);
    return s;
  }

  window.DPSeasonUI = { mount: mount, today: today };
})();
