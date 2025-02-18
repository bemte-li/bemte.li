package hooks

import (
	"fmt"
	"net/mail"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/mailer"
)

// RegisterConviteHooks registers all hooks related to convites
func RegisterConviteHooks(app *pocketbase.PocketBase) {
	app.OnRecordAfterCreateSuccess("convites").BindFunc(func(e *core.RecordEvent) error {
		message := &mailer.Message{
			From: mail.Address{
				Address: app.Settings().Meta.SenderAddress,
				Name:    "Bemte.li",
			},
			To: []mail.Address{
				{
					Address: e.Record.GetString("email"),
					Name:    e.Record.GetString("nome"),
				},
			},
			Subject: "Recebemos sua solicitação de convite - Bemte.li",
			HTML: fmt.Sprintf(`
				<p>Olá %s,</p>
				<p>Recebemos sua solicitação de convite para o Bemte.li!</p>
				<p>Estamos analisando seu pedido e entraremos em contato em breve.</p>
				<p>Obrigado pelo interesse!</p>
				<p>Atenciosamente,<br>Equipe Bemte.li</p>
			`, e.Record.GetString("nome")),
		}

		return app.NewMailClient().Send(message)
	})
}
