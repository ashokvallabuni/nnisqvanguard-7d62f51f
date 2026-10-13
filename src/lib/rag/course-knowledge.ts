import { AVAILABLE_COURSES, LOCKED_COURSES } from "@/data/courses-curriculum";
import { LEARNING_PATHS } from "@/data/curriculum-102";
import { GLOSSARY_TERMS } from "@/data/glossary-terms";
import { linuxSshBruteforceLab } from "@/labs/definitions/linux";
import { suricataNidsLab } from "@/labs/definitions/suricata";
import { sqliInvestigationLab } from "@/labs/definitions/sqli";
import { memoryForensicsLab } from "@/labs/definitions/memory";

export interface CourseKnowledgeChunk {
 id: string;
 courseId: string;
 courseSlug: string;
 courseTitle: string;
 moduleSlug?: string;
 moduleTitle?: string;
 lessonSlug?: string;
 lessonTitle?: string;
 labSlug?: string;
 labTitle?: string;
 topic: string;
 sectionTitle: string;
 contentType:
 | "course_overview"
 | "lesson_content"
 | "lab_guide"
 | "dataset_doc"
 | "glossary_term"
 | "quiz_concept"
 | "career_path";
 content: string;
 tags: string[];
 verifiedRoute: string;
 difficulty?: string;
 isLocked?: boolean;
}

export interface KnowledgeSearchResult {
 chunk: CourseKnowledgeChunk;
 score: number;
 matchedTerms: string[];
}

export interface CourseIndexingStats {
 totalCourses: number;
 totalModules: number;
 totalLabs: number;
 totalChunks: number;
 totalGlossaryTerms: number;
 totalPaths: number;
 indexedAt: string;
 status: "ready" | "indexing" | "error";
}

// In-memory indexed knowledge store
let cachedChunks: CourseKnowledgeChunk[] | null = null;
let cachedStats: CourseIndexingStats | null = null;

/**
 * Tokenize and normalize query or content string
 */
function tokenize(text: string): string[] {
 return text
 .toLowerCase()
 .replace(/[^a-z0-9_\-\.\/]/g, " ")
 .split(/\s+/)
 .filter((t) => t.length > 1);
}

/**
 * Sanitize text to ensure NO protected assessment flags or validation keys are ever present in the RAG store
 */
function sanitizeEducationalText(text: string): string {
 return text
 .replace(/FLAG\{[^}]+\}/g, "[REDACTED: Protected Assessment Flag — Student must discover in lab dataset]")
 .replace(/flag:\s*"[^"]+"/g, 'flag: "[REDACTED]"');
}

/**
 * Extract and normalize all verified course, lab, and glossary educational content
 */
