package repositories

import (
	"consentis-api/internal/dtos"
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

func SaveResearcher(researcher dtos.ResearcherCreateDto) (string, error) {
	pool, err := GetDB()
	if err != nil {
		return "", err
	}
	ctx := context.Background()
	tx, err := pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var researcherID string
	err = tx.QueryRow(ctx, `
        INSERT INTO users (wallet_address, role) 
        VALUES ($1, 'researcher')
        ON CONFLICT (wallet_address) DO UPDATE SET role = 'researcher'
        RETURNING id`, researcher.WalletAddress).Scan(&researcherID)

	if err != nil {
		log.Println("Error creating user:", err)
		return "", err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO researcher_profiles 
		(user_id, full_name, institution, department, professional_email, credentials_url, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id) DO NOTHING`,
		researcherID, researcher.FullName, researcher.Institution, researcher.Department, researcher.ProfessionalEmail,
		researcher.CredentialsURL, researcher.Bio)

	if err != nil {
		log.Println("Error creating researcher profile:", err)
		return "", err
	}

	if err := tx.Commit(ctx); err != nil {
		log.Println("Error committing transaction:", err)
		return "", err
	}

	log.Println("Researcher saved successfully with ID:", researcherID)
	return researcherID, nil
}
