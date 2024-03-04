package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func HandleLogout(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodPost {

		body, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Erreur logout", err.Error())
			StatusInternalServerError(w)
			return
		}
		var TokenLogout string

		err = json.Unmarshal(body, &TokenLogout)
		if err != nil {
			fmt.Println("Unmarshal logout error", err.Error())
			StatusInternalServerError(w)
			return
		}
		// fmt.Println("datatoken logout", TokenLogout)
		DeleteSession(TokenLogout)
	}
}
