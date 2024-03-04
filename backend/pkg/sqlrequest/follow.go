package sqlrequest

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"database/sql"
	"fmt"
)

func GetFollowUser(userID int, connectedUserID int, follower bool) []Models.UserFollow {
	db, err := sqlite.Connect()
	if err != nil {
		return nil
	}
	defer db.Close()
	var query string
	if follower {
		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Follower WHERE f.Following = ?"
	} else {
		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Following WHERE f.Follower = ?"
	}
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var users []Models.UserFollow
	for rows.Next() {
		var user Models.User
		var followId int
		var followType int
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &followId, &followType)
		if err != nil {
			return nil
		}
		isfollower, err := IsFollower(db, connectedUserID, user.Id)
		if err != nil {
			fmt.Println("une erreur s'est produit: ", err)
		}
		userFollow := Models.UserFollow{
			Use:         user,
			FollowId:    followId,
			Status:      followType,
			IsFollowing: isfollower,
		}
		users = append(users, userFollow)
	}
	return users
}

func InsertFollow(db *sql.DB, follower, following, status int) (int64, error) {
	// Préparer la requête SQL d'insertion
	stmt, err := db.Prepare("INSERT INTO Follow(Follower, Following, Type) VALUES(?, ?, ?)")
	if err != nil {
		return -1, err
	}
	defer stmt.Close()

	// Exécuter la requête SQL d'insertion avec les valeurs fournies
	result, err := stmt.Exec(follower, following, status)
	if err != nil {
		return -1, err
	}

	// Récupérer l'ID de la ligne insérée
	id, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}

	return id, nil
}

func DeleteFollow(db *sql.DB, followerID int, followingID int) error {
	// Requête DELETE pour supprimer l'enregistrement avec le follower et le following donnés
	query := "DELETE FROM Follow WHERE Follower = ? AND Following = ?"

	// Exécution de la requête avec les IDs donnés
	_, err := db.Exec(query, followerID, followingID)
	if err != nil {
		return err
	}

	return nil
}
