package helpers

import (
	dtos "consentis-api/internal/DTOs"
	"consentis-api/internal/db/models"
)

func ConvertDtoToRecordModel(recordDto dtos.RecordDto) models.Record {
	return models.Record{
		Name:              recordDto.Name,
		IPFSCid:           recordDto.IPFSCid,
		DataToEncryptHash: recordDto.DataToEncryptHash,
		AccJson:           recordDto.ACCJson,
	}
}
