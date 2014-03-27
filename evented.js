/* jshint
 laxcomma: true
 */

// Evented
(function (definition) {
    // Turn off strict mode for this function so we can assign to global.
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.

    // Montage Require
    if (typeof bootstrap === "function") {
        Extendable = require('Extendable');
        bootstrap("Evented", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        Extendable = require('./extendable.js');
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        Extendable = require('Extendable');
        define('Evented',definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.Evented = definition;
        }

    // <script>
    } else {
        Evented = definition();
    }

})(function () {
    function Evented() {
        this['super']();
        this.dispatch = dispatcher(this.constructor.events);
        return this;   // I just do this to explicitly know what is being returned.
    }

    Evented.events = ['disposed'];

    function dispatcher(events) {
        var eventList = {};
        events.forEach(function(e) {
            eventList[e]=(function(event){var x=function(/* event arguments */) {
                var args = [].slice.call(arguments);
                var handlers = eventList[event].handlers;
                Object.keys(handlers).forEach(function(e) {
                    try {
                        handlers[e].apply(this,args);
                    } catch (exception) {
                        console.log("An error occurred during event execution: %s.%s\n%s: %s",event,e,exception.toString(),exception.stack);
                    }
                });
            };x.handlers={};return x;})(e);
        });
        eventList.on=function(event,handler) {
            event = event.split('.');
            if (!handler) {
                delete eventList[event[0]].handlers[event[1]];
            }
            else eventList[event[0]].handlers[event[1]]=handler;
        }
        return eventList;

    }
    Evented.prototype.on = function (event, callback) {
        if (!this.dispatch || !this.dispatch.on) this.dispatch = dispatcher(this.constructor.events);
        var type = event.split('.').shift();
        if (this.dispatch[type]) {
            try {
                return this.dispatch.on(event, callback); // pass full event name to dispatch
            } catch (e) {
                console.error("During %s",event);
                console.error(e.stack);
            }
        }
        throw "Invalid event " + type;
    };

    Evented.prototype.fire = function (event /*,args...*/) {
        if (!this.dispatch || !this.dispatch.on || this.__silenceEvents) return;
        var type = event.split('.').shift()
            , args = [].slice.call(arguments, 1)
            ;
        if (this.dispatch[type]) {
            this.dispatch[type].apply(this.dispatch[type], args); // pass full event name to dispatch
        }
    };

    Evented.prototype.debounceFire = function (event, wait, immediate /*, args... */) {
        if (!this.dispatch || !this.dispatch.on || this.__silenceEvents) return;
        var type = event.split('.').shift()
            , timeout
            , debounceFuncs = this.constructor.prototype.debounceFire
            , args = [].slice.call(arguments, 3)
            ;
        args.unshift(event);
        if (!this.dispatch[type]) return;
        if (!debounceFuncs[event]) {
            debounceFuncs[event] = function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) context.fire.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, debounceFuncs[event].wait);
                if (callNow) context.fire.apply(context, args);
            };
            debounceFuncs[event].wait = wait;
        }
        return debounceFuncs[event].apply(this, args); // pass full event name to dispatch
    };

    Evented.prototype.silenceEvents = function (flag) {
        this.__silenceEvents = flag || false;
    };

    Evented.prototype.dispose = function () {
        this["super"].dispose();
        this.fire('disposed');
    };

    Evented.extendHook = function (child) {
        child.events = (this.events || []).concat(child.events || []);
    };

    return Extendable.extend(Evented);

});
