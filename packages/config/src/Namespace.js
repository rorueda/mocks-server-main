const { isEqual } = require("lodash");
const EventEmitter = require("events");

const Option = require("./Option");
const { types } = require("./types");
const { addEventListener, CHANGE } = require("./events");

class Namespace {
  constructor(name) {
    this._eventEmitter = new EventEmitter();
    this._name = name;
    this._options = new Set();
  }

  addOption(optionProperties) {
    const option = new Option(optionProperties);
    this._options.add(option);
    return option;
  }

  addOptions(options) {
    return options.map((option) => this.addOption(option));
  }

  _set(configuration) {
    const changedOptions = [];
    if (configuration) {
      this._options.forEach((option) => {
        const previousValue = option.value;
        if (option.type === types.OBJECT) {
          option.merge(configuration[option.name]);
        } else {
          option.value = configuration[option.name];
        }
        if (!isEqual(previousValue, option.value)) {
          changedOptions.push(option);
        }
      });
    }
    return changedOptions;
  }

  init(configuration) {
    this._set(configuration);
  }

  set(configuration) {
    const changedOptions = this._set(configuration);
    if (changedOptions.length) {
      this._eventEmitter.emit(CHANGE, changedOptions);
    }
  }

  // TODO, should it emit also any change in options? Then, events would be duplicated when set method is used
  onChange(listener) {
    return addEventListener(listener, CHANGE, this._eventEmitter);
  }

  get name() {
    return this._name;
  }

  get options() {
    return this._options;
  }
}

module.exports = Namespace;
