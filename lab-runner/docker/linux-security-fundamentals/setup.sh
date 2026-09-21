#!/bin/sh
set -eu

cat > /opt/nisq-lab/readme.txt <<'EOF'
NISQ Linux Security Fundamentals

This is an isolated training environment. Review the evidence directory,
inspect permissions, and locate the training artifact.
EOF

cat > /opt/nisq-lab/evidence/network.log <<'EOF'
2026-09-21T09:10:01Z connection accepted src=10.20.0.14 dst=10.20.0.8 port=443
2026-09-21T09:10:08Z connection denied src=10.20.0.55 dst=10.20.0.8 port=22
EOF

cat > /opt/nisq-lab/evidence/auth.log <<'EOF'
2026-09-21T09:11:03Z sshd failed password for invalid user backup from 10.20.0.55
2026-09-21T09:11:07Z sshd failed password for invalid user backup from 10.20.0.55
EOF

cat > /opt/nisq-lab/evidence/permissions.txt <<'EOF'
Review file ownership and permissions in /opt/nisq-lab/evidence.
One training artifact intentionally has unusual permissions.
EOF

cat > /opt/nisq-lab/evidence/incident.txt <<'EOF'
Training incident: repeated SSH failures were observed from 10.20.0.55.
Determine which evidence file requires attention.
EOF

cat > /opt/nisq-lab/tasks/training-flag.txt <<'EOF'
NISQ{linux_permissions_basics}
EOF

chmod 640 /opt/nisq-lab/evidence/network.log
chmod 640 /opt/nisq-lab/evidence/auth.log
chmod 600 /opt/nisq-lab/evidence/permissions.txt
chmod 644 /opt/nisq-lab/evidence/incident.txt
chmod 640 /opt/nisq-lab/tasks/training-flag.txt
chown -R student:student /opt/nisq-lab
