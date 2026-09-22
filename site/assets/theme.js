/* Applies a saved theme choice before first paint, so there is no flash. */
(function () {
  try {
    var t = localStorage.getItem('iu-theme');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* storage unavailable: follow the system theme */ }
})();
