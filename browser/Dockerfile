FROM alpine:edge@sha256:6fa3225360ea1a48aaee4ca87de66e8e12b9a4f749f37acc7b4b5b9cc3d91b13
RUN apk add --update --no-cache chromium tini
ADD launcher.sh /
EXPOSE 9222
ENTRYPOINT ["tini", "--", "/launcher.sh"]
