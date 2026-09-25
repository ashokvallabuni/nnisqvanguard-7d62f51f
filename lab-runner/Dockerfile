FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js and Docker
RUN apt-get update && apt-get install -y curl ca-certificates iptables && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs docker.io && \
    apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 8080

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
