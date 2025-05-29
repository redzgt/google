const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const target = url.searchParams.get("target");

  if (!target) {
    // No target provided, show form
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proxy Browser</title>
        <style>
          body {
            background: #111;
            color: white;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          input {
            padding: 10px;
            width: 300px;
            font-size: 16px;
          }
          button {
            padding: 10px 20px;
            font-size: 16px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <h2>Enter a URL to browse privately:</h2>
        <form method="GET">
          <input name="target" type="text" placeholder="https://example.com" required />
          <br />
          <button type="submit">Browse</button>
        </form>
      </body>
      </html>
    `);
    return;
  }

  // Remove ?target=... from path before proxying
  const originalUrl = new URL(req.url, `http://${req.headers.host}`);
  originalUrl.searchParams.delete("target");
  req.url = originalUrl.pathname + (originalUrl.searchParams.toString() ? `?${originalUrl.searchParams}` : "");

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => req.url, // preserve path
    onProxyReq: (proxyReq, req) => {
      // optional: cleanup or add headers
    },
    onError(err, req, res) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Proxy error: " + err.message);
    },
  })(req, res);
};
