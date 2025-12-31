package models

import (
	"encoding/json"
	"time"
)

type Record struct {
	ID                string
	PatientId         string
	IPFSCid           string
	DataToEncryptHash string
	AccJson           json.RawMessage
	Name              string
	CreatedAt         time.Time
}
