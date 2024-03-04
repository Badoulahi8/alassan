package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func CreateComment(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
	}

	if r.Method == http.MethodPost {
		data, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Error1", err)
			return
		}

		var newCommentData = Models.Comment{}
		err = json.Unmarshal(data, &newCommentData)
		if err != nil {
			fmt.Println("Error2", err.Error())
			return
		}
		fmt.Println(newCommentData)
		// fmt.Println("dataPost", newPostData)
		// err = utils.ValidatePost(newPostData)
		// if err != nil {
		// 	fmt.Println("Bad Post")
		// 	return
		// }
		var (
			imagePath string
			imageName string
		)
		if len(newCommentData.Image) != 0 {
			imagePath, err = utils.CreateImagePath("../frontend/public/images/comments", newCommentData.Image)
			if err != nil {
				fmt.Println("Erreur lors de la creation de l'image", err)
				return
			}
			imageName = strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
		}
		newCommentData.ImagePath = imageName

		_, errInsert := sqlrequest.CreateComment(db, newCommentData)
		if errInsert != nil {
			fmt.Println("Erreur lors de l'insertion 1", errInsert.Error())
			return
		}
	}
}
