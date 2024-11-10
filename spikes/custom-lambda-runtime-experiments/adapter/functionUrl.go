package adapter

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"io"
	"net/http"
	"strings"
)

type LambdaFunctionURLAdapter struct {
	InternalServiceURL string
}

func (adapter LambdaFunctionURLAdapter) CreateResponse(response *http.Response) (io.Reader, error) {

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	functionUrlResponse := events.LambdaFunctionURLResponse{
		StatusCode: response.StatusCode,
		Body:       string(body),
	}

	resp, err := json.Marshal(functionUrlResponse)
	return strings.NewReader(string(resp)), err

}

func (adapter LambdaFunctionURLAdapter) ParseRequest(ctx context.Context, m map[string]interface{}) (*http.Request, error) {

	eventJSON, err := json.Marshal(m)
	fmt.Println("eventJSON: ", string(eventJSON))
	if err != nil {
		return &http.Request{}, fmt.Errorf("failed to marshal event: %v", err)
	}

	// Attempt to unmarshal into LambdaFunctionURLRequest
	var lambdaURLRequest events.LambdaFunctionURLRequest
	err = json.Unmarshal(eventJSON, &lambdaURLRequest)
	if err != nil {
		return &http.Request{}, fmt.Errorf("failed to unmarshal event into Lambda Function URL Request: %v", err)
	}

	method := lambdaURLRequest.RequestContext.HTTP.Method
	path := lambdaURLRequest.RequestContext.HTTP.Path
	body := lambdaURLRequest.Body
	b64 := lambdaURLRequest.IsBase64Encoded

	switch method {
	case "GET":
		return http.NewRequestWithContext(ctx, http.MethodGet, adapter.InternalServiceURL+path, nil)
	case "POST":
		var payload io.Reader
		if b64 {
			base64Text := []byte(body)
			length, _ := base64.StdEncoding.Decode([]byte(body), []byte(body))
			payload = strings.NewReader(string(base64Text[:length]))
		} else {
			payload = strings.NewReader(body)
		}

		return http.NewRequestWithContext(ctx, http.MethodPost, adapter.InternalServiceURL+path, payload)
	}

	return &http.Request{}, fmt.Errorf("unsupported method: %s", method)
}

func NewLambdaFunctionURLAdapter(serviceUrl string) *LambdaFunctionURLAdapter {
	return &LambdaFunctionURLAdapter{InternalServiceURL: serviceUrl}
}
