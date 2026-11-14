import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// We'll just define the 4 core labs manually to avoid ts-node transpilation issues
const coreLabs = [
  {
    slug: "linux-ssh-brute-force-investigation",
    title: "Linux SSH Brute Force Investigation",
    difficulty: "BEGINNER",
    category: "Host Forensics",
    description:
      "An external adversary is conducting an automated credential-stuffing attack against the production gateway.",
    estimated_minutes: 30,
    dataset: {
      "/var/log/auth.log":
        "Sep 25 10:00:01 gateway sshd[1234]: Failed password for invalid user admin from 192.168.1.105 port 54321 ssh2\nSep 25 10:01:01 gateway sshd[1234]: Failed password for invalid user admin from 192.168.1.105 port 54321 ssh2\n",
      "/opt/nisq/vault/flag.txt": "FLAG{BRUTE_F0RCE_BL0CKED}\n",
      "/home/analyst/README.txt": "Investigate /var/log/auth.log to find the attacker.\n",
    },
  },
  {
    slug: "suricata-network-threat-hunting",
    title: "Suricata Network Threat Hunting",
    difficulty: "INTERMEDIATE",
    category: "Network Security",
    description:
      "Investigate a potential network intrusion using Suricata alerts and PCAP analysis.",
    estimated_minutes: 45,
    dataset: {
      "/var/log/suricata/fast.log":
        "10/25/2026-10:00:01.123456  [**] [1:1000001:1] Malware C2 Communication [**] [Classification: A Network Trojan was detected] [Priority: 1] {TCP} 192.168.1.50:54321 -> 10.10.10.10:443\n",
      "/home/analyst/evidence.pcap": "<binary pcap data placeholder>",
      "/home/analyst/README.txt": "Analyze the Suricata logs and find the C2 server IP.\n",
    },
  },
  {
    slug: "sql-injection-incident-forensics",
    title: "SQL Injection Incident Forensics",
    difficulty: "INTERMEDIATE",
    category: "Web Security",
    description: "Analyze web server access logs to identify an SQL injection attack pattern.",
    estimated_minutes: 40,
    dataset: {
      "/var/log/nginx/access.log":
        '192.168.1.100 - - [25/Sep/2026:10:00:01 +0000] "GET /login.php?user=admin\'%20OR%201=1-- HTTP/1.1" 200 1024\n192.168.1.100 - - [25/Sep/2026:10:00:02 +0000] "GET /login.php?user=admin\'%20UNION%20SELECT%20password%20FROM%20users-- HTTP/1.1" 200 2048\n',
      "/home/analyst/README.txt": "Review the Nginx access logs to identify the SQLi payload.\n",
    },
  },
  {
    slug: "memory-forensics-volatility",
    title: "Memory Forensics with Volatility 3",
    difficulty: "ADVANCED",
    category: "Host Forensics",
    description: "Perform memory forensics on a compromised Windows workstation memory dump.",
    estimated_minutes: 60,
    dataset: {
      "/home/analyst/memdump.raw": "<binary memory dump placeholder>",
      "/home/analyst/README.txt":
        "Use volatility3 to analyze memdump.raw and find the malicious process ID.\n",
      "/home/analyst/flag.txt": "FLAG{M3M0RY_C0RRUPT10N}\n",
    },
  },
];

async function seed() {
  for (const lab of coreLabs) {
    const { data: labData, error: labError } = await supabase
      .from("labs")
      .upsert(
        {
          slug: lab.slug,
          title: lab.title,
          difficulty: lab.difficulty,
          lab_type: "VFS_TERMINAL",
          description: lab.description,
          estimated_time_minutes: lab.estimated_minutes,
          points: lab.reward_points || 100,
          status: "PUBLISHED",
        },
        { onConflict: "slug" },
      )
      .select()
      .single();

    if (labError) {
      console.error(`Error inserting lab ${lab.slug}:`, labError);
      continue;
    }

    console.log(`Inserted lab: ${labData.title}`);

    const { error: dsError } = await supabase.from("lab_datasets").insert({
      lab_id: labData.id,
      dataset_name: `${lab.slug}-vfs-files`,
      dataset_content: lab.dataset,
    });

    if (dsError) {
      console.error(`Error inserting dataset for ${lab.slug}:`, dsError);
    } else {
      console.log(`Inserted dataset for: ${lab.slug}`);
    }
  }
}

seed().catch(console.error);
