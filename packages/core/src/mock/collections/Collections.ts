/*
Copyright 2022-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { OptionProperties, NamespaceInterface, OptionInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import { compact } from "lodash";

import type { AlertsInterface } from "../../alerts/Alerts.types";
import { resolveWhenConditionPass } from "../../common/Helpers";
import type { RouteId, RouteInterface } from "../routes/Route.types";
import type { RoutesInterface } from "../routes/Routes.types";
import {
  collectionRouteVariantsValidationErrors,
  collectionValidationErrors,
  getCollectionRouteVariantsProperty,
  findRouteVariantByVariantId,
} from "../validations";

import { Collection } from "./Collection";
import type { CollectionDefinition, CollectionId, CollectionInterface } from "./Collection.types";
import type {
  CollectionsConstructor,
  CollectionsInterface,
  CollectionsOptions,
  SelectCollectionOptionsNoPromise,
  SelectCollectionOptionsPromise,
} from "./Collections.types";
import { addRoutesToCollectionRoutes } from "./Helpers";

const OPTIONS: OptionProperties[] = [
  {
    description: "Selected collection",
    name: "selected",
    type: "string",
  },
];

const EMPTY_ALERT_ID = "empty";
const SELECTED_COLLECTION_ALERT = "selected";
const LOAD_NAMESPACE = "load";

// TODO, add to data model

export const Collections: CollectionsConstructor = class Collections
  implements CollectionsInterface
{
  private _alerts: AlertsInterface;
  private _alertsLoad: AlertsInterface;
  private _logger: LoggerInterface;
  private _loggerLoad: LoggerInterface;
  private _config: NamespaceInterface;
  private _getPlainCollections: CollectionsOptions["getPlainCollections"];
  private _selectedOption: OptionInterface;
  private _collections: CollectionInterface[] = [];
  private _routesManager: RoutesInterface;
  private _selected: CollectionInterface | null = null;
  private _onChange: CollectionsOptions["onChange"];
  private _collectionDefinitions: CollectionDefinition[] = [];

  static get id() {
    return "collections";
  }

  constructor({
    alerts,
    logger,
    config,
    routesManager,
    getPlainCollections,
    onChange,
  }: CollectionsOptions) {
    this._getPlainCollections = getPlainCollections;
    this._config = config;
    this._routesManager = routesManager;

    this._alerts = alerts;
    this._alertsLoad = this._alerts.collection(LOAD_NAMESPACE);
    this._logger = logger;
    this._loggerLoad = this._logger.namespace(LOAD_NAMESPACE);

    [this._selectedOption] = this._config.addOptions(OPTIONS);
    this._selectedOption.onChange(this._setCurrent.bind(this));
    this._onChange = onChange;
  }

  public get selected(): CollectionId | null {
    return this._selected ? this._selected.id : null;
  }

  public get current(): CollectionInterface | null {
    return this._selected;
  }

  public get ids(): CollectionId[] {
    return this._collections.map((collection) => collection.id);
  }

  public get plain() {
    return this._getPlainCollections();
  }

  public select(collection: CollectionId, options: SelectCollectionOptionsPromise): Promise<void>;
  public select(collection: CollectionId, options: SelectCollectionOptionsNoPromise): void;
  public select(collection: CollectionId, { check = false } = {}) {
    this._selectedOption.value = collection;
    if (check === true) {
      return resolveWhenConditionPass(() => {
        return this.selected === collection;
      });
    }
  }

  private _setCurrent(): void {
    const id = this._selectedOption.value;
    this._logger.verbose(`Trying to select collection '${id}'`);
    let selected;
    this._alerts.remove(SELECTED_COLLECTION_ALERT);
    if (!id) {
      selected = this._collections[0];
      if (selected) {
        this._alerts.set(
          SELECTED_COLLECTION_ALERT,
          "Option 'mock.collections.selected' was not defined. Selecting the first collection found"
        );
      } else {
        this._alerts.set(
          SELECTED_COLLECTION_ALERT,
          "Option 'mock.collections.selected' was not defined"
        );
      }
    } else {
      selected = this._collections.find((collection) => collection.id === id);
      if (!selected) {
        selected = this._collections[0];
        if (selected) {
          this._alerts.set(
            SELECTED_COLLECTION_ALERT,
            `Collection '${id}' was not found. Selecting the first one found`
          );
        }
      }
    }
    if (!selected) {
      this._alerts.set(EMPTY_ALERT_ID, "No collections found");
    } else {
      this._logger.info(`Selected collection: '${selected.id}'`);
      this._alerts.remove(EMPTY_ALERT_ID);
    }

    if (this._selected) {
      // Restore original routes when changing the selected one in order to avoid a big breaking change. Do not emit event because it is already emitted here
      this._selected.resetRoutes({ silent: true });
    }

    this._selected = selected || null;

    this._onChange();
  }

  private _getCollectionRoutes(
    {
      collectionDefinition,
      collectionAlerts,
      routes,
    }: {
      collectionDefinition: CollectionDefinition;
      collectionAlerts: AlertsInterface;
      routes: RouteInterface[];
    },
    routesToAdd: RouteInterface[] = []
  ): RouteInterface[] {
    const collectionRoutes = compact(
      getCollectionRouteVariantsProperty(collectionDefinition).map((routeId: RouteId) => {
        return findRouteVariantByVariantId(routes, routeId) as RouteInterface;
      }) as RouteInterface[]
    );
    if (collectionDefinition.from) {
      const from = this._collectionDefinitions.find(
        (collectionCandidate) => collectionCandidate.id === collectionDefinition.from
      );
      if (from) {
        return this._getCollectionRoutes(
          {
            collectionDefinition: from,
            routes,
            collectionAlerts,
          },
          addRoutesToCollectionRoutes(collectionRoutes, routesToAdd)
        );
      }
      // TODO, throw an error in strict validation mode
      collectionAlerts.set(
        "from",
        `Collection with invalid 'from' property detected, '${collectionDefinition.from}' was not found`
      );
    }
    return addRoutesToCollectionRoutes(collectionRoutes, routesToAdd);
  }

  private _createCollection({
    collectionDefinition,
    collectionAlerts,
  }: {
    collectionDefinition: CollectionDefinition;
    collectionAlerts: AlertsInterface;
  }): CollectionInterface | null {
    let collection = null;
    const routes = this._routesManager.get();

    const collectionRouteVariantsErrors = collectionRouteVariantsValidationErrors(
      collectionDefinition,
      routes
    );
    if (collectionRouteVariantsErrors) {
      collectionAlerts.set("variants", collectionRouteVariantsErrors.message);
      this._loggerLoad.silly(
        `Collection route variants validation errors: ${JSON.stringify(
          collectionRouteVariantsErrors.errors
        )}`
      );
    }

    const collectionErrors = collectionValidationErrors(collectionDefinition);
    if (collectionErrors) {
      collectionAlerts.set("validation", collectionErrors.message);
      this._loggerLoad.silly(
        `Collection validation errors: ${JSON.stringify(collectionErrors.errors)}`
      );
      return null;
    }

    try {
      collection = new Collection({
        id: collectionDefinition.id,
        logger: this._logger.namespace(collectionDefinition.id),
        alerts: this._alerts.collection(collectionDefinition.id),
        routes: this._getCollectionRoutes({
          collectionDefinition,
          collectionAlerts,
          routes,
        }),
        routesManager: this._routesManager,
        onChange: this._onChange,
      });
    } catch (error) {
      collectionAlerts.set("process", "Error processing collection", error as Error);
    }
    return collection;
  }

  public load(collectionDefinitions: CollectionDefinition[]): void {
    this._loggerLoad.verbose("Creating collections from collection definitions");
    this._loggerLoad.debug(JSON.stringify(collectionDefinitions));
    this._collectionDefinitions = collectionDefinitions;
    this._alertsLoad.clean();
    let errorsProcessing = 0;

    const ids: CollectionId[] = [];
    this._collections = compact(
      collectionDefinitions.map((collectionDefinition, index) => {
        const collectionDefinitionId = collectionDefinition && collectionDefinition.id;
        const alertsCollectionId =
          !collectionDefinitionId || ids.includes(collectionDefinitionId)
            ? `${index}`
            : collectionDefinitionId;
        const collectionAlerts = this._alertsLoad.collection(alertsCollectionId);
        const collection = this._createCollection({
          collectionDefinition,
          collectionAlerts,
        });
        if (!collection) {
          errorsProcessing++;
          return null;
        }
        if (ids.includes(collection.id)) {
          collectionAlerts.set(
            "duplicated",
            `Collection with duplicated id '${collection.id}' detected. It has been ignored`
          );
          return null;
        }

        ids.push(collection.id);
        return collection;
      })
    );
    if (errorsProcessing > 0) {
      this._alertsLoad.set(
        "critical-error",
        `Critical errors found while loading collections: ${errorsProcessing}`
      );
    }
    this._loggerLoad.info(`Created ${this._collections.length} collections`);
    this._setCurrent();
  }

  public get(): CollectionInterface[] {
    return [...this._collections];
  }

  public findById(id: CollectionId): CollectionInterface | undefined {
    return this._collections.find((collection) => collection.id === id);
  }
};
