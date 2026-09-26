/**
 * GitHub Pages serves the site; the contact API runs on Vercel.
 * After deploying this repo to Vercel, set API_BASE to that project URL (no trailing slash).
 */
(function () {
  'use strict';

  var API_BASE = 'https://YOUR_VERCEL_PROJECT.vercel.app';

  if (API_BASE.indexOf('YOUR_VERCEL_PROJECT') !== -1) {
    console.warn(
      'Contact form: set API_BASE in assets/js/contact-endpoint.js after deploying the API to Vercel.'
    );
  }

  var endpoint = API_BASE + '/api/contact';

  document.querySelectorAll('.php-email-form').forEach(function (form) {
    form.setAttribute('action', endpoint);
  });
})();
