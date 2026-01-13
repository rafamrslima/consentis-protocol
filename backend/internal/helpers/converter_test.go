package helpers

import (
	"consentis-api/internal/dtos"
	"consentis-api/internal/models"
	"testing"
)

func TestConvertDtoToRecordModel(t *testing.T) {
	tests := []struct {
		name     string
		input    dtos.RecordCreateRequest
		expected models.Record
	}{
		{
			name: "Complete record conversion",
			input: dtos.RecordCreateRequest{
				ID:                "record-123",
				Name:              "Medical Record",
				DataToEncryptHash: "hash-abc-123",
				ACCJson:           []byte(`{"conditions":["read","write"]}`),
			},
			expected: models.Record{
				ID:                "record-123",
				Name:              "Medical Record",
				DataToEncryptHash: "hash-abc-123",
				AccJson:           []byte(`{"conditions":["read","write"]}`),
			},
		},
		{
			name: "Minimal record conversion",
			input: dtos.RecordCreateRequest{
				ID:                "rec-min",
				Name:              "Min",
				DataToEncryptHash: "h",
				ACCJson:           []byte(`{}`),
			},
			expected: models.Record{
				ID:                "rec-min",
				Name:              "Min",
				DataToEncryptHash: "h",
				AccJson:           []byte(`{}`),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ConvertDtoToRecordModel(tt.input)

			if result.ID != tt.expected.ID {
				t.Errorf("ID mismatch: got %v, want %v", result.ID, tt.expected.ID)
			}
			if result.Name != tt.expected.Name {
				t.Errorf("Name mismatch: got %v, want %v", result.Name, tt.expected.Name)
			}
			if result.DataToEncryptHash != tt.expected.DataToEncryptHash {
				t.Errorf("DataToEncryptHash mismatch: got %v, want %v", result.DataToEncryptHash, tt.expected.DataToEncryptHash)
			}
			if string(result.AccJson) != string(tt.expected.AccJson) {
				t.Errorf("AccJson mismatch: got %v, want %v", string(result.AccJson), string(tt.expected.AccJson))
			}
		})
	}
}
