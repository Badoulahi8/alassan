package sqlrequest

import (
	"database/sql"
	"fmt"
)

func IsFollower(db *sql.DB, follower int, following int) (bool, error) {
	query := "SELECT COUNT(*) FROM Follow WHERE Follower = ? AND Following = ?"
	var count int
	err := db.QueryRow(query, follower, following).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("erreur lors de la vérification des followers : %v", err)
	}
	return count > 0, nil
}
