package sqlrequest

import (
	Models "backend/pkg/models"
	"database/sql"
)

func Register(db *sql.DB, user Models.User) (int, error) {
	query := "INSERT INTO User (Id, FirstName, LastName, NickName, Avatar, DateOfBirth, AboutMe, Email, Password) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)"
	res, err := db.Exec(query, user.FirstName, user.LastName, user.NickName, user.Avatar, user.DateOfBirth, user.AboutMe, user.Email, user.Password)
	if err != nil {
		return 0, err
	}

	id, er := res.RowsAffected()

	if er != nil {
		return 0, err
	}

	return int(id), nil
}

func GetUserById(db *sql.DB, Id int) (Models.User, error) {
	query := "SELECT * FROM User WHERE Id = ?"
	row := db.QueryRow(query, Id)
	var user Models.User
	err := row.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Profil, &user.Password)
	if err != nil || err == sql.ErrNoRows {
		return user, err
	}
	return user, nil
}
