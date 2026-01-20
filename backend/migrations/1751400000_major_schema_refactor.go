package migrations

import (
	"encoding/json"
	"os"
	"time"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// 1. Update textos collection - change caminho pattern to allow hyphens
		textosCollection, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}

		// Update caminho field pattern
		if err := textosCollection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text4051051968",
			"max": 0,
			"min": 0,
			"name": "caminho",
			"pattern": "^[a-z0-9-]+$",
			"presentable": false,
			"primaryKey": false,
			"required": true,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// Update textos collection rules
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": ""
		}`), &textosCollection); err != nil {
			return err
		}

		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// 2. Update usuarios collection rules
		usuariosCollection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": ""
		}`), &usuariosCollection); err != nil {
			return err
		}

		if err := app.Save(usuariosCollection); err != nil {
			return err
		}

		// 3. Merge rodapes into textos - get rodapeCollection first
		rodapeCollection, err := app.FindCollectionByNameOrId("pbc_3828697798")
		if err != nil {
			return err
		}

		// Add footer fields to textos collection
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

		// Migrate existing data from rodapes to textos
		textos, err := app.FindRecordsByFilter(textosCollection, "", "", 0, 0)
		if err != nil {
			return err
		}

		for _, texto := range textos {
			rodapeId := texto.GetString("rodape")
			if rodapeId != "" {
				rodape, err := app.FindRecordById(rodapeCollection, rodapeId)
				if err == nil {
					texto.Set("rodape_autor", rodape.GetString("autor"))
					texto.Set("rodape_descricao", rodape.GetString("descricao"))
					texto.Set("rodape_field", rodape.GetString("field"))
					if err := app.Save(texto); err != nil {
						return err
					}
				}
			}
		}

		// Remove the rodape relation field from textos
		textosCollection.Fields.RemoveById("relation66896023")
		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// Delete the rodapes collection
		if err := app.Delete(rodapeCollection); err != nil {
			return err
		}

		// 4. Create niusleteres collection with all fields including display options
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
				},
				{
					"convertURLs": false,
					"hidden": false,
					"id": "editor36406763",
					"maxSize": 0,
					"name": "descricao",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "editor"
				},
				{
					"hidden": false,
					"id": "file_foto_3x4",
					"maxSelect": 1,
					"maxSize": 0,
					"mimeTypes": [
						"image/jpeg",
						"image/png",
						"image/svg+xml",
						"image/gif",
						"image/webp"
					],
					"name": "foto_3x4",
					"presentable": false,
					"protected": false,
					"required": false,
					"system": false,
					"thumbs": [
						"400x400"
					],
					"type": "file"
				},
				{
					"hidden": false,
					"id": "select_display_mode",
					"maxSelect": 1,
					"name": "display_mode",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "select",
					"values": [
						"title_only",
						"title_image_horizontal",
						"title_with_3x4_photo"
					]
				},
				{
					"hidden": false,
					"id": "file_foto_horizontal",
					"maxSelect": 1,
					"maxSize": 0,
					"mimeTypes": [
						"image/jpeg",
						"image/png",
						"image/svg+xml",
						"image/gif",
						"image/webp"
					],
					"name": "foto_horizontal",
					"presentable": false,
					"protected": false,
					"required": false,
					"system": false,
					"thumbs": [
						"1200x400"
					],
					"type": "file"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text_caminho_niusleter",
					"max": 255,
					"min": 1,
					"name": "caminho",
					"pattern": "^[a-z0-9-]+$",
					"presentable": false,
					"primaryKey": false,
					"required": true,
					"system": false,
					"type": "text"
				},
				{
					"cascadeDelete": false,
					"collectionId": "_pb_users_auth_",
					"hidden": false,
					"id": "relation_usuario_niusleter",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "usuario",
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
			"id": "pbc_niusleteres",
			"indexes": [
				"CREATE UNIQUE INDEX idx_niusleteres_usuario ON niusleteres (usuario)",
				"CREATE UNIQUE INDEX idx_niusleteres_caminho ON niusleteres (caminho)"
			],
			"listRule": "",
			"name": "niusleteres",
			"system": false,
			"type": "base",
			"updateRule": null,
			"viewRule": ""
		}`

		niusleteresCollection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &niusleteresCollection); err != nil {
			return err
		}

		if err := app.Save(niusleteresCollection); err != nil {
			return err
		}

		// 5. Get inscritos collection for updates
		inscritosCollection, err := app.FindCollectionByNameOrId("pbc_1506696262")
		if err != nil {
			return err
		}

		// Create a mapping from usuario ID to niusleter ID
		usuarioToNiusleter := make(map[string]string)

		// Migrate existing user data to niusleteres
		usuarios, err := app.FindRecordsByFilter(usuariosCollection, "", "", 0, 0)
		if err != nil {
			return err
		}

		for _, usuario := range usuarios {
			niusleter := core.NewRecord(niusleteresCollection)
			niusleter.Set("nome", usuario.GetString("nome"))
			niusleter.Set("descricao", usuario.GetString("descricao"))
			niusleter.Set("foto_3x4", usuario.GetString("foto"))
			niusleter.Set("usuario", usuario.Id)
			// Set default display_mode based on whether there's a photo
			if usuario.GetString("foto") != "" {
				niusleter.Set("display_mode", "title_with_3x4_photo")
			} else {
				niusleter.Set("display_mode", "title_only")
			}

			if err := app.Save(niusleter); err != nil {
				return err
			}

			usuarioToNiusleter[usuario.Id] = niusleter.Id
		}

		// 6. Update textos collection relation field
		var textosUsuarioFieldId string
		for _, field := range textosCollection.Fields {
			if field.GetName() == "usuario" {
				textosUsuarioFieldId = field.GetId()
				break
			}
		}

		if textosUsuarioFieldId != "" {
			textosCollection.Fields.RemoveById(textosUsuarioFieldId)
			if err := textosCollection.Fields.AddMarshaledJSONAt(len(textosCollection.Fields)-1, []byte(`{
				"cascadeDelete": false,
				"collectionId": "pbc_niusleteres",
				"hidden": false,
				"id": "relation_niusleter_textos",
				"maxSelect": 1,
				"minSelect": 0,
				"name": "niusleter",
				"presentable": false,
				"required": false,
				"system": false,
				"type": "relation"
			}`)); err != nil {
				return err
			}
		}

		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// 7. Update inscritos collection - add note field and update relation field
		if err := inscritosCollection.Fields.AddMarshaledJSONAt(2, []byte(`{
			"convertURLs": false,
			"hidden": false,
			"id": "editor_nota_inscricao",
			"maxSize": 0,
			"name": "nota",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "editor"
		}`)); err != nil {
			return err
		}

		var inscritosUsuarioFieldId string
		for _, field := range inscritosCollection.Fields {
			if field.GetName() == "usuario" {
				inscritosUsuarioFieldId = field.GetId()
				break
			}
		}

		if inscritosUsuarioFieldId != "" {
			inscritosCollection.Fields.RemoveById(inscritosUsuarioFieldId)
			if err := inscritosCollection.Fields.AddMarshaledJSONAt(len(inscritosCollection.Fields)-1, []byte(`{
				"cascadeDelete": false,
				"collectionId": "pbc_niusleteres",
				"hidden": false,
				"id": "relation_niusleter_inscritos",
				"maxSelect": 1,
				"minSelect": 0,
				"name": "niusleter",
				"presentable": false,
				"required": false,
				"system": false,
				"type": "relation"
			}`)); err != nil {
				return err
			}
		}

		// Update inscritos collection indexes
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX `+"`"+`idx_lTlmzdfREf`+"`"+` ON `+"`"+`inscritos`+"`"+` (\n  `+"`"+`email`+"`"+`,\n  `+"`"+`niusleter`+"`"+`\n)"
			]
		}`), &inscritosCollection); err != nil {
			return err
		}

		if err := app.Save(inscritosCollection); err != nil {
			return err
		}

		// 8. Migrate data from usuario relations to niusleter relations
		textos, err = app.FindRecordsByFilter(textosCollection, "", "", 0, 0)
		if err != nil {
			return err
		}

		for _, texto := range textos {
			usuarioId := texto.GetString("usuario")
			if niusleterId, exists := usuarioToNiusleter[usuarioId]; exists {
				texto.Set("niusleter", niusleterId)
				if err := app.Save(texto); err != nil {
					return err
				}
			}
		}

		inscritos, err := app.FindRecordsByFilter(inscritosCollection, "", "", 0, 0)
		if err != nil {
			return err
		}

		for _, inscrito := range inscritos {
			usuarioId := inscrito.GetString("usuario")
			if niusleterId, exists := usuarioToNiusleter[usuarioId]; exists {
				inscrito.Set("niusleter", niusleterId)
				if err := app.Save(inscrito); err != nil {
					return err
				}
			}
		}

		// 9. Remove nome, descricao, and foto fields from usuarios collection
		usuariosCollection.Fields.RemoveById("text1579384326") // nome
		usuariosCollection.Fields.RemoveById("editor36406763") // descricao
		usuariosCollection.Fields.RemoveById("file376926767")  // foto

		if err := app.Save(usuariosCollection); err != nil {
			return err
		}

		// 10. Seed development data (only in dev environment)
		env := os.Getenv("APP_ENV")
		if env == "dev" || env == "development" {
			// Create user record
			user := core.NewRecord(usuariosCollection)
			user.Set("email", "diario@bemte.li")
			user.Set("password", "dev123456")
			user.Set("passwordConfirm", "dev123456")

			if err := app.Save(user); err != nil {
				return err
			}

			// Create niusleter record
			niusleter := core.NewRecord(niusleteresCollection)
			niusleter.Set("nome", "Diário de borda")
			niusleter.Set("descricao", "Desenvolvendo um canto da Internet")
			niusleter.Set("caminho", "diario-de-borda")
			niusleter.Set("usuario", user.Id)
			niusleter.Set("display_mode", "title_only")

			if err := app.Save(niusleter); err != nil {
				return err
			}

			// Create sample texto
			textoContent := `
<h2>E O BEMTE.LI?</h2>

<p>Entre os três mesmos amigos, com o esboço do esboço de uma ideia sem concorrente em nossas bandas (pois, afinal, ainda não há uma única plataforma de niusleter brasileira, enquanto reina o californiano Substack), os encontros do Bemte.li logo completam dois anos e meio.</p>

<p>Quase trinta meses de uma sólida, implacável, vontade tripla de pôr para rodar um site — à nossa nostálgica e (re)idealizadora maneira de pensar a Internet — que envie e-mails. Sem planos pagos, para que artistas, militantes e pessoas de toda sorte, interessadas no texto, possam escrever e interagir com seus ciclos cibernéticos.</p>

<p>Uma designer, um programador, um escritor, no tempo que tiver que ser, mas sem esmorecer. Assim o Bemte.li nasceu e, agora, começa a arriscar voo, dar um rolê pela cidade, fazer ninho. Esse projeto é a ambição da concretude básica, não das alturas: se terminar com meia dúzia de pessoas contentes com seu uso (a contar pela luana e pelo Felipe, que têm suas próprias niusleteres, uma no Buttondown e a outra… no Substack), já nos damos por satisfeitos.</p>

<p>Se mais e mais gente vier a somar, continuaremos, empolgadíssimos, mas atentos para não perder o prumo: sem plataformização, algoritmização, anúncios ou visão de lucro; e sim para código aberto, conta gratuita, arrecadação coletiva e 100% de transparência.</p>

<h2>SEM PRESSA E SEM PAUSA</h2>

<p>O Bemte.li existe nas nossas vidas desde fevereiro de 2023. Fizemos uma única reunião online, todas as outras foram presenciais — porque se encontrar fisicamente faz parte da proposta. Não trabalhamos em todos os encontros que fazemos, às vezes só batemos papo mesmo e damos tchau dizendo que no próximo vamos trabalhar.</p>

<p>Ainda queremos ver o projeto operando do jeitinho que sonhamos lá no começo, mas a trajetória pra chegar até esse sonho é tão importante quanto vê-lo no mundo. O Bemte.li ainda não nasceu, está nascendo, e decidimos abrir o jogo e compartilhar nossos processos. O Diário de borda é a primeira niusleter enviada pelo Bemte.li. Aqui, contamos como estamos desenvolvendo um canto da Internet.</p>

<p>Um breve contexto, em ordem cronológica: passamos o primeiro ano do Bemte.li cozinhando conceitualmente o que seria o projeto, que ainda se chamava Bem-te-li. Ele nos acompanhou por mudanças de residência, términos e inícios de relacionamento, viagens, hiatos, momentos de intensa vontade de criar e alguns bloqueios criativos — mas nunca paramos. Anotamos e desenhamos tudo à mão, em papéis sulfite que nunca sabíamos exatamente com quem ficava, mas que, incrivelmente, nunca se perderam.</p>

<p>No segundo ano do Bemte.li, sistematizamos todas as ideias que tivemos, definimos a escrita do nome atual, iniciamos um longo processo de identidade visual e tivemos nossa primeira DR; mas em dezembro a cara do Bemte.li ficou pronta! E, com a parte visual definida, o código podia andar. Em janeiro deste ano, produzimos mais do que no ano passado inteiro. Resgatamos os conceitos, desenhos, textos, e tudo fluiu. Nosso processo é humano, já falamos isso outras vezes. No discurso, é lindo. Na prática, pode ser frustrante. Mas quando vimos as páginas nascendo, percebemos que a fluidez do trabalho foi resultado desse processo, de um Bemte.li cozinhado lentamente em fogo baixo.</p>

<p>Com o trabalho ganhando corpo, surgiu um novo ânimo e decidimos fazer uma ação de carnaval. Intensificamos o trabalho pra deixar tudo pronto antes do feriado, foi corrido! Escrevemos um manifesto, desenvolvemos a página inicial do site e outra de solicitação de convite. Criamos frases curtas que traduzem conceitualmente nosso projeto, produzimos artes gráficas e imprimimos em adesivos redondos que foram colados pela cidade.</p>

<p>De lá pra cá, mais um hiato e outra mudança de residência — agora, porém, luana, Luccas e Felipe moram mais perto do que nunca, o que colabora com a frequência dos encontros. Nos últimos meses, estamos imersos em resolver questões técnicas que são tão importantes quanto desafiadoras, e felizes com as pequenas vitórias.</p>

<p><em>(fotos dos adesivos na rua e dos encontros no escritório)</em></p>

<h2>NÃO EXISTE CARTA SEM CARTEIRO</h2>

<p>A comparação entre mandar uma carta e enviar um e-mail: é isto que exploramos no nosso manifesto[link]. A comparação é, também, uma anologia que utilizamos e que será melhor elaborada em textos futuros. Pensar no selo, no carteiro, na agência dos Correios do seu bairro e não conseguir sequer imaginar quais são os equivalentes eletrônicos é sintomático de uma Internet reinada por bigueteques que juram te proteger, em troca da sua autonomia.</p>

<p>Um dos mitos usados como justificativa é de que gerenciar seu próprio servidor de e-mails é muito complicado e, portanto, você deveria depender de empresas consolidadas para enviar suas niusleteres. A maioria delas te cobram por e-mail enviado e te garantem que só elas são capazes de garantir sua segurança e entregabilidade. Se não te cobram, bom, os interesses são outros. Entregabilidade: palavra-chave para servidores de e-mail, já que os grandes clientes de e-mail (Gmail, Outlook etc.) mantêm uma lista de personas non gratas extensa em suas portas e recusam qualquer encomenda que não venha desses "CEPs confiáveis".</p>

<p>Se corremos o risco de não chegar nos nossos destinatários ou ter mais trabalho do que suportamos, sendo pequenos e independentes na Internet, então é melhor deixar essa tarefa para quem sabe e focar em outras coisas, certo? Não! Parte do Bemte.li é desafiar esses mitos tecnocratas e manufaturar uma internet independente. Então, se hoje você está recebendo este e-mail, vindo de um endereço @bemte.li, é porque vencemos uma primeira batalha. Isso significa que estamos hospedando nosso próprio servidor de e-mail, e cada e-mail enviado e recebido por aqui é de nossa responsabilidade, tutela e resultado de horas (ou dias) de depuração.</p>

<p>Como servidores de e-mail interagem entre si? Como um e-mail remetido de @bemte.li chega a um destinatário @gmail.com? No momento, ainda não vamos tratar desse assunto específio neste diário. Por hora vale mencionar — já que aqui não há mitos nem mistérios — que estamos nos baseando num projeto de código aberto chamado Stalwart[link]. Em partes, dependermos desse modelo de código aberto implica em se a(pro)fundar em discussões em fóruns e problemas da comunidade — e foi isso que fizemos para que esse e-mail chegasse até você.</p>

<p>Agora você pode nos ajudar ao fazer a sua parte. Esses grandes servidores de e-mail precisam confiar em nós (mesmo que desconfiemos e muito das bigueteques). Imagina se os Correios só enviassem suas cartas se houvesse garantia de que elas seriam recebidas, lidas, respondidas e/ou encaminhadas. É um pouco disso que acontece por aqui. Então que tal encaminhar este texto para quem não nos conhece ainda, mas adoraria conhecer? Ou nos responder dando ideias sobre o que gostaria de ver por aqui? Alguma pergunta? Clicar nos linques também ajuda!</p>

<p>Aos poucos vamos compartilhando mais da saga de ir contra nossos senhores feudais. Lembramos: o Diário de borda caminha de acordo com o desenvolvimento do Bemte.li. Quer dizer que não há data fixa para o envio destes textos, mas existe, claro, um desejo de periodicidade, um desejo de compartilhar com você o que aconte nas bordas e nos cantos dessa Internet.</p>

<h2>Outros Cantos</h2>

<p><strong>[Podcast]</strong> Calma Urgente #48 <a href="https://www.youtube.com/live/znCagr4V2ik">https://www.youtube.com/live/znCagr4V2ik</a><br>
A recusa de acreditar no deus-algorítimo, ainda que, de muitas formas, estejamos submetidos a ele.</p>

<p><strong>[Blog]</strong> Diretório de niusleteres<br>
<a href="https://manualdousuario.net/newsletters-brasileiras/">https://manualdousuario.net/newsletters-brasileiras/</a><br>
Uma curadoria manual e cuidadosa de niusleteres brasileiras gratuitas (a maioria, infelizmente, ainda no Substack).</p>

<p><strong>[Podcast]</strong> Vibes em Análise . ep#55 . INTIMIDADES Sintéticas <a href="https://youtu.be/AhTU9vI6PUI">https://youtu.be/AhTU9vI6PUI</a><br>
Como nos relacionamos através da Internet? E fora dos stories?</p>

<p><strong>[Podcast]</strong> Nina da Hora quer que você leia as letras miúdas da tecnologia<br>
<a href="https://radionovelo.com.br/originais/fiodameada/nina-da-hora-quer-que-voce-leia-as-letras-miudas-da-tecnologia/">https://radionovelo.com.br/originais/fiodameada/nina-da-hora-quer-que-voce-leia-as-letras-miudas-da-tecnologia/</a><br>
O uso de tecnologias de reconhecimento facial em nome de uma segurança imposta, sem nos dizer quem armazena nossos dados e o que fazem com eles.</p>`

			texto := core.NewRecord(textosCollection)
			texto.Set("titulo", "Diário de borda #01")
			texto.Set("corpo", textoContent)
			texto.Set("caminho", "diario-de-borda-01")
			texto.Set("niusleter", niusleter.Id)
			texto.Set("rodape_autor", "Felipe, luana e Luccas")
			texto.Set("rodape_descricao", `<a href="mailto:nos@bemte.li">nos@bemte.li</a>`)
			enviadoDate, _ := time.Parse(time.RFC3339, "2025-06-25T01:11:00Z")
			texto.Set("enviado", enviadoDate)

			if err := app.Save(texto); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		// Rollback: This is complex due to the number of changes,
		// but essentially reverses all the operations above

		// Delete niusleteres collection if it exists
		niusleteresCollection, err := app.FindCollectionByNameOrId("pbc_niusleteres")
		if err == nil {
			app.Delete(niusleteresCollection)
		}

		// Restore usuarios collection fields
		usuariosCollection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// Restore original rules
		if err := json.Unmarshal([]byte(`{
			"listRule": "id = @request.auth.id",
			"viewRule": "id = @request.auth.id"
		}`), &usuariosCollection); err != nil {
			return err
		}

		// Add back the user fields
		if err := usuariosCollection.Fields.AddMarshaledJSONAt(6, []byte(`{
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

		if err := usuariosCollection.Fields.AddMarshaledJSONAt(7, []byte(`{
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

		if err := usuariosCollection.Fields.AddMarshaledJSONAt(8, []byte(`{
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

		if err := app.Save(usuariosCollection); err != nil {
			return err
		}

		// Restore textos collection
		textosCollection, err := app.FindCollectionByNameOrId("pbc_2443867158")
		if err != nil {
			return err
		}

		// Remove footer fields
		textosCollection.Fields.RemoveById("text_rodape_autor")
		textosCollection.Fields.RemoveById("editor_rodape_descricao")
		textosCollection.Fields.RemoveById("file_rodape_field")

		// Restore original caminho pattern and rules
		if err := textosCollection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text4051051968",
			"max": 0,
			"min": 0,
			"name": "caminho",
			"pattern": "^[a-z0-9]+$",
			"presentable": false,
			"primaryKey": false,
			"required": true,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		if err := json.Unmarshal([]byte(`{
			"listRule": null,
			"viewRule": null
		}`), &textosCollection); err != nil {
			return err
		}

		// Restore usuario relation
		textosCollection.Fields.RemoveById("relation_niusleter_textos")
		if err := textosCollection.Fields.AddMarshaledJSONAt(6, []byte(`{
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
		}`)); err != nil {
			return err
		}

		if err := app.Save(textosCollection); err != nil {
			return err
		}

		// Restore inscritos collection
		inscritosCollection, err := app.FindCollectionByNameOrId("pbc_1506696262")
		if err != nil {
			return err
		}

		// Remove the note field added in the forward migration
		inscritosCollection.Fields.RemoveById("editor_nota_inscricao")

		inscritosCollection.Fields.RemoveById("relation_niusleter_inscritos")
		if err := inscritosCollection.Fields.AddMarshaledJSONAt(2, []byte(`{
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
		}`)); err != nil {
			return err
		}

		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX `+"`"+`idx_lTlmzdfREf`+"`"+` ON `+"`"+`inscritos`+"`"+` (\n  `+"`"+`email`+"`"+`,\n  `+"`"+`usuario`+"`"+`\n)"
			]
		}`), &inscritosCollection); err != nil {
			return err
		}

		if err := app.Save(inscritosCollection); err != nil {
			return err
		}

		// Clean up dev data if in development
		env := os.Getenv("APP_ENV")
		if env == "dev" || env == "development" {
			// Delete sample texto
			textos, err := app.FindRecordsByFilter(textosCollection, "caminho = 'diario-de-borda-01'", "", 0, 0)
			if err == nil {
				for _, texto := range textos {
					app.Delete(texto)
				}
			}

			// Delete sample user
			users, err := app.FindRecordsByFilter(usuariosCollection, "email = 'diario@bemte.li'", "", 0, 0)
			if err == nil {
				for _, user := range users {
					app.Delete(user)
				}
			}
		}

		return nil
	})
}
