function modifyUser(user) {
  return {
    ...user,
    name: `Modified ${user.name}`,
  };
}

module.exports = [
  {
    id: "proxy-all",
    url: "{*path}",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        handler: "proxy",
        host: "http://127.0.0.1:3200",
        options: {
          userResDecorator: function (_proxyRes, proxyResData) {
            const data = JSON.parse(proxyResData.toString("utf8"));
            let newData;
            if (Array.isArray(data)) {
              newData = data.map(modifyUser);
            } else {
              newData = modifyUser(data);
            }

            return JSON.stringify(newData);
          },
        },
      },
      {
        id: "disabled",
        response: (_req, _res, next) => next(),
      },
    ],
  },
];
