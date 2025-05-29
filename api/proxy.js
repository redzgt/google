const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const target = url.searchParams.get("target");

  if (!target) {
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Proxy Browser</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #121212;
            font-family: 'Segoe UI', sans-serif;
            color: white;
          }

          .container {
            text-align: center;
            max-width: 90%;
          }

          h1 {
            font-weight: normal;
            margin-bottom: 20px;
            font-size: 24px;
            color: #ccc;
          }

          input {
            padding: 12px 16px;
            width: 100%;
            max-width: 500px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            margin-bottom: 12px;
            outline: none;
            background-color: #1e1e1e;
            color: white;
          }

          button {
            padding: 12px 24px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            background-color: #333;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          button:hover {
            background-color: #444;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Enter a URL to proxy</h1>
          <input id="urlInput" type="text" placeholder="https://example.com" />
          <br />
          <button onclick="go()">Go</button>
        </div>

        <script>
          function go() {
            const url = document.getElementById('urlInput').value.trim();
            if (!url.startsWith('http')) {
              alert('Please enter a valid URL starting with http or https');
              return;
            }
            location.href = '?target=' + encodeURIComponent(url);
          }
        </script>
      </body>
      </html>
    `);
    return;
  }

  // Strip target param before proxying
  url.searchParams.delete("target");
  req.url = url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "");

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => req.url,
    onError(err, req, res) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Proxy error: " + err.message);
    },
  })(req, res);
};
