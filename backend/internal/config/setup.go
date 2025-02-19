package config

import (
	"bemteli/internal/hooks"
	"fmt"
	"log"
	"os"

	"github.com/fatih/color"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/spf13/cast"
)

// InitApp initializes and configures the PocketBase application
func InitApp() *pocketbase.PocketBase {
	app := pocketbase.New()

	// Check if we're in development mode via environment variable
	isDev := os.Getenv("APP_ENV") == "development"

	if isDev {
		// Register migrate command
		migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
			Automigrate: isDev,
		})

		app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
			if err := e.Next(); err != nil {
				return err
			}

			return initDevSuperUser(e.App)
		})
	}

	err := initSMTP(app)
	if err != nil {
		log.Fatal(err)
	}

	// Register hooks from the hooks package
	if err := registerHooksFromPackage(app); err != nil {
		log.Fatal(err)
	}

	return app
}

// registerHooksFromPackage registers all hooks from the hooks package
func registerHooksFromPackage(app *pocketbase.PocketBase) error {
	hooks.RegisterConviteHooks(app)
	return nil
}

// initDevSuperUser creates a default superuser in development mode
func initDevSuperUser(app core.App) error {
	defaultSuperuserEmail := "dev@bemte.li"
	defaultSuperuserPassword := "dev1234567"

	superusersCol, err := app.FindCachedCollectionByNameOrId(core.CollectionNameSuperusers)
	if err != nil {
		return fmt.Errorf("Failed to fetch %q collection: %w.", core.CollectionNameSuperusers, err)
	}

	superuser, err := app.FindAuthRecordByEmail(superusersCol, defaultSuperuserEmail)
	if err != nil {
		superuser = core.NewRecord(superusersCol)
	}

	superuser.SetEmail(defaultSuperuserEmail)
	superuser.SetPassword(defaultSuperuserPassword)

	if err := app.Save(superuser); err != nil {
		return fmt.Errorf("Failed to create new superuser account: %w.", err)
	}

	color.Green("DEVELOPMENT MODE: Successfully created new superuser %q with password %q!", defaultSuperuserEmail, defaultSuperuserPassword)
	return nil
}

// initSMTP configures the SMTP settings for the application
func initSMTP(app core.App) error {
	// load app settings from env variables
	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		if err := e.Next(); err != nil {
			return err
		}

		// Configure SMTP
		e.App.Settings().Meta.SenderName = "Bemte.li"
		e.App.Settings().Meta.SenderAddress = "nao-responda@bemte.li"
		e.App.Settings().SMTP.Enabled = cast.ToBool(os.Getenv("SMTP_ENABLED"))
		e.App.Settings().SMTP.Host = os.Getenv("SMTP_HOST")
		e.App.Settings().SMTP.Port = cast.ToInt(os.Getenv("SMTP_PORT"))
		e.App.Settings().SMTP.Username = os.Getenv("SMTP_USERNAME")
		e.App.Settings().SMTP.Password = os.Getenv("SMTP_PASSWORD")

		// Configure rate limiting
		e.App.Settings().RateLimits.Enabled = true
		e.App.Settings().RateLimits.Rules = []core.RateLimitRule{
			// 2 requests per minute for creating convites
			{Label: "convites:create", Duration: 60, MaxRequests: 2},
		}

		// Configure User IP, to be used for rate limiting, because we're using a reverse proxy
		e.App.Settings().TrustedProxy.Headers = []string{"X-Real-IP"}

		return nil
	})

	return nil
}
