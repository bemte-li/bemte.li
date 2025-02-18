package main

import (
	"log"

	"bemteli/internal/config"

	_ "bemteli/migrations"
)

func main() {
	app := config.InitApp()

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
