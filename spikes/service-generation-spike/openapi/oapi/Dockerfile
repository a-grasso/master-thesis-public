# Go build stage
FROM golang:1.22 AS build

WORKDIR /app
# dependencies
COPY go.mod .
COPY go.sum .
RUN go mod download

# build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/server main.go

FROM alpine:3.20 AS runtime

WORKDIR /app
COPY --from=build /app/server .

ENTRYPOINT ["/app/server"]