# Pocketbase backend build
FROM golang:1.23 AS build
WORKDIR /go/src/bemteli
# RUN go get -d -v golang.org/x/net/html
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bemteli .

# Production build
FROM alpine:3.20

WORKDIR /app

RUN addgroup -g 1001 -S bemteli
RUN adduser -S bemteli -u 1001

RUN apk --no-cache add ca-certificates

COPY --from=build --chown=bemteli:bemteli /go/src/bemteli/bemteli ./

EXPOSE 8090

CMD ["./bemteli", "serve", "--http=0.0.0.0:8090"]