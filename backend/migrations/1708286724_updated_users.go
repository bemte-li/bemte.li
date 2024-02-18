package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models/schema"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		json.Unmarshal([]byte(`[
			"CREATE UNIQUE INDEX ` + "`" + `idx_K9FlCy5` + "`" + ` ON ` + "`" + `users` + "`" + ` (` + "`" + `arroba` + "`" + `)"
		]`), &collection.Indexes)

		// add
		new_arroba := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "b3fec3et",
			"name": "arroba",
			"type": "text",
			"required": true,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), new_arroba)
		collection.Schema.AddField(new_arroba)

		// add
		new_sobre := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "4onda4rs",
			"name": "sobre",
			"type": "editor",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"convertUrls": false
			}
		}`), new_sobre)
		collection.Schema.AddField(new_sobre)

		// update
		edit_nome := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "users_name",
			"name": "nome",
			"type": "text",
			"required": true,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), edit_nome)
		collection.Schema.AddField(edit_nome)

		// update
		edit_foto := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "users_avatar",
			"name": "foto",
			"type": "file",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"mimeTypes": [
					"image/jpeg",
					"image/png",
					"image/svg+xml",
					"image/gif",
					"image/webp"
				],
				"thumbs": null,
				"maxSelect": 1,
				"maxSize": 5242880,
				"protected": false
			}
		}`), edit_foto)
		collection.Schema.AddField(edit_foto)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		json.Unmarshal([]byte(`[]`), &collection.Indexes)

		// remove
		collection.Schema.RemoveField("b3fec3et")

		// remove
		collection.Schema.RemoveField("4onda4rs")

		// update
		edit_nome := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "users_name",
			"name": "name",
			"type": "text",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), edit_nome)
		collection.Schema.AddField(edit_nome)

		// update
		edit_foto := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "users_avatar",
			"name": "avatar",
			"type": "file",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"mimeTypes": [
					"image/jpeg",
					"image/png",
					"image/svg+xml",
					"image/gif",
					"image/webp"
				],
				"thumbs": null,
				"maxSelect": 1,
				"maxSize": 5242880,
				"protected": false
			}
		}`), edit_foto)
		collection.Schema.AddField(edit_foto)

		return dao.SaveCollection(collection)
	})
}
