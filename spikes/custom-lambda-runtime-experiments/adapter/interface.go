package adapter

import (
	"context"
	"io"
	"net/http"
)

type Adapter interface {
	ParseRequest(ctx context.Context, m map[string]interface{}) (*http.Request, error)

	CreateResponse(*http.Response) (io.Reader, error)
}
