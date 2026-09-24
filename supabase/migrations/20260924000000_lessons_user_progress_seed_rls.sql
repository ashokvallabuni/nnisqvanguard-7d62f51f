-- ============================================================
-- Migration: lessons, user_progress, canonical curriculum seed + RLS
-- Idempotent: CREATE TABLE IF NOT EXISTS + upsert + policies wrapped in DO blocks
-- Target: ensures all 3 canonical courses exist with full module/quiz rows
--         so that navigating /learn/:slug/:moduleSlug always resolves.
-- ============================================================

-- ============================================================
-- 1. lessons (sub-session chunks within a module. optional 1:N if needed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content_md text,
  duration_minutes integer NOT NULL DEFAULT 10 CHECK (duration_minutes > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);

GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Lessons are viewable by everyone" ON public.lessons
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage lessons" ON public.lessons
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS lessons_module_idx ON public.lessons(module_id, sort_order);

-- ============================================================
-- 2. user_progress (convenience view/table alias for dashboard UX)
--    We keep the existing module_progress + user_course_progress tables
--    and add user_progress as a union view so clients that query the
--    generic "user_progress" table name continue to work.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  progress_type text NOT NULL CHECK (progress_type IN ('module', 'quiz', 'course', 'lab', 'learning_path')),
  ref_id uuid,
  completed boolean NOT NULL DEFAULT false,
  score integer CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ref_id, progress_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users view own user_progress" ON public.user_progress
    FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own user_progress" ON public.user_progress
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own user_progress" ON public.user_progress
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins view all user_progress" ON public.user_progress
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS user_progress_user_idx
  ON public.user_progress(user_id, course_id, progress_type);

-- ============================================================
-- 3. Ensure RLS policies exist for quizzes / user_course_progress
--    (earlier migrations already created them; defensive DO blocks)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view their academy progress" ON public.user_course_progress
    FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert their academy progress" ON public.user_course_progress
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update their academy progress" ON public.user_course_progress
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Modules are viewable by everyone" ON public.modules
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 4. Seed: 3 canonical courses (idempotent via slug upsert)
--    - cybersecurity-foundations  (defender mindset / core)
--    - networking-fundamentals      (TCP/IP / OSI / Wireshark)
--    - linux-command-quest          (Linux / shell / forensics)
-- ============================================================
INSERT INTO public.courses (slug, title, description, level, tier, sort_order) VALUES
  ('cybersecurity-foundations',
    'Cybersecurity Foundations',
    'The official gateway course for all security defenders. Master foundational threat principles, the CIA Triad, Parkerian Hexad, AAA framework, Lockheed Martin kill chain, password hygiene, cryptography, SOC triage, and incident response.',
    'Beginner', 'free', 1),
  ('networking-fundamentals',
    'Networking Fundamentals',
    'Understand how computers connect, speak, route, and protect data — explained so simply a beginner can grasp it, yet rigorous enough for junior cyber defenders. Includes command-line labs with ping, tracert, nslookup, and Wireshark PCAPs.',
    'Beginner to Intermediate', 'free', 2),
  ('linux-command-quest',
    'Linux Command Quest',
    'In cybersecurity, 90% of security servers and offensive tools run on Linux. Clear 6 practical skill zones (Navigation, File Construction, Permissions, Log Forensics, Sockets, Process Warfare) and defeat the final boss battle by capturing root flags.',
    'Intermediate', 'free', 3)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  tier = EXCLUDED.tier,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 5. Seed: canonical modules for networking-fundamentals
--    Idempotent via (course_id, slug) upsert using a stable slug
--    lookup against courses table.
-- ============================================================
INSERT INTO public.modules (course_id, slug, title, notes_md, tags, difficulty, duration_minutes, practice_labs, sort_order, locked)
SELECT c.id, m.slug, m.title, m.notes, m.tags, m.difficulty, m.duration, m.labs, m.ord, false
FROM public.courses c
JOIN (VALUES
  ('network-fundamentals-topologies',
    'Lesson 1: Network Fundamentals & Topologies',
    '### 1.1 What is a Computer Network?
At its simplest core, a Computer Network is two or more computing devices linked together using cables or wireless signals so they can exchange digital information, share resources, and talk to one another.

#### The Postal System Analogy
Think of a computer network like a global postal network. The computers are individual houses, the network cables are the roads, the network switches are local post offices, and the routers are interstate highways directing mail delivery trucks!

- **Nodes**: Any physical device connected to a network.
- **Links**: The physical or invisible pathway over which data travels.

#### Geographic Network Classifications
- **PAN** – Within 10 meters (Bluetooth headphones).
- **LAN** – Single room, home, or office (your Wi-Fi).
- **CAN** – Multiple buildings across a university campus.
- **MAN** – Across an entire city.
- **WAN** – Across countries or continents (the global Internet).

### 1.2 Network Topologies
- **Star (Most Popular)**: All nodes connect to a central hub/switch. If one cable breaks, only that device disconnects.
- **Bus (Legacy)**: Single central backbone cable. If it snaps, the whole network goes down.
- **Ring**: Circular loop where messages travel in one direction with a token.
- **Mesh (Ultra Reliable)**: Every node connects directly to every other node.',
    ARRAY['Nodes','Links','LAN','WAN','Topologies'], 'Easy', 20, ARRAY[]::text[], 1),
  ('osi-model-layered-stack',
    'Lesson 2: OSI Model & Layered Communication Stack',
    '### 2.1 The OSI 7-Layer Model
Open Systems Interconnection (OSI) model divides network communication into 7 stacked conceptual layers:

| Layer | Name | PDU |
|-------|------|-----|
| 7 | Application | Data |
| 6 | Presentation  | Data |
| 5 | Session | Data |
| 4 | Transport | Segment/Datagram |
| 3 | Network | Packet |
| 2 | Data Link | Frame |
| 1 | Physical | Bits |

### 2.2 Mnemonic: Please Do Not Throw Sausage Pizza Away
From layer 1 → 7: Physical, Data link, Network, Transport, Session, Presentation, Application.

Security impact per layer:
- Layer 3: IP spoofing & routing attacks
- Layer 4: SYN floods, port scanning
- Layer 7: HTTP request smuggling, credential stuffing',
    ARRAY['OSI','Layers','Encapsulation','PDU'],'Easy',25,ARRAY[]::text[],2),
  ('network-hardware-suite',
    'Lesson 3: Network Hardware Suite (Hubs, Switches, Routers, Modems)',
    '### 3.1 Hubs
Operate at Layer 1. Pure repeater. Sends every packet out every port → collision domain nightmare.

### 3.2 Switches
Operate at Layer 2. MAC-address CAM table. Isolates collision domains per port.
**Security concern**: MAC flooding fills the CAM table so the switch falls back to hub mode.

### 3.3 Routers
Operate at Layer 3. IP-address routing table. Moves packets between networks (LAN → WAN → LAN).
**Security concern**: ACL misconfiguration, RIPv1 unauthenticated updates.

### 3.4 Modems
Modulate/demodulate analogue → digital signals for last-mile ISP delivery.
Always place a perimeter firewall between ISP modem and LAN.',
    ARRAY['Switches','Routers','MAC','CAM Table','Routing'],'Medium',25,ARRAY[]::text[],3),
  ('tcp-ip-4-way-handshake',
    'Lesson 4: TCP/IP, 3-Way Handshake & Connection Teardown',
    '### 4.1 TCP (Reliable) vs UDP (Fast)
- TCP: sequenced, acknowledged, retransmitted, windowed. SYN → SYN/ACK → ACK (3-way).
- UDP: fire-and-forget. Used for DNS, VoIP, streaming.

### 4.2 3-Way Handshake
1. Client → Server: **SYN** (seq = X)
2. Server → Client: **SYN/ACK** (seq = Y, ack = X+1)
3. Client → Server: **ACK** (ack = Y+1)

### 4.3 Connection Teardown
FIN → FIN/ACK → ACK (requires 4 packets in full 4-way teardown).
Attackers abuse half-open connections with SYN floods.',
    ARRAY['TCP','UDP','Handshake','SYN Flood','Flags'],'Medium',30,ARRAY[]::text[],4),
  ('network-addressing-subnetting',
    'Lesson 5: IPv4 Addressing, CIDR & Subnetting',
    '### 5.1 IPv4 Addressing
32-bit dotted-decimal (e.g. 192.168.1.105). Divided into network portion + host portion.

### 5.2 CIDR (Classless Inter-Domain Routing)
- /8 = 16M hosts (old Class A)
- /16 = 65k hosts (old Class B)
- /24 = 254 hosts (old Class C)
- /30 = 2 usable hosts (point-to-point)

### 5.3 Private Ranges (RFC 1918)
- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

### 5.4 Subnetting formula
Number of subnets = 2^bits_borrowed
Hosts per subnet = 2^(32-prefix) - 2',
    ARRAY['IPv4','CIDR','Subnetting','RFC1918','NAT'],'Hard',40,ARRAY[]::text[],5),
  ('network-services-dns-http-ssh',
    'Lesson 8: Network Services (DNS, HTTP/HTTPS & SSH)',
    '### 8.1 DNS
Port 53 UDP (queries) / TCP (large responses + zone transfers). Translates domain → IP.
Poisoning attacks point users to attacker IPs. Use DNSSEC.

### 8.2 HTTP (80) / HTTPS (443)
HTTPS = HTTP over TLS. Verifies server identity via CA chain. Ensures confidentiality and integrity.

### 8.3 SSH (22)
Remote encrypted shell administration. Disable root login + password auth. Use ed25519 keys + fail2ban.',
    ARRAY['DNS','HTTP','HTTPS','SSH','TLS'],'Medium',30,ARRAY[]::text[],8),
  ('network-security-firewalls-vpns',
    'Lesson 9: Network Security, Firewalls, NAT & VPNs',
    '### 9.1 Firewalls
Stateful firewalls (L4/L7) maintain a session table. Modern NGFW do DPI.
- Ingress / Egress filtering
- Default-deny stance

### 9.2 NAT (Network Address Translation)
PAT overloads many private IPs onto one public IP. Hides internal topology.

### 9.3 VPNs
- IPsec site-to-site (L3)
- TLS/DTLS remote-access (AnyConnect, OpenVPN, WireGuard)
Split tunneling = risk. Force full tunnel for managed devices.',
    ARRAY['Firewalls','NAT','VPN','IPsec','WireGuard','DPI'],'Medium',30,ARRAY[]::text[],9)
) AS m(slug, title, notes, tags, difficulty, duration, labs, ord)
ON c.slug = 'networking-fundamentals'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  notes_md = EXCLUDED.notes_md,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  practice_labs = EXCLUDED.practice_labs,
  sort_order = EXCLUDED.sort_order,
  locked = EXCLUDED.locked;

-- ============================================================
-- 6. Seed: canonical Linux modules
-- ============================================================
INSERT INTO public.modules (course_id, slug, title, notes_md, tags, difficulty, duration_minutes, practice_labs, sort_order, locked)
SELECT c.id, m.slug, m.title, m.notes, m.tags, m.difficulty, m.duration, m.labs, m.ord, false
FROM public.courses c
JOIN (VALUES
  ('linux-filesystem-hierarchy',
    'Level 2: Linux Filesystem Hierarchy (FHS)',
    '### FHS Layout
```
/            – root of everything
/bin /sbin   – essential binaries
/etc         – configuration files
/home        – user home dirs
/var/log     – LOG FOR FORENSICS
/tmp         – attacker staging (volatile)
/opt         – third-party packages
/proc /sys   – kernel + hardware info (pseudo-fs)
```
Rule #1 for IR responders: **/var/log/auth.log never lies.**',
    ARRAY['FHS','Filesystem','Forensics','Logs'],'Medium',30,ARRAY[]::text[],2),
  ('linux-permissions-chmod',
    'Level 3: Linux File Permissions (chmod, suid, sudoers)',
    '### Discretionary Access Control
`ls -l` → `drwxr-xr-x user group ...`
1. type (d/-/l)
2. owner (rwx)
3. group (rwx)
4. other (rwx)

Numeric mode cheat: r=4, w=2, x=1.
- `chmod 600 ~/.ssh/id_ed25519` (key MUST be 0600)
- SUID bit = 4000. Danger! find / -perm -4000 = pivot checklist.
- Capabilities replace SUID on modern distros.',
    ARRAY['chmod','chown','SUID','sudoers','DAC'],'Medium',30,ARRAY[]::text[],3),
  ('log-forensics-journalctl',
    'Level 4: Log Forensics & Journalctl',
    '### The Four Horsemen of SOC Logs
- `/var/log/auth.log` – sshd / sudo / pam
- `/var/log/syslog` – system-wide
- `journalctl -u sshd --since today`
- auditd: `ausearch -m USER_AUTH -ts today`

Command cheat:
```bash
grep "Failed password" /var/log/auth.log | awk "{print \$11}" | sort | uniq -c
```
= find brute-force IPs.',
    ARRAY['Logs','journalctl','auditd','SOC','Brute Force'],'Medium',35,ARRAY[]::text[],4),
  ('network-diagnostics-socket-recon',
    'Level 5: Network Diagnostics & Socket Recon',
    '### Socket triad: ss / netstat / lsof
```bash
ss -tulpn          # all listening TCP+UDP
ss -tnp state established
lsof -i :22
whois 198.51.100.44
dig +short evil.example @1.1.1.1
curl -I --tlsv1.2 https://example.com
```
Malware beacons: repeated SYN_SENT → same remote IP on weird port at 60s intervals.',
    ARRAY['ss','lsof','dig','whois','socket','beacon'],'Hard',40,ARRAY[]::text[],5)
) AS m(slug, title, notes, tags, difficulty, duration, labs, ord)
ON c.slug = 'linux-command-quest'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  notes_md = EXCLUDED.notes_md,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  practice_labs = EXCLUDED.practice_labs,
  sort_order = EXCLUDED.sort_order,
  locked = EXCLUDED.locked;

-- ============================================================
-- 7. Seed: cybersecurity-foundations modules (augment existing with full difficulty/tags)
-- ============================================================
INSERT INTO public.modules (course_id, slug, title, notes_md, tags, difficulty, duration_minutes, practice_labs, sort_order, locked)
SELECT c.id, m.slug, m.title, m.notes, m.tags, m.difficulty, m.duration, m.labs, m.ord, false
FROM public.courses c
JOIN (VALUES
  ('intro',
    'Intro to Cybersecurity',
    '### The Defender Mindset
Attackers need ONE win. Defenders need to win EVERY SINGLE TIME.

- Asset: anything with value to a business.
- Threat: something that can harm an asset.
- Vulnerability: a weakness.
- Risk = Likelihood × Impact.
Apply countermeasures in layers → Defense in Depth.',
    ARRAY['Security Fundamentals','Threat Intelligence','Risk'],'Easy',30,ARRAY[]::text[],1),
  ('cia-triad',
    'CIA Triad',
    '### CIA Triad = The Security Holy Trinity
- **Confidentiality**: only authorized parties see the data.
- **Integrity**: data is accurate and untampered.
- **Availability**: legitimate users can access it when they need it.

Parkerian Hexad extends with: Possession/Control, Authenticity, Utility.',
    ARRAY['CIA Triad','Risk Management','Parkerian Hexad'],'Easy',25,ARRAY[]::text[],2),
  ('hacker-types',
    'Types of Hackers',
    '### Hat taxonomy
- White hat: authorized defenders / bug bounty
- Grey hat: breaks rules not laws
- Black hat: criminal
- Script kiddie: no skill, only pre-built tools
- Nation state (APT): low-and-slow multi-year intrusions',
    ARRAY['Threat Intelligence','APT','Threat Actors'],'Easy',25,ARRAY[]::text[],3),
  ('network-basics',
    'Network Basics',
    '### Network for defenders
- IPv4 subnetting + RFC 1918 private space
- TCP vs UDP
- Common ports: 21,22,23,25,53,80,110,139,443,445,3389
- Firewall ACL default-deny philosophy',
    ARRAY['Network Security','Infrastructure','Ports'],'Medium',45,ARRAY[]::text[],4),
  ('malware-basics',
    'Malware Basics',
    '### The Malware Zoo
- Virus: attaches to host file. Requires user action.
- Worm: self-replicates across network. No user needed.
- Trojan: pretends to be something else (GameOfThrones.exe 😈)
- Ransomware: encrypts + extorts.
- Rootkit: lives in kernel / firmware. Hides everything.
- Spyware / Adware',
    ARRAY['Malware Analysis','Incident Response','Viruses','Ransomware'],'Medium',40,ARRAY[]::text[],5)
) AS m(slug, title, notes, tags, difficulty, duration, labs, ord)
ON c.slug = 'cybersecurity-foundations'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  notes_md = EXCLUDED.notes_md,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  practice_labs = EXCLUDED.practice_labs,
  sort_order = EXCLUDED.sort_order,
  locked = EXCLUDED.locked;

-- ============================================================
-- 8. Seed: quizzes (1 per known module slug, idempotent)
-- ============================================================
INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
SELECT m.id, q.question, q.options::jsonb, q.correct, q.explanation, 1
FROM public.modules m
JOIN (VALUES
  ('network-fundamentals-topologies',
    'Which topology isolates a single device failure to only that device?',
    '["Star","Bus","Ring","Mesh"]', 0,
    'Star topology: only the one node connected by its own cable drops.'),
  ('osi-model-layered-stack',
    'At which OSI layer do packets get routed between different networks?',
    '["Layer 2 (Data Link)","Layer 3 (Network)","Layer 4 (Transport)","Layer 7 (Application)"]', 1,
    'Layer 3 (Network) handles IP addressing and routing.'),
  ('network-hardware-suite',
    'A switch learns where devices physically live using what table?',
    '["Routing Table","CAM / MAC Address Table","ARP Table","DNS Resolver Cache"]', 1,
    'Content-Addressable Memory table maps port <-> MAC address.'),
  ('tcp-ip-4-way-handshake',
    'What is the packet sequence that establishes a reliable TCP session?',
    '["FIN,ACK","SYN, SYN/ACK, ACK","UDP datagram blast","ARP, request, reply"]', 1,
    'Classic 3-way handshake: SYN → SYN/ACK → ACK.'),
  ('network-addressing-subnetting',
    'Which of the following is a valid RFC 1918 private IP range?',
    '["8.8.8.0/24","192.168.0.0/16","1.0.0.0/8","224.0.0.0/4"]', 1,
    'RFC 1918 defines 10/8, 172.16/12 and 192.168/16.'),
  ('network-services-dns-http-ssh',
    'Which service pair encrypts the session end-to-end?',
    '["Telnet (23) + FTP (21)","HTTP (80) + DNS (53)","HTTPS (443) + SSH (22)","TFTP (69) + SNMP (161)"]', 2,
    'HTTPS (TLS) and SSH both provide authenticated encrypted channels.'),
  ('network-security-firewalls-vpns',
    'A security policy of deny-by-default with explicit allow rules is called:',
    '["Permissive","Default-deny","Implicit trust","ACL-free"]', 1,
    'Default-deny (or implicit-deny) is the cornerstone of zero-trust architecture.'),
  ('linux-filesystem-hierarchy',
    'Which directory contains forensic-grade authentication event logs?',
    '["/home","/var/log","/tmp","/opt"]', 1,
    '/var/log contains auth.log, syslog, audit and is critical for IR.'),
  ('linux-permissions-chmod',
    'What is the strictest correct permission for a private SSH key?',
    '["chmod 777","chmod 000","chmod 600","chmod 644"]', 2,
    'OpenSSH enforces 0600 (-rw-------) on private identity files.'),
  ('log-forensics-journalctl',
    'Which command is best to inspect SSH authentication events from today?',
    '["journalctl -u sshd --since today","rm -rf /var/log","reboot -f","find / -name flag.txt"]', 0,
    'journalctl filters by unit and time window for precise SOC triage.'),
  ('network-diagnostics-socket-recon',
    'Which tool lists ALL open and listening sockets with owning process?',
    '["ls","ss -tulpn","pwd","cat /etc/passwd"]', 1,
    'ss -tulpn = TCP UDP Listening Process Numeric. Go-to recon command.'),
  ('intro',
    'The classic Risk formula is:',
    '["Revenue - Costs","Likelihood x Impact","Threats + Vulnerabilities","Assets x Hype"]', 1,
    'Risk = (how likely it will happen) x (how bad it is if it does).'),
  ('cia-triad',
    'Which leg of the CIA triad protects data from being changed without authorization?',
    '["Confidentiality","Integrity","Availability","Authenticity"]', 1,
    'Integrity = tamper protection. Hashing (SHA-256) and signatures enforce it.'),
  ('hacker-types',
    'Low-and-slow, multi-year intrusions usually carried out by governments are:',
    '["Script kiddies","Insiders","Advanced Persistent Threats (APT)","Hacktivists"]', 2,
    'APTs have nation-state resources, time, and discipline.'),
  ('network-basics',
    'Which port combo is commonly associated with Windows SMB & lateral movement?',
    '["21/22","80/443","139/445","53/853"]', 2,
    'NetBIOS 139 + SMB over TCP 445 = classic lateral-movement corridor.'),
  ('malware-basics',
    'A program that pretends to be a game installer but encrypts all files for money is:',
    '["A worm","A virus","Trojan + ransomware","A rootkit"]', 2,
    'Trojan (false packaging) carrying a ransomware (crypto-extortion) payload.'),
  ('phishing',
    'Which action is the safest first response to a suspicious link?',
    '["Open it in a private window","Report it and verify through a trusted channel","Forward it to colleagues","Reply asking for identity"]', 1,
    'Do not interact. Use a side-channel to verify the sender identity.'),
  ('password-security',
    'Which of these options is the strongest authenticator strategy?',
    '["P@ssw0rd reused everywhere","Password manager + MFA","No password ever","Write passwords on sticky note"]', 1,
    'Unique long random passwords stored offline + hardware MFA (YubiKey / passkey) is gold standard.'),
  ('social-engineering',
    'Following someone through a door they badged into is called:',
    '["Pretexting","Baiting","Tailgating","Quid pro quo"]', 2,
    'Tailgating is one of the most common physical SE attacks.'),
  ('safe-browsing',
    'The lock icon in the browser address bar MOST DIRECTLY means:',
    '["This site is legally safe","This site has no malware","This connection uses TLS/HTTPS","Payment is verified"]', 2,
    'The padlock = TLS only. It guarantees confidentiality in transit, NOT site honesty.'),
  ('mobile-security',
    'The single most important mobile hardening step is:',
    '["Install 5 antivirus apps","Always use Bluetooth in public","OS + app auto-update ON and no sideloading","Disable the lock screen"]', 2,
    'Patches and no untrusted APKs eliminate 90% of mobile attack surface.')
) AS q(module_slug, question, options, correct, explanation)
ON m.slug = q.module_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.quizzes qz WHERE qz.module_id = m.id
);

-- ============================================================
-- 9. Seed: lessons table (one stub lesson per known module id)
-- ============================================================
INSERT INTO public.lessons (module_id, slug, title, content_md, duration_minutes, sort_order)
SELECT m.id, 'theory', 'Theory & Reading', COALESCE(m.notes_md, 'Read the module notes and annotate key takeaways.'), 15, 1
FROM public.modules m
WHERE NOT EXISTS (
  SELECT 1 FROM public.lessons l WHERE l.module_id = m.id AND l.slug = 'theory'
);

INSERT INTO public.lessons (module_id, slug, title, content_md, duration_minutes, sort_order)
SELECT m.id, 'practice', 'Practice & Hands-on Drills',
  E'### Practice\n\n1. Re-read the module summary.\n2. Take the module quiz.\n3. Attempt the companion Cyber Lab if one is listed under the module card.',
  10, 2
FROM public.modules m
WHERE NOT EXISTS (
  SELECT 1 FROM public.lessons l WHERE l.module_id = m.id AND l.slug = 'practice'
);

-- ============================================================
-- FINAL: Make sure has_role() helper exists (required for admin policies)
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role text) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
  AS $func$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND p.role = role
    );
  $func$;

