package repositories

import (
	"context"
	"log"
)

func SaveUser(walletAddress string, role string) error {
	pool, err := ConnectToDatabase()
	if err != nil {
		return err
	}
	defer pool.Close()

	ctx := context.Background()

	_, err = pool.Exec(ctx,
		`INSERT INTO users (wallet_address, role) VALUES ($1, $2)
		ON CONFLICT (wallet_address)
		DO NOTHING;`, walletAddress, role)

	if err != nil {
		log.Println(err)
		return err
	}

	log.Println("Row inserted/updated successfully into users.")
	return nil
}
