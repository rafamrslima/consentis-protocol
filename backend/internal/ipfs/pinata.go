package pinata

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"mime/multipart"
	"net/http"
	"os"
	"sync"
	"time"
)

const (
	PinataBaseURL  = "https://api.pinata.cloud"
	MaxFileSize    = 10 * 1024 * 1024 // 10MB
	DefaultTimeout = 2 * time.Minute
	MaxRetries     = 3
)

var (
	clientInstance *Client
	clientOnce     sync.Once
	clientErr      error
)

func GetClient() (*Client, error) {
	clientOnce.Do(func() {
		apiKey := os.Getenv("PINATA_API_KEY")
		apiSecret := os.Getenv("PINATA_API_SECRET")

		if apiKey == "" || apiSecret == "" {
			clientErr = errors.New("PINATA_API_KEY and PINATA_API_SECRET must be set")
			return
		}

		clientInstance = NewClient(apiKey, apiSecret)
	})

	if clientErr != nil {
		return nil, clientErr
	}

	return clientInstance, nil
}

func NewClient(apiKey, apiSecret string) *Client {
	return &Client{
		APIKey:    apiKey,
		APISecret: apiSecret,
		HTTP: &http.Client{
			Timeout: DefaultTimeout,
		},
	}
}

func (c *Client) validate() error {
	if c.APIKey == "" || c.APISecret == "" {
		return errors.New("API key and secret are required")
	}
	return nil
}

func (c *Client) doWithRetry(req *http.Request, maxRetries int) (*http.Response, error) {
	var resp *http.Response
	var err error

	for attempt := 0; attempt <= maxRetries; attempt++ {
		resp, err = c.HTTP.Do(req)
		if err == nil && resp.StatusCode < 500 {
			return resp, nil
		}

		if resp != nil {
			resp.Body.Close()
		}

		if attempt < maxRetries {
			backoffDuration := time.Duration(math.Pow(2, float64(attempt))) * time.Second
			time.Sleep(backoffDuration)
		}
	}

	return resp, err
}

func newLimitedReader(r io.Reader, maxSize int64) *LimitedReader {
	return &LimitedReader{
		Reader:    r,
		remaining: maxSize,
	}
}

func (lr *LimitedReader) Read(p []byte) (n int, err error) {
	if lr.remaining <= 0 {
		return 0, fmt.Errorf("file size exceeds limit of %d bytes", MaxFileSize)
	}

	if int64(len(p)) > lr.remaining {
		p = p[:lr.remaining]
	}

	n, err = lr.Reader.Read(p)
	lr.remaining -= int64(n)
	return n, err
}

func (c *Client) StreamToPinata(
	ctx context.Context,
	fileReader io.Reader,
	filename string,
	metadata *PinataMetadata,
	options *PinataOptions,
) (*PinataResponse, error) {

	if err := c.validate(); err != nil {
		return nil, fmt.Errorf("client validation failed: %w", err)
	}

	limitedReader := newLimitedReader(fileReader, MaxFileSize)

	const url = PinataBaseURL + "/pinning/pinFileToIPFS"

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
		if _, err := io.Copy(part, limitedReader); err != nil {
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

	resp, err := c.doWithRetry(req, MaxRetries)
	if err != nil {
		return nil, fmt.Errorf("request failed after %d retries: %w", MaxRetries, err)
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
