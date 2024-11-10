FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY main.go .

RUN go build -o main main.go

FROM golang:1.22.1

COPY --from=build /app/main ./main

EXPOSE 6969

ENTRYPOINT [ "./main" ]
