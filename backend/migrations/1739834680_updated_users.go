package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey__pb_users_auth_` + "`" + ` ON ` + "`" + `usuarios` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email__pb_users_auth_` + "`" + ` ON ` + "`" + `usuarios` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''"
			],
			"name": "usuarios",
			"oauth2": {
				"mappedFields": {
					"avatarURL": "",
					"name": ""
				}
			}
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"convertURLs": false,
			"hidden": false,
			"id": "editor36406763",
			"maxSize": 0,
			"name": "descricao",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "editor"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text1579384326",
			"max": 255,
			"min": 0,
			"name": "nome",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(8, []byte(`{
			"hidden": false,
			"id": "file376926767",
			"maxSelect": 1,
			"maxSize": 0,
			"mimeTypes": [
				"image/jpeg",
				"image/png",
				"image/svg+xml",
				"image/gif",
				"image/webp"
			],
			"name": "foto",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": [
				"400x400"
			],
			"type": "file"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey__pb_users_auth_` + "`" + ` ON ` + "`" + `users` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email__pb_users_auth_` + "`" + ` ON ` + "`" + `users` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''"
			],
			"name": "users",
			"oauth2": {
				"mappedFields": {
					"avatarURL": "avatar",
					"name": "name"
				}
			}
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("editor36406763")

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text1579384326",
			"max": 255,
			"min": 0,
			"name": "name",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"hidden": false,
			"id": "file376926767",
			"maxSelect": 1,
			"maxSize": 0,
			"mimeTypes": [
				"image/jpeg",
				"image/png",
				"image/svg+xml",
				"image/gif",
				"image/webp"
			],
			"name": "avatar",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": null,
			"type": "file"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
