# HetznerVM Deployment

This directory features the `compose-service.yaml` file to deploy the applications for the benchmark on a Hetzner VM.
As is, the services are fetched from the authors public GitHub registry. 
Change accordingly if needed.

The `compose-observ.yaml` file is used to deploy the monitoring stack on the same VM to monitor the Hetzner VM in terms of CPU, memory, and network usage and pipe it into Grafana Cloud.

Please make sure that all needed tokens are present correctly in the files.
