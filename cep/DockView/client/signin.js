(function () {
  "use strict";

  var input = document.getElementById("url-input");
  var goBtn = document.getElementById("go");

  function getParam(name) {
    var search = window.location.search || "";
    var match = new RegExp("[?&]" + name + "=([^&]*)").exec(search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
  }

  function go(url) {
    if (!url) return;
    window.location.href = url;
  }

  var target = getParam("url");
  if (target) {
    input.value = target;
    go(target);
  }

  goBtn.addEventListener("click", function () { go(input.value.trim()); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") go(input.value.trim());
  });
})();
