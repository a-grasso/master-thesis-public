FROM golang:1.22.1 as build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main main.go

FROM public.ecr.aws/lambda/provided:al2023

COPY --from=build /app/main ./main

COPY entrypoint_zip.sh .
RUN chmod +x entrypoint.sh

RUN dnf -y update && dnf -y install nc

COPY netcat_server.sh /var/task/netcat_server.sh
RUN chmod +x /var/task/netcat_server.sh

EXPOSE 6969

ENTRYPOINT [ "./entrypoint.sh" ]
CMD [ "/var/task/netcat_server.sh" ]
