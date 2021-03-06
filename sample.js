
if (typeof (Evented) == 'undefined') {
    // Montage Require
    if (typeof bootstrap === "function") {
        Evented = require('Evented');

    // CommonJS
    } else if (typeof exports === "object") {
        Evented = require('./evented.js');

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        Evented = require('Evented');

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            Evented = ses.Evented;
        }
    }
}

function ParentClass() {
    console.log("Parent constructor");
    this['super'](); // call super constructor
    this.test=1;
    this.otherProperty=2;
    this.on('test1.parentclass',function(arg) {
        console.log("called test event 1 in parent class of extended %s.",this.constructor.name);
    }.bind(this));
    try {
        this.on('test4.parentclass',function(arg) {
            console.log("called test event 4 in ParentClass of extended %s.",this.constructor.name);
        });
        console.log("An exception should have occurred.");
    } catch (e) {
        console.log("Correctly caught bad event request.");
    }
}
ParentClass.events = ["test1"];

ParentClass.prototype.parentFunction=function() {
    console.log("ParentFunction");
    if (!this.stop) {
        console.log("Calling inheritedFunction from parentFunction");
        this.stop=true;
        this.inheritedFunction();
        this.stop=false;
    } else {
        console.log("Not calling inheritedFunction");
    }
}

ParentClass.prototype.inheritedFunction=function() {
    console.log("Inherited function in parent class");
    this.parentFunction();
}

Evented.extend(ParentClass);

function ChildClass() {
    console.log("Child constructor");
    this['super'](); // call super constructor
    console.log("Done parent constructor");
    console.log("Should be '1': %s",this.test);
    this.parentFunction();
    this.inheritedFunction();
    this.on('test1.childclass',function(arg) {
        console.log("called test event 1 in %s.",this.constructor.name);
    }.bind(this));
    this.on('test2.childclass',function(arg) {
        console.log("called test event 2 in %s.",this.constructor.name);
    }.bind(this));
    this.on('test3.childclass',function(arg) {
        console.log("called test event 3 in %s.",this.constructor.name);
    }.bind(this));
}

ChildClass.events = ["test2","test3"];

ChildClass.prototype.inheritedFunction = function() {
    console.log("Inherited function in child class");
    if (!this.recursion) {
        console.log("Testing recursion from middle of inheritance chain.");
        this.recursion = true;
        this.inheritedFunction();
        this.recursion = false;
        console.log("Done. Now continuing up the heirarchy chain.");
    }
    this['super'].inheritedFunction();
}

ParentClass.extend(ChildClass);

function Child2Class() {
    console.log("Child constructor");
    this['super'](); // call super constructor
}

Child2Class.prototype.inheritedFunction = function() {
    console.log("Inherited function in child 2 class");
    this['super'].inheritedFunction();
}

ChildClass.extend(Child2Class);

var child = new Child2Class();
child.fire('test1');
child.fire('test2');
child.fire('test3');
