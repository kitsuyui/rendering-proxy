FROM alpine:edge
RUN apk --update add --no-cache curl ca-certificates jq
ADD main.sh /
ENTRYPOINT ["/main.sh"]
