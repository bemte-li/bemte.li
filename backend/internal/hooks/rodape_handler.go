package hooks

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// RegisterRodapeHooks registers hooks for automatic rodape handling on texto creation/update
func RegisterRodapeHooks(app *pocketbase.PocketBase) {
	// Handle rodape on texto create
	app.OnRecordCreateRequest("textos").BindFunc(func(e *core.RecordRequestEvent) error {
		if err := handleRodapeOnTextoSave(app, e); err != nil {
			return err
		}
		return e.Next()
	})

	// Handle rodape on texto update
	app.OnRecordUpdateRequest("textos").BindFunc(func(e *core.RecordRequestEvent) error {
		if err := handleRodapeOnTextoSave(app, e); err != nil {
			return err
		}
		return e.Next()
	})

	app.Logger().Info("Rodape handler hooks registered")
}

// handleRodapeOnTextoSave extracts rodape data from the request body, finds or creates a rodape record,
// and sets the rodape relation on the texto
func handleRodapeOnTextoSave(app *pocketbase.PocketBase, e *core.RecordRequestEvent) error {
	// Extract rodape data from request body (these fields are not in the textos schema)
	// The client sends: rodape_autor, rodape_descricao, rodape_foto
	requestInfo, _ := e.RequestInfo()
	if requestInfo == nil || requestInfo.Body == nil {
		return nil
	}

	body := requestInfo.Body

	// Extract rodape fields from request body
	autor, _ := body["rodape_autor"].(string)
	descricao, _ := body["rodape_descricao"].(string)
	foto, _ := body["rodape_foto"].(string)

	// Get niusleter from the record (this field is in the schema)
	niusleterId := e.Record.GetString("niusleter")

	// If no rodape data provided, skip
	if autor == "" && descricao == "" && foto == "" {
		return nil
	}

	// Need niusleter to create rodape
	if niusleterId == "" {
		return nil
	}

	// Compute hash for deduplication
	hash := computeRodapeHashForHook(autor, descricao, foto)

	// Try to find existing rodape with same hash and niusleter
	rodapesCollection, err := app.FindCollectionByNameOrId("pbc_rodapes")
	if err != nil {
		return fmt.Errorf("failed to find rodapes collection: %w", err)
	}

	// Search for existing rodape
	filter := fmt.Sprintf("hash = '%s' && niusleter = '%s'", hash, niusleterId)
	existingRodapes, err := app.FindRecordsByFilter(rodapesCollection, filter, "", 1, 0)
	if err != nil {
		return fmt.Errorf("failed to search for existing rodape: %w", err)
	}

	var rodapeId string

	if len(existingRodapes) > 0 {
		// Reuse existing rodape
		rodapeId = existingRodapes[0].Id
		app.Logger().Debug("Reusing existing rodape",
			"rodapeId", rodapeId,
			"hash", hash,
		)
	} else {
		// Create new rodape
		newRodape := core.NewRecord(rodapesCollection)
		newRodape.Set("autor", autor)
		newRodape.Set("descricao", descricao)
		newRodape.Set("foto", foto)
		newRodape.Set("hash", hash)
		newRodape.Set("niusleter", niusleterId)

		if err := app.Save(newRodape); err != nil {
			return fmt.Errorf("failed to create rodape: %w", err)
		}

		rodapeId = newRodape.Id
		app.Logger().Debug("Created new rodape",
			"rodapeId", rodapeId,
			"hash", hash,
		)
	}

	// Set the rodape relation on the texto
	e.Record.Set("rodape", rodapeId)

	return nil
}

// computeRodapeHashForHook generates a hash for rodape content deduplication
func computeRodapeHashForHook(autor, descricao, foto string) string {
	content := fmt.Sprintf("%s|%s|%s", autor, descricao, foto)
	hash := sha256.Sum256([]byte(content))
	return hex.EncodeToString(hash[:])[:12]
}
