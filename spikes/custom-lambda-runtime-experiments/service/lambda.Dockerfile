FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN go build -o main main.go

FROM ghcr.io/a-grasso/proxus-lambda-runtime

WORKDIR /var/task
COPY --from=build /app/main asd

COPY collector.yaml /var/task/collector.yaml

CMD [ "/var/task/asd" ]
