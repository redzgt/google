const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Serve the frontend UI when path is /
  if (parsedUrl.pathname === "/") {
    res.setHeader("Content-Type", "text/html");
    return res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Space Proxy</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', sans-serif;
            background: radial-gradient(ellipse at center, #0a0a23 0%, #000000 100%);
            color: #e0e0e0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
          }

          h2 {
            font-size: 2em;
            margin-bottom: 1em;
            color: #ffffff;
            text-shadow: 0 0 10px #00f0ff;
          }

          form {
            display: flex;
            flex-direction: row;
            width: 80%;
            max-width: 600px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1em;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
          }

          input {
            flex: 1;
            padding: 0.8em;
            border: none;
            border-radius: 8px 0 0 8px;
            font-size: 1em;
            background-color: #1c1c2b;
            color: #ffffff;
          }

          input::placeholder {
            color: #888;
          }

          button {
            padding: 0.8em 1.5em;
            font-size: 1em;
            border: none;
            border-radius: 0 8px 8px 0;
            background-color: #00f0ff;
            color: #000;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          button:hover {
            background-color: #00c0cc;
          }

          @media (max-width: 500px) {
            form {
              flex-direction: column;
              gap: 10px;
              border-radius: 10px;
            }

            input, button {
              border-radius: 8px !important;
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <h2>🌌 Space Proxy</h2>
        <form id="proxyForm">
          <input type="text" id="urlInput" placeholder="https://example.com" required />
          <button type="submit">Launch</button>
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

    if (!target || !/^https?:\\/\\/[^ "]+$/.test(target)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Invalid or missing 'url' query parameter.");
    }

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: () => "/",
    })(req, res);
  }

  // Fallback for 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found.");
};
