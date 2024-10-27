module.exports = [
  {
    id: "proxy-all",
    url: "{*path}",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        delay: 1000,
        type: "proxy",
        options: {
          host: "http://127.0.0.1:3200",
          options: {},
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
