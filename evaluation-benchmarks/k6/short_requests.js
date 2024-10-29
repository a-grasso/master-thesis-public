export { gofib } from './gofib.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const env_file = open(`./env.json`)

export function setup() {
  let DATA = JSON.parse(env_file);

  return DATA;
}

export let options = {
  scenarios: {}, // to be set later
  tags: {
    request_type: 'short',
  },
}

let scenarios = {
  final_long_constant_rate: { // as base for comparison
    executor: 'constant-arrival-rate',
    exec: 'gofib',
    env: {
      K6_SCENARIO: 'final_long_constant_rate',
    },

    preAllocatedVUs: 60,
    rate: 50,
    timeUnit: '1s',
    duration: "1h",
  },
  final_constant_vu: { // how much is the service capable of handling in a short time
    executor: 'constant-vus',
    exec: 'gofib',
    env: {
      K6_SCENARIO: 'final_constant_vu',
    },

    vus: 1,
    duration: '30m',
  },
  final_spike: { // scalability of the service in how spikes are handled
    executor: 'ramping-arrival-rate',
    exec: 'gofib',
    env: {
      K6_SCENARIO: 'final_spike',
    },

    preAllocatedVUs: 3000,
    stages: [
      { duration: '2m', target: 2000 }, // fast ramp-up to a high point
      // No plateau
      { duration: '1m', target: 0 }, // quick ramp-down to 0 users
    ],
  },
}

if (__ENV.scenario) {
  // Use just a single scenario if `--env scenario=whatever` is used
  options.scenarios[__ENV.scenario] = scenarios[__ENV.scenario];
} else {
  // Use all scenarios
  options.scenarios = scenarios;
}

export function handleSummary(data) {
  return {
    './summary.json': JSON.stringify(data), //the default data object
    stdout: textSummary(data, { indent: '→', enableColors: false }), // Show the text summary to stdout...
  };
}