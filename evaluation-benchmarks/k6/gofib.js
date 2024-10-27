import http from "k6/http";
import { check } from "k6";

let counter = 0;
export function gofib() {

    let random_int = Math.floor(Math.random() * 10);

    let endpoint = __ENV.ENDPOINT;

    let options = {
        headers: {
            "Content-Type": "application/json",
            "X-K6-Scenario": JSON.stringify(__ENV.K6_SCENARIO),
        },
    };

    counter++;

    let response = http.post(endpoint, JSON.stringify({ value: random_int }), options);
    let intNumber = parseInt(response.body);

    check(response, { "status as expected": (r) => r.status === 200 });
    check(intNumber, { "return is between fib(0) and fib(10)": (r) => r >= 0 && r <= 55 });
}

