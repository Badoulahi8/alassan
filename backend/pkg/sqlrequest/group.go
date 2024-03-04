package sqlrequest

import (
	Models "backend/pkg/models"
	"database/sql"
	"fmt"
	"strconv"
)

func GetUserGroups(db *sql.DB, idUser int) ([]string, error) {

	query, err := db.Prepare("SELECT GroupID FROM groupMembers WHERE UserID = ?")
	if err != nil {
		return []string{}, err
	}
	rows, err := query.Query(idUser)
	if err != nil {
		return []string{}, err
	}
	var groupId []string

	for rows.Next() {

		var idGroup int
		err = rows.Scan(&idGroup)
		if err != nil {
			return groupId, err
		}
		groupId = append(groupId, strconv.Itoa(idGroup))
	}

	return groupId, nil
}

func GetPostGroup(db *sql.DB, idGroup int) ([]Models.Posts, error) {

	query, err := db.Prepare("SELECT * FROM Post WHERE VisibilityPost = ? ORDER BY Date DESC")
	if err != nil {
		fmt.Println("fii")
		return []Models.Posts{}, err
	}
	groupId := strconv.Itoa(idGroup)
	rows, err := query.Query(groupId)
	if err != nil {
		fmt.Println("fii 2")
		return []Models.Posts{}, err
	}

	var postsGroup []Models.Posts
	for rows.Next() {
		var post Models.Posts
		err = rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
		if err != nil {
			fmt.Println("fii 3")

			return postsGroup, err
		}
		postsGroup = append(postsGroup, post)
	}
	// fmt.Println("postgrou", postsGroup)
	return postsGroup, nil
}
