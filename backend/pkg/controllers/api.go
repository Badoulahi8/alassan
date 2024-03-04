package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hello from register handler")

	_, auth := IsAuthenticated(r)
	if auth {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	if r.Method != http.MethodPost {
		fmt.Println("Errorrrrrr bad req not post method")
		StatusBadRequest(w, "Bad Request")
		return
	}

	email := strings.TrimSpace(r.FormValue("email"))
	password := strings.TrimSpace(r.FormValue("password"))
	firstName := strings.TrimSpace(r.FormValue("firstName"))
	lastName := strings.TrimSpace(r.FormValue("lastName"))
	dob := strings.TrimSpace(r.FormValue("dob"))
	username := strings.TrimSpace(r.FormValue("username"))
	bio := r.FormValue("bio")
	profil := "public"

	if email == "" || password == "" || firstName == "" || lastName == "" || dob == "" {
		StatusInternalServerError(w)
		return
	}

	// fmt.Println("Decoded User:", email, password, username, firstName, lastName, dob, bio)
	_, ok := IfUserExist(username, email)
	if ok {
		w.WriteHeader(http.StatusUnauthorized)
		WriteResponse(w, "User already exists")
		fmt.Println("User already exists")
		return
	}

	file, header, err := r.FormFile("profileImage")
	defer func() {
		if file != nil {
			file.Close()
		}
	}()
	if err != nil && err != http.ErrMissingFile {
		fmt.Println("Error getting profile image:", err)
		WriteResponse(w, "Error getting profile image")
		return
	}

	var imagePath string
	if file != nil {
		defer file.Close()

		if header.Size > 20*1024*1024 {
			fmt.Println("Cannot upload files more than 20 MB")
			WriteResponse(w, "file must be under 20mb")
			return
		}

		ext := filepath.Ext(header.Filename)
		ext = strings.ToLower(ext)
		if ext != ".jpeg" && ext != ".jpg" && ext != ".gif" && ext != ".png" {
			fmt.Println("Extension not valid :", ext)
			WriteResponse(w, "file ext not valid")
			return
		}

		// Générez un UUID unique pour l'image
		imageUUID := uuid.Must(uuid.NewV4()).String()
		imagePath = imageUUID + ext

		err = saveFile(file, "../frontend/public/images/users/"+imagePath)
		if err != nil {
			fmt.Println("Error saving the file :", err)
			WriteResponse(w, "file cant be saved")
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		HandleError(err, "hasign password using bcrypt")
		return
	}

	CreateUser(email, string(hashedPassword), username, firstName, lastName, imagePath, dob, bio, profil)
	WriteResponse(w, "Created")
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hello from LoginHandler")

	if r.Method != http.MethodPost {
		fmt.Println("Errorrrrrr bad req not post method")
		StatusBadRequest(w, "Bad Request")
		return
	}

	email := r.FormValue("email")
	password := r.FormValue("password")

	user, ok := CheckCredentials(email, password)
	if !ok {
		// fmt.Println("test")
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Println("Not allowed to access")
		WriteResponse(w, "Your are not allowed to access")
		return
	}

	sessionToken := uuid.Must(uuid.NewV4()).String()
	session, checkSession := UserHasAlreadyASession(user.ID)
	if checkSession {
		DeleteSession(session.Token)
		CreateSession(w, sessionToken, user.ID)
	} else {
		CreateSession(w, sessionToken, user.ID)
	}
	userID := strconv.Itoa(user.ID)

	w.Write([]byte(`{"status":"success", "token":"` + sessionToken + `",  "id":"` + userID + `"}`))
}

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		groupName := strings.TrimSpace(r.FormValue("groupName"))
		description := strings.TrimSpace(r.FormValue("description"))

		fmt.Println("GroupName = ", groupName, "Description = ", description)

		if groupName == "" || description == "" {
			StatusUnauthorized(w)
			return
		}

		usersession, _ := IsAuthenticated(r)

		addGroupToDB(groupName, description, usersession.IdUser)

		groupId, err := GetGroupIdByName(groupName)
		if err != nil {
			fmt.Println(" GetGroupIdByName error ", err)
			return
		}

		err = AddMemberToGroup(groupId, usersession.IdUser)
		if err != nil {
			fmt.Println(" Error adding creator group to members ", err)
			return
		}
		WriteResponse(w, "group created")
	}

	if r.Method == "GET" {
		groups, err := GetGroupNamesAndId()
		if err != nil {
			fmt.Println("Erreur de conversion:", err)
			return
		}
		groupsJSON, err := json.Marshal(groups)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(groupsJSON)
	}
}

