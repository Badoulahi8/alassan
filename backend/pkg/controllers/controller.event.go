package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"log"
)

func addEventToDB(title, description, date string, idCreator, idGroup int) {
	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return
	}

	stmt, err := db.Prepare("INSERT INTO Event(title, Description, UserId, GroupId, Date) VALUES (?,?,?,?,?)")
	if err != nil {
		HandleError(err, "preparing insertion of event")
		return
	}

	res, err := stmt.Exec(title, description, idCreator, idGroup, date)
	if err != nil {
		HandleError(err, "Excecuting insertion of event")
		return
	}

	res.RowsAffected()
	log.Printf("event:%s created by:%d \n", title, idCreator)
	db.Close()
}

func GetEvents(groupeID int) []Models.EventDetails{
	var event Models.EventDetails
	var events []Models.EventDetails

	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return nil
	}

	rows, err := db.Query("SELECT * FROM Event WHERE GroupId = ?", groupeID)
	if err != nil {
		HandleError(err, "Fetching groups database.")
		return nil
	}
	for rows.Next() {
		err := rows.Scan(&event.Id, &event.Title, &event.Description, &event.UserId, &event.GroupId, &event.DateTime)
		if err != nil {
			HandleError(err, "Fetching events database.")
			return events
		}
		events = append(events, event)
	}
	db.Close()
	return events
}
