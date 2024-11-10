package runtime

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Client struct {
	InvocationURL       string
	ResponseURLTemplate string
	AWSLambdaRuntimeAPI string
	Headers             map[string]string
	httpClient          *http.Client
}

func NewLambdaRuntimeAPIClient(awsLambdaRuntimeAPI string, client *http.Client) *Client {
	return &Client{
		InvocationURL:       fmt.Sprintf("http://%s/2018-06-01/runtime/invocation/next", awsLambdaRuntimeAPI),
		ResponseURLTemplate: "http://%s/2018-06-01/runtime/invocation/%s/response",
		AWSLambdaRuntimeAPI: awsLambdaRuntimeAPI,
		Headers: map[string]string{
			"Lambda-Runtime-Function-Response-Mode": "streaming",
			"Transfer-Encoding":                     "chunked",
		},
		httpClient: client,
	}
}

func (s *Client) FetchInvocation(ctx context.Context) (map[string]interface{}, string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.InvocationURL, nil)
	if err != nil {
		return nil, "", err
	}

	resp, err := s.httpClient.Do(req)
	invocationId := resp.Header.Get("Lambda-Runtime-Aws-Request-Id")

	defer resp.Body.Close()
	fmt.Println("Response from RuntimeAPI Invocation Fetch: ", resp)

	body, err := io.ReadAll(resp.Body)

	fmt.Println("Body from RuntimeAPI Invocation Fetch: ", string(body))

	var eventData map[string]interface{}
	err = json.Unmarshal(body, &eventData)

	return eventData, invocationId, err
}

func (s *Client) PublishResult(ctx context.Context, invocationID string, payload io.Reader) error {
	responseURL := fmt.Sprintf(s.ResponseURLTemplate, s.AWSLambdaRuntimeAPI, invocationID)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, responseURL, payload)
	if err != nil {
		return err
	}

	for key, value := range s.Headers {
		req.Header.Add(key, value)
	}

	fmt.Println("Request for RuntimeAPI PublishResult: ", req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	return nil
}
