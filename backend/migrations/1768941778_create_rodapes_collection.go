package migrations

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// 1. Create rodapes collection
		rodapesJSON := `{
			"createRule": null,
			"deleteRule": null,
			"updateRule": null,
			"listRule": "",
			"viewRule": "",
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
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text_rodape_autor",
					"max": 0,
					"min": 0,
					"name": "autor",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"convertURLs": false,
					"hidden": false,
					"id": "editor_rodape_descricao",
					"maxSize": 0,
					"name": "descricao",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "editor"
				},
				{
					"hidden": false,
					"id": "file_rodape_foto",
					"maxSelect": 1,
					"maxSize": 0,
					"mimeTypes": [
						"image/jpeg",
						"image/png"
					],
					"name": "foto",
					"presentable": false,
					"protected": false,
					"required": false,
					"system": false,
					"thumbs": [],
					"type": "file"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text_rodape_hash",
					"max": 64,
					"min": 0,
					"name": "hash",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": true,
					"system": false,
					"type": "text"
				},
				{
					"cascadeDelete": false,
					"collectionId": "pbc_niusleteres",
					"hidden": false,
					"id": "relation_rodape_niusleter",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "niusleter",
					"presentable": false,
					"required": true,
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
			"id": "pbc_rodapes",
			"indexes": [
				"CREATE UNIQUE INDEX idx_rodapes_hash_niusleter ON rodapes (hash, niusleter)"
			],
			"name": "rodapes",
			"system": false,
			"type": "base"
		}`

		rodapesCollection := &core.Collection{}
		if err := json.Unmarshal([]byte(rodapesJSON), &rodapesCollection); err != nil {
			return err
		}

		if err := app.Save(rodapesCollection); err != nil {
			return err
		}

		// 2. Add rodape relation field to textos collection
		textosCollection, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}

		if err := textosCollection.Fields.AddMarshaledJSONAt(len(textosCollection.Fields)-1, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_rodapes",
			"hidden": false,
			"id": "relation_texto_rodape",
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

		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// 3. Migrate existing data from embedded fields to rodapes collection
		textos, err := app.FindRecordsByFilter(textosCollection, "", "", 0, 0)
		if err != nil {
			return err
		}

		// Track created rodapes by hash+niusleter to reuse them
		rodapeCache := make(map[string]string) // hash+niusleter -> rodape ID

		for _, texto := range textos {
			autor := texto.GetString("rodape_autor")
			descricao := texto.GetString("rodape_descricao")
			foto := texto.GetString("rodape_field")
			niusleterId := texto.GetString("niusleter")

			// Skip if no rodape data
			if autor == "" && descricao == "" && foto == "" {
				continue
			}

			// Compute hash
			hash := computeRodapeHash(autor, descricao, foto)
			cacheKey := fmt.Sprintf("%s:%s", hash, niusleterId)

			var rodapeId string
			if existingId, exists := rodapeCache[cacheKey]; exists {
				// Reuse existing rodape
				rodapeId = existingId
			} else {
				// Create new rodape
				rodape := core.NewRecord(rodapesCollection)
				rodape.Set("autor", autor)
				rodape.Set("descricao", descricao)
				rodape.Set("foto", foto)
				rodape.Set("hash", hash)
				rodape.Set("niusleter", niusleterId)

				if err := app.Save(rodape); err != nil {
					return err
				}

				rodapeId = rodape.Id
				rodapeCache[cacheKey] = rodapeId
			}

			// Link texto to rodape
			texto.Set("rodape", rodapeId)
			if err := app.Save(texto); err != nil {
				return err
			}
		}

		// 4. Remove old embedded fields from textos
		textosCollection.Fields.RemoveById("text_rodape_autor")
		textosCollection.Fields.RemoveById("editor_rodape_descricao")
		textosCollection.Fields.RemoveById("file_rodape_field")

		if err := app.Save(textosCollection); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		// Rollback: restore embedded fields and remove rodapes collection

		// 1. Get textos collection
		textosCollection, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}

		// 2. Add back embedded fields
		if err := textosCollection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text_rodape_autor",
			"max": 0,
			"min": 0,
			"name": "rodape_autor",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		if err := textosCollection.Fields.AddMarshaledJSONAt(6, []byte(`{
			"convertURLs": false,
			"hidden": false,
			"id": "editor_rodape_descricao",
			"maxSize": 0,
			"name": "rodape_descricao",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "editor"
		}`)); err != nil {
			return err
		}

		if err := textosCollection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"hidden": false,
			"id": "file_rodape_field",
			"maxSelect": 1,
			"maxSize": 0,
			"mimeTypes": [
				"image/jpeg",
				"image/png"
			],
			"name": "rodape_field",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": [],
			"type": "file"
		}`)); err != nil {
			return err
		}

		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// 3. Migrate data back from rodapes to embedded fields
		rodapesCollection, err := app.FindCollectionByNameOrId("pbc_rodapes")
		if err != nil {
			// Collection doesn't exist, nothing to migrate
			return nil
		}

		textos, err := app.FindRecordsByFilter(textosCollection, "", "", 0, 0)
		if err != nil {
			return err
		}

		for _, texto := range textos {
			rodapeId := texto.GetString("rodape")
			if rodapeId != "" {
				rodape, err := app.FindRecordById(rodapesCollection, rodapeId)
				if err == nil {
					texto.Set("rodape_autor", rodape.GetString("autor"))
					texto.Set("rodape_descricao", rodape.GetString("descricao"))
					texto.Set("rodape_field", rodape.GetString("foto"))
					if err := app.Save(texto); err != nil {
						return err
					}
				}
			}
		}

		// 4. Remove rodape relation from textos
		textosCollection.Fields.RemoveById("relation_texto_rodape")
		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// 5. Delete rodapes collection
		if err := app.Delete(rodapesCollection); err != nil {
			return err
		}

		return nil
	})
}

// computeRodapeHash generates a hash for rodape content deduplication
func computeRodapeHash(autor, descricao, foto string) string {
	content := fmt.Sprintf("%s|%s|%s", autor, descricao, foto)
	hash := sha256.Sum256([]byte(content))
	return hex.EncodeToString(hash[:])[:12]
}
