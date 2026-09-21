FROM debian:bookworm-slim

RUN useradd --create-home --shell /bin/bash student \
  && mkdir -p /opt/nisq-lab/evidence /opt/nisq-lab/tasks \
  && chown -R student:student /opt/nisq-lab

COPY setup.sh /usr/local/bin/setup-lab
RUN chmod +x /usr/local/bin/setup-lab \
  && /usr/local/bin/setup-lab \
  && rm /usr/local/bin/setup-lab

USER student
WORKDIR /home/student
CMD ["sleep", "infinity"]
