import http from "k6/http";
import { check } from "k6";
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

let counter = 0;
export function gos3(data) {

    let endpoint = __ENV.ENDPOINT;
    let bucket = __ENV.BUCKET;

    let options = {
        headers: {
            "Content-Type": "application/json",
            "X-K6-Scenario": JSON.stringify(__ENV.K6_SCENARIO),
        },
    };

    const searchParams = new URLSearchParams([
        ['bucket', bucket],
        ['key', `k6`],
    ]);

    counter++;

    let response = http.post(`${endpoint}?${searchParams.toString()}`, data.payload, options);

    let intNumber = parseInt(response.body);

    check(response, { "status as expected": (r) => r.status === 200 });
    check(intNumber, { "return is bigger than 0": (r) => r > 0 });
}

