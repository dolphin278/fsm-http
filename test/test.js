var assert = require('assert');
var http = require('http');
var FSMHttp = require('../lib/FSM-http.js');

var machine = require('./machine.json');

var serverLog = {};
var contentLog = {};

var server = http.createServer(function (req, res) {
    serverLog[req.url] = (serverLog[req.url] || 0) + 1;
    contentLog[req.url] = '';
    res.writeHead((req.url === "/ok") ? 200 : 400);
    // console.log(req.url);
    req.on('data', function (data) {
      // console.log('req->', data.toString());
        contentLog[req.url] += data;
    });
    req.on('end', function () {
        res.end();  
    });
    // req.pipe(process.stdout);
    // req.on('end', function () {
    //   res.end();      
    // });
    
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
        
        it('http request on transition should have fsm data in it', function (done) {
            setTimeout(function () {
                assert(contentLog['/ok']);
                var parsedData = JSON.parse(contentLog['/ok']);
                assert(parsedData);
                assert(parsedData.customMachineData);
                assert(parsedData.customMachineData === "someData");
                done();
            }, 100)
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
