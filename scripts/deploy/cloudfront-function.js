// CloudFront Function — runtime cloudfront-js-2.0, event type viewer-request.
//
// Committed as the single source of truth. bootstrap.sh feeds this file to
// create-function / update-function. Never edit it in the AWS console.
//
// Why this exists instead of CloudFront custom error responses: the usual
// 403/404 -> /index.html 200 recipe is distribution-wide, so an API 401 would
// arrive as an HTML 200. src/shared/composables/useApi.ts gates the whole
// token-refresh path on `error.response?.status !== 401`, so that rule silently
// disables auth refresh. See context/foundation/infrastructure.md, risk row 1.
//
// event.request.uri never contains the query string — CloudFront exposes it
// separately as event.request.querystring and reassembles it onto the origin
// request. Rewriting `uri` therefore preserves ?foo=bar with no extra code.

function handler(event) {
  var request = event.request
  var uri = request.uri

  // Never rewrite API paths. Mirrors navigateFallbackDenylist [/^\/api\//] in
  // vite.config.ts. Without this, GET /api/v1/stays has no extension, gets
  // rewritten to /index.html, and returns HTML 200 — reintroducing exactly the
  // failure the custom-error-response ban was written to prevent.
  if (uri === '/api' || uri.indexOf('/api/') === 0) {
    return request
  }

  // Root. DefaultRootObject also covers this; handling it here too makes the
  // function correct regardless of which runs first.
  if (uri === '/') {
    request.uri = '/index.html'
    return request
  }

  // A last segment carrying an extension is a real object: /assets/index-abc.js,
  // /sw.js, /manifest.webmanifest, /favicon.ico, /workbox-4618a956.js. Let it 403
  // from S3 rather than masking a missing asset as an HTML 200.
  //
  // Last segment rather than whole URI: no route in src/app/router/index.ts
  // contains a dot today, so the two are equivalent — but this stays correct if a
  // route parameter ever carries one (/properties/foo.bar/edit).
  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1)
  if (lastSegment.indexOf('.') !== -1) {
    return request
  }

  // Extension-less => a vue-router route: /ops/arrivals, /workers/42/badge.
  request.uri = '/index.html'
  return request
}
