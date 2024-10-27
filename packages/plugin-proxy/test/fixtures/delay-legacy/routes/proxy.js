module.exports = [
  {
    id: "proxy-all",
    url: "{*path}",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        delay: 1000,
        handler: "proxy",
        host: "http://127.0.0.1:3200",
        options: {},
      },
      {
        id: "disabled",
        response: (_req, _res, next) => next(),
      },
    ],
  },
];
