# Should be the same as the node version used in the runner image (use `sudo docker run --rm -it --entrypoint "" ghcr.io/mermaid-js/mermaid-cli/mermaid-cli:<version> node --version` to check)
FROM node:26.4.0-bullseye AS builder

WORKDIR /build

COPY proto/ proto/
COPY src/ src/
COPY package.json package-lock.json tsconfig.json vite.config.js ./

RUN npm ci && npm run build

FROM ghcr.io/mermaid-js/mermaid-cli/mermaid-cli:11.16.0 AS runner

WORKDIR /home/mermaidcli

COPY mermaid-package.json package.json
COPY --from=builder /build/dist/ .
COPY --from=builder /build/proto/ proto/

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENTRYPOINT ["node", "--experimental-global-webcrypto", "main.js"]