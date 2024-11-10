// smithy-typescript generated code
import {
  ServiceInputTypes,
  ServiceOutputTypes,
  WeatherClientResolvedConfig,
} from "../WeatherClient";
import {
  SubscribeToMovementsInput,
  SubscribeToMovementsOutput,
  SubscribeToMovementsOutputFilterSensitiveLog,
} from "../models/models_0";
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
 * The input for {@link SubscribeToMovementsCommand}.
 */
export interface SubscribeToMovementsCommandInput extends SubscribeToMovementsInput {}
/**
 * @public
 *
 * The output of {@link SubscribeToMovementsCommand}.
 */
export interface SubscribeToMovementsCommandOutput extends SubscribeToMovementsOutput, __MetadataBearer {}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { WeatherClient, SubscribeToMovementsCommand } from "@weather-service/client"; // ES Modules import
 * // const { WeatherClient, SubscribeToMovementsCommand } = require("@weather-service/client"); // CommonJS import
 * const client = new WeatherClient(config);
 * const input = {};
 * const command = new SubscribeToMovementsCommand(input);
 * const response = await client.send(command);
 * // { // SubscribeToMovementsOutput
 * //   movements: { // MovementEvents Union: only one key present
 * //     up: { // Movement
 * //       velocity: Number("float"),
 * //     },
 * //     down: {
 * //       velocity: Number("float"),
 * //     },
 * //     left: {
 * //       velocity: Number("float"),
 * //     },
 * //     right: {
 * //       velocity: Number("float"),
 * //     },
 * //     throttlingError: {},
 * //   },
 * // };
 *
 * ```
 *
 * @param SubscribeToMovementsCommandInput - {@link SubscribeToMovementsCommandInput}
 * @returns {@link SubscribeToMovementsCommandOutput}
 * @see {@link SubscribeToMovementsCommandInput} for command's `input` shape.
 * @see {@link SubscribeToMovementsCommandOutput} for command's `response` shape.
 * @see {@link WeatherClientResolvedConfig | config} for WeatherClient's `config` shape.
 *
 * @throws {@link WeatherServiceException}
 * <p>Base exception class for all service exceptions from Weather service.</p>
 *
 */
export class SubscribeToMovementsCommand extends $Command.classBuilder<SubscribeToMovementsCommandInput, SubscribeToMovementsCommandOutput, WeatherClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>()
      .m(function (this: any, Command: any, cs: any, config: WeatherClientResolvedConfig, o: any) {
          return [

  getSerdePlugin(config, this.serialize, this.deserialize),
      ];
  })
  .s("Weather", "SubscribeToMovements", {

    /**
     * @internal
     */
    eventStream: {
      output: true,
    },
  })
  .n("WeatherClient", "SubscribeToMovementsCommand")
  .f(void 0, SubscribeToMovementsOutputFilterSensitiveLog)
  .ser(() => { throw new Error("No supported protocol was found"); })
  .de(() => { throw new Error("No supported protocol was found"); })
.build() {
}
