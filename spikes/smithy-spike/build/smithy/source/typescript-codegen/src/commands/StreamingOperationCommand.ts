// smithy-typescript generated code
import {
  ServiceInputTypes,
  ServiceOutputTypes,
  WeatherClientResolvedConfig,
} from "../WeatherClient";
import {
  StreamingOperationInput,
  StreamingOperationOutput,
  StreamingOperationOutputFilterSensitiveLog,
} from "../models/models_0";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import {
  StreamingBlobPayloadOutputTypes,
  MetadataBearer as __MetadataBearer,
} from "@smithy/types";

/**
 * @public
 */
export { __MetadataBearer, $Command };
/**
 * @public
 *
 * The input for {@link StreamingOperationCommand}.
 */
export interface StreamingOperationCommandInput extends StreamingOperationInput {}
/**
 * @public
 *
 * The output of {@link StreamingOperationCommand}.
 */
export interface StreamingOperationCommandOutput extends Omit<StreamingOperationOutput, "output">, __MetadataBearer {
    output?: StreamingBlobPayloadOutputTypes;
}

/**
 * @public
 *
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { WeatherClient, StreamingOperationCommand } from "@weather-service/client"; // ES Modules import
 * // const { WeatherClient, StreamingOperationCommand } = require("@weather-service/client"); // CommonJS import
 * const client = new WeatherClient(config);
 * const input = {};
 * const command = new StreamingOperationCommand(input);
 * const response = await client.send(command);
 * // { // StreamingOperationOutput
 * //   output: "<SdkStream>", // see \@smithy/types -> StreamingBlobPayloadOutputTypes
 * // };
 *
 * ```
 *
 * @param StreamingOperationCommandInput - {@link StreamingOperationCommandInput}
 * @returns {@link StreamingOperationCommandOutput}
 * @see {@link StreamingOperationCommandInput} for command's `input` shape.
 * @see {@link StreamingOperationCommandOutput} for command's `response` shape.
 * @see {@link WeatherClientResolvedConfig | config} for WeatherClient's `config` shape.
 *
 * @throws {@link WeatherServiceException}
 * <p>Base exception class for all service exceptions from Weather service.</p>
 *
 */
export class StreamingOperationCommand extends $Command.classBuilder<StreamingOperationCommandInput, StreamingOperationCommandOutput, WeatherClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>()
      .m(function (this: any, Command: any, cs: any, config: WeatherClientResolvedConfig, o: any) {
          return [

  getSerdePlugin(config, this.serialize, this.deserialize),
      ];
  })
  .s("Weather", "StreamingOperation", {

  })
  .n("WeatherClient", "StreamingOperationCommand")
  .f(void 0, StreamingOperationOutputFilterSensitiveLog)
  .ser(() => { throw new Error("No supported protocol was found"); })
  .de(() => { throw new Error("No supported protocol was found"); })
.build() {
}
