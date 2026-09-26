/**
 * GitHub Pages serves the site; the contact API runs on Vercel.
 * After deploying this repo to Vercel, set API_BASE to that project URL (no trailing slash).
 */
(function () {
  'use strict';

  var API_BASE = 'https://myportfolio-navy-seven-46.vercel.app';

  var endpoint = API_BASE + '/api/contact';

  document.querySelectorAll('.php-email-form').forEach(function (form) {
    form.setAttribute('action', endpoint);
  });
})();
