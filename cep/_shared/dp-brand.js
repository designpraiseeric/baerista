/* DesignPraise brand kit for CEP panels — copied into each extension's dp/ folder by build.py.
 * Usage: <div class="dp-foot" data-id="dockview" data-name="DockView" data-version="2.0.0"></div>
 *        then load CSInterface.js and dp/dp-brand.js. Sets data-theme on <html> from AE's panel colour. */
(function () {
  "use strict";
  var SITE = "https://designpraiseeric.pages.dev/soon";
  var REGISTRY = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/registry.json";
  var BAR_ID = "com.designpraise.baerista.panel";
  var WORDMARK = "@@WORDMARK@@";
  var cs = (typeof CSInterface !== "undefined") ? new CSInterface() : null;

  function cmp(a, b) {
    var x = String(a).split("."), y = String(b).split(".");
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var p = +(x[i] || 0), q = +(y[i] || 0);
      if (p !== q) return p > q ? 1 : -1;
    }
    return 0;
  }
  function open(url) { if (cs) cs.openURLInDefaultBrowser(url); else window.open(url, "_blank"); }

  function theme() {
    var pref = "auto";
    try { pref = localStorage.getItem("dp.theme") || "auto"; } catch (e) {}
    var t = pref;
    if (pref === "auto") {
      t = "night";
      try {
        var c = cs.getHostEnvironment().appSkinInfo.panelBackgroundColor.color;
        t = (0.299 * c.red + 0.587 * c.green + 0.114 * c.blue) < 128 ? "night" : "day";
      } catch (e) {}
    }
    document.documentElement.setAttribute("data-theme", t);
  }
  theme();
  if (cs) cs.addEventListener("com.adobe.csxs.events.ThemeColorChanged", theme);
  window.DPBrand = { setTheme: function (p) { try { localStorage.setItem("dp.theme", p); } catch (e) {} theme(); }, open: open };

  function footer() {
    var f = document.querySelector(".dp-foot");
    if (!f) return;
    var id = f.getAttribute("data-id"), name = f.getAttribute("data-name"), ver = f.getAttribute("data-version");
    f.innerHTML = '<span><span class="dp-ver"></span><a class="dp-upd" hidden></a></span><span class="dp-mark" title="designpraise — visit the site"></span>';
    f.querySelector(".dp-ver").textContent = name + " " + ver;
    var mark = f.querySelector(".dp-mark");
    mark.innerHTML = WORDMARK;
    mark.addEventListener("click", function () { open(SITE); });

    // Tell the user about updates; Baerista installs them, otherwise point at the release.
    var show = function (entry) {
      var a = f.querySelector(".dp-upd");
      a.textContent = "· " + entry.version + " available";
      a.title = entry.changelog || "";
      a.hidden = false;
      a.onclick = function () {
        if (cs && cs.requestOpenExtension) { try { cs.requestOpenExtension(BAR_ID, ""); return; } catch (e) {} }
        open(entry.gumroad || "https://github.com/designpraiseeric/baerista");
      };
    };
    fetch(REGISTRY + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (reg) {
      for (var i = 0; i < reg.tools.length; i++) {
        if (reg.tools[i].id === id && cmp(reg.tools[i].version, ver) > 0) show(reg.tools[i]);
      }
    }).catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", footer); else footer();
})();
