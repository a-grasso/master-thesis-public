import {AzureFunction, Context, HttpRequest} from "@azure/functions"

const saveState: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('SaveState HTTP trigger function processed a request.');

    // update state
    let state = `${req.body}`;

    context.log(`Saving new state:\n${state}\n`);

    // save state using the Dapr output binding
    context.bindings.stateOut =
        {
            "value": state,
            // "key": "{Optional. We defined in function.json}",
            // "etag": "{Optional. The etag value of the state record.}"
        };

    // return a http response using the http output binding
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `State now saved: \n${state}`
    };
};

export default saveState;

