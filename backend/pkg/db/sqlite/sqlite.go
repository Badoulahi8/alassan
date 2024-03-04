package sqlite

import (
	"database/sql"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func Connect() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "./pkg/db/database.db")
	if err != nil { 
		return nil, err
	}
	return db, nil
}

func RunMigrations(db *sql.DB) error {
	const migrationsPath = "pkg/db/migrations/sqlite"
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		return nil
	}
	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsPath,
		"sqlite3", driver)
	if err != nil {
		return fmt.Errorf("impossible de créer l'instance de migration : %v", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("erreur lors de l'application up des migrations : %v", err)
	}

	// if err := m.Down(); err != nil && err != migrate.ErrNoChange {
	// 	return fmt.Errorf("erreur lors de l'application up des migrations : %v", err)
	// }
	return nil
}
