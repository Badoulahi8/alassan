package main

import (
	"backend/pkg/controllers"
	"backend/pkg/db/sqlite"
	"backend/pkg/route"
	"log"
	"os"
)

func main() {

	go controllers.HandleMessages()	
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
	}
	defer db.Close()
	// Ouvrir le fichier d'entrée
	file, err := os.ReadFile("./pkg/db/migrations/sqlite/insert_init_schema.sql")
	if err != nil {

		log.Fatal(err)
	}

	if _, err := db.Exec(string(file)); err != nil {
		return
	}

	//err = sqlite.RunMigrations(db)
	//if err != nil {
	//	log.Fatalf("erreur lors de l'application des migrations : %v", err)
	//}

	// log.Println("Migrations appliquées avec succès")
	route.Route()
	// http.ListenAndServe(":8080", nil)

}
