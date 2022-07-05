/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

// Default routes handler
const DefaultRoutesHandler = require("./handlers/Default");
const Json = require("./handlers/Json");
const Middleware = require("./handlers/Middleware");

class RoutesHandlers {
  constructor({ logger }) {
    this._logger = logger;
    this._registeredRouteHandlers = [];
    this._routeHandlers = [DefaultRoutesHandler, Json, Middleware];
  }

  add(RoutesHandler) {
    this._routeHandlers.push(RoutesHandler);
  }

  register(routeHandlers = []) {
    this._routeHandlers = this._routeHandlers.concat(routeHandlers);
    return this._registerHandlers().then(() => {
      this._logger.verbose(
        `Registered ${this._registeredRouteHandlers.length} routes handlers without errors`
      );
      return Promise.resolve();
    });
  }

  _registerHandlers() {
    this._routeHandlers.forEach((RouteHandler) => {
      // TODO, check id, etc..
      this._registeredRouteHandlers.push(RouteHandler);
      this._logger.verbose(`Registering "${RouteHandler.id}" routes handler`);
    });
    return Promise.resolve();
  }

  get handlers() {
    return this._registeredRouteHandlers;
  }
}

module.exports = RoutesHandlers;
