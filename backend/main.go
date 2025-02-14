package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// TODO: Load  SMTP settings from a file or environment variables
	// See https://github.com/pocketbase/pocketbase/discussions/1551

	// Check if we're in development mode via environment variable
	isDev := os.Getenv("APP_ENV") == "development"

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		Automigrate: isDev,
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
