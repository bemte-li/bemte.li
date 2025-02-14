package main

import (
	"log"
)

func main() {
	app := InitApp()

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
