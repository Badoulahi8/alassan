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
	"strconv"
	"strings"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
		StatusInternalServerError(w)
		return
	}
	usersession, stat := IsAuthenticated(r)
	if !stat {
		fmt.Println("User is not authentificate 1 2 3 ")
		StatusUnauthorized(w)
		return
	}

	if r.Method == http.MethodGet {
		// fmt.Println("username", usersession.User)
		followers := sqlrequest.GetFollowUser(usersession.User.ID, usersession.User.ID, true)

		// fmt.Println("follower", followers)
		newDataPostForm := Models.PostFormData{
			UserInfo: usersession.User,
			Follower: followers,
		}

		jsonData, err := json.Marshal(newDataPostForm)
		if err != nil {
			fmt.Println("Erreur lors du Marshal", err.Error())
			StatusInternalServerError(w)
			return
		}
		// fmt.Println("jsonData", jsonData)
		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(jsonData)
		if err != nil {
			fmt.Println("Erreur lors de l'envoi des donnees", err.Error())
			StatusInternalServerError(w)
		}

	} else if r.Method == http.MethodPost {
		data, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Error1", err)
			StatusInternalServerError(w)
			return
		}

		var newPostData = Models.Posts{}
		err = json.Unmarshal(data, &newPostData)
		if err != nil {
			fmt.Println("Error2", err.Error())
			StatusInternalServerError(w)
			return
		}
		// fmt.Println("dataPost", newPostData)
		err = utils.ValidatePost(newPostData)
		if err != nil {
			fmt.Println("Bad Post")
			StatusBadRequest(w, err.Error())
			return
		}
		var (
			imagePath string
			imageName string
		)
		if len(newPostData.Image) != 0 {
			imagePath, err = utils.CreateImagePath("../frontend/public/images/posts", newPostData.Image)
			if err != nil {
				fmt.Println("Erreur lors de la creation de l'image", err)
				StatusInternalServerError(w)
				return
			}
			imageName = strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
		}
		newPostData.ImagePath = imageName
		newPostData.UserId = usersession.User.ID

		idNewPost, errInsert := sqlrequest.InsertPost(db, newPostData)
		if errInsert != nil {
			fmt.Println("Erreur lors de l'insertion 1", errInsert.Error())
			StatusInternalServerError(w)
			return
		}
		if len(newPostData.UserSelected) != 0 {
			errInsert = sqlrequest.SavePostVisibility(db, idNewPost, newPostData.UserSelected)
			if errInsert != nil {
				fmt.Println("Erreur lors de l'insertion 2", errInsert.Error())
				StatusInternalServerError(w)
				return
			}
		}
	}
}

func CreatePostGroup(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodPost {
		db, err := sqlite.Connect()
		if err != nil {
			log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
			StatusInternalServerError(w)
			return
		}
		usersession, stat := IsAuthenticated(r)
		if !stat {
			fmt.Println("User is not authentificate postgroup")
			StatusUnauthorized(w)
			return
		}

		data, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Error1", err)
			StatusInternalServerError(w)
			return
		}

		var newPostData = Models.Posts{}
		err = json.Unmarshal(data, &newPostData)
		if err != nil {
			fmt.Println("Error2", err.Error())
			StatusInternalServerError(w)
			return
		}
		// fmt.Println("dataPost", newPostData)
		err = utils.ValidatePost(newPostData)
		if err != nil {
			fmt.Println("Bad Post")
			StatusBadRequest(w, err.Error())
			return
		}
		var (
			imagePath string
			imageName string
		)
		if len(newPostData.Image) != 0 {
			imagePath, err = utils.CreateImagePath("../frontend/public/images/posts", newPostData.Image)
			if err != nil {
				fmt.Println("Erreur lors de la creation de l'image", err)
				StatusInternalServerError(w)
				return
			}
			imageName = strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
		}
		newPostData.ImagePath = imageName
		newPostData.UserId = usersession.User.ID

		idNewPost, errInsert := sqlrequest.InsertPost(db, newPostData)
		if errInsert != nil {
			fmt.Println("Erreur lors de l'insertion 1", errInsert.Error())
			StatusInternalServerError(w)
			return
		}
		fmt.Println("Idpostgroup", idNewPost)
	}
}

func GetAllPostHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
		StatusInternalServerError(w)
		return
	}
	usersession, stat := IsAuthenticated(r)
	if !stat {
		fmt.Println("User is not authentificate getallpost")
		StatusUnauthorized(w)
		return
	}
	defer db.Close()
	groupId, err := sqlrequest.GetUserGroups(db, usersession.User.ID)

	if err != nil {
		fmt.Println("Error", err.Error())
		StatusInternalServerError(w)
		return
	}

	var postsDatas []Models.PostDatas
	posts, err := sqlrequest.GetAllPost(db, usersession.User.ID, groupId)
	if err != nil {
		fmt.Println("erruiyi", err.Error())
		StatusInternalServerError(w)
		return
	}
	for _, post := range posts {
		var postData Models.PostDatas
		postData.Id = post.Id
		postData.Content = post.Content
		postData.ImagePath = post.ImagePath
		userPost, _ := sqlrequest.GetUserById(db, post.UserId)
		if userPost.Id == 0 {
			postData.NickName = "Unknown"
			postData.UserAvatar = "default.png"
		} else {
			postData.NickName = userPost.NickName
			postData.UserAvatar = userPost.Avatar
		}
		// var nLike = 0
		postData.NumLikes, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, 1)
		// postData.NumLikes = utils.AbregerNombreLikesOrComment(nLike)
		postData.NumComments = utils.AbregerNombreLikesOrComment(len(sqlrequest.GetCommentByIdPost(db, post.Id)))
		// post.IsLike = models.LikePost(db.OpenDB(), v.Id, user.Id)
		// nLike, nDisLike := models.GetNumberLikeByIdPost(db.Database, v.Id)
		// post.Likes = utils.AbregerNombreLikesOrComment(nLike)
		// post.Date = utils.FormatDate(v.Date)
		postsDatas = append(postsDatas, postData)
	}

	jsonDatas, _ := json.Marshal(postsDatas)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonDatas)
}

