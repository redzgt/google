const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  const { target } = req.query;

  if (!target) {
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Enter Proxy URL</title>
        <style>
          body {
            font-family: sans-serif;
            background: #111;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          input, button {
            padding: 10px;
            font-size: 16px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <h2>Enter a URL to proxy:</h2>
        <input id="urlInput" type="text" placeholder="https://example.com" />
        <button onclick="startProxy()">Go</button>

        <script>
          function startProxy() {
            const url = document.getElementById("urlInput").value;
            if (!url.startsWith("http")) {
              alert("Please enter a valid URL with http or https.");
              return;
            }
            window.location.href = "?target=" + encodeURIComponent(url);
          }
        </script>
      </body>
      </html>
    `);
    return;
  }

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      return url.pathname;
    },
  })(req, res);
};
