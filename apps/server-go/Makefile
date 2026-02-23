.PHONY: deps build run test

deps:
	GOPROXY=https://goproxy.cn,direct go mod tidy

build:
	go build -o bin/server ./cmd/server

run: build
	./bin/server

test:
	go test ./cmd/server -v -count=1
