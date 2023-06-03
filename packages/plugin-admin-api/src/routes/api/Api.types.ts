/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import type { Router } from "express";

/** Options for creating an Api interface */
export interface ApiOptions {
  /** Logger */
  logger: ScopedCoreInterface["logger"];
  /** Mocks server config interface */
  config: ScopedCoreInterface["config"];
  /** Mocks Server alerts interface */
  alerts: ScopedCoreInterface["alerts"];
  /** Mocks server mock interface */
  mock: ScopedCoreInterface["mock"];
  /** Version of Mocks Server core */
  coreVersion: string;
}

/** Creates a Api interface */
export interface ApiConstructor {
  /**
   * Creates a Api interface
   * @param options - Api options {@link ApiOptions}
   * @returns Api interface {@link ApiInterface}.
   * @example const ApiInterface = new ApiInterface({ logger, config, alerts, mock, coreVersion });
   */
  new (options: ApiOptions): ApiInterface;
}

/** Api interface */
export interface ApiInterface {
  /** Express router for the alerts path */
  get router(): Router;
}
