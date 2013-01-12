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
    return new FSM(spec, routerFunc);
}

module.exports = FSMHttp;
