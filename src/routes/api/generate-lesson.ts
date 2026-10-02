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
You are a professional cybersecurity instructor. Upgrade the content quality of the following lesson.
Do not generate short 2-3 paragraph lessons. The lesson should have enough depth that a student can actually understand the topic without needing another website.

Course: ${courseTitle}
Module: ${moduleTitle}

Required structure:
- A clear introduction
- Detailed explanation of the topic
- Important concepts explained in simple language
- Real-world cybersecurity examples
- Practical examples where appropriate
- Step-by-step explanation of how the concept works
- Common mistakes
- Security best practices
- A short practical scenario
- Key points / summary
- Connection to the relevant IVVAB LAB when applicable

Content Quality Rules:
- Write like a professional cybersecurity instructor, not an AI chatbot.
- Do NOT use repetitive phrases like "In today's rapidly evolving world...", "Let's dive into...", "It's important to note...".
- Avoid excessive emojis, decorative symbols, \`::\`, \`---\`, unnecessary bullet spam, fake quotes, and overly fragmented sentences.
- Use plain professional language with natural headings and paragraphs.
- Approximately 30% of the learning experience should use visual explanations (ASCII/Markdown diagrams, architecture diagrams, flow diagrams, tables), while 70% remains readable text.
- If it is about networking, explain networking. If Linux, explain Linux commands. If web security, explain the attack flow.

Existing notes (if any, use as a baseline):
${currentContent || "No existing notes provided."}

Return ONLY the Markdown content. Do not wrap in \`\`\`markdown or provide any other commentary.
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
