package main

import (
	v1 "consentis-api/internal/api/v1"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env.")
	}
	v1.StartController()
}
