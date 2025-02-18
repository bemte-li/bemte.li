package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		jsonData := `{
			"createRule": null,
			"deleteRule": null,
			"fields": [
				{
					"autogeneratePattern": "[a-z0-9]{15}",
					"hidden": false,
					"id": "text3208210256",
					"max": 15,
					"min": 15,
					"name": "id",
					"pattern": "^[a-z0-9]+$",
					"presentable": false,
					"primaryKey": true,
					"required": true,
					"system": true,
					"type": "text"
				},
				{
					"exceptDomains": null,
					"hidden": false,
					"id": "email3885137012",
					"name": "email",
					"onlyDomains": null,
					"presentable": false,
					"required": false,
					"system": false,
					"type": "email"
				},
				{
					"cascadeDelete": false,
					"collectionId": "_pb_users_auth_",
					"hidden": false,
					"id": "relation577089629",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "usuario",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				},
				{
					"hidden": false,
					"id": "autodate2990389176",
					"name": "created",
					"onCreate": true,
					"onUpdate": false,
					"presentable": false,
					"system": false,
					"type": "autodate"
				},
				{
					"hidden": false,
					"id": "autodate3332085495",
					"name": "updated",
					"onCreate": true,
					"onUpdate": true,
					"presentable": false,
					"system": false,
					"type": "autodate"
				}
			],
			"id": "pbc_1506696262",
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_lTlmzdfREf` + "`" + ` ON ` + "`" + `inscritos` + "`" + ` (\n  ` + "`" + `email` + "`" + `,\n  ` + "`" + `usuario` + "`" + `\n)"
			],
			"listRule": null,
			"name": "inscritos",
			"system": false,
			"type": "base",
			"updateRule": null,
			"viewRule": null
		}`

		collection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1506696262")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
