import { RouteDefinition } from "../../../../../src"

const config : RouteDefinition[] = [
  {
    id: "get-users",
    url: "/api/users",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: [
            {
              "id": 1,
              "name": "John Doe"
            },
            {
              "id": 2,
              "name": "Jane Doe"
            }
          ]
        }
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 403,
          body: {
            message: "Bad data"
          }
        }
      }
    ]
  },
  {
    id: "get-user",
    url: "/api/users/:id",
    method: "GET",
    variants: [
      {
        id: "1",
        type: "json",
        options: {
          status: 200,
          body: {
            id: 1,
            name: "John Doe"
          }
        }
      },
      {
        id: "2",
        type: "json",
        options: {
          status: 200,
          body: {
            id: 2,
            name: "Jane Doe"
          }
        }
      }
    ]
  }
];

export default config;