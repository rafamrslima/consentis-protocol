package helpers

import (
	"consentis-api/internal/dtos"
	"errors"
	"strings"
)

func ValidateRecord(record dtos.RecordCreateRequest) error {
	if strings.TrimSpace(record.Name) == "" {
		return errors.New("Name is required and cannot be empty")
	}

	if strings.TrimSpace(record.DataToEncryptHash) == "" {
		return errors.New("DataToEncryptHash is required and cannot be empty")
	}

	if strings.TrimSpace(record.PatientAddress) == "" {
		return errors.New("PatientAddress is required and cannot be empty")
	}

	if strings.TrimSpace(string(record.ACCJson)) == "" {
		return errors.New("ACCJson is required and cannot be empty")
	}

	return nil
}
