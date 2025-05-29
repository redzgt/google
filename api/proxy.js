const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const target = url.searchParams.get("target");

  if (!target) {
    // Show browser UI when no target is specified
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proxy Browser</title>
        <style>
          body {
            margin: 0;
            background: #121212;
            color: white;
            font-family: sans-serif;
            overflow: hidden;
          }

          .tabs {
            display: flex;
            background: #1e1e1e;
            padding: 5px;
            overflow-x: auto;
            white-space: nowrap;
          }

          .tab {
            padding: 8px 12px;
            margin-right: 5px;
            background: #2a2a2a;
            border-radius: 6px 6px 0 0;
            cursor: pointer;
            display: flex;
            align-items: center;
          }

          .tab.active {
            background: #333;
            font-weight: bold;
          }

          .tab span {
            margin-right: 8px;
          }

          .tab .close {
            cursor: pointer;
            color: #999;
          }

          .tab .close:hover {
            color: red;
          }

          .content {
            height: calc(100vh - 40px);
            background: #000;
          }

          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }

          .new-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
          }

          .new-tab input {
            padding: 10px;
            width: 400px;
            font-size: 16px;
            border-radius: 6px;
            border: none;
            outline: none;
          }

          .new-tab button {
            margin-top: 10px;
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 6px;
            background: #333;
            color: white;
            cursor: pointer;
          }

          .new-tab button:hover {
            background: #444;
          }
        </style>
      </head>
      <body>

      <div class="tabs" id="tabs"></div>
      <div class="content" id="content"></div>

      <script>
        let tabs = [];
        let currentTab = null;

        function createNewTab(targetUrl = null) {
          const id = Date.now();
          const isNewTab = targetUrl === null;

          const tab = {
            id,
            title: isNewTab ? "New Tab" : targetUrl,
            url: targetUrl,
            isNew: isNewTab
          };

          tabs.push(tab);
          switchToTab(id);
          renderTabs();
        }

        function switchToTab(id) {
          currentTab = id;
          renderTabs();
          renderContent();
        }

        function closeTab(id) {
          const index = tabs.findIndex(t => t.id === id);
          if (index !== -1) {
            tabs.splice(index, 1);
            if (currentTab === id) {
              if (tabs.length > 0) {
                switchToTab(tabs[Math.max(0, index - 1)].id);
              } else {
                createNewTab();
              }
            } else {
              renderTabs();
              renderContent();
            }
          }
        }

        function renderTabs() {
          const tabContainer = document.getElementById("tabs");
          tabContainer.innerHTML = "";

          tabs.forEach(tab => {
            const tabEl = document.createElement("div");
            tabEl.className = "tab" + (tab.id === currentTab ? " active" : "");
            tabEl.innerHTML = \`<span>\${tab.title}</span><div class="close" onclick="closeTab(\${tab.id})">×</div>\`;
            tabEl.onclick = () => switchToTab(tab.id);
            tabContainer.appendChild(tabEl);
          });
        }

        function renderContent() {
          const content = document.getElementById("content");
          content.innerHTML = "";

          const tab = tabs.find(t => t.id === currentTab);
          if (!tab) return;

          if (tab.isNew) {
            const div = document.createElement("div");
            div.className = "new-tab";
            div.innerHTML = \`
              <input id="urlInput" type="text" placeholder="https://example.com" />
              <button onclick="loadUrl(\${tab.id})">Go</button>
            \`;
            content.appendChild(div);
          } else {
            const iframe = document.createElement("iframe");
            iframe.src = "?target=" + encodeURIComponent(tab.url);
            content.appendChild(iframe);
          }
        }

        function loadUrl(tabId) {
          const input = document.getElementById("urlInput");
          const url = input.value.trim();
          if (!url.startsWith("http")) {
            alert("Please enter a valid URL (starting with http or https)");
            return;
          }

          const tab = tabs.find(t => t.id === tabId);
          if (tab) {
            tab.url = url;
            tab.title = url;
            tab.isNew = false;
            switchToTab(tabId);
          }
        }

        // Start with a new tab open
        createNewTab();
      </script>

      </body>
      </html>
    `);
    return;
  }

  // Remove ?target=... from the actual path so proxy works cleanly
  url.searchParams.delete("target");
  req.url = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "");

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
