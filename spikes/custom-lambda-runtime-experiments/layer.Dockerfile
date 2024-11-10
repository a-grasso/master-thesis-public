FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main main.go

FROM public.ecr.aws/lambda/provided:al2023

COPY entrypoint_docker.sh /var/runtime/bootstrap
RUN chmod +x /var/runtime/bootstrap

COPY --from=build /app/main /var/runtime/main
RUN chmod +x /var/runtime/main

ENTRYPOINT [ "/var/runtime/bootstrap" ]
# should be overriden
CMD [ "/var/task/internal" ]