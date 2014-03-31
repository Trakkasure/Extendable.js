Extendable.js
=============


Extendable.js is a simple library for heirarchical development.
It was developed so that people who are comfortable with development
methodologies used in Java can use similar capabilities in JavaScript.

Minimum requirement is that the javascript processor supports ES5.

Simple example:

```javascript
function myBaseClass() {
    this['super'](); // Call super constructor. Here, that would be Extendable.
    // do some stuff.
}

myBaseClass.prototype.method1 = function() {
    // do some stuff in this method in the BaseClass.
}

myBaseClass.prototype.coreMethod = function() {
    // just a core method that subclass probably won't override.
}

Extendable.extend(myBaseClass); // myBaseClass is a subclass of Extendable. This is how it starts.



function mySubClass() {
    this['super'](); // Call super constructor. Here, that would be myBaseClass.
    // do some stuff.
}

mySubClass.prototype.method1 = function() {
    // do some stuff in the subclass' version of base method.

    this['super'].method1(); // call the parent class' version of method1.

    // do more stuff....

    this.coreMethod();  // This will call the parent class coreMethod
                        // since it doesn't exist on the current class.
                        // It is inherrited.
}

myBaseClass.extend(mySubClass);
```

Additional features
===================

Creating a hook to execute whenever a subclass extends this class or any descendant class.

```javascript

myBaseClass.extendHook = function() {
    // do some stuff to handle when any subclass extends this class.
}

mySubClass.extendHook = function() {
    // do some stuff to handle extending
}

```

In the above code, when mySubClass extends myBaseClass, the myBaseClass extend hook is called
at the point ``` myBaseClass.extend(mySubClass); ``` is called.
