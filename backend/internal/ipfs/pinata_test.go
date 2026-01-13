package pinata

import (
	"bytes"
	"io"
	"strings"
	"testing"
)

func TestNewClient(t *testing.T) {
	apiKey := "test-key"
	apiSecret := "test-secret"

	client := NewClient(apiKey, apiSecret)

	if client.APIKey != apiKey {
		t.Errorf("Expected APIKey %s, got %s", apiKey, client.APIKey)
	}
	if client.APISecret != apiSecret {
		t.Errorf("Expected APISecret %s, got %s", apiSecret, client.APISecret)
	}
	if client.HTTP == nil {
		t.Error("Expected HTTP client to be initialized")
	}
}

func TestClientValidate(t *testing.T) {
	tests := []struct {
		name      string
		client    *Client
		wantError bool
	}{
		{
			name: "Valid client",
			client: &Client{
				APIKey:    "valid-key",
				APISecret: "valid-secret",
			},
			wantError: false,
		},
		{
			name: "Missing API key",
			client: &Client{
				APISecret: "valid-secret",
			},
			wantError: true,
		},
		{
			name: "Missing API secret",
			client: &Client{
				APIKey: "valid-key",
			},
			wantError: true,
		},
		{
			name:      "Empty client",
			client:    &Client{},
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.client.validate()
			if (err != nil) != tt.wantError {
				t.Errorf("validate() error = %v, wantError %v", err, tt.wantError)
			}
		})
	}
}

func TestLimitedReader(t *testing.T) {
	tests := []struct {
		name      string
		content   string
		maxSize   int64
		wantError bool
	}{
		{
			name:      "Content within limit",
			content:   "Hello World",
			maxSize:   100,
			wantError: false,
		},
		{
			name:      "Content exceeds limit",
			content:   strings.Repeat("a", 200),
			maxSize:   100,
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reader := bytes.NewReader([]byte(tt.content))
			limitedReader := newLimitedReader(reader, tt.maxSize)

			// Read the content in chunks
			buf := make([]byte, 1024)
			totalRead := int64(0)
			var readErr error

			for {
				n, err := limitedReader.Read(buf)
				totalRead += int64(n)
				if err != nil {
					if err != io.EOF {
						readErr = err
					}
					break
				}
			}

			if tt.wantError {
				if readErr == nil {
					t.Error("Expected error when exceeding limit, got nil")
				}
			} else {
				if readErr != nil {
					t.Errorf("Unexpected error: %v", readErr)
				}
				if totalRead != int64(len(tt.content)) {
					t.Errorf("Expected to read %d bytes, got %d", len(tt.content), totalRead)
				}
			}
		})
	}
}
