package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type Data struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Username   string `json:"username"`
	Profil     string `json:"profil"`
	Biographie string `json:"biographie"`
}

type User struct {
	ID          int    `json:"id"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Nickname    string `json:"nickname"`
	Avatar      string `json:"avatar"`
	DateOfBirth string `json:"dateOfBirth"`
	AboutMe     string `json:"aboutMe"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

type userData struct {
	User        Models.User
	Posts       []Models.PostDatas
	Followers   []Models.UserFollow `json:"followers"`
	Following   []Models.UserFollow `json:"following"`
	IsFollowing bool
}

func HandleProfil(w http.ResponseWriter, r *http.Request) {
	session, _ := IsAuthenticated(r)

	fmt.Println("Voici la session du user connecte ", session)
	connectedUserID := session.IdUser

	fmt.Println("userrrrrrrrrr")
	// Récupérer l'ID de l'utilisateur à partir des paramètres de requête
	//setCorsHeaders(w)

	userIDParam := r.URL.Query().Get("id")
	if userIDParam == "" {
		http.Error(w, "Missing user ID", http.StatusBadRequest)
		return
	}

	// Convertir l'ID de l'utilisateur en un entier
	userId, err := strconv.Atoi(userIDParam)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	database, _ := sqlite.Connect()
	user, err := Models.GetUserByID(database, userId)
	if err != nil {
		http.Error(w, "Can not recup the user", http.StatusBadRequest)
	}
	fmt.Println(user.FirstName, connectedUserID, userId)
	isfollowing, err := sqlrequest.IsFollower(database, connectedUserID, userId)
	if err != nil {
		fmt.Println("une erreur s'est produit: ", err)
	}

	data := userData{
		User:        user,
		Posts:       GetPostsByUser(w, r, userId),
		Followers:   sqlrequest.GetFollowUser(userId, connectedUserID, true),
		Following:   sqlrequest.GetFollowUser(userId, connectedUserID, false),
		IsFollowing: isfollowing,
	}

	// Convertir les données en JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	// Définir le type de contenu de la réponse en JSON
	w.Header().Set("Content-Type", "application/json")
	// Envoyer les données encodées en JSON en réponse
	w.Write(jsonData)
}

/*/
func GetFollowers(w http.ResponseWriter, r *http.Request) {
	//setCorsHeaders(w)
	id := r.URL.Query().Get("id")
	userID, err := strconv.Atoi(id)
	fmt.Println(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	follow := userData{
		Followers: getFollowUser(userID, true),
		Following: getFollowUser(userID, false),
	}

	fmt.Println("followers ", follow)

	json.NewEncoder(w).Encode(follow)
}


func getFollowUser(userID int, connectedUserID int, follower bool) []UserFollow {
	db, err := sqlite.Connect()
	if err != nil {
		return nil
	}
	defer db.Close()

	// 	var query string
	// 	if follower {
	// 		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Follower WHERE f.Following = ?"
	// 	} else {
	// 		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Following WHERE f.Follower = ?"
	// 	}
	// 	rows, err := db.Query(query, userID)
	// 	if err != nil {
	// 		return nil
	// 	}
	// 	defer rows.Close()

	var users []UserFollow
	for rows.Next() {
		var user Models.User
		var followId int
		var followType int
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &followId, &followType)
		if err != nil {
			return nil
		}
		isfollower, err := sqlrequest.IsFollower(db, connectedUserID, user.Id)
		if err != nil {
			fmt.Println("une erreur s'est produit: ", err)
		}
		userFollow := UserFollow{
			Use:         user,
			FollowId:    followId,
			Status:      followType,
			IsFollowing: isfollower,
		}
		users = append(users, userFollow)
	}
	return users
}
/*/

func HandleFollow(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		fmt.Println("Can't connect to database.")
		return
	}
	defer db.Close()
	session, _ := IsAuthenticated(r)

	fmt.Println("Voici la session du user connecte ", session)
	userID := session.IdUser
	id := r.URL.Query().Get("id")
	status := r.URL.Query().Get("status")
	profil := r.URL.Query().Get("profil")
	followingID, _ := strconv.Atoi(id)
	stat, _ := strconv.Atoi(status)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	isfollower, err := sqlrequest.IsFollower(db, userID, followingID)
	if stat == 1 {
		_, err = sqlrequest.InsertFollow(db, userID, followingID, stat)
	} else {
		fmt.Println("suppression", userID, followingID, isfollower, stat, profil)
		if isfollower {
			err = sqlrequest.DeleteFollow(db, userID, followingID)
		} else if profil == "private" {
			_, err = sqlrequest.InsertFollow(db, userID, followingID, stat)
		}
	}
	if err != nil {
		http.Error(w, "Error updating follow status", http.StatusInternalServerError)
		return
	}
	type Data struct {
		Status string
	}

	data := Data{
		Status: "ok",
	}
	// Envoyer une réponse avec un statut HTTP 200 OK
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	// Définir le type de contenu de la réponse en JSON
	w.Header().Set("Content-Type", "application/json")
	// Envoyer les données encodées en JSON en réponse
	w.Write(jsonData)
}

