module.exports = [
  {
    id: "proxy-all",
    url: "{*path}",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        handler: "proxy",
        host: () => {
          return "http://127.0.0.1:3200";
        },
        options: {},
      },
      {
        id: "disabled",
        response: (_req, _res, next) => next(),
      },
    ],
  },
  {
    id: "proxy-user",
    url: "/api/users/:id",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        handler: "proxy",
        host: () => {
          return "http://127.0.0.1:3300";
        },
        options: {},
      },
    ],
  },
];
