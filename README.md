fsm-http
========
FSM that uses remote HTTP calls to allow state transitions.

## Installation

```npm install node-fsm-http```

## Usage

Works as a wrapper [node-fsm](https://github.com/dolphin278/fsm) to allow fsm to use external HTTP requests to check, whether our state transition is valid. Basically, it provides default routerFunc for `node-fsm`.

In essence, you just provide your machine description the same way as for `node-fsm` but now you place optional `request` field to you edge objects:

```
var machine = {
    "nodes": [
        …
        {
            "name": "B",
            "request": {
                "uri": "http://localhost:8889/stateNotify"
            }
        },
        …
    ],
    "edges": [
        {
            "name": "AB",
            "from": "A",
            "to": "B",
            "request": {
                "uri": "http://localhost:8889/ok" // <- THIS
            }
        }
    ],
    "currentState": "A"
}

/// then, you create fsm-http instance without `routerFunc`:
var FSMHttp = require('node-fsm-http');

var fsm = new FSMHttp(machine);
```

now, you use same methods as for plain [node-fsm](https://github.com/dolphin278/fsm), but when you attempt to change machine state, fsm performs http request specified by `request` field of edge object you trying to follow. If http request returns HTTP status 200, transition successfull, otherwise it fails.

`node-fsm-http` uses [`request`](https://github.com/mikeal/request) module to perform HTTP request, using `request` value as `option` value for request (module), so you have many options to pass data from your fsm to external endpoints (see ['request' documentation on 'options' object](https://github.com/mikeal/request#requestoptions-callback)), for example, you could specify different HTTP verbs to perform request, or provide request payload to pass form data to external HTTP endpoint, etc.

If egge you trying to follow doesn't have `request` field, fsm decides that transition is successful by default.

###State change HTTP notification

State objects could also have `request` field. If specified, we make asynchronous HTTP request using this value as `request()` options object (same approach as for edge).

**Important**: Regardless of this call result, machine will not change it state, even if remote enpoint returned error code.


## TODO:

* Combine fsm's `data` field with `request` field subfields like `json` or `body`.
* Update fsm's `data` field with result of HTTP query
* Add HTTP notifications when state changes.