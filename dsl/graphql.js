"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Pact GraphQL module.
 *
 * @module GraphQL
 */
var interaction_1 = require("../dsl/interaction");
var matchers_1 = require("./matchers");
var lodash_1 = require("lodash");
var graphql_tag_1 = require("graphql-tag");
var graphQLQueryError_1 = require("../errors/graphQLQueryError");
var configurationError_1 = require("../errors/configurationError");
/**
 * GraphQL interface
 */
var GraphQLInteraction = /** @class */ (function (_super) {
    __extends(GraphQLInteraction, _super);
    function GraphQLInteraction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.operation = undefined;
        _this.variables = undefined;
        return _this;
    }
    /**
     * The type of GraphQL operation. Generally not required.
     */
    GraphQLInteraction.prototype.withOperation = function (operation) {
        this.operation = operation;
        return this;
    };
    /**
     * Any variables used in the Query
     */
    GraphQLInteraction.prototype.withVariables = function (variables) {
        this.variables = variables;
        return this;
    };
    /**
     * The actual GraphQL query as a string.
     *
     * NOTE: spaces are not important, Pact will auto-generate a space-insensitive matcher
     *
     *  e.g. the value for the "query" field in the GraphQL HTTP payload:
     *  '{ "query": "{
     *        Category(id:7) {
     *          id,
     *          name,
     *          subcategories {
     *            id,
     *            name
     *          }
     *        }
     *     }"
     *  }'
     */
    GraphQLInteraction.prototype.withQuery = function (query) {
        if (lodash_1.isNil(query)) {
            throw new configurationError_1.default("You must provide a GraphQL query.");
        }
        try {
            graphql_tag_1.default(query);
        }
        catch (e) {
            throw new graphQLQueryError_1.default("GraphQL Query is invalid: " + e.message);
        }
        this.query = query;
        return this;
    };
    /**
     * Returns the interaction object created.
     */
    GraphQLInteraction.prototype.json = function () {
        if (lodash_1.isNil(this.query)) {
            throw new configurationError_1.default("You must provide a GraphQL query.");
        }
        if (lodash_1.isNil(this.state.description)) {
            throw new graphQLQueryError_1.default("You must provide a description for the query.");
        }
        this.state.request = lodash_1.extend({
            body: lodash_1.omitBy({
                operationName: this.operation,
                query: matchers_1.regex({
                    generate: this.query,
                    matcher: escapeGraphQlQuery(this.query),
                }),
                variables: this.variables,
            }, lodash_1.isUndefined),
            headers: { "content-type": "application/json" },
            method: "POST",
        }, this.state.request);
        return this.state;
    };
    return GraphQLInteraction;
}(interaction_1.Interaction));
exports.GraphQLInteraction = GraphQLInteraction;
var escapeGraphQlQuery = function (s) { return escapeSpace(escapeRegexChars(s)); };
var escapeRegexChars = function (s) {
    return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
var escapeSpace = function (s) { return s.replace(/\s+/g, "\\s*"); };
//# sourceMappingURL=graphql.js.map