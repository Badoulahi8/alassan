package controllers

import (
	"encoding/json"
	"net/http"
)

type ErrorPage struct {
	StatusCode  int
	Message     string
	Description string
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func respondJSON(w http.ResponseWriter, status int, message string, success bool) {
	response := ErrorResponse{
		Success: success,
		Message: message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}
