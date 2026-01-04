package main

import (
	"consentis-api/internal/handlers"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env.")
	}
	handlers.Start()
}
