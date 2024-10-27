# K6 Load Testing

This directory contains the k6 scripts to run the load tests on the deployed services.

The k6 scenario configurations for the fibonacci and file services are present in the `short_requests.js` and `long_requests.js` files respectively.

The files `gofib.js` and `gos3.js` are the main k6 scripts that run the load tests on the fibonacci and file services respectively. These scripts are mostly not to be touched as they are parametrized and controlled via outside variables, e.g. which endpoint exactly to test.

Both scenario configurations need a `env.json` file to be present in the same directory. However, it is currently not used in the scripts.

A `compose.yaml` file is present to have a local InfluxDB running to be able to store the metrics locally.

The k6 load tests are primarily run with the custom `run.sh` script.
The script was developed to have more control about configurations, scenarios to be run, cold-start services or where metrics are stored to.
It also handles the custom auditing of results.