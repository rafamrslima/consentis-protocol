package v1

import (
	dtos "consentis-api/internal/DTOs"
	"consentis-api/internal/db"
	"consentis-api/internal/helpers"
	"encoding/json"
	"log"
	"net/http"
)

func StartRecordsController(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/records", addRecord)
	mux.HandleFunc("GET /api/v1/records", getRecords)
}

func addRecord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var recordDto dtos.RecordCreationDto
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
	if err := db.CreateRecord(record, recordDto.PatientAddress); err != nil {
		http.Error(w, "Failed to add record", http.StatusInternalServerError)
		log.Printf("Error inserting record: %v", err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Record added successfully"))
}

func getRecords(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	records, err := db.GetAllRecords()
	if err != nil {
		http.Error(w, "Failed to retrieve records", http.StatusInternalServerError)
		log.Printf("Error retrieving records: %v", err)
		return
	}

	data, err := json.Marshal(records)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write(data); err != nil {
		log.Println("Error writing response:", err)
		return
	}
}
