#!/bin/bash

go build -o internal main.go
chmod +x internal
zip service.zip internal collector.yaml

rm -rf internal