// smithy-typescript generated code
import {
  ServiceInputTypes,
  ServiceOutputTypes,
  WeatherClientResolvedConfig,
} from "../WeatherClient";
import {
  GetForecastInput,
  GetForecastOutput,
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
 * The input for {@link GetForecastCommand}.
 */
export interface GetForecastCommandInput extends GetForecastInput {}
/**
 * @public
 *
 * The output of {@link GetForecastCommand}.
 */
export interface GetForecastCommandOutput extends GetForecastOutput, __MetadataBearer {}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { WeatherClient, GetForecastCommand } from "@weather-service/client"; // ES Modules import
 * // const { WeatherClient, GetForecastCommand } = require("@weather-service/client"); // CommonJS import
 * const client = new WeatherClient(config);
 * const input = { // GetForecastInput
 *   cityId: "STRING_VALUE", // required
 * };
 * const command = new GetForecastCommand(input);
 * const response = await client.send(command);
 * // { // GetForecastOutput
 * //   chanceOfRain: Number("float"),
 * // };
 *
 * ```
 *
 * @param GetForecastCommandInput - {@link GetForecastCommandInput}
 * @returns {@link GetForecastCommandOutput}
 * @see {@link GetForecastCommandInput} for command's `input` shape.
 * @see {@link GetForecastCommandOutput} for command's `response` shape.
 * @see {@link WeatherClientResolvedConfig | config} for WeatherClient's `config` shape.
 *
 * @throws {@link WeatherServiceException}
 * <p>Base exception class for all service exceptions from Weather service.</p>
 *
 */
export class GetForecastCommand extends $Command.classBuilder<GetForecastCommandInput, GetForecastCommandOutput, WeatherClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>()
      .m(function (this: any, Command: any, cs: any, config: WeatherClientResolvedConfig, o: any) {
          return [

  getSerdePlugin(config, this.serialize, this.deserialize),
      ];
  })
  .s("Weather", "GetForecast", {

  })
  .n("WeatherClient", "GetForecastCommand")
  .f(void 0, void 0)
  .ser(() => { throw new Error("No supported protocol was found"); })
  .de(() => { throw new Error("No supported protocol was found"); })
.build() {
}
