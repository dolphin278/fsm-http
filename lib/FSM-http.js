var FSM = require('node-fsm');
var request = require('request');

// Fields from obj2 takes precedence of obj1 fields.
function mixin(obj1, obj2) {
    var result = JSON.parse(JSON.stringify(obj1));
    for (var field in obj2) {
        if (obj2.hasOwnProperty(field)) {
            result[field] = obj2[field];
        }
    }
    return result;
}

function routerFunc(edge, callback) {
    var self = this;
    if (edge.request) {
        var req = JSON.parse(JSON.stringify(edge.request));
        req.json = mixin(
            edge.request.json || {},
            self.data || {}
        );
        request(req, function (err, r, body) {
            if (typeof body === "object") {
                self.data = body;
            }
            // TODO: Need more sophisticated logic
            callback(err, r.statusCode === 200);
        });
    } else {
        return callback(null, true);
    }
}

function FSMHttp(spec) {
    var fsm = new FSM(spec, routerFunc);
    if (Array.isArray(fsm)) {
        return fsm;
    };
    fsm.on('state', function (edge) {
        var newState = this.getGraph().getNode(edge.to);
        if (newState && newState.request) {
            request(newState.request);
        }
    });
    return fsm;
}

module.exports = FSMHttp;
