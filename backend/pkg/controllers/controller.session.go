package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"log"
	"net/http"
)

func GetSessions() ([]Models.Session, error) {
	var sessions []Models.Session
	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	rows, err := db.Query("SELECT sessions.token, sessions.id, User.Id, User.Nickname, User.Avatar FROM sessions INNER JOIN User ON sessions.id = User.Id")
	if err != nil {
		// fmt.Println("ici")
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var session Models.Session
		if err := rows.Scan(&session.Token, &session.IdUser, &session.User.ID, &session.User.Username, &session.User.Avatar); err != nil {
			// fmt.Println("here")
			return sessions, err
		}
		sessions = append(sessions, session)
	}
	return sessions, nil
}

func IfSessionExist(token string) (Models.Session, bool) {
	sessions, err := GetSessions()
	// fmt.Println("sess", sessions)
	if err != nil {
		// fmt.Println("erreur test", err.Error())
		HandleError(err, "Fetching users sessions.")
		return Models.Session{}, false
	}

	for _, session := range sessions {
		// fmt.Println("not...", session.Token, "yes...", token)
		if session.Token == token {
			return session, true
		}
	}
	// fmt.Println("Not found")
	return Models.Session{}, false
}

func UserHasAlreadyASession(id int) (Models.Session, bool) {
	sessions, err := GetSessions()
	if err != nil {
		HandleError(err, "Fetching users sessions.")
		return Models.Session{}, false
	}

	for _, session := range sessions {
		if session.IdUser == id {
			return session, true
		}
	}
	return Models.Session{}, false
}

func CreateSession(w http.ResponseWriter, token string, id int) {
	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return
	}
	defer db.Close()
	stmt, err := db.Prepare("INSERT INTO sessions(token, id) values(?,?)")
	if err != nil {
		HandleError(err, "preparing insertion of session")
		return
	}
	res, err := stmt.Exec(token, id)
	if err != nil {
		HandleError(err, "Excecuting insertion of an session")
		return
	}
	// http.SetCookie(w, &http.Cookie{
	// 	Name: "session_token",
	// 	Value: token,
	// })
	res.RowsAffected()
	log.Printf("Session with token as +> %s for username +> %d created", token, id)
}

func DeleteSession(token string) {
	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return
	}
	defer db.Close()
	stmt, err := db.Prepare("delete from sessions where token=?")
	HandleError(err, "preparing delete session")
	if err != nil {
		return
	}
	res, err := stmt.Exec(token)
	if err != nil {
		HandleError(err, "executing delete session")
		return
	}
	res.RowsAffected()
}

func GetIDUserFromSession(session Models.Session) int {
	users := GetUsers()
	for _, user := range users {
		if user.Username == session.Username {
			return user.ID
		}
	}
	return 0
}

func GetUserFromSession(sessionToken string) string {
	sessions, err := GetSessions()
	if err != nil {
		HandleError(err, "Fetching users sessions.")
		return ""
	}

	for _, sess := range sessions {
		if sess.Token == sessionToken {
			return sess.Username
		}
	}
	return ""
}
