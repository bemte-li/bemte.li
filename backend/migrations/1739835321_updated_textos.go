package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_3828697798",
			"hidden": false,
			"id": "relation66896023",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "rodape",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation66896023")

		return app.Save(collection)
	})
}
