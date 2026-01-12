package handlers

import (
	"consentis-api/internal/dtos"
	"consentis-api/internal/helpers"
	"consentis-api/internal/repositories"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func StartResearchersHandler(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/users/researcher/{address}", getResearcherByAddress)
	mux.HandleFunc("POST /api/v1/users/researcher", saveResearcher)
	mux.HandleFunc("PUT /api/v1/users/researcher/{address}", updateResearcher)
}

func getResearcherByAddress(w http.ResponseWriter, r *http.Request) {
	address := r.PathValue("address")
	if address == "" {
		http.Error(w, "Address parameter is required", http.StatusBadRequest)
		return
	}

	if len(address) != 42 || !strings.HasPrefix(address, "0x") {
		http.Error(w, "Invalid Ethereum address format", http.StatusBadRequest)
		return
	}

	profile, err := repositories.GetResearcherProfileByAddress(address)
	if err != nil {
		http.Error(w, "Failed to retrieve researcher", http.StatusInternalServerError)
		log.Printf("Error retrieving researcher: %v", err)
		return
	}

	if profile == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	data, err := json.Marshal(profile)
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

func saveResearcher(w http.ResponseWriter, r *http.Request) {
	var researcher dtos.ResearcherCreateDto
	if err := json.NewDecoder(r.Body).Decode(&researcher); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("Error decoding request body: %v", err)
		return
	}

	err := helpers.ValidateResearcher(researcher)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Bad Request: %v", err)
		return
	}

	researcherID, err := repositories.SaveResearcher(researcher)
	if err != nil {
		http.Error(w, "Failed to save researcher", http.StatusInternalServerError)
		log.Printf("Error saving researcher: %v", err)
		return
	}

	data, err := json.Marshal(researcherID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if _, err := w.Write(data); err != nil {
		log.Println("Error writing response:", err)
		return
	}
}

func updateResearcher(w http.ResponseWriter, r *http.Request) {
	address := r.PathValue("address")
	if address == "" {
		http.Error(w, "Address parameter is required", http.StatusBadRequest)
		return
	}

	if len(address) != 42 || !strings.HasPrefix(address, "0x") {
		http.Error(w, "Invalid Ethereum address format", http.StatusBadRequest)
		return
	}

	var researcher dtos.ResearcherUpdateDto
	if err := json.NewDecoder(r.Body).Decode(&researcher); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("Error decoding request body: %v", err)
		return
	}

	err := helpers.ValidateResearcherUpdate(researcher)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Bad Request: %v", err)
		return
	}

	emailTaken, err := repositories.IsEmailTakenByOther(researcher.ProfessionalEmail, address)
	if err != nil {
		http.Error(w, "Failed to validate email", http.StatusInternalServerError)
		log.Printf("Error checking email uniqueness: %v", err)
		return
	}
	if emailTaken {
		http.Error(w, "Email is already in use by another researcher", http.StatusConflict)
		return
	}

	err = repositories.UpdateResearcherProfile(address, researcher)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "Researcher not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to update researcher", http.StatusInternalServerError)
		log.Printf("Error updating researcher: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]string{"message": "Researcher profile updated successfully"}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Println("Error writing response:", err)
		return
	}
}
