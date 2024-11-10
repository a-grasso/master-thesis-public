FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG TARGET

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o serving hybrid.go

FROM alpine:latest
WORKDIR /app

COPY --from=build /app/serving .

EXPOSE 8080

ENTRYPOINT ["/app/serving"]