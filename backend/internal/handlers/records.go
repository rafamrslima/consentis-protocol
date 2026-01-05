package handlers

import (
	"consentis-api/internal/dtos"
	"consentis-api/internal/helpers"
	pinata "consentis-api/internal/ipfs"
	"consentis-api/internal/repositories"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func StartRecordsHandler(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/records", addRecord)
	mux.HandleFunc("GET /api/v1/records", getRecords)
	mux.HandleFunc("GET /api/v1/records/patient/{address}", getRecordsByOwnerAddress)
}

func addRecord(w http.ResponseWriter, r *http.Request) {
	recordDto := dtos.RecordCreateRequest{
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
	if err := repositories.CreateRecord(record, recordDto.PatientAddress); err != nil {
		http.Error(w, "Failed to add record", http.StatusInternalServerError)
		log.Printf("Error inserting record: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Record added successfully",
		"cid":     record.IPFSCid,
	})
}

func getRecords(w http.ResponseWriter, r *http.Request) {
	records, err := repositories.GetAllRecords()
	if err != nil {
		http.Error(w, "Failed to retrieve records", http.StatusInternalServerError)
		log.Printf("Error retrieving records: %v", err)
		return
	}

	if len(records) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("[]"))
		return
	}

	data, err := json.Marshal(records)
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

func getRecordsByOwnerAddress(w http.ResponseWriter, r *http.Request) {
	address := r.PathValue("address")
	if address == "" {
		http.Error(w, "Address parameter is required", http.StatusBadRequest)
		return
	}

	if len(address) != 42 || !strings.HasPrefix(address, "0x") {
		http.Error(w, "Invalid Ethereum address format", http.StatusBadRequest)
		return
	}

	records, err := repositories.GetRecordsByOwnerAddress(address)
	if err != nil {
		http.Error(w, "Failed to retrieve records", http.StatusInternalServerError)
		log.Printf("Error retrieving records: %v", err)
		return
	}

	if len(records) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("[]"))
		return
	}

	data, err := json.Marshal(records)
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
