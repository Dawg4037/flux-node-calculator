// Applies the saved theme before the page paints, so there's no flash of the wrong theme.
// Loaded as a file (not inline) to keep the Content-Security-Policy strict.
try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
} catch (e) {}
