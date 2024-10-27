export { gos3 } from './gos3.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const env_file = open(`./env.json`)
const payload = open(`gos3-input.json`)

export function setup() {
  let DATA = JSON.parse(env_file);

  return { data: DATA, payload: JSON.parse(payload) };
}

export let options = {
  scenarios: {}, // to be set later
  tags: {
    request_type: 'long',
  },
  thresholds: {
    'http_req_duration{scenario:final_breakpoint}': [
      {
        threshold: "p(95) < 33000", // 3 times the max tolerated server-side duration of 11s, thens its dead for the user
        abortOnFail: true,
        delayAbortEval: "5m"
      }],
  },
}

let scenarios = {
  final_constant_rate_1_per_second: {
    executor: 'constant-arrival-rate',
    exec: 'gos3',
    env: {
      BUCKET: 'deplomni-performance-gos3',
      K6_SCENARIO: 'final_constant_rate_1_per_second',
    },

    rate: 1,
    timeUnit: '1s',
    duration: "1h",
    preAllocatedVUs: 100,
    gracefulStop: "15s",
  },
  final_constant_vu: {
    executor: 'constant-vus',
    exec: 'gos3',
    env: {
      BUCKET: 'deplomni-performance-gos3',
      K6_SCENARIO: 'final_constant_vu',
    },

    vus: 1,
    duration: "30m",
    gracefulStop: "15s",
  },
  final_breakpoint: {
    executor: 'ramping-arrival-rate',
    exec: 'gos3',
    env: {
      BUCKET: 'deplomni-performance-gos3',
      K6_SCENARIO: 'final_breakpoint',
    },

    stages: [
      { duration: '1h', target: 100 }, // just slowly ramp-up to a HUGE load
    ],
    preAllocatedVUs: 1000,
  },
 /* final_spike: { THIS SCENARIO IS NOT USED!!!
    executor: 'ramping-arrival-rate',
    exec: 'gos3',
    env: {
      BUCKET: 'deplomni-performance-gos3',
      K6_SCENARIO: 'final_spike',
    },

    stages: [
      { duration: '2m', target: 20 }, // fast ramp-up to a high point
      // No plateau
      { duration: '1m', target: 0 }, // quick ramp-down to 0 users
    ],
    preAllocatedVUs: 500,
    gracefulStop: "15s",
  },*/
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