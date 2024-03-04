package route

import (
	"backend/pkg/controllers"
	"fmt"
	"log"
	"net/http"
)

var (
	PORT = "8080"
)

func Route() {
	colorGreen := "\033[32m" // Mise en place de couleur pour la lisibilité dans le terminal
	colorBlue := "\033[34m"
	colorYellow := "\033[33m"
	fmt.Println(string(colorBlue), "[SERVER_INFO] : Starting local Server...")

	// -------------//-------------//-------------//-------------//-------------//-------------

	http.HandleFunc("/api/posts", controllers.GetAllPostHandler)
	http.HandleFunc("/api/post/", controllers.GetPostById)
	http.HandleFunc("/api/createpost", controllers.CreatePost)
	http.HandleFunc("/api/createpostgroup", controllers.CreatePostGroup)
	http.HandleFunc("/api/createcomment", controllers.CreateComment)
	http.HandleFunc("/api/register", controllers.RegisterHandler)
	http.HandleFunc("/api/login", controllers.LoginHandler)
	http.HandleFunc("/api/logout", controllers.HandleLogout)
	http.HandleFunc("/api/groups", controllers.CreateGroup)
	http.HandleFunc("/api/groupsdata/", controllers.GetGroupsDatas)
	http.HandleFunc("/api/createEvent", controllers.CreateEvent)
	http.HandleFunc("/api/joingroup", controllers.JoinGroup)
	http.HandleFunc("/api/joinGroupResp", controllers.JoinGroupResp)
	http.HandleFunc("/api/action", controllers.ActionPost)
	http.HandleFunc("/api/connectedUser", controllers.GetConnectedUserID)
	http.HandleFunc("/profil", controllers.HandleProfil)
	//http.HandleFunc("/api/user/followers", controllers.GetFollowers)
	http.HandleFunc("/api/data/follow", controllers.HandleFollow)
	http.HandleFunc("/api/data/updateProfil", controllers.UpdateProfile)
	http.HandleFunc("/api/addGroupMember", controllers.AddGroupMember)
	http.HandleFunc("/api/users", controllers.GetUsersHandler)
	http.HandleFunc("/api/groupschat", controllers.GetGroupsHandler)
	http.HandleFunc("/api/oldmessages", controllers.GetOldMessagesHandler)
	http.HandleFunc("/ws", controllers.HandleConnections)

	// -------------//-------------//-------------//-------------//-------------//-------------

	// Appliquer le middleware CORS
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		// Si la méthode est OPTIONS, retourner avec un statut OK
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Si la méthode n'est pas OPTIONS, appeler le gestionnaire principal
		http.DefaultServeMux.ServeHTTP(w, r)
	})

	fmt.Println(string(colorGreen), "[SERVER_READY] : on http://localhost: "+PORT+"✅ ") // Mise en place de l'URL pour l'utilisateur
	fmt.Println(string(colorYellow), "[SERVER_INFO] : To stop the program : Ctrl + c \033[00m")
	err := http.ListenAndServe(":"+PORT, handler)
	if err != nil {
		log.Fatal(err)
		
	}

}
