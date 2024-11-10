// smithy-typescript generated code
import {
  ServiceInputTypes,
  ServiceOutputTypes,
  WeatherClientResolvedConfig,
} from "../WeatherClient";
import { GetCurrentTimeOutput } from "../models/models_0";
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
 * The input for {@link GetCurrentTimeCommand}.
 */
export interface GetCurrentTimeCommandInput {}
/**
 * @public
 *
 * The output of {@link GetCurrentTimeCommand}.
 */
export interface GetCurrentTimeCommandOutput extends GetCurrentTimeOutput, __MetadataBearer {}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { WeatherClient, GetCurrentTimeCommand } from "@weather-service/client"; // ES Modules import
 * // const { WeatherClient, GetCurrentTimeCommand } = require("@weather-service/client"); // CommonJS import
 * const client = new WeatherClient(config);
 * const input = {};
 * const command = new GetCurrentTimeCommand(input);
 * const response = await client.send(command);
 * // { // GetCurrentTimeOutput
 * //   time: new Date("TIMESTAMP"), // required
 * // };
 *
 * ```
 *
 * @param GetCurrentTimeCommandInput - {@link GetCurrentTimeCommandInput}
 * @returns {@link GetCurrentTimeCommandOutput}
 * @see {@link GetCurrentTimeCommandInput} for command's `input` shape.
 * @see {@link GetCurrentTimeCommandOutput} for command's `response` shape.
 * @see {@link WeatherClientResolvedConfig | config} for WeatherClient's `config` shape.
 *
 * @throws {@link WeatherServiceException}
 * <p>Base exception class for all service exceptions from Weather service.</p>
 *
 */
export class GetCurrentTimeCommand extends $Command.classBuilder<GetCurrentTimeCommandInput, GetCurrentTimeCommandOutput, WeatherClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>()
      .m(function (this: any, Command: any, cs: any, config: WeatherClientResolvedConfig, o: any) {
          return [

  getSerdePlugin(config, this.serialize, this.deserialize),
      ];
  })
  .s("Weather", "GetCurrentTime", {

  })
  .n("WeatherClient", "GetCurrentTimeCommand")
  .f(void 0, void 0)
  .ser(() => { throw new Error("No supported protocol was found"); })
  .de(() => { throw new Error("No supported protocol was found"); })
.build() {
}
