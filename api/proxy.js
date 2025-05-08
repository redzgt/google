const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const target = parsedUrl.query.url;

  if (!target || !/^https?:\/\/[^ "]+$/.test(target)) {
    res.statusCode = 400;
    res.end("Invalid or missing 'url' query parameter.");
    return;
  }

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: () => "/", // optional: rewrites the path to root
  })(req, res);
};
