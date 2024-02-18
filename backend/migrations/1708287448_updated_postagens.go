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

		collection, err := dao.FindCollectionByNameOrId("bie4whsxn3dvutk")
		if err != nil {
			return err
		}

		// add
		new_rodape := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
			"system": false,
			"id": "ttqahm9d",
			"name": "rodape",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "qt1vhqip5c7qryp",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), new_rodape)
		collection.Schema.AddField(new_rodape)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("bie4whsxn3dvutk")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("ttqahm9d")

		return dao.SaveCollection(collection)
	})
}
