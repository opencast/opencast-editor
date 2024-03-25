# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=16
FROM node:${NODE_VERSION}-alpine as build

RUN apk add --no-cache git
WORKDIR /src
COPY package.json .
COPY package-lock.json .
RUN npm i
COPY / .

ARG PUBLIC_URL=/
ARG REACT_APP_SETTINGS_PATH=/editor-settings.toml
RUN npm run build


ARG NODE_VERSION=16
FROM node:${NODE_VERSION}-alpine as caddy

RUN apk add --no-cache curl

ARG CADDY_VERSION=2.5.1

RUN curl -sSL "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_amd64.tar.gz" | tar xzf - caddy \
 && chown 0:0 caddy \
 && chmod +x caddy
RUN mkdir -p /rootfs/config /rootfs/data \
 && chown 1000:1000 /rootfs/config /rootfs/data


FROM scratch

ENV XDG_CONFIG_HOME /config
ENV XDG_DATA_HOME   /data

COPY <<EOF /Caddyfile
{
	admin off
}

:80 {
	root * /www
	file_server
}

:2019 {
	metrics /metrics
	respond /healthz 200
}
EOF

COPY <<EOF /etc/nsswitch.conf
hosts: files dns
EOF

COPY --from=caddy /rootfs    /
COPY --from=caddy /caddy     /
COPY --from=build /src/build /www

USER 1000:1000

EXPOSE 80
EXPOSE 443
EXPOSE 2019

LABEL org.opencontainers.image.title         "Opencast Video Editor"
LABEL org.opencontainers.image.description   "Web-based video editor for Opencast"
LABEL org.opencontainers.image.vendor        "Opencast"
LABEL org.opencontainers.image.licenses      "Apache-2.0"
LABEL org.opencontainers.image.url           "https://github.com/opencast/opencast-editor"
LABEL org.opencontainers.image.documentation "https://github.com/opencast/opencast-editor"
LABEL org.opencontainers.image.source        "https://github.com/opencast/opencast-editor"

ENTRYPOINT [ "/caddy" ]
CMD ["run", "--config", "/Caddyfile", "--adapter", "caddyfile"]
