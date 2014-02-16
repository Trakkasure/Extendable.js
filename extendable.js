/* jslint laxcomma: true */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("Extendable", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define('Extendable',definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.Extendable= definition;
        }

    // <script>
    } else {
        Extendable = definition();
    }

})(function () {
	// Extendable constructor.
	function Extendable() {
		if (!this._guid) {
			Object.defineProperty(this, '_guid', {
				writable: true, configurable: false, enumerable: false, value: guid()
			});
			Extendable.objValues[this._guid]={};
		}
		return this;
	};

    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


	// Handle staic super calls on immediate subclass
	Extendable['super'] = function () {
		// Class Super
		console.error("This point shouldn't be reached.");
		return this;
	};

	Object.defineProperty(Extendable.prototype, 'super', {
		writable: true, configurable: false, enumerable: false, value: {}
	});

	// Secret sauce for extending via prototype inheritance.
	Extendable.extend = function extend(child) {

		//console.log("Extending Parent: %s, Child: %s",this.name,child.name);
		if (this === child) {
			console.error("Child is equal to parent.");
			return;
		}
		var self = this;

		child['super'] = self;
		Object.defineProperty(child.prototype, 'super', {
			configurable: false, enumerable: false, get: shim(self, child)
		});

		child.extend = extend; // the normal extend

		//self.processPlugins(child);

		// List of hooks of parents.
		child.__extend = self.__extend.slice();

		if (child.extendHook)
			child.__extend.push(child.extendHook); // original extend

		child.extendHook = Extendable.extendHook; // shim extend to call up the chain first.

		self.extendHook(child);
		return child;
	};

	Extendable.__extend = [];
	Extendable.clazz = Extendable;

	function shim(parent, child) {
		child['super'] = parent;

		// Points to the current class being referenced in inheritance chain.
		child.prototype.clazz = child;
		child.clazz = child;
		// When "super" is not used and this is called directly.
		Object.keys(parent.prototype).forEach(function (key) {
			if (!child.prototype.hasOwnProperty(key)) {
				child.prototype[key] = function () {
					var orig_class = this[key].clazz || this.clazz;
					// console.log('Direct Calling %s.%s',parent.name,key);
					this[key].clazz = orig_class['super'];
					var retval = parent.prototype[key].apply(this, arguments);
					this[key].clazz = orig_class;
					return retval;
				};
			} else child.prototype[key].clazz = child;
		});

		// this is the accessor function to "get" super
		return function () {

			// Save the current class
			var orig_class = arguments.callee.caller.clazz;

			// This is the "super" function.
			// The "this" reference is the instance.
			var superFunc = function () {
				this.clazz = orig_class['super'];
				// Execute the parent constructor
				// console.log('Calling super constructor %s.%s',orig_class.name,this.clazz.name);
				var retval = this.clazz.apply(this, arguments);
				// return to the original level.
				this.clazz = orig_class;
				return retval;
			};

			superFunc['super'] = orig_class['super'];

			// The returned super function should have, as properties,  all functions of the current level's parent.
			Object.keys(orig_class['super'].prototype).forEach(function (key) {
				var self = this;
				if (typeof orig_class['super'].prototype[key] === typeof superFunc) {// if it's a function.
					superFunc[key] = function () {
						//self.clazz=orig_class['super'];
						// console.log('Calling super %s.%s',self.clazz.name,key);
						var func = orig_class['super'].prototype[key]
							, retval = func.apply(self, arguments);
						//self.clazz=orig_class;
						return retval;
					};
					superFunc[key].clazz = orig_class['super'].clazz;
				}
			}, this);


			return superFunc;
		};
	}

	Extendable.objValues={};

	Extendable.prototype.dispose = function() {
		this.isDisposed = true;
		delete Extendable.objValues[this._guid];
	};

	Extendable.extendHook = function (child) {
		this.__extend.forEach(function (f) {
			f.call(this, child);
		}, this);
	};

	Extendable.addPlugin = function (child,handlers) {

	};
	/*
	property parameters:
		name: name of the property to create
		default: default value to set if undefined or null is passed as a parameter.
		readonly: if set, then cannot change from "default" value. (default MUST be set)
		merge: merge properties of incoming object with existing object value.
		       this assumes that the property value is an object.
		evaluateFunction:
			if a function, let's call it A is passed in as a parameter,
			then later a non-function is passed, let's call it X,
			then the function passed in is executed using the parameter: A(X)
			and the value returned.
			this simplifies the following use case:
				this.x(function(d){return d.x});
				myX = this.x()(point);
			into this:
				this.x(function(d){return d.x});
				myX = this.x(point);

			As long as the property being passed in is not a function, the stored function
			will be called with the property value, and the resulting value returned.
			The end result in both cases is the same, but when used in loops or iterators,
			the 2nd case is faster.
	 */
	Extendable.applyProperties=function(context,properties) {
		// define properties for this child.
		if (child.properties && child.properties.length)
			Extendable.applyProperties(child.prototype,child.properties);
		properties.forEach(function(property){
			if (typeof property !== typeof ({})) property = {"name":property,"default":null};
			context[property.name] = (function() {
				return function(_) {
					if (!this._guid) {
						Object.defineProperty(this, '_guid', {
							writable: true, configurable: false, enumerable: false, value: guid()
						});
						Extendable.objValues[this._guid]={};
					}
					var value = Extendable.objValues[this._guid];
					if (this.isDisposed) {
						console.warn("Cannot set %s property of disposed object: %s\n%s",property.name,this.constructor.name,new Error().stack);
						return this;
					}
					if (!value) {
						console.error("Property array not found. This should never happen.");
						console.error(new Error().stack);
						return this;
					}
					if (arguments.length && (_ === undefined || _ === null)) {
						_ = property["default"];
					} else if (!arguments.length) {
						// get
						return value[property.name];
					}
					// set
					if (property.readonly) throw "Cannot set readonly property "+property.name+" of object "+this.constructor.name;
					// Execute value.
					if (property.evaluateFunction) {
						if (typeof(_) === "function") {
							value[property.name] = _;
						} else return value[property.name](_);
					} else {
						// Merge
						if (property.merge) {
							if (typeof value[property.name] !== typeof({})) value[property.name]=property["default"]||{};
							Object.keys(_).forEach(function(k){
								value[property.name][k]=_[k];
							});
						}
						value[property.name] = _;
					}
					return this;
				};
			})();
		});
	};

	return Extendable;

});
