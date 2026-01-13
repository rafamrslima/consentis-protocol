package helpers

import (
	"consentis-api/internal/dtos"
	"strings"
	"testing"
)

func TestValidateRecord(t *testing.T) {
	tests := []struct {
		name    string
		record  dtos.RecordCreateRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "Valid record",
			record: dtos.RecordCreateRequest{
				ID:                "record-123",
				Name:              "Test Record",
				DataToEncryptHash: "hash123",
				PatientAddress:    "0x1234567890123456789012345678901234567890",
				ACCJson:           []byte(`{"key":"value"}`),
			},
			wantErr: false,
		},
		{
			name: "Missing record ID",
			record: dtos.RecordCreateRequest{
				Name:              "Test Record",
				DataToEncryptHash: "hash123",
				PatientAddress:    "0x1234567890123456789012345678901234567890",
				ACCJson:           []byte(`{"key":"value"}`),
			},
			wantErr: true,
			errMsg:  "record_id is required",
		},
		{
			name: "Missing name",
			record: dtos.RecordCreateRequest{
				ID:                "record-123",
				DataToEncryptHash: "hash123",
				PatientAddress:    "0x1234567890123456789012345678901234567890",
				ACCJson:           []byte(`{"key":"value"}`),
			},
			wantErr: true,
			errMsg:  "Name is required",
		},
		{
			name: "Empty patient address",
			record: dtos.RecordCreateRequest{
				ID:                "record-123",
				Name:              "Test Record",
				DataToEncryptHash: "hash123",
				ACCJson:           []byte(`{"key":"value"}`),
			},
			wantErr: true,
			errMsg:  "PatientAddress is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateRecord(tt.record)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateRecord() error = %v, wantErr %v", err, tt.wantErr)
			}
			if err != nil && tt.errMsg != "" && !strings.Contains(err.Error(), tt.errMsg) {
				t.Errorf("ValidateRecord() error = %v, expected to contain %v", err.Error(), tt.errMsg)
			}
		})
	}
}

func TestValidateResearcher(t *testing.T) {
	tests := []struct {
		name       string
		researcher dtos.ResearcherCreateDto
		wantErr    bool
		errMsg     string
	}{
		{
			name: "Valid researcher",
			researcher: dtos.ResearcherCreateDto{
				FullName:          "Dr. John Doe",
				WalletAddress:     "0x1234567890123456789012345678901234567890",
				Institution:       "MIT",
				ProfessionalEmail: "john@mit.edu",
			},
			wantErr: false,
		},
		{
			name: "Invalid wallet address format",
			researcher: dtos.ResearcherCreateDto{
				FullName:          "Dr. John Doe",
				WalletAddress:     "invalid-address",
				Institution:       "MIT",
				ProfessionalEmail: "john@mit.edu",
			},
			wantErr: true,
			errMsg:  "Invalid Ethereum address format",
		},
		{
			name: "Missing full name",
			researcher: dtos.ResearcherCreateDto{
				WalletAddress:     "0x1234567890123456789012345678901234567890",
				Institution:       "MIT",
				ProfessionalEmail: "john@mit.edu",
			},
			wantErr: true,
			errMsg:  "Name is required",
		},
		{
			name: "Missing institution",
			researcher: dtos.ResearcherCreateDto{
				FullName:          "Dr. John Doe",
				WalletAddress:     "0x1234567890123456789012345678901234567890",
				ProfessionalEmail: "john@mit.edu",
			},
			wantErr: true,
			errMsg:  "Institution is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateResearcher(tt.researcher)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateResearcher() error = %v, wantErr %v", err, tt.wantErr)
			}
			if err != nil && tt.errMsg != "" && !strings.Contains(err.Error(), tt.errMsg) {
				t.Errorf("ValidateResearcher() error = %v, expected to contain %v", err.Error(), tt.errMsg)
			}
		})
	}
}

func TestValidateResearcherUpdate(t *testing.T) {
	tests := []struct {
		name       string
		researcher dtos.ResearcherUpdateDto
		wantErr    bool
		errMsg     string
	}{
		{
			name: "Valid update",
			researcher: dtos.ResearcherUpdateDto{
				FullName:          "Dr. Jane Smith",
				Institution:       "Stanford",
				ProfessionalEmail: "jane@stanford.edu",
			},
			wantErr: false,
		},
		{
			name: "Missing email",
			researcher: dtos.ResearcherUpdateDto{
				FullName:    "Dr. Jane Smith",
				Institution: "Stanford",
			},
			wantErr: true,
			errMsg:  "ProfessionalEmail is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateResearcherUpdate(tt.researcher)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateResearcherUpdate() error = %v, wantErr %v", err, tt.wantErr)
			}
			if err != nil && tt.errMsg != "" && !strings.Contains(err.Error(), tt.errMsg) {
				t.Errorf("ValidateResearcherUpdate() error = %v, expected to contain %v", err.Error(), tt.errMsg)
			}
		})
	}
}
