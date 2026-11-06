const fs = require("fs");

let content = fs.readFileSync("src/lib/quiz.functions.ts", "utf8");

const oldBlock = ` // ── 6. Return result — correct_option is never included in response
 return {
 is_correct: isCorrect,
 score,
 attempt_number: attemptNumber,
 explanation: isCorrect
 ? (quizExplanation ?? "Correct! Excellent work.")
 : quizExplanation
 ? \`Incorrect. \${quizExplanation}\`
 : "Incorrect. Review the lesson and try again.",
 };`;

const newBlock = ` // ── 6. Check for course completion & automated certificate issuance
 let certificateNumber: string | null = null;
 if (isCorrect) {
 try {
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const { data: courseRow } = await supabaseAdmin
 .from("courses")
 .select("slug")
 .eq("id", data.courseId)
 .maybeSingle();

 if (courseRow?.slug) {
 const { evaluateAndIssueCertificateInternal } = await import("@/lib/certificate.functions");
 const certResult = await evaluateAndIssueCertificateInternal({
 userId,
 courseSlug: courseRow.slug,
 });
 if (certResult?.certificateNumber) {
 certificateNumber = certResult.certificateNumber;
 }
 }
 } catch (certErr) {
 console.warn("[submitQuizAnswer] Auto-certificate check warning:", certErr);
 }
 }

 // ── 7. Return result — correct_option is never included in response
 return {
 is_correct: isCorrect,
 score,
 attempt_number: attemptNumber,
 explanation: isCorrect
 ? (quizExplanation ?? "Correct! Excellent work.")
 : quizExplanation
 ? \`Incorrect. \${quizExplanation}\`
 : "Incorrect. Review the lesson and try again.",
 certificateNumber,
 };`;

const normContent = content.replace(/\r\n/g, "\n");
const normOld = oldBlock.replace(/\r\n/g, "\n");

if (normContent.includes(normOld)) {
  const updated = normContent.replace(normOld, newBlock);
  fs.writeFileSync("src/lib/quiz.functions.ts", updated, "utf8");
  console.log("Successfully patched submitQuizAnswer in src/lib/quiz.functions.ts!");
} else {
  console.error("Could not find matching oldBlock in quiz.functions.ts!");
  process.exit(1);
}
