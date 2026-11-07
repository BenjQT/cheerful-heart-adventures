/* =====================================================================
   Cheerful Heart Adventures — install + offline helper
   Registers sw.js (offline play) when the page is served over http(s).
   Opening the files straight from disk (file://) still works, just without
   offline caching. Nothing here talks to any server other than this site.
   ===================================================================== */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});
  const sw = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol);
  CH.pwa = {
    supported: sw,
    /** true when running as an installed app (home-screen icon) */
    get installed() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  };
  if (!sw) return;
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline play just stays off */ });
  });
})();
