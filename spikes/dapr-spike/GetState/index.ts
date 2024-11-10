import {AzureFunction, Context, HttpRequest} from "@azure/functions"

const getState: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('GetState HTTP trigger function processed a request.');

    let state = context.bindings.stateIn ?? "";
    context.log(`Current state:\n${state}\n`);

    // return a http response using the http output binding
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `State is: \n${state}`
    };
};

export default getState;

