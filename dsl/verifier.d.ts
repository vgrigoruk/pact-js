import * as express from "express";
import { LogLevel } from "./options";
export interface ProviderState {
    states?: [string];
}
export interface StateHandler {
    [name: string]: () => Promise<any>;
}
export interface VerifierOptions {
    logLevel?: LogLevel;
    requestFilter?: express.RequestHandler;
    stateHandlers?: StateHandler;
    providerBaseUrl: string;
    provider?: string;
    pactUrls?: string[];
    pactBrokerBaseUrl?: string;
    providerStatesSetupUrl?: string;
    pactBrokerUsername?: string;
    pactBrokerPassword?: string;
    consumerVersionTag?: string | string[];
    customProviderHeaders?: string[];
    publishVerificationResult?: boolean;
    providerVersion?: string;
    pactBrokerUrl?: string;
    timeout?: number;
    monkeypatch?: string;
    format?: "json" | "RspecJunitFormatter";
    out?: string;
    validateSSL?: boolean;
    changeOrigin?: boolean;
}
export declare class Verifier {
    private address;
    private stateSetupPath;
    private config;
    private deprecatedFields;
    constructor(config?: VerifierOptions);
    /**
     * Verify a HTTP Provider
     *
     * @param config
     */
    verifyProvider(config?: VerifierOptions): Promise<any>;
    private runProviderVerification;
    private waitForServerReady;
    private startProxy;
    private createProxy;
    private createProxyStateHandler;
    private setupStates;
    private setConfig;
}
