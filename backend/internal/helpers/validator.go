package helpers

import (
	"consentis-api/internal/dtos"
	"errors"
	"strings"
)

func ValidateRecord(record dtos.RecordCreateRequest) error {
	if strings.TrimSpace(record.ID) == "" {
		return errors.New("record_id is required and cannot be empty")
	}

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

func ValidateResearcher(researcher dtos.ResearcherCreateDto) error {
	if strings.TrimSpace(researcher.FullName) == "" {
		return errors.New("Name is required and cannot be empty")
	}

	if strings.TrimSpace(researcher.WalletAddress) == "" {
		return errors.New("WalletAddress is required and cannot be empty")
	}

	if len(researcher.WalletAddress) != 42 || !strings.HasPrefix(researcher.WalletAddress, "0x") {
		return errors.New("Invalid Ethereum address format for WalletAddress")
	}

	if strings.TrimSpace(researcher.Institution) == "" {
		return errors.New("Institution is required and cannot be empty")
	}

	if strings.TrimSpace(researcher.ProfessionalEmail) == "" {
		return errors.New("ProfessionalEmail is required and cannot be empty")
	}

	return nil
}
