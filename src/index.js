const difference = require('lodash/array/difference');
const has = require('lodash/object/has');

function getGetterName(variableName) {
  return 'get' + variableName.charAt(1).toUpperCase() + variableName.slice(2);
}

function getSetterName(variableName) {
  return 'set' + variableName.charAt(1).toUpperCase() + variableName.slice(2);
}

function makeGetter(variableName) {
  return function() {
    return this[variableName];
  };
}

function makeSetter(variableName) {
  return function(x) {
    this[variableName] = x;
  };
}

const SUPPORTED_DESCRIPTOR_PROPS = [
  'name', 'get', 'set', 'destroy', 'destroyMethod'
];

export default function addAccessors(obj, descriptors) {
  descriptors.forEach(descriptor => {
    const {name} = descriptor;
    if (process.env.NODE_ENV !== 'production') {
      const unsupportedProps = difference(
        Object.keys(descriptor), SUPPORTED_DESCRIPTOR_PROPS);
      if (unsupportedProps.length) {
        throw new Error("Unsupported accessor descriptor properties: " +
          unsupportedProps.join(', '));
      }
    }
    if (descriptor.get) {
      obj[getGetterName(name)] = makeGetter(name);
    }
    if (descriptor.set) {
      obj[getSetterName(name)] = makeSetter(name);
    }
  });
  const superDestroy = obj.destroy;
  obj.destroy = function() {
    if (superDestroy) {
      superDestroy.call(this);
    }
    descriptors.forEach(descriptor => {
      const {name, destroy} = descriptor;
      if (has(this, name)) {
        const value = this[name];
        this[name] = undefined;
        if (destroy && value) {
          const destroyMethod = descriptor.destroyMethod || 'destroy';
          if (Array.isArray(value)) {
            value.forEach(x => {
              x[destroyMethod]();
            });
          } else {
            value[destroyMethod]();
          }
        }
      }
    });
  };
}
