# addAccessors

This is a javascript library for adding getters, setters, and a "destroy"
method that unsets member variables to a class.

Works with Node.js and CommonJS bundlers like Browserify.

    npm install --save add-accessors

## Usage

Examples use ES6, but ES6 is not necessary to use addAccessors.
([Babel](https://babeljs.io/) is an excellent tool to use to get ES6!)

```javascript
const addAccessors = require('add-accessors');

class Foo {
  constructor(x) {
    this._x = x;
    this._destroyable = {
      destroy() {
        console.log('destroyable destroy called');
      }
    };
    this._bar = {
      remove() {
        console.log('bar remove called');
      }
    };
  }
}
addAccessors(Foo.prototype, [
  {name: '_x', get: true, set: true},
  {name: '_destroyable', destroy: true},
  {name: '_bar', destroy: true, destroyMethod: 'remove'}
]);

const foo = new Foo(42);
console.log(foo.getX()); // 42
foo.setX(123);
console.log(foo.getX()); // 123

foo.destroy();
// "destroyable destroy called"
// "bar remove called"

console.log(foo.getX()); // undefined
```

The `addAccessors` function takes an object (such as a class prototype) and an
array describing the member variables. Each member variable descriptor is made
up of the following properties:

* name: The name of the member variable. Must begin with an underscore.
* get: Optional. If true, a getter is added to the object for this member. The
  getter is named "get" followed by the name with the underscore skipped and the
  first letter capitalized.
* set: Optional. If true, a setter is added to the object for this member. It is
  named with similar rules to the getter.
* destroy: Optional. If true, then when the object is destroyed, if this member
  variable is truthy, then its "destroy" method will be called. If the value of
  the member variable is an array, then the "destroy" method will be called on
  each of its values instead.
* destroyMethod: Optional. If present, then this shall name the method to use
  to destroy the member variable instead of "destroy".

Getters and setter methods are added for the specified member variables, and a
"destroy" method is added to the object which sets all of the member variables
to `undefined`, and calls destroy methods on the values of the member variables
that were set to have it called.

## Miscellaneous

Additional checks are done at run-time to make sure that addAccessors is used
correctly. These checks can be disabled by setting the NODE_ENV environment
variable to "production".
