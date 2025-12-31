package v1

import "net/http"

func StartRecordsController(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/records", addRecord)
}

func addRecord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Logic to add a record would go here

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Record added successfully"))
}
