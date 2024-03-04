package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"net/http"
)

func ActionPost(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		db, _ := sqlite.Connect()

		var actionData Models.ActionData
		if err := json.NewDecoder(r.Body).Decode(&actionData); err != nil {
			respondJSON(w, http.StatusBadRequest, "Erreur de decodage JSON", false)
			return
		}
		// ok, session := RequiereLogin(r)
		var user Models.User
		user.Id = 1
		// if ok {
		// 	user.Id, _ = strconv.Atoi(session.Data["userID"])
		// 	u, err := user.GetUser(database.OpenDB())
		// 	if err == nil {
		// 		user = u
		// 	}
		// }
		act, _ := sqlrequest.GetActionByUser(db, actionData.PostId, actionData.CommentId, user.Id)
		if act.Id != 0 {
			_, err := sqlrequest.DeleteAction(db, act)
			if err != nil {
				respondJSON(w, http.StatusBadRequest, "Failed to react this post", false)
			} else {
				respondJSON(w, http.StatusOK, "Success to react this post", true)
			}
		} else {
			act.PostId = actionData.PostId
			act.UserId = user.Id
			act.CommentId = actionData.CommentId
			_, err := sqlrequest.InsertAction(db, act)
			if err != nil {
				respondJSON(w, http.StatusBadRequest, "Failed to react this post", false)
			} else {
				respondJSON(w, http.StatusOK, "Success to react this post", true)
			}
		}
	}
}
