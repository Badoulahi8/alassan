package controllers

import (
	Models "backend/pkg/models"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const (
	sessionCookieName = "session_token"
	sessionDuration   = 3600 * time.Second
)

func WriteResponse(w http.ResponseWriter, status string) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"` + status + `"}`))
}

// Print the error while achieving a given task.
func HandleError(err error, task string) {
	if err != nil {
		log.Printf("Error While %s | more=> %v\n", task, err)
	}
}

func IsAuthenticated(r *http.Request) (Models.Session, bool) {
	c, err := r.Cookie(sessionCookieName)
	if err == nil {
		// fmt.Println("Erreur lors de le recuperation des cookies", err.Error())
		sessionToken := c.Value
		// fmt.Println("rCoockie", c)
		userSession, exists := IfSessionExist(sessionToken)
		if exists {
			return userSession, true
		}
	}
	return Models.Session{}, false
}

func IsExpired(expiry time.Time) bool {
	return time.Now().After(expiry)
}

func StatusBadRequest(w http.ResponseWriter, text string) {
	w.WriteHeader(http.StatusBadRequest)
	WriteResponse(w, "Bad Request")
}

func StatusUnauthorized(w http.ResponseWriter) {
	w.WriteHeader(http.StatusUnauthorized)
	WriteResponse(w, "Unauthorized")
}

func StatusInternalServerError(w http.ResponseWriter) {
	w.WriteHeader(http.StatusInternalServerError)
	WriteResponse(w, "Internal Server Error")
}

func saveFile(file multipart.File, filePath string) error {
	// Extraire le chemin du répertoire à partir du chemin du fichier
	dir := filepath.Dir(filePath)

	// Créer le répertoire de destination s'il n'existe pas déjà
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}

	// Ouvrir le fichier de destination
	destination, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer destination.Close()

	// Copier le contenu du fichier téléchargé dans le fichier de destination
	_, err = io.Copy(destination, file)
	if err != nil {
		return err
	}

	return nil
}

func CheckCredentials(email, password string) (Models.Users, bool) {
	users := GetUsers()

	var hashedPassword string

	for _, user := range users {

		hashedPassword = user.Password
		err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))

		if user.Email == email && err == nil {
			// fmt.Println("test test")
			return user, true
		}
	}

	return Models.Users{}, false
}
