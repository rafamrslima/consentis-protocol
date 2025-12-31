package v1

import (
	dtos "consentis-api/internal/DTOs"
	"consentis-api/internal/db"
	"consentis-api/internal/helpers"
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
)

func StartRecordsController(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/records", addRecord)
}

func addRecord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var recordDto dtos.RecordDto
	if err := json.NewDecoder(r.Body).Decode(&recordDto); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("Error decoding request body: %v", err)
		return
	}

	err := helpers.ValidateRecord(recordDto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Bad Request: %v", err)
		return
	}

	record := helpers.ConvertDtoToRecordModel(recordDto)
	record.PatientId = uuid.NewString()
	if err := db.SaveRecord(record); err != nil {
		http.Error(w, "Failed to add record", http.StatusInternalServerError)
		log.Printf("Error inserting record: %v", err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Record added successfully"))
}
