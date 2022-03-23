export default [
  {
    "id": "base",
    "routesVariants": ["add-headers:enabled", "get-users:success", "get-user:success", "get-users-new:success"]
  },
  {
    "id": "no-headers",
    "from": "base",
    "routesVariants": ["add-headers:disabled"]
  },
  {
    "id": "user-real",
    "from": "no-headers",
    "routesVariants": ["get-user:real"]
  },
]
