# Recommended Serving Approach

This project features an HTTP web service as serving application with the recommended hybrid deployment model of *adapted serverful-first*.

The adaptation featured in this project is two-fold and put all together into the same `main.go`: in-code and out-of-code adaptation, i.e.:
1. Go Gin HTTP framework with ALGNHSA
2. Go Gin HTTP framework with the Lambda Web Adapter

The application features a `RUN_STANDALONE` environment variable and checks for the AWS execution runtime whether to execute the HTTP framework within the ALGNHSA adapter.

For all other deployment variants (standalone and standalone with Lambda Web Adapter), no environment variable has to be changed, i.e. `RUN_STANDALONE=false` which is default.

Two Dockerfiles (`Dockerfile` and `lwa.Dockerfile`) are provided for each of the deployment variants:
1. `Dockerfile`: Standalone or Lambda with ALGNHSA
2. `lwa.Dockerfile`: Standalone on Lambda with Lambda Web Adapter

This application goes hand in hand with the processing application in `./../recommended-processing-approach`.