export function buildCourseKnowledgeIndex(): CourseKnowledgeChunk[] {
 const chunks: CourseKnowledgeChunk[] = [];

 // 1. Index AVAILABLE_COURSES & their comprehensive modules
 for (const course of AVAILABLE_COURSES) {
 // Course Overview Chunk
 chunks.push({
 id: `c-${course.slug}-overview`,
 courseId: course.id,
 courseSlug: course.slug,
 courseTitle: course.title,
 topic: course.title,
 sectionTitle: "Course Curriculum Overview & Learning Objectives",
 contentType: "course_overview",
 content: sanitizeEducationalText(
 `Course: ${course.title} (Level: ${course.level}, Duration: ${course.duration_hours || 8} hours).
Summary: ${course.summary}
Full Description: ${course.description}
Key Skills Taught: ${course.skills.join(", ")}
Badge Awarded: ${course.badge_name}
Total Modules: ${course.modules.length}`,
 ),
 tags: [...course.skills, course.title, course.level, "Course Overview"],
 verifiedRoute: `/learn/${course.slug}`,
 difficulty: course.level,
 isLocked: false,
 });

 // Module and Lesson Chunks
 for (const mod of course.modules) {
 const route = `/learn/${course.slug}/${mod.slug}`;

 // Module high-level summary chunk
 chunks.push({
 id: `m-${course.slug}-${mod.slug}-summary`,
 courseId: course.id,
 courseSlug: course.slug,
 courseTitle: course.title,
 moduleSlug: mod.slug,
 moduleTitle: mod.title,
 topic: mod.title,
 sectionTitle: `${mod.title} - Overview & Educational Analogy`,
 contentType: "lesson_content",
 content: sanitizeEducationalText(
 `Lesson: ${mod.title} (Course: ${course.title}, Order: #${mod.order_index}, Estimated: ${mod.duration_minutes}m, Level: ${mod.difficulty}).
Summary: ${mod.summary}
${mod.analogy ? `Educational Analogy: ${mod.analogy}` : ""}
Key Topics: ${mod.tags.join(", ")}
${mod.companion_lab_slug ? `Companion Hands-on Lab: ${mod.companion_lab_slug}` : ""}`,
 ),
 tags: [...mod.tags, course.title, mod.title, "Lesson Summary"],
 verifiedRoute: route,
 difficulty: mod.difficulty,
 isLocked: false,
 });

 // Parse and split notes_md into atomic sections by markdown header
 if (mod.notes_md) {
 const sections = mod.notes_md.split(/(?=###\s+|##\s+)/g);
 sections.forEach((section, idx) => {
 const trimmed = section.trim();
 if (trimmed.length < 20) return;

 // Extract section title
 const firstLine = trimmed.split("\n")[0].replace(/^[#\s]+/, "");
 chunks.push({
 id: `m-${course.slug}-${mod.slug}-sec-${idx + 1}`,
 courseId: course.id,
 courseSlug: course.slug,
 courseTitle: course.title,
 moduleSlug: mod.slug,
 moduleTitle: mod.title,
 topic: firstLine || mod.title,
 sectionTitle: `${mod.title} > ${firstLine}`,
 contentType: "lesson_content",
 content: sanitizeEducationalText(
 `From Course "${course.title}", Module "${mod.title}":\n\n${trimmed}`,
 ),
 tags: [...mod.tags, course.title, firstLine],
 verifiedRoute: route,
 difficulty: mod.difficulty,
 isLocked: false,
 });
 });
 }

 // Dataset references attached to modules
 if (mod.dataset_ref) {
 chunks.push({
 id: `m-${course.slug}-${mod.slug}-dataset`,
 courseId: course.id,
 courseSlug: course.slug,
 courseTitle: course.title,
 moduleSlug: mod.slug,
 moduleTitle: mod.title,
 topic: mod.dataset_ref.name,
 sectionTitle: `Practical Dataset: ${mod.dataset_ref.name}`,
 contentType: "dataset_doc",
 content: sanitizeEducationalText(
 `Practical Dataset for ${mod.title}:
Dataset Name: ${mod.dataset_ref.name}
Source: ${mod.dataset_ref.source}
Description: ${mod.dataset_ref.description}
Format: ${mod.dataset_ref.format} (${mod.dataset_ref.recordsCount} records)
Associated Lesson: ${mod.title} in ${course.title}`,
 ),
 tags: ["Dataset", mod.dataset_ref.name, mod.dataset_ref.format, mod.title],
 verifiedRoute: route,
 difficulty: mod.difficulty,
 isLocked: false,
 });
 }

 // Quiz Concept chunks (without answer keys)
 if (mod.quizzes && mod.quizzes.length > 0) {
 mod.quizzes.forEach((q, qIdx) => {
 chunks.push({
 id: `m-${course.slug}-${mod.slug}-quiz-${qIdx + 1}`,
 courseId: course.id,
 courseSlug: course.slug,
 courseTitle: course.title,
 moduleSlug: mod.slug,
 moduleTitle: mod.title,
 topic: "Knowledge Check Question",
 sectionTitle: `${mod.title} - Knowledge Check Concept #${qIdx + 1}`,
 contentType: "quiz_concept",
 content: sanitizeEducationalText(
 `Knowledge Check Concept for ${mod.title}:
Question: ${q.question}
Key Educational Concept: ${q.explanation}`,
 ),
 tags: ["Quiz Concept", mod.title, course.title],
 verifiedRoute: route,
 difficulty: mod.difficulty,
 isLocked: false,
 });
 });
 }
 }
 }

 // 2. Index LOCKED_COURSES (so IVVAB accurately acknowledges them as upcoming roadmap courses instead of inventing nonexistent modules)
 for (const locked of LOCKED_COURSES) {
 chunks.push({
 id: `locked-${locked.slug}`,
 courseId: locked.id,
 courseSlug: locked.slug,
 courseTitle: locked.title,
 topic: locked.title,
 sectionTitle: `${locked.title} (Upcoming Academy Course)`,
 contentType: "course_overview",
 content: `The course "${locked.title}" is an official NISQ Vanguard Academy course currently in development (Category: ${locked.category}, Planned Duration: ${locked.duration}, Difficulty: ${locked.difficulty}).
Status: Currently locked in the curriculum roadmap. Students should complete foundational prerequisites in Cybersecurity Foundations, Networking Fundamentals, and Linux Command Quest first.`,
 tags: [locked.title, locked.category, "Upcoming Course", "Roadmap"],
 verifiedRoute: `/academy`,
 difficulty: locked.difficulty,
 isLocked: true,
 });
 }

 // 3. Index LEARNING_PATHS (from curriculum-102)
 for (const path of LEARNING_PATHS) {
 chunks.push({
 id: `path-${path.slug}`,
 courseId: path.id,
 courseSlug: path.slug,
 courseTitle: path.title,
 topic: path.title,
 sectionTitle: `Career Learning Path: ${path.title}`,
 contentType: "career_path",
 content: `Career Learning Path: ${path.title}
Course Range: ${path.course_range} (${path.courses_count} courses)
Description: ${path.description}
Target Professional Roles: ${path.target_roles.join(", ")}
Included Course Modules: ${path.course_slugs.join(", ")}`,
 tags: [path.title, ...path.target_roles, "Learning Path", "Career Roadmap"],
 verifiedRoute: `/cyber-range/learning-paths`,
 isLocked: false,
 });
 }

 // 4. Index IVVAB LABS (Practical Hands-On Lab Workspaces)
 const labs = [
 linuxSshBruteforceLab,
 suricataNidsLab,
 sqliInvestigationLab,
 memoryForensicsLab,
 ];

 for (const lab of labs) {
 const labRoute = `/cyber-range/lab/${lab.slug}`;

 // Lab Overview & Objectives
 chunks.push({
 id: `lab-${lab.slug}-overview`,
 courseId: lab.id,
 courseSlug: lab.slug,
 courseTitle: lab.title,
 labSlug: lab.slug,
 labTitle: lab.title,
 topic: lab.title,
 sectionTitle: `IVVAB LABS Guide: ${lab.title}`,
 contentType: "lab_guide",
 content: sanitizeEducationalText(
 `IVVAB LABS Practical Investigation: ${lab.title}
Difficulty: ${lab.difficulty} | Category: ${lab.category} | Estimated Time: ${lab.estimated_minutes} mins | Reward: ${lab.reward_points} XP
Scenario Description: ${lab.description}
Learning Objectives:
- ${lab.learning_objectives.join("\n- ")}
${lab.prerequisites ? `Prerequisites:\n- ${lab.prerequisites.join("\n- ")}` : ""}
${lab.dataset_description ? `Dataset Environment:\n${lab.dataset_description}` : ""}
${lab.next_recommended ? `Recommended Next Activity: ${lab.next_recommended.title} (${lab.next_recommended.route})` : ""}`,
 ),
 tags: ["IVVAB LABS", lab.title, lab.category, lab.difficulty, "Hands-on Lab"],
 verifiedRoute: labRoute,
 difficulty: lab.difficulty,
 isLocked: false,
 });

 // Lab Theory & Conceptual Introduction
 if (lab.conceptual_intro) {
 chunks.push({
 id: `lab-${lab.slug}-theory`,
 courseId: lab.id,
 courseSlug: lab.slug,
 courseTitle: lab.title,
 labSlug: lab.slug,
 labTitle: lab.title,
 topic: `${lab.title} Theory`,
 sectionTitle: `${lab.title} - Theoretical Explanation & Threat Mechanics`,
 contentType: "lesson_content",
 content: sanitizeEducationalText(
 `Theoretical Foundation for IVVAB LAB: ${lab.title}\n\n${lab.conceptual_intro}`,
 ),
 tags: ["Lab Theory", lab.title, lab.category],
 verifiedRoute: labRoute,
 difficulty: lab.difficulty,
 isLocked: false,
 });
 }

 // Lab Task Guidance (Sanitized: NO answer keys or raw flags)
 for (let tIdx = 0; tIdx < lab.tasks.length; tIdx++) {
 const task = lab.tasks[tIdx];
 chunks.push({
 id: `lab-${lab.slug}-task-${task.id}`,
 courseId: lab.id,
 courseSlug: lab.slug,
 courseTitle: lab.title,
 labSlug: lab.slug,
 labTitle: lab.title,
 topic: task.title,
 sectionTitle: `${lab.title} > Task ${tIdx + 1}: ${task.title}`,
 contentType: "lab_guide",
 content: sanitizeEducationalText(
 `Task in ${lab.title}:
Task Title: ${task.title}
Task Objective: ${task.description}
Educational Insight: ${task.explanation || "Examine system evidence using virtual terminal commands."}
Investigative Approach: Use standard analysis tools on the virtual dataset to extract indicators. Do NOT provide answers directly; guide learners through discovery steps.`,
 ),
 tags: [lab.title, task.title, "Lab Task"],
 verifiedRoute: labRoute,
 difficulty: lab.difficulty,
 isLocked: false,
 });
 }
 }

 // 5. Index GLOSSARY_TERMS
 for (const term of GLOSSARY_TERMS) {
 chunks.push({
 id: `glossary-${term.slug}`,
 courseId: "glossary",
 courseSlug: "glossary",
 courseTitle: "Cybersecurity Glossary",
 topic: term.term,
 sectionTitle: `Glossary Definition: ${term.term}`,
 contentType: "glossary_term",
 content: `Term: ${term.term} (Category: ${term.category}${term.rfcOrStandard ? `, Standard: ${term.rfcOrStandard}` : ""})
Definition: ${term.definition}
Technical Details: ${term.technicalDetails}
Security Impact & Risk: ${term.securityImpact}
${term.relatedLessonSlug ? `Related Lesson: /learn/${term.relatedLessonSlug}` : ""}
${term.relatedLabSlug ? `Related Lab: /cyber-range/lab/${term.relatedLabSlug}` : ""}`,
 tags: [term.term, term.category, "Glossary", "Definition"],
 verifiedRoute: term.relatedLessonSlug ? `/learn/${term.relatedLessonSlug}` : `/academy/glossary`,
 isLocked: false,
 });
 }

 return chunks;
}

/**
 * Get or initialize the cached knowledge index
 */
export function getCourseKnowledgeIndex(): CourseKnowledgeChunk[] {
 if (!cachedChunks) {
 cachedChunks = buildCourseKnowledgeIndex();
 cachedStats = {
 totalCourses: AVAILABLE_COURSES.length + LOCKED_COURSES.length,
 totalModules: AVAILABLE_COURSES.reduce((acc, c) => acc + c.modules.length, 0),
 totalLabs: 4,
 totalChunks: cachedChunks.length,
 totalGlossaryTerms: GLOSSARY_TERMS.length,
 totalPaths: LEARNING_PATHS.length,
 indexedAt: new Date().toISOString(),
 status: "ready",
 };
 }
 return cachedChunks;
}

/**
 * Force refresh the in-memory knowledge index
 */
export function refreshKnowledgeIndex(): CourseIndexingStats {
 cachedChunks = buildCourseKnowledgeIndex();
 cachedStats = {
 totalCourses: AVAILABLE_COURSES.length + LOCKED_COURSES.length,
 totalModules: AVAILABLE_COURSES.reduce((acc, c) => acc + c.modules.length, 0),
 totalLabs: 4,
 totalChunks: cachedChunks.length,
 totalGlossaryTerms: GLOSSARY_TERMS.length,
 totalPaths: LEARNING_PATHS.length,
 indexedAt: new Date().toISOString(),
 status: "ready",
 };
 return cachedStats;
}

/**
 * Get indexing stats for admin content management
 */
export function getIndexingStats(): CourseIndexingStats {
 if (!cachedStats) {
 getCourseKnowledgeIndex();
 }
 return cachedStats!;
}

export interface SearchOptions {
 limit?: number;
 minScore?: number;
 courseSlug?: string;
 labSlug?: string;
 excludeLocked?: boolean;
}

/**
 * Search course knowledge base with BM25 / token-weighted relevance ranking
 */
export function searchCourseKnowledge(
 query: string,
 options: SearchOptions = {},
): KnowledgeSearchResult[] {
 const chunks = getCourseKnowledgeIndex();
 const limit = options.limit || 5;
 const minScore = options.minScore || 2.0;

 const queryTokens = tokenize(query);
 if (queryTokens.length === 0) return [];

 const lowerQuery = query.toLowerCase();

 // Boost key cybersecurity concepts
 const boostTerms: Record<string, number> = {
 ssh: 3.5,
 "auth.log": 4.0,
 "brute force": 4.0,
 suricata: 4.0,
 pcap: 3.5,
 dns: 3.0,
 "dns tunneling": 4.5,
 sqli: 4.5,
 "sql injection": 4.5,
 union: 3.5,
 volatility: 4.5,
 pslist: 4.0,
 netscan: 4.0,
 "cia triad": 4.0,
 networking: 3.0,
 linux: 3.0,
 top: 2.0,
 chmod: 3.0,
 wireshark: 3.5,
 handshake: 3.5,
 subnet: 3.5,
 subnetting: 3.5,
 arp: 3.5,
 nmap: 3.5,
 metasploit: 3.5,
 "active directory": 3.5,
 };

 const results: KnowledgeSearchResult[] = [];

 for (const chunk of chunks) {
 if (options.courseSlug && chunk.courseSlug !== options.courseSlug) continue;
 if (options.labSlug && chunk.labSlug !== options.labSlug) continue;
 if (options.excludeLocked && chunk.isLocked) continue;

 const titleLower = chunk.sectionTitle.toLowerCase();
 const topicLower = chunk.topic.toLowerCase();
 const contentLower = chunk.content.toLowerCase();
 const tagsLower = chunk.tags.map((t) => t.toLowerCase());

 let score = 0;
 const matchedTerms: string[] = [];

 // Exact phrase matches in title/content
 if (lowerQuery.length > 3) {
 if (titleLower.includes(lowerQuery)) {
 score += 15.0;
 matchedTerms.push(`exact_title: "${lowerQuery}"`);
 } else if (contentLower.includes(lowerQuery)) {
 score += 8.0;
 matchedTerms.push(`exact_content: "${lowerQuery}"`);
 }
 }

 for (const token of queryTokens) {
 let tokenScore = 0;
 const boost = boostTerms[token] || 1.0;

 // Title match
 if (titleLower.includes(token)) {
 tokenScore += 4.5 * boost;
 }

 // Topic match
 if (topicLower.includes(token)) {
 tokenScore += 3.5 * boost;
 }

 // Tags match
 if (tagsLower.some((t) => t.includes(token))) {
 tokenScore += 2.5 * boost;
 }

 // Content occurrence frequency
 const occurrences = (contentLower.match(new RegExp(`\\b${token}\\b`, "g")) || []).length;
 if (occurrences > 0) {
 tokenScore += Math.min(occurrences * 1.2, 6.0) * boost;
 }

 if (tokenScore > 0) {
 score += tokenScore;
 matchedTerms.push(token);
 }
 }

 if (score >= minScore) {
 results.push({ chunk, score, matchedTerms: Array.from(new Set(matchedTerms)) });
 }
 }

 return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Format retrieved chunks into grounded system context for IVVAB AI
 */
export function formatKnowledgeContext(results: KnowledgeSearchResult[]): string {
 if (results.length === 0) {
 return `[NO DIRECT COURSE KNOWLEDGE MATCH FOUND IN ACADEMY DATABASE.
Instruct IVVAB: State clearly that this specific topic is not explicitly covered in the current active Academy course modules. You may provide general foundational cybersecurity principles, but do NOT invent course names, module titles, or citations.]`;
 }

 let output = `[VERIFIED COURSE KNOWLEDGE BASE RETRIEVAL (${results.length} relevant sections found)]\n`;
 output += `CRITICAL INSTRUCTIONS FOR IVVAB AI:
- The following excerpts are extracted directly from the actual NISQ Vanguard Academy course and lab database.
- Base your explanation on these verified sources.
- When referencing a course or lesson, cite its exact Title and verified link URL.
- NEVER fabricate nonexistent courses or modules.
- NEVER reveal protected assessment flags or bypass lab challenges; provide guided hints instead.\n\n`;

 results.forEach((r, idx) => {
 const c = r.chunk;
 output += `--- SOURCE ${idx + 1} (Relevance Score: ${r.score.toFixed(1)}) ---\n`;
 output += `Course / Context: "${c.courseTitle}"\n`;
 if (c.moduleTitle) output += `Module / Lesson: "${c.moduleTitle}"\n`;
 if (c.labTitle) output += `Lab: "${c.labTitle}"\n`;
 output += `Section: "${c.sectionTitle}"\n`;
 output += `Verified Route: ${c.verifiedRoute}\n`;
 output += `Status: ${c.isLocked ? "Upcoming / Locked Roadmap Course" : "Active & Available"}\n`;
 output += `Content:\n${c.content}\n\n`;
 });

 return output;
}
