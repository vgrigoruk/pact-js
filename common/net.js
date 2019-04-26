"use strict";
/**
 * Network module.
 * @module net
 * @private
 */
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var bluebird_1 = require("bluebird");
var isPortAvailable = function (port, host) {
    return Promise.resolve(bluebird_1.Promise
        .each([host, "127.0.0.1", "localhost", "0.0.0.0"], function (h) {
        return portCheck(port, h);
    })
        .then(function () { return Promise.resolve(undefined); })
        .catch(function (e) { return Promise.reject(e); }));
};
exports.isPortAvailable = isPortAvailable;
var portCheck = function (port, host) {
    return new Promise(function (resolve, reject) {
        var server = net
            .createServer()
            .listen({ port: port, host: host, exclusive: true })
            .on("error", function (e) {
            if (e.code === "EADDRINUSE") {
                reject(new Error("Port " + port + " is unavailable on address " + host));
            }
            else {
                reject(e);
            }
        })
            .on("listening", function () {
            server.once("close", function () { return resolve(); }).close();
        });
    });
};
exports.portCheck = portCheck;
//# sourceMappingURL=net.js.map