// smithy-typescript generated code
// @ts-ignore: package.json will be imported from dist folders
import packageInfo from "../package.json"; // eslint-disable-line

import { Sha256 } from "@aws-crypto/sha256-browser";
import { defaultUserAgent } from "@aws-sdk/util-user-agent-browser";
import { eventStreamSerdeProvider } from "@smithy/eventstream-serde-browser";
import {
  FetchHttpHandler as RequestHandler,
  streamCollector,
} from "@smithy/fetch-http-handler";
import { invalidFunction } from "@smithy/invalid-dependency";
import { calculateBodyLength } from "@smithy/util-body-length-browser";
import {
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_MODE,
} from "@smithy/util-retry";
import { WeatherClientConfig } from "./WeatherClient";
import { getRuntimeConfig as getSharedRuntimeConfig } from "./runtimeConfig.shared";
import { loadConfigsForDefaultMode } from "@smithy/smithy-client";
import { resolveDefaultsModeConfig } from "@smithy/util-defaults-mode-browser";

/**
 * @internal
 */
export const getRuntimeConfig = (config: WeatherClientConfig) => {
  const defaultsMode = resolveDefaultsModeConfig(config);
  const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
  const clientSharedValues = getSharedRuntimeConfig(config);
  return {
    ...clientSharedValues,
    ...config,
    runtime: "browser",
    defaultsMode,
    bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
    defaultUserAgentProvider: config?.defaultUserAgentProvider ?? defaultUserAgent({clientVersion: packageInfo.version}),
    eventStreamPayloadHandlerProvider: config?.eventStreamPayloadHandlerProvider ?? (() => ({handle: invalidFunction("event stream request is not supported in browser."),})),
    eventStreamSerdeProvider: config?.eventStreamSerdeProvider ?? eventStreamSerdeProvider,
    maxAttempts: config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    requestHandler: RequestHandler.create(config?.requestHandler ?? defaultConfigProvider),
    retryMode: config?.retryMode ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
    sha256: config?.sha256 ?? Sha256,
    streamCollector: config?.streamCollector ?? streamCollector,
  };
};
