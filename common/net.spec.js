"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-expression */
var logger_1 = require("./logger");
var net_1 = require("./net");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
chai.use(chaiAsPromised);
describe("Net", function () {
    var port = 4567;
    var host = "0.0.0.0";
    var specialPort = process.platform.match("win") ? -1 : 80;
    describe("#isPortAvailable", function () {
        context("when the port is not allowed to be bound", function () {
            it("returns a rejected promise", function () {
                return expect(net_1.isPortAvailable(specialPort, host)).to.eventually.be
                    .rejected;
            });
        });
        context("when the port is available", function () {
            it("returns a fulfilled promise", function () {
                return expect(net_1.isPortAvailable(port, host)).to.eventually.be.fulfilled;
            });
        });
        context("when the port is unavailable", function () {
            it("returns a rejected promise", function () {
                createServer(port).then(function (_) {
                    return expect(net_1.isPortAvailable(port, host)).to.eventually.be.rejected;
                });
            });
        });
    });
    // Utility function to create a server on a given port and return a Promise
    var createServer = function (p) {
        return new Promise(function (resolve, reject) {
            var nodeNet = require("net");
            var server = nodeNet.createServer();
            server.on("error", function (err) { return reject(err); });
            server.on("listening", function () { return resolve(server); });
            server.listen(p, host, function () {
                logger_1.default.info("test server is up on port " + p);
            });
        });
    };
});
//# sourceMappingURL=net.spec.js.map