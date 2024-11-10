package main

import (
	"fmt"
	"log"
	"net/http"
)

const (
	SAMPLE_EVENT = `{
    "version": "2.0",
    "routeKey": "$default",
    "rawPath": "/get",
    "rawQueryString": "",
    "headers": {
        "sec-fetch-mode": "navigate",
        "content-length": "0",
        "x-amzn-tls-version": "TLSv1.3",
        "sec-fetch-site": "none",
        "x-forwarded-proto": "https",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "x-forwarded-port": "443",
        "x-forwarded-for": "2a01:599:91f:af7c:2591:938b:93bc:d0da",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256",
        "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "x-amzn-trace-id": "Self=1-668d1c14-7cc9b6b00693e9826c86ce87;Root=1-668d1c14-1cd7db5b537edd52075caf57",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "host": "m4zivlbqghqli6rphqfju2znga0dchjj.lambda-url.us-east-1.on.aws",
        "upgrade-insecure-requests": "1",
        "cache-control": "max-age=0",
        "accept-encoding": "gzip, deflate, br, zstd",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "sec-fetch-dest": "document"
    },
    "requestContext": {
        "accountId": "anonymous",
        "apiId": "m4zivlbqghqli6rphqfju2znga0dchjj",
        "domainName": "m4zivlbqghqli6rphqfju2znga0dchjj.lambda-url.us-east-1.on.aws",
        "domainPrefix": "m4zivlbqghqli6rphqfju2znga0dchjj",
        "http": {
            "method": "GET",
            "path": "/get",
            "protocol": "HTTP/1.1",
            "sourceIp": "2a01:599:91f:af7c:2591:938b:93bc:d0da",
            "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        },
        "requestId": "bd620a05-9d8b-4dc0-9be9-967a81989b92",
        "routeKey": "$default",
        "stage": "$default",
        "time": "09/Jul/2024:11:16:36 +0000",
        "timeEpoch": 1720523796320
    },
    "isBase64Encoded": false
}`
)

func main() {
	http.HandleFunc("/2018-06-01/runtime/invocation/next", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Lambda-Runtime-Aws-Request-Id", "test-invocation-id")
		w.Write([]byte(SAMPLE_EVENT))
		log.Print("Lambda invoked")
	})

	http.HandleFunc("/2018-06-01/runtime/invocation/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
		log.Print("Lambda done")
	})

	fmt.Println("Starting server on port 80")
	if err := http.ListenAndServe(":80", nil); err != nil {
		panic(err)
	}
}
