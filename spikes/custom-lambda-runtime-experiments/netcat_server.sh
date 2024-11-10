#!/bin/bash

while true; do
    echo -e "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nhello" | nc -l -p 6969
done