func GetGroupsDatas(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	usersession, _ := IsAuthenticated(r)

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	groupIDStr := parts[len(parts)-1]

	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	ok, _ := CheckIfGroupExists(groupID)
	if !ok {
		fmt.Println("Group does not exist")
		StatusBadRequest(w, "")
		WriteResponse(w, "nope")
		return
	}

	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("erreur lors de la connexion à la base de données : %v", err)
		StatusInternalServerError(w)
		return
	}
	datas := GetGroupsAndStuff(groupID)
	postsgroup, err := sqlrequest.GetPostGroup(db, groupID)
	if err != nil {
		fmt.Println("err", err.Error())
		StatusInternalServerError(w)
		return
	}
	// datas.PostGroup = postsgroup

	var postsDatas []Models.PostDatas
	for _, post := range postsgroup {
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

	datas.PostGroup = postsDatas
	events := GetEvents(groupID)
	groupEventData := Models.GroupDatas{
		Datas:  datas,
		Events: events,
		Friends: Models.FriendsDatas{
			Followers:  sqlrequest.GetFollowUser(usersession.IdUser, usersession.IdUser, true),
			Followings: sqlrequest.GetFollowUser(usersession.IdUser, usersession.IdUser, false),
		},
	}

	groupEventDataJSON, err := json.Marshal(groupEventData)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Envoyer la réponse HTTP
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(groupEventDataJSON)
}

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	var eventDetails Models.EventDetails
	if err := json.NewDecoder(r.Body).Decode(&eventDetails); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	usersession, _ := IsAuthenticated(r)
	id := usersession.IdUser

	idgroup, err := strconv.Atoi(eventDetails.Slug)
	if err != nil {
		fmt.Println("Error while atoing conversion:", err)
		return
	}

	isMember, err := IsMemberOfGroup(id, idgroup)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	if isMember {
		fmt.Println("User is a member of the group")
		addEventToDB(eventDetails.Title, eventDetails.Description, eventDetails.DateTime, id, idgroup)

		w.WriteHeader(http.StatusOK)
		WriteResponse(w, "Created")
		return
	} else {
		fmt.Println("User is not a member of the group")
		WriteResponse(w, "Not allowed")
		return
	}
}

func JoinGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		usersession, _ := IsAuthenticated(r)
		idUser := usersession.IdUser

		// Parse le formulaire dans la requête
		err := r.ParseForm()
		if err != nil {
			fmt.Println("Error parsing form data:", err)
			StatusBadRequest(w, "Error parsing form data")
			return
		}

		groupID, err := strconv.Atoi(r.FormValue("groupId"))
		if err != nil {
			fmt.Println("Error converting group ID:", err)
			StatusBadRequest(w, "Invalid group ID")
			return
		}

		groupCreator, err := strconv.Atoi(r.FormValue("groupCreator"))
		if err != nil {
			fmt.Println("Error converting group ID creator:", err)
			StatusBadRequest(w, "Invalid group ID")
			return
		}

		fmt.Printf("Group ID: %d\n", groupID)
		fmt.Printf("Group Creator: %d\n", groupCreator)

		groupExists, err := CheckIfGroupExists(groupID)
		if err != nil {
			fmt.Println("Error checking if group exists:", err)
			StatusInternalServerError(w)
			return
		}
		if !groupExists {
			fmt.Println("Group does not exist")
			WriteResponse(w, "group does not exist")
			StatusUnauthorized(w)
			return
		}

		creatorIDCorrect, err := CheckIfCreatorIDCorrect(groupID, groupCreator)
		if err != nil {
			fmt.Println("Error checking if creator ID is correct:", err)
			StatusInternalServerError(w)
			return
		}
		if !creatorIDCorrect {
			fmt.Println("Invalid group creator")
			WriteResponse(w, "he is not the creator")
			StatusBadRequest(w, "Invalid group creator")
			return
		}

		groupName, err := GetGroupNameByID(groupID)
		if err != nil {
			fmt.Println("Errorrr getting group name")
			return
		}

		username := GetUserById(idUser)

		isMember, err := IsMemberOfGroup(idUser, groupID)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		if isMember {
			fmt.Println("User is a member of the group")
			WriteResponse(w, "Unauthorized")
			return
		} else {
			fmt.Println("User is not a member of the group")
			err = SaveMembershipRequest(groupID, idUser, groupCreator, groupName, username)
			if err != nil {
				fmt.Println("Error saving membership request:", err)
				StatusInternalServerError(w)
				return
			}
			WriteResponse(w, "Requested")
		}
	}

	if r.Method == "GET" {
		usersession, auth := IsAuthenticated(r)

		if auth {
			idUser := usersession.IdUser

			fmt.Println("id user: ", idUser)

			isCorrect, err := CheckIfCreator(idUser)
			if err != nil {
				fmt.Println("Erreur lors de la vérification de l'ID du créateur:", err)
				return
			}
			if !isCorrect {
				fmt.Println("L'ID du créateur est incorrect.")
				return
			}

			stuff, err := GetAllMembershipRequests(idUser)
			if err != nil {
				fmt.Println("Enable to get stuufff")
				return
			}

			responseJSON, err := json.Marshal(stuff)
			if err != nil {
				fmt.Println("Cannot marshal stuuff")
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(responseJSON)
		}
	}
}

