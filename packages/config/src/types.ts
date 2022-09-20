import { types } from "./types/Option";
import type { 
  OptionInterface,
  OptionType,
  OptionInterfaceArray,
  OptionInterfaceBoolean,
  ItemsType 
} from "./types/Option";
import type { AnyObject } from "./types/Common";

const FALSY_VALUES = ["false", "0", 0];

interface ValueParser {
  (value: unknown): unknown
}

interface StringObjectParser {
  (value: string): AnyObject | string
}

interface BooleanParser {
  (value: string): boolean
}

interface ArrayValueParser {
  (value: unknown[]): unknown[]
}

function typeIsNumber(type: OptionType): boolean {
  return type === types.NUMBER;
}

function typeIsBoolean(type: OptionType): boolean {
  return type === types.BOOLEAN;
}

export function typeIsObject(type: OptionType): boolean {
  return type === types.OBJECT;
}

export function typeIsArray(type: OptionType): boolean {
  return type === types.ARRAY;
}

export function optionIsArray(option: OptionInterface): option is OptionInterfaceArray {
  return typeIsArray(option.type);
}

function doNothingParser(value: unknown): unknown {
  return value;
}

export function parseObject(value: string): AnyObject | string {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function parseBoolean(value: string): boolean {
  return !FALSY_VALUES.includes(value);
}

function getTypeParser(type: OptionType) {
  if (typeIsNumber(type)) {
    return parseFloat;
  }
  if (typeIsObject(type)) {
    return parseObject;
  }
  return doNothingParser;
}

function getTypeParserWithBooleans(type: ItemsType): ValueParser {
  if (typeIsBoolean(type)) {
    return parseBoolean as ValueParser;
  }
  return getTypeParser(type) as ValueParser;
}

export function getOptionParser(option: OptionInterface) {
  return getTypeParser(option.type) as ValueParser;
}

function ParseArrayContents(option: OptionInterfaceArray): ArrayValueParser {
  const parseArrayContents = getTypeParserWithBooleans(option.itemsType);
  return function (array: unknown[]) {
    return array.map((item) => parseArrayContents(item));
  };
}


export function getOptionParserWithBooleansAndArrays<T extends OptionInterface>(option: T): T extends OptionInterfaceArray ? StringObjectParser : T extends OptionInterfaceBoolean ? BooleanParser : ValueParser;
export function getOptionParserWithBooleansAndArrays(option: OptionInterface): ValueParser | StringObjectParser | BooleanParser {
  if (optionIsArray(option)) {
    return parseObject as ValueParser;
  }
  if (typeIsBoolean(option.type)) {
    return parseBoolean as ValueParser;
  }
  return getOptionParser(option);
}

export function getOptionParserWithArrayContents<T extends OptionInterface>(option: T): T extends OptionInterfaceArray ? ArrayValueParser : ValueParser;
export function getOptionParserWithArrayContents(option: OptionInterface): ArrayValueParser | ValueParser {
  if (optionIsArray(option)) {
    return ParseArrayContents(option);
  }
  return getOptionParser(option);
}

export function avoidArraysMerge(_destinationArray: unknown[], sourceArray: unknown[]): unknown[] {
  return sourceArray;
}
