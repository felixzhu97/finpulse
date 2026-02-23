package docs

import (
	_ "embed"

	"github.com/swaggo/swag"
)

//go:embed swagger.json
var docTemplate string

var SwaggerInfo = &swag.Spec{
	Version:          "1.0",
	Host:             "localhost:8801",
	BasePath:         "/",
	Title:            "Portfolio API",
	Description:      "Non-AI portfolio API; shares DB with server-python.",
	SwaggerTemplate:  docTemplate,
	InfoInstanceName: "swagger",
}

func init() {
	swag.Register(SwaggerInfo.InfoInstanceName, SwaggerInfo)
}
