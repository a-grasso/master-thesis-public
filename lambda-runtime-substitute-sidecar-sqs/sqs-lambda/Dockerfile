FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main main.go

FROM alpine:latest
WORKDIR /app

COPY --from=build /app/main .

ENTRYPOINT ["/app/main"]