func GetPostById(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
	}
	userId := utils.GetIdOfUrl(r, "api/post")
	if userId == 0 {
		fmt.Println("Id incorrect")
		// respondJSON(w, http.StatusBadRequest, "Post parameter invalide !!!", false)
		return
	}
	post, errP := sqlrequest.GetPostById(db, userId)
	if errP != nil {
		fmt.Println("Post for identifier " + strconv.Itoa(userId) + " doesn't exist !!!")
		// respondJSON(w, http.StatusBadRequest, "Post for identifier "+strconv.Itoa(p.Id)+" doesn't exist !!!", false)
		return
	}
	var postData Models.PostDatas
	postData.Id = post.Id
	postData.Content = post.Content
	postData.ImagePath = post.ImagePath
	userPost, _ := sqlrequest.GetUserById(db, post.UserId)
	if userPost.Id == 0 {
		postData.NickName = "Unknown"
		postData.UserAvatar = "default.png"
	} else {
		postData.NickName = userPost.NickName
		postData.UserAvatar = userPost.Avatar
	}
	var nLike = 0
	nLike, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, 1)
	// postData.NumLikes = utils.AbregerNombreLikesOrComment(nLike)
	postData.NumComments = utils.AbregerNombreLikesOrComment(len(sqlrequest.GetCommentByIdPost(db, post.Id)))
	CommentsByPost := sqlrequest.GetCommentByIdPost(db, postData.Id)
	nLike++
	for _, c := range CommentsByPost {
		var commentDatas Models.CommentDatas
		commentDatas.Id = c.Id
		commentDatas.Content = c.Content
		commentDatas.Date = c.Date
		userComment, _ := sqlrequest.GetUserById(db, c.UserId)
		if userComment.Id == 0 {
			commentDatas.NickName = "Unknown"
			commentDatas.AvatarUser = "default.png"
		} else {
			commentDatas.NickName = userComment.NickName
			commentDatas.AvatarUser = userComment.Avatar
		}
		postData.Comments = append(postData.Comments, commentDatas)
	}
	// usr, _ := models.GetUserById(db.OpenDB(), post.UserId)
	// var posts PostComment
	// posts.PostId = post.Id
	// posts.UserId = post.UserId
	// posts.Content = post.Content
	// posts.Comments = models.GetCommentsFromDatabase(db.OpenDB(), user.Id, p.Id)

	// posts.Date = utils.FormatDate(post.Date)
	// posts.ImagePath = post.ImagePath
	// posts.VideoPath = post.VideoPath
	// posts.Title = post.Title
	// posts.UserName = usr.UserName
	// posts.FirstName = usr.FirstName
	// posts.LastName = usr.LastName
	// nLike, nDisLike := models.GetNumberLikeByIdPost(db.Database, posts.PostId)
	// posts.Likes = utils.AbregerNombreLikesOrComment(nLike)
	// posts.DisLikes = utils.AbregerNombreLikesOrComment(nDisLike)
	// posts.IsLike = models.LikePost(db.OpenDB(), posts.PostId, user.Id)
	// posts.IsDisLike = models.DisLikePost(db.OpenDB(), posts.PostId, user.Id)
	// posts.Categories = models.GetCategoriesByIdPost(db.OpenDB(), posts.PostId)
	// if Status[posts.UserName] {
	// 	posts.ErrorRegister = ""
	// 	posts.Status = true
	// }

	// userSession, _ := IsAuthenticated(r)
	// userInfos, _ := sqlrequest.GetUserById(db, userSession.IdUser)
	userInfos := Models.User{
		Id:       1,
		NickName: "StaticUser",
		Avatar:   "alassane.png",
	}
	datas := struct {
		Post Models.PostDatas
		User Models.User
	}{
		Post: postData,
		User: userInfos,
	}
	jsonDatas, _ := json.Marshal(datas)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonDatas)
}

func GetPostsByUser(w http.ResponseWriter, r *http.Request, userId int) []Models.PostDatas {
	db, _ := sqlite.Connect()
	// if err != nil {
	// 	log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
	// }
	defer db.Close()
	var postsDatas []Models.PostDatas
	posts := sqlrequest.GetPostByUserId(db, userId)
	for _, post := range posts {
		var postData Models.PostDatas
		postData.Id = post.Id
		postData.Content = post.Content
		postData.ImagePath = post.ImagePath
		userPost, _ := sqlrequest.GetUserById(db, userId)
		if userPost.Id == 0 {
			postData.NickName = "Unknown"
			postData.UserAvatar = "default.png"
		} else {
			postData.NickName = userPost.NickName
			postData.UserAvatar = userPost.Avatar
		}
		postData.NumLikes, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, 1)
		postData.NumComments = utils.AbregerNombreLikesOrComment(len(sqlrequest.GetCommentByIdPost(db, post.Id)))
		postsDatas = append(postsDatas, postData)
	}
	return postsDatas
}
