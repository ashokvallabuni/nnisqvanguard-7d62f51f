FROM debian:bookworm-slim

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install core analysis and networking tools required for training labs
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    iproute2 \
    iputils-ping \
    net-tools \
    procps \
    curl \
    wget \
    grep \
    sed \
    awk \
    findutils \
    file \
    nano \
    vim-tiny \
    python3-minimal \
    openssh-client \
    netcat-openbsd \
    dnsutils \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create non-root analyst user and setup directory structure
RUN useradd --create-home --shell /bin/bash analyst \
  && mkdir -p /home/analyst/lab/evidence /home/analyst/lab/logs /home/analyst/lab/tasks /home/analyst/workspace \
  && chown -R analyst:analyst /home/analyst

COPY setup.sh /usr/local/bin/setup-lab
RUN chmod +x /usr/local/bin/setup-lab \
  && /usr/local/bin/setup-lab \
  && rm /usr/local/bin/setup-lab

USER analyst
WORKDIR /home/analyst

# Keep ephemeral container alive for command execution
CMD ["sleep", "infinity"]
