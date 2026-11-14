#!/bin/sh
set -eu

# Realistic simulated evidence and logs for Linux Investigation & Security Lab
cat > /home/analyst/lab/README.txt <<'EOF'
============================================================
NISQ VANGUARD CYBER RANGE — LINUX SECURITY INVESTIGATION LAB
============================================================

ROLE: Security Operations Center (SOC) Tier-1 Analyst
OBJECTIVE: Investigate suspicious authentication logs, identify attacker IPs,
and locate the authorized training flag.

DIRECTORIES:
  - /home/analyst/lab/logs/       : Authentication and system logs
  - /home/analyst/lab/evidence/   : Volatile incident artifacts
  - /home/analyst/lab/tasks/      : Lab guidance and task details

PRACTICAL COMMANDS TO USE:
  - whoami, pwd, ls -la
  - cat, grep, awk, sort, uniq -c
  - head, tail, file

Submit the training flag found in the tasks directory once you finish analyzing the auth log.
EOF

# Create controlled auth.log dataset
cat > /home/analyst/lab/logs/auth.log <<'EOF'
Sep 21 08:14:02 soc-sensor-01 sshd[1042]: Accepted publickey for analyst from 192.168.1.100 port 52314 ssh2
Sep 21 08:15:30 soc-sensor-01 sudo: analyst : TTY=pts/0 ; PWD=/home/analyst ; USER=root ; COMMAND=/usr/bin/apt update
Sep 21 09:00:11 soc-sensor-01 sshd[1120]: Failed password for invalid user admin from 10.20.0.55 port 41200 ssh2
Sep 21 09:00:13 soc-sensor-01 sshd[1122]: Failed password for invalid user root from 10.20.0.55 port 41202 ssh2
Sep 21 09:00:15 soc-sensor-01 sshd[1124]: Failed password for invalid user backup from 10.20.0.55 port 41204 ssh2
Sep 21 09:00:17 soc-sensor-01 sshd[1126]: Failed password for invalid user test from 10.20.0.55 port 41206 ssh2
Sep 21 09:00:19 soc-sensor-01 sshd[1128]: Failed password for invalid user oracle from 10.20.0.55 port 41208 ssh2
Sep 21 09:00:22 soc-sensor-01 sshd[1130]: Failed password for invalid user guest from 10.20.0.55 port 41210 ssh2
Sep 21 09:00:25 soc-sensor-01 sshd[1132]: Failed password for invalid user deploy from 10.20.0.55 port 41212 ssh2
Sep 21 09:00:28 soc-sensor-01 sshd[1134]: Failed password for invalid user service from 10.20.0.55 port 41214 ssh2
Sep 21 09:05:40 soc-sensor-01 sshd[1200]: Connection closed by authenticating user root 10.20.0.55 port 41300 [preauth]
EOF

cat > /home/analyst/lab/evidence/incident-summary.txt <<'EOF'
INCIDENT REPORT: INC-2026-0921-A
ALERT: Repeated SSH brute-force failures detected targeting external gateway.
TASK 1: Determine the total number of failed authentication attempts from attacker IP 10.20.0.55.
TASK 2: Inspect file permissions across /home/analyst/lab/tasks/.
EOF

cat > /home/analyst/lab/tasks/task-guide.txt <<'EOF'
Task 1: Run: grep "Failed password" /home/analyst/lab/logs/auth.log | wc -l
Task 2: Read /home/analyst/lab/tasks/flag.txt
EOF

cat > /home/analyst/lab/tasks/flag.txt <<'EOF'
NISQ{linux_permissions_basics}
EOF

# Secure permissions
chmod 644 /home/analyst/lab/README.txt
chmod 644 /home/analyst/lab/logs/auth.log
chmod 644 /home/analyst/lab/evidence/incident-summary.txt
chmod 644 /home/analyst/lab/tasks/task-guide.txt
chmod 640 /home/analyst/lab/tasks/flag.txt

chown -R analyst:analyst /home/analyst/lab
