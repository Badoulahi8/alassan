package sqlrequest

import (
	Models "backend/pkg/models"
	"database/sql"
	"time"
)

func GetCommentByIdPost(db *sql.DB, PostId int) []Models.Comment {
	query := `
        SELECT * FROM Comment WHERE PostId=? ORDER BY Date DESC;
    `
	rows, err := db.Query(query, PostId)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var comments []Models.Comment

	for rows.Next() {
		var comment Models.Comment
		err := rows.Scan(
			&comment.Id, &comment.Content, &comment.ImagePath, &comment.Date, &comment.PostId, &comment.UserId)
		if err != nil {
			return nil
		}
		// comment.Likes, comment.Dislikes = GetNumberLikeDislikeByIdComment(db, comment.ID)
		// user, _ := GetUserById(db, comment.UserId)
		// comment.IsLikeComment = LikeComment(db, comment.ID, userID)
		// comment.IsDisLikeComment = DisLikeComment(db, comment.ID, userID)
		// comment.DateFormat = utils.FormatDate(comment.Date)
		// comment.User = user.UserName
		// if comment.ParentID == 0 {
		// 	// Si c'est un commentaire principal, organisez-le avec ses réponses
		// 	organizedComment := OrganizeCommentWithReplies(comment, userID, db)
		// }
		comments = append(comments, comment)
	}
	return comments
}

func CreateComment(db *sql.DB, comment Models.Comment) (int, error) {
	query, err := db.Prepare(`INSERT INTO Comment(Content, ImagePath, Date, PostId, UserId) VALUES(?,?,?,?,?)`)

	if err != nil {
		return 0, err
	}
	dateComment := time.Now().Format("2006-01-02 15:04:05")

	// result, err := query.Exec(comment.Content, comment.ImagePath, dateComment, comment.UserId, comment.UserId)
	result, err := query.Exec(comment.Content, "", dateComment, comment.PostId, comment.UserId)

	if err != nil {
		return 0, err
	}
	lastId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(lastId), nil
}
