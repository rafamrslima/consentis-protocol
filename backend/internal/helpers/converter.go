package helpers

import (
	dtos "consentis-api/internal/dtos"
	"consentis-api/internal/models"
)

func ConvertDtoToRecordModel(recordDto dtos.RecordCreateRequest) models.Record {
	return models.Record{
		ID:                recordDto.ID,
		Name:              recordDto.Name,
		DataToEncryptHash: recordDto.DataToEncryptHash,
		AccJson:           recordDto.ACCJson,
	}
}
