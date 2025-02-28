package hooks

import (
	"github.com/pocketbase/pocketbase"
)

// RegisterConviteHooks registers all hooks related to convites
func RegisterConviteHooks(app *pocketbase.PocketBase) {
	// TODO: Re-enable this hook when the mail server is ready
	// app.OnRecordAfterCreateSuccess("convites").BindFunc(func(e *core.RecordEvent) error {
	// 	message := &mailer.Message{
	// 		From: mail.Address{
	// 			Address: app.Settings().Meta.SenderAddress,
	// 			Name:    "Bemte.li",
	// 		},
	// 		To: []mail.Address{
	// 			{
	// 				Address: e.Record.GetString("email"),
	// 				Name:    e.Record.GetString("nome"),
	// 			},
	// 		},
	// 		Subject: "Recebemos sua solicitação de convite - Bemte.li",
	// 		HTML: fmt.Sprintf(`
	// 			<p>Olá %s,</p>
	// 			<p>Recebemos sua solicitação de convite para o Bemte.li!</p>
	// 			<p>Obrigado pelo interesse!</p>
	// 			<p>Atenciosamente,<br>Equipe Bemte.li</p>
	// 		`, e.Record.GetString("nome")),
	// 	}

	// 	return app.NewMailClient().Send(message)
	// })
	app.Logger().Info("Convite email hook disabled")
}
