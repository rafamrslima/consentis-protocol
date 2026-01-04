package dtos

import "time"

type RecordsByPatientResponse struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	IPFSCid   string    `json:"ipfs_cid"`
	CreatedAt time.Time `json:"created_at"`
}
