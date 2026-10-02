import { createFileRoute } from "@tanstack/react-router";
import { json, callChatModel, getAuth, clientKey, rateLimit } from "@/lib/api-helpers.server";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/generate-lesson")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const ctx = await getAuth(request);
          if (!rateLimit(`generate:${clientKey(request, ctx.userId)}`, 20, 60_000)) {
            return json({ error: "Rate limit exceeded." }, 429);
          }

          const body = await request.json();
          const { courseSlug, moduleSlug, courseTitle, moduleTitle, currentContent } = body;

          if (!courseSlug || !moduleSlug) {
            return json({ error: "Missing required fields" }, 400);
          }

const prompt = `
You are a professional cybersecurity instructor authoring a textbook-quality lesson. 

Course: ${courseTitle}
Module: ${moduleTitle}

Your task is to create a detailed, highly educational, professional lesson for a cybersecurity training platform.

DO NOT write just short notes or definitions. Write proper, detailed paragraphs that explain the concept. 
For example, instead of "Asset: anything valuable", write a full paragraph explaining what an asset is, providing examples like databases, employee laptops, cloud applications, and why security teams must identify them.

REQUIRED SECTIONS (Use standard Markdown headings, but DO NOT use excessive #'s or hashtags like #Asset):
1. Introduction: Explain what the topic is and why the learner needs to understand it.
2. Core Concept: Detailed explanation using simple language suitable for a beginner while maintaining technical accuracy.
3. How It Works: Explain the underlying process step by step.
4. Real-World Example: Show how this concept appears in an actual organization, network, application, SOC, cloud environment or security incident.
5. Security Perspective: Explain how attackers abuse the concept and how defenders detect, prevent or respond to it.
6. Practical Example: Realistic technical example where appropriate.
7. Common Mistakes: Mistakes beginners commonly make.
8. Defensive Thinking: Teach the learner how a security professional thinks about the problem.
9. Key Takeaways: Summarize the important concepts in natural language.
10. Knowledge Check: Provide questions that test whether the learner actually understood the concept.
11. PRACTICE IN IVVAB LABS: If a lab is relevant, explain what the learner will apply in IVVAB LABS (never call it Cyber Range). Explain WHY they are entering the lab.

CRITICAL FORMATTING AND STYLE RULES:
- WRITE REAL PARAGRAPHS. Expand and explain. Do not artificially make every paragraph the same length.
- REMOVE AI-GENERATED LOOKING FORMATTING. Do NOT use excessive bullets, emojis, decorative symbols, \`::\`, arrows (\`->\`, \`=>\`), or hashtags.
- CYBERSECURITY FOUNDATIONS: Explain concepts rather than one-line definitions. 
- BASICS OF NETWORKING: Show packet movement, explain what happens at each stage.
- LINUX COMMAND QUEST: Explain commands instead of simply displaying syntax. Give security investigation use-cases.
- USE INFORMATION DIAGRAMS: ~30% of the lesson should use visual learning elements. Use Mermaid.js (\`\`\`mermaid) for flow diagrams, architectures, and topologies! Ensure diagrams teach the concept (e.g. Network topology, CIA Triad, TCP flow, DNS, Incident response lifecycle).

Existing notes (if any, use as a baseline but heavily expand into the required format):
${currentContent || "No existing notes provided."}

Return ONLY the Markdown content. Do not wrap the entire response in \`\`\`markdown, but YOU MUST use \`\`\`mermaid blocks for your diagrams.
`;

          const generatedMarkdown = await callChatModel([
            { role: "system", content: "You are an expert cybersecurity instructor." },
            { role: "user", content: prompt }
          ]);
          
          const cleanContent = generatedMarkdown.replace(/^```markdown\n/, "").replace(/\n```$/, "").trim();

          const { data: courseData, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .eq("slug", courseSlug)
            .single();
            
          if (courseError || !courseData) {
              return json({ error: "Course not found in database. Ensure it is seeded first." }, 404);
          }

          const { error: updateError } = await supabase
            .from("modules")
            .update({ notes_md: cleanContent })
            .eq("course_id", courseData.id)
            .eq("slug", moduleSlug);

          if (updateError) {
            return json({ error: "Failed to save to database", details: updateError.message }, 500);
          }

          return json({ success: true, content: cleanContent });
        } catch (error: any) {
          console.error("Error generating lesson:", error);
          return json({ error: error.message }, 500);
        }
      }
    }
  }
});
