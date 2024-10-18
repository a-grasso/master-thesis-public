FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

FROM alpine:latest
WORKDIR /app

COPY --from=build /app/main .

ENV PORT=9001
EXPOSE 9001

ENTRYPOINT ["/app/main"]