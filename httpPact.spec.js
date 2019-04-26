"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty no-console no-string-literal*/
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var request_1 = require("./common/request");
var interaction_1 = require("./dsl/interaction");
var mockService_1 = require("./dsl/mockService");
var pact_node_1 = require("@pact-foundation/pact-node");
var httpPact_1 = require("./httpPact");
var ts_mock_imports_1 = require("ts-mock-imports");
// Mock out the PactNode interfaces
var PactServer = /** @class */ (function () {
    function PactServer() {
    }
    PactServer.prototype.start = function () { };
    PactServer.prototype.delete = function () { };
    return PactServer;
}());
chai.use(sinonChai);
chai.use(chaiAsPromised);
var expect = chai.expect;
describe("Pact", function () {
    var pact;
    var fullOpts = {
        consumer: "A",
        provider: "B",
        port: 1234,
        host: "127.0.0.1",
        ssl: false,
        logLevel: "info",
        spec: 2,
        cors: false,
        pactfileWriteMode: "overwrite",
    };
    before(function () {
        // Stub out pact-node
        var manager = ts_mock_imports_1.ImportMock.mockClass(pact_node_1.default, "createServer");
        manager.mock("createServer", function () { });
    });
    beforeEach(function () {
        pact = Object.create(httpPact_1.Pact.prototype);
        pact.opts = fullOpts;
    });
    afterEach(function () {
        sinon.restore();
        // return serviceFactory.removeAllServers()
    });
    describe("#constructor", function () {
        it("throws Error when consumer not provided", function () {
            expect(function () {
                new httpPact_1.Pact({ consumer: "", provider: "provider" });
            }).to.throw(Error, "You must specify a Consumer for this pact.");
        });
        it("throws Error when provider not provided", function () {
            expect(function () {
                new httpPact_1.Pact({ consumer: "someconsumer", provider: "" });
            }).to.throw(Error, "You must specify a Provider for this pact.");
        });
    });
    describe("#createOptionsWithDefault", function () {
        var constructorOpts = {
            consumer: "A",
            provider: "B",
        };
        it("merges options with sensible defaults", function () {
            var opts = httpPact_1.Pact.createOptionsWithDefaults(constructorOpts);
            expect(opts.consumer).to.eq("A");
            expect(opts.provider).to.eq("B");
            expect(opts.cors).to.eq(false);
            expect(opts.host).to.eq("127.0.0.1");
            expect(opts.logLevel).to.eq("info");
            expect(opts.spec).to.eq(2);
            expect(opts.dir).not.to.be.empty;
            expect(opts.log).not.to.be.empty;
            expect(opts.pactfileWriteMode).to.eq("overwrite");
            expect(opts.ssl).to.eq(false);
            expect(opts.sslcert).to.eq(undefined);
            expect(opts.sslkey).to.eq(undefined);
        });
    });
    describe("#setup", function () {
        var serverMock = {
            start: function () { return Promise.resolve(); },
            options: { port: 1234 },
            logLevel: function (a) { },
        };
        describe("when server is not properly configured", function () {
            describe("and pact-node is unable to start the server", function () {
                it("returns a rejected promise", function () { return __awaiter(_this, void 0, void 0, function () {
                    var p;
                    return __generator(this, function (_a) {
                        p = new httpPact_1.Pact(fullOpts);
                        p.server = {
                            start: function () { return Promise.reject("pact-node error"); },
                            options: { port: 1234 },
                        };
                        return [2 /*return*/, expect(p.setup()).to.eventually.be.rejectedWith("pact-node error")];
                    });
                }); });
            });
        });
        describe("when server is properly configured", function () {
            it("starts the mock server in the background", function () {
                var p = new httpPact_1.Pact(fullOpts);
                p.server = serverMock;
                return expect(p.setup()).to.eventually.be.fulfilled;
            });
        });
        describe("when server is properly configured", function () {
            it("returns the current configuration", function () {
                var p = new httpPact_1.Pact(fullOpts);
                p.server = serverMock;
                return expect(p.setup()).to.eventually.include({
                    consumer: "A",
                    provider: "B",
                    port: 1234,
                    host: "127.0.0.1",
                    ssl: false,
                    logLevel: "info",
                    spec: 2,
                    cors: false,
                    pactfileWriteMode: "overwrite",
                });
            });
        });
    });
    describe("#addInteraction", function () {
        var interaction = {
            state: "i have a list of projects",
            uponReceiving: "a request for projects",
            withRequest: {
                method: request_1.HTTPMethod.GET,
                path: "/projects",
                headers: { Accept: "application/json" },
            },
            willRespondWith: {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: {},
            },
        };
        describe("when given a provider state", function () {
            it("creates interaction with state", function () {
                pact.mockService = {
                    addInteraction: function (int) { return Promise.resolve(int.state); },
                };
                return expect(pact.addInteraction(interaction)).to.eventually.have.property("providerState");
            });
        });
        describe("when not given a provider state", function () {
            it("creates interaction with no state", function () {
                pact.mockService = {
                    addInteraction: function (int) { return Promise.resolve(int.state); },
                };
                interaction.state = undefined;
                return expect(pact.addInteraction(interaction)).to.eventually.not.have.property("providerState");
            });
            describe("when given an Interaction as a builder", function () {
                it("creates interaction", function () {
                    var interaction2 = new interaction_1.Interaction()
                        .given("i have a list of projects")
                        .uponReceiving("a request for projects")
                        .withRequest({
                        method: request_1.HTTPMethod.GET,
                        path: "/projects",
                        headers: { Accept: "application/json" },
                    })
                        .willRespondWith({
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                        body: {},
                    });
                    pact.mockService = {
                        addInteraction: function (int) {
                            return Promise.resolve(int);
                        },
                    };
                    return expect(pact.addInteraction(interaction2)).to.eventually.have.property("given");
                });
            });
        });
    });
    describe("#verify", function () {
        describe("when pact verification is successful", function () {
            it("returns a successful promise and remove interactions", function () {
                pact.mockService = {
                    verify: function () { return Promise.resolve("verified!"); },
                    removeInteractions: function () { return Promise.resolve("removeInteractions"); },
                };
                var verifyPromise = pact.verify();
                return Promise.all([
                    expect(verifyPromise).to.eventually.eq("removeInteractions"),
                    expect(verifyPromise).to.eventually.be.fulfilled,
                ]);
            });
        });
        describe("when pact verification is unsuccessful", function () {
            it("throws an error", function () {
                var removeInteractionsStub = sinon
                    .stub(mockService_1.MockService.prototype, "removeInteractions")
                    .resolves("removeInteractions");
                pact.mockService = {
                    verify: function () { return Promise.reject("not verified!"); },
                    removeInteractions: removeInteractionsStub,
                };
                var verifyPromise = pact.verify();
                return Promise.all([
                    expect(verifyPromise).to.eventually.be.rejectedWith(Error),
                    verifyPromise.catch(function () {
                        return expect(removeInteractionsStub).to.callCount(1);
                    }),
                ]);
            });
        });
        describe("when pact verification is successful", function () {
            describe("and an error is thrown in the cleanup", function () {
                it("throws an error", function () {
                    pact.mockService = {
                        verify: function () { return Promise.resolve("verified!"); },
                        removeInteractions: function () {
                            throw new Error("error removing interactions");
                        },
                    };
                    return expect(pact.verify()).to.eventually.be.rejectedWith(Error);
                });
            });
        });
    });
    describe("#finalize", function () {
        describe("when writing Pact is successful", function () {
            it("returns a successful promise and shuts down down the mock server", function () {
                pact.mockService = {
                    writePact: function () { return Promise.resolve("pact file written!"); },
                    removeInteractions: sinon.stub(),
                };
                pact.server = {
                    delete: function () { return Promise.resolve(); },
                };
                return expect(pact.finalize()).to.eventually.be.fulfilled;
            });
        });
        describe("when writing Pact is unsuccessful", function () {
            it("throws an error and shuts down the server", function () {
                pact.mockService = {
                    writePact: function () { return Promise.reject(new Error("pact not file written!")); },
                    removeInteractions: sinon.stub(),
                };
                var deleteStub = sinon.stub(PactServer.prototype, "delete").resolves();
                pact.server = { delete: deleteStub };
                return expect(pact.finalize()).to.eventually.be.rejected.then(function () {
                    return expect(deleteStub).to.callCount(1);
                });
            });
        });
        describe("when writing pact is successful and shutting down the mock server is unsuccessful", function () {
            it("throws an error", function () {
                pact.mockService = {
                    writePact: sinon.stub(),
                    removeInteractions: sinon.stub(),
                };
                pact.server = {
                    delete: function () { return Promise.reject(); },
                };
                return expect(pact.finalize).to.throw(Error);
            });
        });
    });
    describe("#writePact", function () {
        describe("when writing Pact is successful", function () {
            it("returns a successful promise", function () {
                pact.mockService = {
                    writePact: function () { return Promise.resolve("pact file written!"); },
                    removeInteractions: sinon.stub(),
                };
                var writePactPromise = pact.writePact();
                return Promise.all([
                    expect(writePactPromise).to.eventually.eq("pact file written!"),
                    expect(writePactPromise).to.eventually.be.fulfilled,
                ]);
            });
        });
    });
    describe("#removeInteractions", function () {
        describe("when removing interactions is successful", function () {
            it("returns a successful promise", function () {
                pact.mockService = {
                    removeInteractions: function () { return Promise.resolve("interactions removed!"); },
                };
                var removeInteractionsPromise = pact.removeInteractions();
                return Promise.all([
                    expect(removeInteractionsPromise).to.eventually.eq("interactions removed!"),
                    expect(removeInteractionsPromise).to.eventually.be.fulfilled,
                ]);
            });
        });
    });
});
//# sourceMappingURL=httpPact.spec.js.map