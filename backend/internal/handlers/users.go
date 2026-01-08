package handlers

import (
	"consentis-api/internal/repositories"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func StartUsersHandler(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/users/researcher/{address}", getUserByResearcherAddress)
}

func getUserByResearcherAddress(w http.ResponseWriter, r *http.Request) {
	address := r.PathValue("address")
	if address == "" {
		http.Error(w, "Address parameter is required", http.StatusBadRequest)
		return
	}

	if len(address) != 42 || !strings.HasPrefix(address, "0x") {
		http.Error(w, "Invalid Ethereum address format", http.StatusBadRequest)
		return
	}

	researcherID, err := repositories.GetUserByResearcherAddress(address)
	if err != nil {
		http.Error(w, "Failed to retrieve users", http.StatusInternalServerError)
		log.Printf("Error retrieving users: %v", err)
		return
	}

	if researcherID == "" {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	data, err := json.Marshal(researcherID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write(data); err != nil {
		log.Println("Error writing response:", err)
		return
	}
}
