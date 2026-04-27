package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Atualiza as regras de permissão para habilitar a área do autor (`/casa`).
// O dono de uma niusleter (`niusleteres.usuario = @request.auth.id`) passa a
// poder atualizar a própria niusleter, gerenciar os próprios textos e listar
// os próprios inscritos. Tudo o que não for escopo do autor continua como
// estava.
func init() {
	m.Register(func(app core.App) error {
		niusleteres, err := app.FindCollectionByNameOrId("pbc_niusleteres")
		if err != nil {
			return err
		}
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": "",
			"createRule": null,
			"updateRule": "usuario = @request.auth.id",
			"deleteRule": null
		}`), &niusleteres); err != nil {
			return err
		}
		if err := app.Save(niusleteres); err != nil {
			return err
		}

		textos, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": "",
			"createRule": "niusleter.usuario = @request.auth.id",
			"updateRule": "niusleter.usuario = @request.auth.id",
			"deleteRule": "niusleter.usuario = @request.auth.id"
		}`), &textos); err != nil {
			return err
		}
		if err := app.Save(textos); err != nil {
			return err
		}

		inscritos, err := app.FindCollectionByNameOrId("pbc_1506696262")
		if err != nil {
			return err
		}
		if err := json.Unmarshal([]byte(`{
			"listRule": "niusleter.usuario = @request.auth.id",
			"viewRule": "niusleter.usuario = @request.auth.id",
			"createRule": null,
			"updateRule": null,
			"deleteRule": null
		}`), &inscritos); err != nil {
			return err
		}
		return app.Save(inscritos)
	}, func(app core.App) error {
		niusleteres, err := app.FindCollectionByNameOrId("pbc_niusleteres")
		if err != nil {
			return err
		}
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": "",
			"createRule": null,
			"updateRule": null,
			"deleteRule": null
		}`), &niusleteres); err != nil {
			return err
		}
		if err := app.Save(niusleteres); err != nil {
			return err
		}

		textos, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": "",
			"createRule": null,
			"updateRule": null,
			"deleteRule": null
		}`), &textos); err != nil {
			return err
		}
		if err := app.Save(textos); err != nil {
			return err
		}

		inscritos, err := app.FindCollectionByNameOrId("pbc_1506696262")
		if err != nil {
			return err
		}
		if err := json.Unmarshal([]byte(`{
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null
		}`), &inscritos); err != nil {
			return err
		}
		return app.Save(inscritos)
	})
}
