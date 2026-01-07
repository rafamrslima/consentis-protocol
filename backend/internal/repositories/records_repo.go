package repositories

import (
	"consentis-api/internal/dtos"
	"consentis-api/internal/models"
	"context"
	"log"
)

func CreateRecord(record models.Record, patientAddress string) error {
	pool, err := ConnectToDatabase()
	if err != nil {
		return err
	}
	defer pool.Close()
	ctx := context.Background()

	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var patientId string
	err = tx.QueryRow(ctx, `
	    INSERT INTO users (wallet_address, role)
        VALUES ($1, 'patient')
        ON CONFLICT (wallet_address)
		DO UPDATE SET wallet_address = EXCLUDED.wallet_address
		RETURNING id; `, patientAddress).Scan(&patientId)

	if err != nil {
		log.Println(err)
		return err
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO records (patient_id, name, ipfs_cid, data_to_encrypt_hash, acc_json) 
		VALUES ($1, $2, $3, $4, $5)`,
		patientId, record.Name, record.IPFSCid, record.DataToEncryptHash, record.AccJson)

	if err != nil {
		log.Println(err)
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		log.Println(err)
		return err
	}

	log.Println("Row inserted successfully into records.")
	return nil
}

func GetAllRecords(researcherAddress string) ([]dtos.RecordMetadataWithConsentResponse, error) {
	pool, err := ConnectToDatabase()
	if err != nil {
		return nil, err
	}
	defer pool.Close()

	ctx := context.Background()
	rows, err := pool.Query(ctx,
		`SELECT
			r.id,
			r.name,
			r.ipfs_cid,
			r.data_to_encrypt_hash,
			r.acc_json,
			u.wallet_address,
			r.created_at,
			CASE WHEN c.researcher_address IS NOT NULL THEN c.status ELSE '' END as consent_status,
			CASE WHEN c.researcher_address IS NOT NULL THEN c.updated_at ELSE NULL END as last_updated
		FROM records r
		INNER JOIN users u ON r.patient_id = u.id
		LEFT JOIN consents c ON r.id = c.record_id AND c.researcher_address = $1
		ORDER BY r.created_at DESC`, researcherAddress)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recordsMetadata []dtos.RecordMetadataWithConsentResponse
	for rows.Next() {
		var recordMetadata dtos.RecordMetadataWithConsentResponse
		if err := rows.Scan(
			&recordMetadata.Id,
			&recordMetadata.Name,
			&recordMetadata.IPFSCid,
			&recordMetadata.DataToEncryptHash,
			&recordMetadata.AccJson,
			&recordMetadata.PatientAddress,
			&recordMetadata.CreatedAt,
			&recordMetadata.ConsentStatus,
			&recordMetadata.LastUpdatedConsent,
		); err != nil {
			return nil, err
		}
		recordsMetadata = append(recordsMetadata, recordMetadata)
	}
	return recordsMetadata, nil
}

func GetRecordsByOwnerAddress(address string) ([]dtos.RecordsByPatientResponse, error) {
	pool, err := ConnectToDatabase()
	if err != nil {
		return nil, err
	}
	defer pool.Close()

	ctx := context.Background()
	rows, err := pool.Query(ctx,
		`SELECT r.id, r.name, r.ipfs_cid, r.data_to_encrypt_hash, r.acc_json, u.wallet_address, r.created_at
		FROM records r
		INNER JOIN users u ON r.patient_id = u.id
		WHERE u.wallet_address = $1
		ORDER BY r.created_at DESC`, address)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []dtos.RecordsByPatientResponse
	for rows.Next() {
		var record dtos.RecordsByPatientResponse
		if err := rows.Scan(
			&record.Id,
			&record.Name,
			&record.IPFSCid,
			&record.DataToEncryptHash,
			&record.AccJson,
			&record.PatientAddress,
			&record.CreatedAt,
		); err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, nil
}
