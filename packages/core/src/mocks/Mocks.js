/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const tracer = require("../tracer");

const OPTIONS = [
  {
    description: "Selected mock",
    name: "selected",
    type: "string",
    extraData: {
      scaffold: {
        commented: false,
      },
    },
  },
  {
    description: "Global delay to apply to routes",
    name: "delay",
    type: "number",
    default: 0,
  },
];

const {
  getPlainMocks,
  getPlainRoutes,
  getPlainRoutesVariants,
  addCustomVariant,
  getRouteVariants,
  getMocks,
  getMock,
} = require("./helpers");
const { getIds, compileRouteValidator } = require("./validations");

class Mocks {
  static get id() {
    return "mocks";
  }

  constructor(
    { config, getLoadedMocks, getLoadedRoutes, onChange, addAlert, removeAlerts },
    core
  ) {
    this._config = config;
    [this._currentMockOption, this._currentDelayOption] = this._config.addOptions(OPTIONS);
    this._currentMockOption.onChange(this._setCurrent.bind(this));

    this._getLoadedMocks = getLoadedMocks;
    this._getLoadedRoutes = getLoadedRoutes;
    this._onChange = onChange;
    this._addAlert = addAlert;
    this._removeAlerts = removeAlerts;
    this._core = core;

    this._router = null;
    this._mocksDefinitions = [];
    this._mocks = [];
    this._plainMocks = [];
    this._routesDefinitions = [];
    this._plainRoutes = [];
    this._plainRoutesVariants = [];
    this._routesVariants = [];
    this._customVariants = [];
    this._customVariantsMock = null;

    this.router = this.router.bind(this);
    this.getDelay = this.getDelay.bind(this);
  }

  getDelay() {
    return this._currentDelayOption.value;
  }

  _reloadRouter() {
    if (this._customVariantsMock) {
      this._router = this._customVariantsMock.router;
    } else if (this._currentMock) {
      this._router = this._currentMock.router;
    } else {
      this._router = express.Router();
    }
    this._onChange();
  }

  _processMocks() {
    tracer.debug("Processing loaded mocks");
    tracer.silly(JSON.stringify(this._mocksDefinitions));
    this._mocks = getMocks({
      mocksDefinitions: this._mocksDefinitions,
      addAlert: this._addAlert,
      removeAlerts: this._removeAlerts,
      routeVariants: this._routesVariants,
      getGlobalDelay: this.getDelay,
    });
  }

  _processRoutes() {
    tracer.debug("Processing loaded routes");
    tracer.silly(JSON.stringify(this._routesDefinitions));
    this._routesVariants = getRouteVariants({
      routesDefinitions: this._routesDefinitions,
      addAlert: this._addAlert,
      removeAlerts: this._removeAlerts,
      routeHandlers: this._routesVariantsHandlers,
      core: this._core,
    });
    tracer.debug(`Processed ${this._routesVariants.length} route variants`);
  }

  load() {
    this._routesDefinitions = this._getLoadedRoutes();
    this._mocksDefinitions = this._getLoadedMocks();
    this._processRoutes();
    this._processMocks();
    this._mocksIds = getIds(this._mocks);
    this._plainRoutes = getPlainRoutes(this._routesDefinitions, this._routesVariants);
    this._plainRoutesVariants = getPlainRoutesVariants(this._routesVariants);
    this._plainMocks = getPlainMocks(this._mocks, this._mocksDefinitions);
    this.current = this._currentMockOption.value;
  }

  init(routesHandlers) {
    compileRouteValidator(routesHandlers);
    this._routesVariantsHandlers = routesHandlers;
  }

  router(req, res, next) {
    this._router(req, res, next);
  }

  _setCurrent(id) {
    tracer.verbose(`Trying to set current mock as "${id}"`);
    let current;
    this._removeAlerts("current:settings");
    if (!id) {
      current = this._mocks[0];
      if (current) {
        this._addAlert(
          "current:settings",
          `Option "mock" was not defined. Using the first mock found`
        );
      } else {
        this._addAlert("current:settings", `Option "mock" was not defined`);
      }
    } else {
      current = this._mocks.find((mock) => mock.id === id);
      if (!current) {
        current = this._mocks[0];
        if (current) {
          this._addAlert(
            "current:settings",
            `Mock "${id}" was not found. Using the first one found`
          );
        }
      }
    }
    if (!current) {
      this._addAlert("current:amount", "No mocks found");
    } else {
      tracer.info(`Current mock: "${current.id}"`);
      this._removeAlerts("current:amount");
    }

    this._currentMock = current;
    this._currentId = (current && current.id) || null;
    this._stopUsingVariants();
    this._reloadRouter();
  }

  set current(id) {
    this._setCurrent(id);
  }

  _stopUsingVariants() {
    this._customVariants = [];
    this._customVariantsMock = null;
  }

  _createCustomMock() {
    const currentMockId = this._currentId;
    this._customVariantsMock = getMock({
      mockDefinition: {
        id: `custom-variants:from:${currentMockId}`,
        from: currentMockId,
        routesVariants: this._customVariants,
      },
      mockIndex: "custom",
      mocksDefinitions: this._mocksDefinitions,
      routeVariants: this._routesVariants,
      getGlobalDelay: this.getDelay,
      addAlert: this._addAlert,
      removeAlerts: this._removeAlerts,
    });
  }

  restoreRoutesVariants() {
    this._stopUsingVariants();
    this._reloadRouter();
  }

  useRouteVariant(variantId) {
    // TODO, validate variantId
    this._customVariants = addCustomVariant(variantId, this._customVariants);
    this._createCustomMock();
    this._reloadRouter();
  }

  get customRoutesVariants() {
    return [...this._customVariants];
  }

  get current() {
    return this._currentId;
  }

  get ids() {
    return [...this._mocksIds];
  }

  get plainMocks() {
    return [...this._plainMocks];
  }

  get plainRoutes() {
    return [...this._plainRoutes];
  }

  get plainRoutesVariants() {
    return [...this._plainRoutesVariants];
  }
}

module.exports = Mocks;
