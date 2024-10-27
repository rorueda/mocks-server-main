import { CollectionDefinition } from "../../../../src"

const config: CollectionDefinition[] =  [
  {
    id: "base",
    routes: ["get-users:success", "get-user:1"]
  },
  {
    id: "user-2",
    from: "base",
    routes: ["get-user:2"]
  }
];

export default config;