func GetTypeByID(id int) (int, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return 0, err
	}
	defer db.Close()

	var followType int
	err = db.QueryRow("SELECT Type FROM Follow WHERE Id = ?", id).Scan(&followType)
	if err != nil {
		return 0, err
	}

	return followType, nil
}

// func updateFollowStatus(followID, status int) error {
// 	// Connexion à la base de données
// 	db, err := sqlite.Connect()
// 	if err != nil {
// 		return err
// 	}
// 	defer db.Close()

// 	// Préparation de la requête SQL
// 	query := "UPDATE Follow SET Type = ? WHERE Id = ?"
// 	_, err = db.Exec(query, status, followID)
// 	if err != nil {
// 		return err
// 	}

// 	fmt.Println("Successfully updated status to", status, "for follow ID", followID)
// 	return nil
// }

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	aboutMe := r.URL.Query().Get("aboutMe")
	profil := r.URL.Query().Get("profil")

	fmt.Println("USer IDDDD", id, aboutMe, profil)

	Id, err := strconv.Atoi(id)
	if err != nil {
		fmt.Println("Error while converting", err)
		return
	}

	if profil == "true" {
		profil = "private"
	} else {
		profil = "public"
	}

	err = UpdateUserProfile(Id, aboutMe, profil)
	if err != nil {
		http.Error(w, "Error updating User profil", http.StatusInternalServerError)
		return
	}

	type Data struct {
		Status string
	}

	data := Data{
		Status: "ok",
	}
	// Envoyer une réponse avec un statut HTTP 200 OK
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	// Définir le type de contenu de la réponse en JSON
	w.Header().Set("Content-Type", "application/json")
	// Envoyer les données encodées en JSON en réponse
	w.Write(jsonData)
}

func UpdateUserProfile(userID int, aboutMe, profil string) error {
	// Ouvrir une connexion à la base de données
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()
	fmt.Println(userID, profil, aboutMe)
	//query := "UPDATE User SET AboutMe = ?, Profil = ? WHERE Id = ?"
	query := "UPDATE User SET AboutMe = ?, Profil = ? WHERE Id = ?"
	_, err = db.Exec(query, aboutMe, profil, userID)
	if err != nil {
		return err
	}
	fmt.Println("updated seccessfully")
	// Si la mise à jour est réussie, retourner nil (pas d'erreur)
	return nil
}

func GetConnectedUserID(w http.ResponseWriter, r *http.Request) {
	session, _ := IsAuthenticated(r)

	fmt.Println("Voici la session du user connecte ", session)
	userID := session.IdUser
	type UserData struct {
		UserID int `json:"userId"`
	}

	userData := UserData{
		UserID: userID,
	}

	jsonData, err := json.Marshal(userData)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
