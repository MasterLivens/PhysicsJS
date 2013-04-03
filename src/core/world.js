(function(){

var defaults = {
    name: false,
    timestep: 1000.0 / 60,
    maxSteps: 4,
    webworker: false, // to implement
    integrator: 'improved-euler'
};

var World = function World( cfg, fn ){

    if (!(this instanceof World)){
        return new World( cfg, fn );
    }
    
    this.init( cfg, fn );
};

World.prototype = {

    init: function( cfg, fn ){

        // prevent double initialization
        this.init = true;

        this._bodies = [];
        this._behaviorStack = [];
        this._integrator = null;
        this._paused = false;
        this._opts = {};

        // set options
        this.options( cfg );

        // apply the callback function
        if (typeof fn === 'function'){

            fn.apply(this, [ this ]);
        }
    },

    // get/set options
    options: function( cfg ){

        if (cfg){

            // extend the defaults
            Physics.util.extend(this._opts, defaults, cfg);
            // set timestep
            this.timeStep(this._opts.timestep);
            // add integrator
            this.add(Physics.integrator(this._opts.integrator));

            return this;
        }

        return Physics.util.extend({}, this._opts);
    },

    // add objects, integrators, behaviors...
    add: function( arg ){

        var i = 0
            ,len = arg && arg.length || 0
            ,thing = len ? arg[ 0 ] : arg
            ;

        // we'll either cycle through an array
        // or just run this on the arg itself
        do {
            switch (thing.type){

                case 'behavior':
                    this.addBehavior(thing);
                break; // end behavior

                case 'integrator':
                    this._integrator = thing;
                break; // end integrator

                // assume physical body
                default:
                    this.addBody(thing);
                break; // end default
            }
        } while ( ++i < len && (thing = arg[ i ]) )

        return this;
    },

    // add a behavior
    addBehavior: function( behavior ){

        // TODO more...
        this._behaviorStack.push( behavior );
        return this;
    },

    addBody: function( body ){

        this._bodies.push( body );
        return this;
    },

    applyBehaviors: function(){

    },

    // internal method
    substep: function(){

        this.applyBehaviors();
        this._integrator.integrate(dt, this._bodies)

        // this.doInteractions( 'beforeAccel', dt );
        // this.resolveAcceleration( dt );
        // this.doInteractions( 'afterAccel', dt );
        // this.resolveInertia( dt );
        // this.doInteractions( 'afterInertia', dt );
    },

    step: function( now ){
        
        if ( this._paused ){

            this._time = false;
            return this;
        }

        var time = this._time || (this._time = now)
            ,diff = now - time
            ;

        if ( !diff ) return this;
        
        // set some stats
        this.FPS = 1000/diff;
        this.nsteps = Math.ceil(diff/this._dt);

        // limit number of substeps in each step
        if ( diff > this._maxJump ){

            this._time = now - this._maxJump;
        }

        while ( this._time < now ){
            this._time += dt;
            this.substep();
        }

        return this;
    },

    pause: function(){

        this._paused = true;
        return this;
    },

    unpause: function(){

        this._paused = false;
        return this;
    },

    isPaused: function(){

        return !!this._paused;
    },

    timeStep: function( dt ){

        if ( dt ){

            this._dt = dt;
            // calculate the maximum jump in time over which to do substeps
            this._maxJump = dt * this._opts.maxSteps;

            return this;
        }

        return this._dt;
    },

    // TODO: find bodies
    // select: function( sel ){

    //     if (!sel){

    //         // fast array copy
    //         return this._bodies.splice(0);
    //     }

    //     // TODO
    // }

    getByClassName: function( klass ){

        var bodies = this._bodies
            ,obj
            ,ret = []
            ;

        for ( var i = 0, l = bodies.length; i < l; ++i ){
            
            obj = bodies[ i ];

            if ( obj.hasClass( klass ) ){

                ret.push( obj );
            }
        }

        return ret;
    }
};

Physics.world = World;
    
}());