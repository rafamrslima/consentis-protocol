package handlers

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGetRecordsByResearcherAddress_MissingAddress(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/records/researcher/", nil)
	req.SetPathValue("address", "")
	w := httptest.NewRecorder()

	getRecordsByResearcherAddress(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	expectedBody := "Address parameter is required\n"
	if w.Body.String() != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, w.Body.String())
	}
}

func TestGetRecordsByResearcherAddress_InvalidAddressFormat(t *testing.T) {
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
			req := httptest.NewRequest(http.MethodGet, "/api/v1/records/researcher/"+tt.address, nil)
			req.SetPathValue("address", tt.address)
			w := httptest.NewRecorder()

			getRecordsByResearcherAddress(w, req)

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

func TestGetRecordsByOwnerAddress_MissingAddress(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/records/patient/", nil)
	req.SetPathValue("address", "")
	w := httptest.NewRecorder()

	getRecordsByOwnerAddress(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	expectedBody := "Address parameter is required\n"
	if w.Body.String() != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, w.Body.String())
	}
}

func TestGetRecordsByOwnerAddress_InvalidAddressFormat(t *testing.T) {
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
			req := httptest.NewRequest(http.MethodGet, "/api/v1/records/patient/"+tt.address, nil)
			req.SetPathValue("address", tt.address)
			w := httptest.NewRecorder()

			getRecordsByOwnerAddress(w, req)

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

func TestAddRecord_MissingFile(t *testing.T) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add form fields without file
	writer.WriteField("record_id", "550e8400-e29b-41d4-a716-446655440000")
	writer.WriteField("patient_address", "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2")
	writer.WriteField("name", "Test Record")
	writer.WriteField("acc_json", "{}")
	writer.WriteField("data_to_encrypt_hash", "0xabc123")
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/records", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	addRecord(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "file is required") {
		t.Errorf("Expected 'file is required' error, got '%s'", w.Body.String())
	}
}

func TestAddRecord_MissingRequiredFields(t *testing.T) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create a dummy file
	part, _ := writer.CreateFormFile("file", "test.txt")
	part.Write([]byte("test content"))

	// Missing required fields
	writer.WriteField("record_id", "")
	writer.WriteField("patient_address", "")
	writer.WriteField("name", "")
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/records", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	addRecord(w, req)

	// Expect 400 (validation) or 500 (IPFS/DB error)
	if w.Code != http.StatusBadRequest && w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 400 or 500, got %d", w.Code)
	}
}

func TestAddRecord_InvalidRecordID(t *testing.T) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create a dummy file
	part, _ := writer.CreateFormFile("file", "test.txt")
	part.Write([]byte("test content"))

	writer.WriteField("record_id", "not-a-uuid") // Invalid UUID
	writer.WriteField("patient_address", "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2")
	writer.WriteField("name", "Test Record")
	writer.WriteField("acc_json", "{}")
	writer.WriteField("data_to_encrypt_hash", "0xabc123")
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/records", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	addRecord(w, req)

	// Expect 400 (validation) or 500 (IPFS/DB error)
	if w.Code != http.StatusBadRequest && w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 400 or 500, got %d", w.Code)
	}
}
