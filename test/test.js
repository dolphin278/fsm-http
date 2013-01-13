var assert = require('assert');
var http = require('http');
var FSMHttp = require('../lib/FSM-http.js');

var machine = require('./machine.json');

var serverLog = {};

var server = http.createServer(function (req, res) {
    serverLog[req.url] = (serverLog[req.url] || 0) + 1;
    res.writeHead((req.url === "/ok") ? 200 : 400);
    res.end();
});

describe('FSM-http', function () {

    var fsm = null;
    before(function (done) {
        fsm = new FSMHttp(machine);
        server.listen(8889, done);
    });

    it('have fsm structure', function () {
        assert(fsm);
        assert(fsm.graph, JSON.stringify(fsm));
        assert(fsm.currentState === "A");
    });

    describe('when asked to follow AB', function () {
        before(function (done) {
            fsm.follow('AB', done);
        });

        it('should call /ok path on stub server', function () {
            assert(serverLog['/ok'] > 0);
        });

        it('should change state to "B"', function () {
            assert(fsm.currentState === "B");
        });

        it('should make async HTTP request to /stateNotify', function (done) {
            setTimeout(function () {
                assert(serverLog['/stateNotify'] > 0);
                done();
            }, 100);
        });

        describe('when then asked to follow BC', function () {
            var status = null;
            before(function (done) {
                fsm.follow('BC', function (err, st) {
                    assert(!err, err);
                    status = st;
                    done();
                });
            });

            it('should return false status because stub server return 400', function () {
                assert(!status);
            });

            it('should access /fail', function () {
                assert(serverLog['/fail'] > 0);
            });
        
        });

    });

    after(function (done) {
        server.close(done);
    });
});
