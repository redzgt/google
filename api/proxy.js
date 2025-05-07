const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Serve the frontend UI when path is /
  if (parsedUrl.pathname === "/") {
    res.setHeader("Content-Type", "text/html");
    return res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Simple Proxy</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          input { width: 80%; padding: 10px; }
          button { padding: 10px 20px; }
        </style>
      </head>
      <body>
        <h2>Enter a URL to Proxy:</h2>
        <form id="proxyForm">
          <input type="text" id="urlInput" placeholder="https://example.com" required />
          <button type="submit">Go</button>
        </form>
        <script>
          document.getElementById("proxyForm").addEventListener("submit", function(e) {
            e.preventDefault();
            const url = encodeURIComponent(document.getElementById("urlInput").value);
            window.location.href = "/proxy?url=" + url;
          });
        </script>
      </body>
      </html>
    `);
  }

  // Proxy logic when path is /proxy
  if (parsedUrl.pathname.startsWith("/proxy")) {
    const target = parsedUrl.query.url;

    if (!target || !/^https?:\/\/[^ "]+$/.test(target)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Invalid or missing 'url' query parameter.");
    }

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        return "/";
      },
    })(req, res);
  }

  // Fallback for 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found.");
};
