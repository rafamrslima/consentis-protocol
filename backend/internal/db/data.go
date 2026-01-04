package db

import (
	dtos "consentis-api/internal/DTOs"
	"consentis-api/internal/db/models"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func connect() (*pgxpool.Pool, error) {
	connString := os.Getenv("DATABASE_CONNECTION_STRING")
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, err
	}
	config.MaxConns = 20
	config.MinConns = 2
	config.MaxConnLifetime = time.Hour
	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		fmt.Println("Error to connect to database.", err)
		return nil, err
	}
	return pool, nil
}

func CreateRecord(record models.Record, patientAddress string) error {
	pool, err := connect()
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

func GetAllRecords() ([]dtos.RecordMetadataDto, error) {
	pool, err := connect()
	if err != nil {
		return nil, err
	}
	defer pool.Close()

	ctx := context.Background()
	rows, err := pool.Query(ctx,
		`SELECT name, u.wallet_address, r.created_at FROM records r
		inner join users u on r.patient_id = u.id order by r.created_at DESC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recordsMetadata []dtos.RecordMetadataDto
	for rows.Next() {
		var recordMetadata dtos.RecordMetadataDto
		if err := rows.Scan(&recordMetadata.Name, &recordMetadata.PatientAddress, &recordMetadata.CreatedAt); err != nil {
			return nil, err
		}
		recordsMetadata = append(recordsMetadata, recordMetadata)
	}
	return recordsMetadata, nil
}

func GetRecordsByOwnerAddress(address string) ([]dtos.RecordsByPatientResponse, error) {
	pool, err := connect()
	if err != nil {
		return nil, err
	}
	defer pool.Close()

	ctx := context.Background()
	rows, err := pool.Query(ctx,
		`SELECT r.id, r.name, r.ipfs_cid, r.created_at FROM records r inner join users u on r.patient_id = u.id
		where u.wallet_address = $1 order by r.created_at DESC`, address)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []dtos.RecordsByPatientResponse
	for rows.Next() {
		var record dtos.RecordsByPatientResponse
		if err := rows.Scan(&record.Id, &record.Name, &record.IPFSCid, &record.CreatedAt); err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, nil
}
