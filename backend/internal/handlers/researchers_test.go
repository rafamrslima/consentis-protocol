package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetResearcherByAddress_MissingAddress(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/researcher/", nil)
	req.SetPathValue("address", "")
	w := httptest.NewRecorder()

	getResearcherByAddress(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	expectedBody := "Address parameter is required\n"
	if w.Body.String() != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, w.Body.String())
	}
}

func TestGetResearcherByAddress_InvalidAddressFormat(t *testing.T) {
	tests := []struct {
		name    string
		address string
	}{
		{"Too short", "0x123"},
		{"No 0x prefix", "742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"},
		{"Invalid length", "0x742d35Cc6634C0532925a3b844Bc9e7595f0bE"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/users/researcher/"+tt.address, nil)
			req.SetPathValue("address", tt.address)
			w := httptest.NewRecorder()

			getResearcherByAddress(w, req)

			if w.Code != http.StatusBadRequest {
				t.Errorf("Expected status 400 for %s, got %d", tt.name, w.Code)
			}

			expectedBody := "Invalid Ethereum address format\n"
			if w.Body.String() != expectedBody {
				t.Errorf("Expected body '%s', got '%s'", expectedBody, w.Body.String())
			}
		})
	}
}

func TestSaveResearcher_InvalidJSON(t *testing.T) {
	invalidJSON := []byte(`{"full_name": "John Doe", "institution":}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/users/researcher", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	saveResearcher(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	expectedBody := "Invalid request body\n"
	if w.Body.String() != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, w.Body.String())
	}
}
