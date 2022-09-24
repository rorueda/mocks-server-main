import { isUndefined } from "lodash";
import commander from "commander";

import type { Command } from "commander"

import { getOptionParserWithArrayContents } from "./types";
import { namespaceAndParentNames } from "./namespaces";

import type { OptionInterface } from "./types/Option";
import type { NamespaceInterface } from "./types/Config";
import type { BaseCommanderOptionProperties, CommanderOptionProperties, CommandLineArgumentsInterface, CommanderOptionsData, ReadOptions } from "./types/CommandLineArgument";
import type { ConfigObject, AnyObject } from "./types/Common";
import { types } from "./types/Option";

const NAMESPACE_SEPARATOR = ".";
const COMMANDER_VALUE_GETTER = ` <value>`;
const COMMANDER_ARRAY_VALUE_GETTER = ` <value...>`;

function getOptionPrefix({ isBoolean, defaultIsTrue }: { isBoolean: boolean, defaultIsTrue: boolean }): string {
  return isBoolean && defaultIsTrue ? "--no-" : "--";
}

function getOptionGetter({ isBoolean, isArray }: { isBoolean: boolean, isArray: boolean }): string {
  if (isBoolean) {
    return "";
  }
  if (isArray) {
    return COMMANDER_ARRAY_VALUE_GETTER;
  }
  return COMMANDER_VALUE_GETTER;
}

function getCommanderOptionProperties(commanderOptionName: string, option: OptionInterface): BaseCommanderOptionProperties {
  const isBoolean = option.type === types.BOOLEAN;
  const isArray = option.type === types.ARRAY;
  const defaultIsTrue = option.default === true;
  // Option can only be set to false if default value is true or viceversa. So, users can't restore to default value using args when config in other places change it
  const optionPrefix = getOptionPrefix({ isBoolean, defaultIsTrue });
  const optionValueGetter = getOptionGetter({ isBoolean, isArray });

  const Option = new commander.Option(`${optionPrefix}${commanderOptionName}${optionValueGetter}`);

  return {
    default: option.default,
    isBoolean,
    isObject: option.type === types.OBJECT,
    Option: Option,
  };
}

function getCommanderOptionName(namespace: NamespaceInterface, optionName: string): string {
  return [...namespaceAndParentNames(namespace), optionName].join(NAMESPACE_SEPARATOR);
}

function commanderValueHasToBeIgnored(optionValue: unknown, commanderOptionProperties: CommanderOptionProperties): boolean {
  return (
    !commanderOptionProperties ||
    isUndefined(optionValue) ||
    // Commander assign default true value to boolean options. We can't assign default values, because arguments would overwrite variables defined using other methods, such as env vars.
    (optionValue === true &&
      commanderOptionProperties.isBoolean &&
      commanderOptionProperties.default === true)
  );
}

class CommandLineArguments implements CommandLineArgumentsInterface {
  private _config: ConfigObject

  constructor() {
    this._config = {};
  }

  private _createNamespaceInterfaceOptions(namespace: NamespaceInterface, command: Command, optionsData: CommanderOptionsData) {
    namespace.options.forEach((option) => {
      const commanderOptionName = getCommanderOptionName(namespace, option.name);
      const commanderOptionProperties = getCommanderOptionProperties(commanderOptionName, option);
      const data = {
        namespace,
        option,
        ...commanderOptionProperties,
      } as CommanderOptionProperties
      optionsData[commanderOptionName] = data;
      command.addOption(commanderOptionProperties.Option);
    });
    this._createNamespaceOptions(namespace.namespaces, command, optionsData);
  }

  private _createNamespaceOptions(namespaces: NamespaceInterface[], command: Command, optionsData: CommanderOptionsData) {
    namespaces.forEach((namespace) => {
      this._createNamespaceInterfaceOptions(namespace, command, optionsData);
    });
  }

  private _addLevelsToConfig(config: ConfigObject, levels: string[], index = 0): ConfigObject {
    if (index === levels.length) {
      return config;
    }
    config[levels[index]] = config[levels[index]] || {};
    return this._addLevelsToConfig(config[levels[index]] as ConfigObject, levels, index + 1);
  }

  private _commanderResultsToConfigObject(results: AnyObject, config: ConfigObject, commanderOptionsData: CommanderOptionsData) {
    Object.keys(results).forEach((optionName) => {
      const optionValue = results[optionName];
      if (!commanderValueHasToBeIgnored(optionValue, commanderOptionsData[optionName])) {
        const objectLevels = optionName.split(NAMESPACE_SEPARATOR).slice(0, -1);
        const option = commanderOptionsData[optionName].option;
        const configAtLevel = this._addLevelsToConfig(config, objectLevels);
        const originalOptionName = option.name;
        const parser = getOptionParserWithArrayContents(option);
        configAtLevel[originalOptionName] = parser(optionValue as unknown[]);
      }
    });
    return config;
  }

  public read(namespaces: NamespaceInterface[], { allowUnknownOption }: ReadOptions): ConfigObject {
    const config = {};

    // Create commander options
    const commanderOptionsData = {};
    const program = new commander.Command();
    this._createNamespaceOptions(namespaces, program, commanderOptionsData);

    // Get commander results
    if (allowUnknownOption) {
      program.allowUnknownOption();
    }

    program.parse();
    const results = program.opts();

    // Convert commander results into object with namespaces levels
    this._config = this._commanderResultsToConfigObject(results, config, commanderOptionsData);

    return this._config;
  }
}

export default CommandLineArguments;
