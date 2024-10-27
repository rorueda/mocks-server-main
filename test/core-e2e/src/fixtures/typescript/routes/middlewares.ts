// Use this file only as a guide for first steps using middlewares. Delete it when no more needed.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/guides-using-middlewares

function middleware(req: Object, res: Object, next: () => void, core: Object) : void {
  res.set("x-mocks-server-example", "custom-header-typescript");
  core.logger.info(
    "Custom header added by add-headers:enabled route variant middleware using TypeScript"
  );
  next();
}

const middlewares = [
  {
    id: "add-headers",
    url: "{*path}",
    method: "GET",
    variants: [
      {
        id: "enabled",
        type: "middleware",
        options: {
          middleware
        },
      },
      {
        id: "disabled",
        type: "middleware",
        options: {
          middleware: (req, res, next) => next(),
        }
      },
    ],
  },
];

export default middlewares;
