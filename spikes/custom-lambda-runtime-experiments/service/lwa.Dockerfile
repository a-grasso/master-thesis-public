FROM golang:1.22.2-alpine AS build_base
RUN apk add --no-cache git
WORKDIR /tmp/main

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN GOOS=linux CGO_ENABLED=0 go build -o bootstrap main.go

FROM alpine:3.20.1
RUN apk add ca-certificates
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=build_base /tmp/main/bootstrap /app/bootstrap

ENV PORT=8080 GIN_MODE=release
EXPOSE 8080

CMD ["/app/bootstrap"]