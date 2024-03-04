package sqlrequest

import (
	Models "backend/pkg/models"
	"backend/pkg/utils"
	"database/sql"
	"fmt"
	"log"
	"time"
)

func InsertPost(db *sql.DB, post Models.Posts) (int, error) {

	query, err := db.Prepare(`INSERT INTO Post(Content, ImagePath, Date, UserId, VisibilityPost) VALUES(?,?,?,?,COALESCE(NULLIF(?, ''), 'public'))`)
	if err != nil {
		return 0, err
	}
	datePost := time.Now().Format("2006-01-02 15:04:05")

	result, err := query.Exec(post.Content, post.ImagePath, datePost, post.UserId, post.Visibility)
	if err != nil {
		return 0, err
	}
	lastId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(lastId), nil
}

func PostVisiblity(db *sql.DB, PostId, UserId int) error {

	query, err := db.Prepare(`INSERT INTO PostVisibility(PostId, Visibility) VALUES(?,?)`)
	if err != nil {
		return err
	}
	_, err = query.Exec(PostId, UserId)
	if err != nil {
		return err
	}
	return nil
}

/*
Cette fonction permet de faire correspondre un post avec les utilisateur qui auront la possibilité de voir le post
*/
func SavePostVisibility(db *sql.DB, IdPost int, UsersId []int) error {

	for _, idUser := range UsersId {
		if errInsert := PostVisiblity(db, IdPost, idUser); errInsert != nil {
			return errInsert
		}
	}
	return nil
}

func GetAllPost(db *sql.DB, idUser int, postCanSee []string) ([]Models.Posts, error) {

	// Générer la liste des valeurs pour la clause IN
	var visibilityValues []interface{}
	visibilityValues = append(visibilityValues, idUser, "public") // Valeur par défaut

	for _, group := range postCanSee {
		visibilityValues = append(visibilityValues, group)
	}

	querytest, err := db.Prepare(`
		SELECT Post.Id, Post.Content, Post.ImagePath, Post.Date, Post.UserId, Post.VisibilityPost 
		FROM Post 
		LEFT JOIN PostVisibility ON Post.Id = PostVisibility.PostId 
		WHERE PostVisibility.Visibility = ? OR Post.VisibilityPost IN (?` + utils.GeneratePlaceholders(len(postCanSee)) + `) 
		ORDER BY Post.Date DESC
	`)
	if err != nil {
		return []Models.Posts{}, err
	}
	rows, err := querytest.Query(visibilityValues...)
	if err != nil {
		fmt.Println("Erreur query", err.Error())
		return []Models.Posts{}, err
	}
	defer rows.Close()

	var posts []Models.Posts
	for rows.Next() {
		var post Models.Posts
		err := rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
		if err != nil {
			fmt.Println("erreur row", err.Error())
			return []Models.Posts{}, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func GetPostById(db *sql.DB, Id int) (Models.Posts, error) {
	query := "SELECT * FROM Post WHERE Id = ?"
	var post Models.Posts
	rows := db.QueryRow(query, Id)
	err := rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
	if err == sql.ErrNoRows {
		return post, err
	}
	return post, nil
}

func GetPostByUserId(db *sql.DB, userId int) []Models.Posts {
	query := "SELECT * FROM Post WHERE UserId= ? ORDER BY Date DESC"
	rows, err := db.Query(query, userId)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var posts []Models.Posts
	for rows.Next() {
		var post Models.Posts
		err := rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
		if err != nil {
			log.Fatal(err)
		}
		posts = append(posts, post)
	}

	return posts
}
