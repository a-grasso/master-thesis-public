// smithy-typescript generated code
import {
  ServiceInputTypes,
  ServiceOutputTypes,
  WeatherClientResolvedConfig,
} from "../WeatherClient";
import {
  PublishMessagesInput,
  PublishMessagesInputFilterSensitiveLog,
} from "../models/models_0";
import { getEventStreamPlugin } from "@aws-sdk/middleware-eventstream";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";

/**
 * @public
 */
export { __MetadataBearer, $Command };
/**
 * @public
 *
 * The input for {@link PublishMessagesCommand}.
 */
export interface PublishMessagesCommandInput extends PublishMessagesInput {}
/**
 * @public
 *
 * The output of {@link PublishMessagesCommand}.
 */
export interface PublishMessagesCommandOutput extends __MetadataBearer {}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { WeatherClient, PublishMessagesCommand } from "@weather-service/client"; // ES Modules import
 * // const { WeatherClient, PublishMessagesCommand } = require("@weather-service/client"); // CommonJS import
 * const client = new WeatherClient(config);
 * const input = { // PublishMessagesInput
 *   room: "STRING_VALUE",
 *   messages: { // PublishEvents Union: only one key present
 *     message: { // Message
 *       message: "STRING_VALUE",
 *     },
 *     leave: {},
 *   },
 * };
 * const command = new PublishMessagesCommand(input);
 * const response = await client.send(command);
 * // {};
 *
 * ```
 *
 * @param PublishMessagesCommandInput - {@link PublishMessagesCommandInput}
 * @returns {@link PublishMessagesCommandOutput}
 * @see {@link PublishMessagesCommandInput} for command's `input` shape.
 * @see {@link PublishMessagesCommandOutput} for command's `response` shape.
 * @see {@link WeatherClientResolvedConfig | config} for WeatherClient's `config` shape.
 *
 * @throws {@link WeatherServiceException}
 * <p>Base exception class for all service exceptions from Weather service.</p>
 *
 */
export class PublishMessagesCommand extends $Command.classBuilder<PublishMessagesCommandInput, PublishMessagesCommandOutput, WeatherClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>()
      .m(function (this: any, Command: any, cs: any, config: WeatherClientResolvedConfig, o: any) {
          return [

  getSerdePlugin(config, this.serialize, this.deserialize),
  getEventStreamPlugin(config),
      ];
  })
  .s("Weather", "PublishMessages", {

    /**
     * @internal
     */
    eventStream: {
      input: true,
    },
  })
  .n("WeatherClient", "PublishMessagesCommand")
  .f(PublishMessagesInputFilterSensitiveLog, void 0)
  .ser(() => { throw new Error("No supported protocol was found"); })
  .de(() => { throw new Error("No supported protocol was found"); })
.build() {
}
