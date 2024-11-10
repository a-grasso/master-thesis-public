#!/bin/bash

go build -o main main.go
chmod +x main

cp entrypoint_zip.sh bootstrap
zip layer.zip bootstrap main

rm -rf main bootstrap