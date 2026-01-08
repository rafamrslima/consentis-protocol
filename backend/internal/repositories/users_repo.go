package repositories

import (
	"context"
	"log"
)

func SaveUser(walletAddress string, role string) error {
	pool, err := GetDB()
	if err != nil {
		return err
	}

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

func GetUserByResearcherAddress(researcherAddress string) (string, error) {
	pool, err := GetDB()
	if err != nil {
		return "", err
	}

	ctx := context.Background()

	rows, err := pool.Query(ctx,
		`SELECT id FROM users
		WHERE role = 'researcher' AND wallet_address = $1;`, researcherAddress)

	if err != nil {
		log.Println(err)
		return "", err
	}
	defer rows.Close()

	var userID string
	if rows.Next() {
		if err := rows.Scan(&userID); err != nil {
			log.Println(err)
			return "", err
		}
	} else {
		return "", nil // No user found
	}

	return userID, nil
}
