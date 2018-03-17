FROM alpine:edge
ENV \
GECKODRIVER_VERSION='v0.20.0' \
GECKODRIVER_HASH='b1d211c2954f6720d2674a20c911c97bccf2a7a2'
RUN \
echo http://dl-cdn.alpinelinux.org/alpine/edge/testing/ >> /etc/apk/repositories && \
apk --update add --no-cache firefox tini
ADD ./geckodriver /usr/bin/geckodriver
ENTRYPOINT ["/usr/bin/geckodriver"]
CMD ["--host", "0.0.0.0"]
EXPOSE 4444
