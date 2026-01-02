package db

import (
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
