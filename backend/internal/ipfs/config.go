package pinata

import (
	"io"
	"net/http"
)

type Client struct {
	APIKey    string
	APISecret string
	HTTP      *http.Client
}

type PinataResponse struct {
	IpfsHash  string `json:"IpfsHash"`
	PinSize   int64  `json:"PinSize"`
	TimeStamp string `json:"Timestamp"`
}

type PinataMetadata struct {
	Name      string            `json:"name,omitempty"`
	Keyvalues map[string]string `json:"keyvalues,omitempty"`
}

type PinataOptions struct {
	CidVersion int `json:"cidVersion,omitempty"`
}

type LimitedReader struct {
	io.Reader
	remaining int64
}
