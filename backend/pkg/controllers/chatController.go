package controllers

import (
	"backend/pkg/db/sqlite"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

var HelpUserID int

type GroupMember struct {
	UserChatID int    `json:"UserChatId"`
	Name       string `json:"name"`
}

type Group struct {
	Id           int           `json:"id"`
	Name         string        `json:"name"`
	GroupCreator int           `json:"group_creator"`
	CreationDate time.Time     `json:"creation"`
	Description  string        `json:"description"`
	ImageURL     string        `json:"imageUrl"`
	Members      []GroupMember `json:"members"`
}

type UserChat struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
	Status string `json:"status"`
}

func GetFollowerschat(userID int) ([]UserChat, error) {
	var followers []UserChat
	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
	SELECT DISTINCT u.Id, u.FirstName, u.LastName, u.Email, u.Avatar
	FROM User u
	INNER JOIN Follow f ON u.Id = f.Following
	LEFT JOIN (
	    SELECT MAX(m.Date) as last_message_time, CASE WHEN m.Expediteur = ? THEN m.Destinataire ELSE m.Expediteur END as other_user_id
	    FROM Message m
	    WHERE m.Expediteur = ? OR m.Destinataire = ?
	    GROUP BY other_user_id
	) lm ON u.Id = lm.other_user_id
	WHERE f.Follower = ?
	ORDER BY lm.last_message_time DESC
	`

	rows, err := db.Query(query, userID, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Carte pour stocker les utilisateurs connectés
	connectedUsers := make(map[int]bool)

	// Verifier la connexion de chaque utilisateur dans la carte des clients
	clientsMu.RLock()
	for client := range clients {
		connectedUsers[client.ID] = true
	}
	clientsMu.RUnlock()

	for rows.Next() {
		var follower UserChat
		var id int
		var firstName, lastName, email, avatar string
		err := rows.Scan(&id, &firstName, &lastName, &email, &avatar)
		if err != nil {
			return nil, err
		}
		follower.Id = id
		follower.Name = fmt.Sprintf("%s %s", firstName, lastName)
		follower.Email = email
		if avatar == "" {
			follower.Avatar = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg"
		} else {
			follower.Avatar = "../images/users/" + avatar
		}

		// Vérifier le statut de l'utilisateur
		_, ok := connectedUsers[id]
		if ok {
			follower.Status = "available"
		} else {
			follower.Status = "inactive"
		}

		followers = append(followers, follower)
	}

	return followers, nil
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifier si l'utilisateur est authentifié
	userSession, stat := IsAuthenticated(r)
	HelpUserID = userSession.IdUser
	if !stat {
		fmt.Println("User is not authentificate 1 2 3 ")
		StatusUnauthorized(w)
		return
	}

	fmt.Println("Fetching followers for user:", HelpUserID)

	// Récupérer les followers de l'utilisateur de la session actuelle
	followers, err := GetFollowerschat(HelpUserID)
	if err != nil {
		StatusInternalServerError(w)
		return
	}

	// Retourner les followers en tant que réponse JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(followers)
}

func GetGroupsChat(userID int) ([]Group, error) {
	var groups []Group
	fmt.Println(userID)
	db, err := sqlite.Connect()
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %v", err)
	}
	defer db.Close()

	query := `
        SELECT DISTINCT g.Id, g.Name
        FROM Groups g
        INNER JOIN groupMembers gm ON g.Id = gm.GroupID
        WHERE gm.UserID = ?
    `

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying database: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var group Group
		err := rows.Scan(&group.Id, &group.Name)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %v", err)
		}
		// Vous pouvez laisser l'URL de l'image par défaut comme avant
		group.ImageURL = "https://www.zone01dakar.sn/wp-content/uploads/2022/05/ZONE01-OUJDA-HORIZON-FOND-BLANC.jpg"

		groups = append(groups, group)
	}

	return groups, nil
}

func GetGroupsHandler(w http.ResponseWriter, r *http.Request) {

	fmt.Println("Fetching group for user:", HelpUserID)
	groups, err := GetGroupsChat(HelpUserID)
	if err != nil {
		StatusInternalServerError(w)
		return
	}
	fmt.Println(groups)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

func InsertMessage(msg Message) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	currentTime := time.Now().Format("2006-01-02 15:04:05")

	var groupeID int // Déclarer un type int pour l'ID du groupe

	// Vérifier si le destinataire est un ami ou un groupe
	if msg.DestinataireType == "Friend" {
		groupeID = 0 // Si c'est un ami, le groupeID est 0
	} else {
		groupeID = msg.GroupId // Sinon, utiliser l'ID du groupe
	}

	query := "INSERT INTO Message (Expediteur, Destinataire, DestinataireType, GroupeID, Contenue, Date, Lu) VALUES (?, ?, ?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(msg.SenderId, msg.RecipientId, msg.DestinataireType, groupeID, msg.Text, currentTime, false)
	if err != nil {
		return err
	}

	fmt.Println("Message inserted successfully")
	return nil
}

func GetOldMessages(senderID, recipientID int, recipientType string) ([]Message, error) {
	var messages []Message

	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	var query string
	if recipientType == "Friend" {
		query = `
            SELECT m.Contenue, m.Expediteur, u.Nickname, m.Destinataire, m.DestinataireType, 0 AS GroupeID, m.Date
            FROM Message m
            JOIN User u ON m.Expediteur = u.ID
            WHERE (m.Expediteur = ? AND m.Destinataire = ?) OR (m.Expediteur = ? AND m.Destinataire = ?)
            ORDER BY m.Date ASC
        `
	} else if recipientType == "Group" {
		fmt.Println(recipientID, " avant ici")
		query = `
			SELECT DISTINCT m.Contenue, m.Expediteur, u.Nickname, m.Destinataire, m.DestinataireType, m.GroupeID, m.Date
			FROM Message m
			JOIN User u ON m.Expediteur = u.ID
			JOIN groupMembers gm ON gm.UserID = ? AND gm.GroupID = m.GroupeID
			WHERE m.DestinataireType = 'Group' AND m.GroupeID = ?
			ORDER BY m.Date ASC
		`
	} else {
		return nil, errors.New("Recipient type not supported")
	}

	rows, err := db.Query(query, senderID, recipientID, recipientID, senderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var msg Message
		var groupId int // Déclarez une variable pour stocker temporairement la valeur de GroupeID
		err := rows.Scan(&msg.Text, &msg.SenderId, &msg.SenderName, &msg.RecipientId, &msg.DestinataireType, &groupId, &msg.Timestamp)
		if err != nil {
			return nil, err
		}
		msg.GroupId = groupId // Assignez la valeur de groupId à msg.GroupId
		messages = append(messages, msg)
	}

	fmt.Println(recipientID, " apres  ici")
	fmt.Println(messages)

	return messages, nil
}

// GetNicknameByID récupère le Nickname d'un utilisateur à partir de son ID
func GetNicknameByID(userID int) (string, error) {
	var nickname string
	db, err := sqlite.Connect()
	if err != nil {
		return "", err
	}
	defer db.Close()

	// Query pour récupérer le Nickname de l'utilisateur par son ID
	query := `SELECT Nickname FROM User WHERE Id = ?`

	// Exécutez la requête SQL et scannez le résultat dans la variable nickname
	err = db.QueryRow(query, userID).Scan(&nickname)
	if err != nil {
		return "", err
	}

	return nickname, nil
}
