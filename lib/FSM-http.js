var FSM = require('node-fsm');
var request = require('request');

function routerFunc(edge, callback) {
    if (edge.request) {
        request(edge.request, function (err, r, body) {
            // TODO: Need more sophisticated logic
            callback(err, r.statusCode === 200);
        });
    } else {
        return callback(null, true);
    }
}

function FSMHttp(spec) {
    var fsm = new FSM(spec, routerFunc);
    fsm.on('state', function (edge) {
        var newState = this.graph.getNode(edge.to);
        if (newState && newState.request) {
            request(newState.request);
        }
    });
    return fsm;
}

module.exports = FSMHttp;
