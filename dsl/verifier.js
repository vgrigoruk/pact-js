"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
var pact_node_1 = require("@pact-foundation/pact-node");
var utils_1 = require("../common/utils");
var pact_node_2 = require("@pact-foundation/pact-node");
var lodash_1 = require("lodash");
var express = require("express");
var http = require("http");
var logger_1 = require("../common/logger");
var configurationError_1 = require("../errors/configurationError");
var HttpProxy = require("http-proxy");
var bodyParser = require("body-parser");
var Verifier = /** @class */ (function () {
    function Verifier(config) {
        this.address = "http://localhost";
        this.stateSetupPath = "/_pactSetup";
        this.deprecatedFields = ["providerStatesSetupUrl"];
        if (config) {
            this.setConfig(config);
        }
    }
    /**
     * Verify a HTTP Provider
     *
     * @param config
     */
    Verifier.prototype.verifyProvider = function (config) {
        logger_1.default.info("Verifying provider");
        // Backwards compatibility
        if (config) {
            logger_1.default.warn("Passing options to verifyProvider() wil be deprecated in future versions, please provide to Verifier constructor instead");
            this.setConfig(config);
        }
        if (lodash_1.isEmpty(this.config)) {
            return Promise.reject(new configurationError_1.default("No configuration provided to verifier"));
        }
        // Start the verification CLI proxy server
        var app = this.createProxy();
        var server = this.startProxy(app);
        // Run the verification once the proxy server is available
        return this.waitForServerReady(server)
            .then(this.runProviderVerification())
            .then(function (result) {
            server.close();
            return result;
        })
            .catch(function (e) {
            server.close();
            throw e;
        });
    };
    // Run the Verification CLI process
    Verifier.prototype.runProviderVerification = function () {
        var _this = this;
        return function (server) {
            var opts = __assign({ providerStatesSetupUrl: _this.address + ":" + server.address().port + _this.stateSetupPath }, lodash_1.omit(_this.config, "handlers"), { providerBaseUrl: _this.address + ":" + server.address().port });
            return utils_1.qToPromise(pact_node_1.default.verifyPacts(opts));
        };
    };
    // Listens for the server start event
    // Converts event Emitter to a Promise
    Verifier.prototype.waitForServerReady = function (server) {
        return new Promise(function (resolve, reject) {
            server.on("listening", function () { return resolve(server); });
            server.on("error", function () {
                return reject(new Error("Unable to start verification proxy server"));
            });
        });
    };
    // Get the Proxy we'll pass to the CLI for verification
    Verifier.prototype.startProxy = function (app) {
        return http.createServer(app).listen();
    };
    // Get the Express app that will run on the HTTP Proxy
    Verifier.prototype.createProxy = function () {
        var _this = this;
        var app = express();
        var proxy = new HttpProxy();
        app.use(this.stateSetupPath, bodyParser.json());
        app.use(this.stateSetupPath, bodyParser.urlencoded({ extended: true }));
        // Allow for request filtering
        if (this.config.requestFilter !== undefined) {
            app.use(this.config.requestFilter);
        }
        // Setup provider state handler
        app.post(this.stateSetupPath, this.createProxyStateHandler());
        // Proxy server will respond to Verifier process
        app.all("/*", function (req, res) {
            logger_1.default.debug("Proxing", req.path);
            proxy.web(req, res, {
                changeOrigin: _this.config.changeOrigin === true,
                secure: _this.config.validateSSL === true,
                target: _this.config.providerBaseUrl,
            });
        });
        return app;
    };
    Verifier.prototype.createProxyStateHandler = function () {
        var _this = this;
        return function (req, res) {
            var message = req.body;
            return _this.setupStates(message)
                .then(function () { return res.sendStatus(200); })
                .catch(function (e) { return res.status(500).send(e); });
        };
    };
    // Lookup the handler based on the description, or get the default handler
    Verifier.prototype.setupStates = function (descriptor) {
        var _this = this;
        var promises = new Array();
        if (descriptor.states) {
            descriptor.states.forEach(function (state) {
                var handler = _this.config.stateHandlers
                    ? _this.config.stateHandlers[state]
                    : null;
                if (handler) {
                    promises.push(handler());
                }
                else {
                    logger_1.default.warn("No state handler found for \"" + state + "\", ignorning");
                }
            });
        }
        return Promise.all(promises);
    };
    Verifier.prototype.setConfig = function (config) {
        var _this = this;
        this.config = config;
        this.deprecatedFields.forEach(function (f) {
            if (_this.config[f]) {
                logger_1.default.warn(f + " is deprecated, and will be removed in future versions");
            }
        });
        if (this.config.validateSSL === undefined) {
            this.config.validateSSL = true;
        }
        if (this.config.changeOrigin === undefined) {
            this.config.changeOrigin = false;
        }
        if (this.config.logLevel && !lodash_1.isEmpty(this.config.logLevel)) {
            pact_node_2.default.logLevel(this.config.logLevel);
            logger_1.default.level(this.config.logLevel);
        }
    };
    return Verifier;
}());
exports.Verifier = Verifier;
//# sourceMappingURL=verifier.js.map