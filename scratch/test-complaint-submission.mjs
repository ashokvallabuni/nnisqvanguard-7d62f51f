import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cbyoozhtubavksiolgxz.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMjQwMCwiZXhwIjoyMTAwMzg4NDAwfQ.GlcmJk1guLMRlumcK28nkIeKS_Vn9eR2Lyud2qswJDg";

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testIncidentReporting() {
  console.log("=== Testing Incident Reporting (Complaint & Evidence Upload) ===");

  // 1. Verify 'evidence' bucket exists
  const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
  if (bErr) throw new Error("Failed to list buckets: " + bErr.message);

  const evidenceBucket = buckets.find((b) => b.id === "evidence" || b.name === "evidence");
  console.log(
    `[Storage Verification] 'evidence' bucket found:`,
    evidenceBucket ? "YES (Configured)" : "NO",
  );
  if (!evidenceBucket) throw new Error("Evidence bucket missing!");

  // 2. Test text-only report submission (No attachment)
  console.log("\n[Test 1: Submit Report WITHOUT Attachment]");
  const reportNoAttachment = {
    name: "Security Analyst",
    email: "analyst@example.com",
    phone: "+91 9876543210",
    complaint_text: "Received suspicious email claiming urgent bank account verification.",
    evidence_url: null,
    status: "new",
  };

  const { data: insertedNoAtt, error: insErr1 } = await supabaseAdmin
    .from("complaints")
    .insert(reportNoAttachment)
    .select("id, name, complaint_text, status, created_at")
    .single();

  if (insErr1) {
    console.error("Failed to insert text-only complaint:", insErr1.message);
    throw insErr1;
  }
  console.log(`  Successfully submitted text-only report! Reference ID: ${insertedNoAtt.id}`);

  // 3. Test Evidence File Upload to Storage Bucket
  console.log("\n[Test 2: Upload Evidence Attachment to 'evidence' Bucket]");
  const fileContent = Buffer.from(
    "SUSPICIOUS PHISHING HEADER LOG:\nFrom: support@evil.com\nSubject: Password Reset Required",
    "utf-8",
  );
  const fileName = `test_evidence_${Date.now()}.txt`;
  const filePath = `evidence_logs/${fileName}`;

  const { data: uploadData, error: upErr } = await supabaseAdmin.storage
    .from("evidence")
    .upload(filePath, fileContent, { contentType: "text/plain", upsert: true });

  if (upErr) {
    console.error("Evidence upload failed:", upErr.message);
    throw upErr;
  }
  console.log(`  Uploaded evidence object to storage path: '${uploadData.path}'`);

  // 4. Test report submission WITH attachment
  console.log("\n[Test 3: Submit Report WITH Attachment]");
  const reportWithAttachment = {
    name: "SOC Officer",
    email: "soc@example.com",
    phone: "+91 9876543211",
    complaint_text: "Phishing landing page targeting employee credentials. Header log attached.",
    evidence_url: uploadData.path,
    status: "new",
  };

  const { data: insertedWithAtt, error: insErr2 } = await supabaseAdmin
    .from("complaints")
    .insert(reportWithAttachment)
    .select("id, name, complaint_text, evidence_url, status, created_at")
    .single();

  if (insErr2) {
    console.error("Failed to insert complaint with attachment:", insErr2.message);
    throw insErr2;
  }
  console.log(
    `  Successfully submitted report with attachment! Reference ID: ${insertedWithAtt.id}, Evidence URL: ${insertedWithAtt.evidence_url}`,
  );

  // 5. Verify reading complaint from Admin view
  const { data: verifyComplaint } = await supabaseAdmin
    .from("complaints")
    .select("*")
    .eq("id", insertedWithAtt.id)
    .single();

  console.log(
    `\n[Database Record Confirmation] Complaint ${verifyComplaint.id} confirmed stored in Supabase with name='${verifyComplaint.name}', evidence_url='${verifyComplaint.evidence_url}', status='${verifyComplaint.status}'`,
  );

  console.log("\n=== Incident Reporting Tests Passed Successfully ===");
}

testIncidentReporting().catch(console.error);
