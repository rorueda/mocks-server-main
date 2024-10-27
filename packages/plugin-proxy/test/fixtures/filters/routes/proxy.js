module.exports = [
  {
    id: "proxy-all",
    url: "{*path}",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        type: "proxy",
        options: {
          host: "http://127.0.0.1:3200",
          options: {
            filter: (req) => {
              return !req.url.includes("users/2");
            },
          },
        },
      },
      {
        id: "disabled",
        type: "middleware",
        options: {
          middleware: (_req, _res, next) => next(),
        },
      },
    ],
  },
];
