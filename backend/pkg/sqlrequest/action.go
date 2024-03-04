package sqlrequest

import (
	Models "backend/pkg/models"
	"database/sql"
)

func GetAction(db *sql.DB, postId, commentId, userId int) (int, bool) {
	query := "SELECT * FROM Action WHERE PostId= ? AND CommentId=?"
	rows, err := db.Query(query, postId, commentId)
	// db.Exec("DELETE FROM Action")
	// db.Exec("INSERT INTO Action (Id, Status, UserId, PostId, CommentId) VALUES (NULL, 1, 2, 4, 0)")
	// db.Exec("INSERT INTO Action (Id, Status, UserId, PostId, CommentId) VALUES (NULL, 1, 1, 4, 0)")
	// db.Exec("INSERT INTO Action (Id, Status, UserId, PostId, CommentId) VALUES (NULL, 1, 3, 4, 0)")
	likes := 0
	isLike := false
	if err != nil {
		return 0, false
	}
	defer rows.Close()
	for rows.Next() {
		var a Models.Action
		err := rows.Scan(&a.Id, &a.Status, &a.UserId, &a.PostId, &a.CommentId)
		if err != nil {
			return 0, false
		}
		if a.UserId == userId {
			isLike = true
		}
		likes++
	}
	return likes, isLike
}

func GetActionByUser(db *sql.DB, PostId, CommentId, UserId int) (Models.Action, error) {
	var act Models.Action
	query := "SELECT * FROM Action WHERE PostId =? AND CommentId =? AND UserId =?"
	rows := db.QueryRow(query, PostId, CommentId, UserId)
	err := rows.Scan(&act.Id, &act.Status, &act.UserId, &act.PostId, &act.CommentId)
	if err != nil {
		return Models.Action{}, err
	}
	return act, nil
}

func InsertAction(db *sql.DB, a Models.Action) (int, error) {
	query := "INSERT INTO Action (Status, UserId, PostId, CommentId) VALUES (?, ?, ?, ?)"
	res, err := db.Exec(query, &a.Status, &a.UserId, &a.PostId, &a.CommentId)
	if err != nil {
		return 0, err
	}
	id, er := res.RowsAffected()

	if er != nil {
		return 0, err
	}
	return int(id), nil
}

func DeleteAction(db *sql.DB, a Models.Action) (int, error) {
	query := "DELETE FROM Action WHERE Id = ?"
	res, err := db.Exec(query, a.Id)
	if err != nil {
		return 0, err
	}
	id, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}