func JoinGroupResp(w http.ResponseWriter, r *http.Request) {
	var JoinResp Models.JoinResp
	if err := json.NewDecoder(r.Body).Decode(&JoinResp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if JoinResp.Response == "accept" {
		idUser := GetUserByUsername(JoinResp.User)
		idgroup, _ := GetGroupIdByName(JoinResp.Group)

		AddMemberToGroup(idgroup, idUser)
		WriteResponse(w, "Added")
	} else {
		WriteResponse(w, "Declined")
		return
	}
}

func AddGroupMember(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		userssesion, _ := IsAuthenticated(r)
		idUser := userssesion.IdUser

		groupID, err := strconv.Atoi(r.FormValue("groupId"))
		if err != nil {
			fmt.Println("Error converting group ID:", err)
			StatusBadRequest(w, "Invalid group ID")
			return
		}

		idRequested, err := strconv.Atoi(r.FormValue("idRequested"))
		if err != nil {
			fmt.Println("Error converting  ID :", err)
			StatusBadRequest(w, "Invalid  ID")
			return
		}

		// fmt.Println("grouuud id", groupID)
		// fmt.Println("reeqqqq id", idRequested)
		// fmt.Println("userr id", idUser)

		groupExists, err := CheckIfGroupExists(groupID)
		if err != nil {
			fmt.Println("Error checking if group exists:", err)
			StatusInternalServerError(w)
			return
		}
		if !groupExists {
			fmt.Println("Group does not exist")
			WriteResponse(w, "group does not exist")
			StatusUnauthorized(w)
			return
		}

		isMember, err := IsMemberOfGroup(idRequested, groupID)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		if isMember {
			fmt.Println("User is a member of the group")
			WriteResponse(w, "Unauthorized")
			return
		} else {
			fmt.Println("User is not a member of the group")
			fmt.Println("Grouppp Id ", groupID, " Requested Id ", idRequested)
			ok := HasARequest(idRequested, groupID)
			if ok {
				fmt.Println("User is already member")
				WriteResponse(w, "Nope")
				return
			}
			err = SaveAddMemberRequest(groupID, idUser, idRequested)
			if err != nil {
				fmt.Println("Error saving membership request:", err)
				StatusInternalServerError(w)
				return
			}
			WriteResponse(w, "Requested")
		}
	}

	if r.Method == "GET" {
		usersession, auth := IsAuthenticated(r)

		if auth {
			idUser := usersession.IdUser

			stuff := GetAddGroupRequest(idUser)

			responseJSON, err := json.Marshal(stuff)
			if err != nil {
				fmt.Println("Cannot marshal stuuff")
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(responseJSON)
		}
	}
}
