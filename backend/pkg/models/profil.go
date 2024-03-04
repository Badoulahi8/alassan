package Models

import (
	"database/sql"
	"fmt"
)

func GetUsers(db *sql.DB) ([]User, error) {
	// Préparer la requête SELECT
	rows, err := db.Query("SELECT * FROM User")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var user User
		// Remplir la structure User avec les données de la ligne courante
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password)
		if err != nil {
			return nil, err
		}
		// Ajouter l'utilisateur à la liste
		users = append(users, user)
	}
	// Vérifier les erreurs possibles lors du parcours des résultats
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func GetUserByID(db *sql.DB, userID int) (User, error) {
	// Préparer la requête SELECT avec un paramètre
	row := db.QueryRow("SELECT * FROM User WHERE Id = ?", userID)

	var user User
	// Remplir la structure User avec les données de la ligne
	err := row.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil)
	if err != nil {
		fmt.Println(" error while scanning user", err)
		return User{}, err
	}

	return user, nil
}
