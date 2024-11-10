// smithy-typescript generated code
import { WeatherClient } from "../WeatherClient";
import {
  ListCitiesCommand,
  ListCitiesCommandInput,
  ListCitiesCommandOutput,
} from "../commands/ListCitiesCommand";
import { WeatherPaginationConfiguration } from "./Interfaces";
import { createPaginator } from "@smithy/core";
import { Paginator } from "@smithy/types";

/**
 * @public
 */
export const paginateListCities: (
    config: WeatherPaginationConfiguration,
    input: ListCitiesCommandInput,
    ...rest: any[]
) => Paginator<ListCitiesCommandOutput> =
    createPaginator<WeatherPaginationConfiguration, ListCitiesCommandInput, ListCitiesCommandOutput>(
        WeatherClient,
        ListCitiesCommand,
        "nextToken",
        "nextToken",
        "pageSize"
    );
