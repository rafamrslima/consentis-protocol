package repositories

import (
	"consentis-api/internal/models"
	"context"
	"log"
)

func SaveConsent(consent models.Consent, txHash string) error {
	pool, err := ConnectToDatabase()
	if err != nil {
		return err
	}
	defer pool.Close()

	ctx := context.Background()

	_, err = pool.Exec(ctx,
		`INSERT INTO consents (record_id, researcher_address, status, last_tx_hash) 
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (record_id, researcher_address) 
		DO UPDATE SET 
			status = EXCLUDED.status,
			last_tx_hash = EXCLUDED.last_tx_hash,
			updated_at = CURRENT_TIMESTAMP;`,
		consent.RecordID, consent.ResearcherAddress, consent.Status, txHash)

	if err != nil {
		log.Println(err)
		return err
	}

	log.Println("Row inserted/updated successfully into consents.")
	return nil
}
