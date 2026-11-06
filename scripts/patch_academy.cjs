const fs = require("fs");

let content = fs.readFileSync("src/lib/academy.functions.ts", "utf8");

const oldBlock = ` // ── 5. Check for course completion + certificate issuance ────────────────
 let certificateNumber: string | null = null;

 if (supabaseAdmin) {
 try {
 const { data: allModules } = await supabase
 .from("modules")
 .select("id")
 .eq("course_id", courseId);

 if (allModules && allModules.length > 0) {
 const { count: completedCount } = await supabase
 .from("module_progress")
 .select("module_id", { count: "exact", head: true })
 .eq("user_id", userId)
 .eq("completed", true)
 .in(
 "module_id",
 allModules.map((m) => m.id),
 );

 if ((completedCount ?? 0) >= allModules.length) {
 // All modules done — issue certificate if not already issued
 const { data: existing } = await supabaseAdmin
 .from("certificates")
 .select("certificate_number")
 .eq("user_id", userId)
 .eq("course_id", courseId)
 .maybeSingle();

 if (!existing) {
 const { data: profile } = await supabase
 .from("profiles")
 .select("full_name")
 .eq("id", userId)
 .maybeSingle();

 const recipientName = profile?.full_name || "Verified Analyst";
 const certNum = \`NISQ-CERT-\${data.courseSlug.toUpperCase().slice(0, 6)}-\${new Date().getFullYear()}-\${crypto.randomUUID().split("-")[0].toUpperCase()}\`;

 await supabaseAdmin.from("certificates").insert({
 user_id: userId,
 course_id: courseId,
 certificate_number: certNum,
 recipient_name: recipientName,
 course_title: courseTitle,
 });
 certificateNumber = certNum;
 } else {
 certificateNumber = existing.certificate_number;
 }
 }
 }
 } catch (certErr) {
 console.warn("[completeModule] Certificate check failed:", certErr);
 }
 }`;

const newBlock = ` // ── 5. Check for course completion + certificate issuance ────────────────
 let certificateNumber: string | null = null;

 try {
 const { evaluateAndIssueCertificateInternal } = await import("@/lib/certificate.functions");
 const certResult = await evaluateAndIssueCertificateInternal({
 userId,
 courseSlug: data.courseSlug,
 });
 if (certResult?.certificateNumber) {
 certificateNumber = certResult.certificateNumber;
 }
 } catch (certErr) {
 console.warn("[completeModule] Automated certificate evaluation warning:", certErr);
 }`;

// Normalize line breaks for matching
const normContent = content.replace(/\r\n/g, "\n");
const normOld = oldBlock.replace(/\r\n/g, "\n");

if (normContent.includes(normOld)) {
  const updated = normContent.replace(normOld, newBlock);
  fs.writeFileSync("src/lib/academy.functions.ts", updated, "utf8");
  console.log("Successfully replaced completeModule certificate check in src/lib/academy.functions.ts!");
} else {
  console.error("Could not find matching oldBlock!");
  process.exit(1);
}

