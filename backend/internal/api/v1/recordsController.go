package v1

import (
	dtos "consentis-api/internal/DTOs"
	"consentis-api/internal/db"
	"consentis-api/internal/helpers"
	pinata "consentis-api/internal/ipfs"
	"encoding/json"
	"log"
	"net/http"
)

func StartRecordsController(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/records", addRecord)
	mux.HandleFunc("GET /api/v1/records", getRecords)
	mux.HandleFunc("GET /api/v1/records/patient/{address}", getRecordsByOwnerAddress)
}

func addRecord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	recordDto := dtos.RecordCreationDto{
		PatientAddress:    r.FormValue("patient_address"),
		Name:              r.FormValue("name"),
		ACCJson:           json.RawMessage(r.FormValue("acc_json")),
		DataToEncryptHash: r.FormValue("data_to_encrypt_hash"),
	}

	err := helpers.ValidateRecord(recordDto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Bad Request: %v", err)
		return
	}

	ctx := r.Context()
	const maxUploadSize = 10 << 20 // 10 MB
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Invalid multipart form", http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	client, err := pinata.GetClient()
	if err != nil {
		http.Error(w, "Failed to initialize IPFS client", http.StatusInternalServerError)
		return
	}

	res, err := client.StreamToPinata(ctx, file, fileHeader.Filename,
		&pinata.PinataMetadata{
			Name: recordDto.Name,
			Keyvalues: map[string]string{
				"patient": recordDto.PatientAddress,
			},
		},
		&pinata.PinataOptions{CidVersion: 1},
	)
	if err != nil {
		http.Error(w, "IPFS upload failed", http.StatusBadGateway)
		return
	}

	record := helpers.ConvertDtoToRecordModel(recordDto)
	record.IPFSCid = res.IpfsHash
	log.Println("Record IPFS CID:", record.IPFSCid)
	if err := db.CreateRecord(record, recordDto.PatientAddress); err != nil {
		http.Error(w, "Failed to add record", http.StatusInternalServerError)
		log.Printf("Error inserting record: %v", err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Record added successfully, CID: " + record.IPFSCid))
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

	if len(records) == 0 {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("[]"))
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

func getRecordsByOwnerAddress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	address := r.PathValue("address")
	if address == "" {
		http.Error(w, "Address parameter is required", http.StatusBadRequest)
		return
	}

	records, err := db.GetRecordsByOwnerAddress(address)
	if err != nil {
		http.Error(w, "Failed to retrieve records", http.StatusInternalServerError)
		log.Printf("Error retrieving records: %v", err)
		return
	}

	if len(records) == 0 {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("[]"))
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
