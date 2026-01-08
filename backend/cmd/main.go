package main

import (
	chainlistener "consentis-api/internal/chain-listener"
	"consentis-api/internal/handlers"
	"consentis-api/internal/repositories"
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env.")
	}

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
		syscall.SIGINT,
	)
	defer stop()

	httpServer := handlers.NewServer(":8080")

	go func() {
		log.Println("Starting HTTP server on :8080...")
		if err := httpServer.Start(); err != nil {
			log.Printf("HTTP server error: %v", err)
		}
	}()

	go func() {
		log.Println("Starting chain event listener...")
		chainlistener.StartEventListener(ctx)
	}()

	<-ctx.Done()
	log.Println("\nShutdown signal received...")

	// Create shutdown context with timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Shutdown HTTP server gracefully
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}
	repositories.CloseDB()

	log.Println("Application stopped gracefully")
}
