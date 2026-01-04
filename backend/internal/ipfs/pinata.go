package pinata

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

type Client struct {
	APIKey    string
	APISecret string
	HTTP      *http.Client
}

func NewClient(apiKey, apiSecret string) *Client {
	return &Client{
		APIKey:    apiKey,
		APISecret: apiSecret,
		HTTP: &http.Client{
			Timeout: 1 * time.Minute,
		},
	}
}

type PinataResponse struct {
	IpfsHash  string `json:"IpfsHash"`
	PinSize   int64  `json:"PinSize"`
	TimeStamp string `json:"Timestamp"`
}

// Optional metadata/options payloads
type PinataMetadata struct {
	Name      string            `json:"name,omitempty"`
	Keyvalues map[string]string `json:"keyvalues,omitempty"`
}

type PinataOptions struct {
	CidVersion int `json:"cidVersion,omitempty"`
}

func (c *Client) StreamToPinata(
	ctx context.Context,
	fileReader io.Reader,
	filename string,
	metadata *PinataMetadata,
	options *PinataOptions,
) (*PinataResponse, error) {

	// Pinata endpoint for file uploads
	const url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

	// Pipe lets us write multipart data while http.Client reads it
	pr, pw := io.Pipe()
	mw := multipart.NewWriter(pw)

	// Write multipart body in a goroutine
	go func() {
		defer pw.Close()
		defer mw.Close()

		// 1) file part
		part, err := mw.CreateFormFile("file", filename)
		if err != nil {
			_ = pw.CloseWithError(err)
			return
		}
		if _, err := io.Copy(part, fileReader); err != nil {
			_ = pw.CloseWithError(err)
			return
		}

		// 2) optional pinataMetadata (JSON string field)
		if metadata != nil {
			b, err := json.Marshal(metadata)
			if err != nil {
				_ = pw.CloseWithError(err)
				return
			}
			if err := mw.WriteField("pinataMetadata", string(b)); err != nil {
				_ = pw.CloseWithError(err)
				return
			}
		}

		// 3) optional pinataOptions (JSON string field)
		if options != nil {
			b, err := json.Marshal(options)
			if err != nil {
				_ = pw.CloseWithError(err)
				return
			}
			if err := mw.WriteField("pinataOptions", string(b)); err != nil {
				_ = pw.CloseWithError(err)
				return
			}
		}
	}()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, pr)
	if err != nil {
		return nil, err
	}

	// Use multipart writer content-type (includes boundary)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	req.Header.Set("pinata_api_key", c.APIKey)
	req.Header.Set("pinata_secret_api_key", c.APISecret)

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("pinata upload failed (%d): %s", resp.StatusCode, string(body))
	}

	var out PinataResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, fmt.Errorf("decode pinata response: %w; body=%s", err, string(body))
	}

	return &out, nil
}
