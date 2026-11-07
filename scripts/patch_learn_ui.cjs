const fs = require('fs');
const filePath = 'src/routes/_authenticated/learn.$slug.$moduleSlug.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const quizBlockRegex = /\s*\/\/\s*4\.\s*Fetch Quizzes for this module[\s\S]*?enabled:\s*!+currentModule,\r?\n\s*\}\);/;

const replacement = `
  const isTestCourse = Boolean(course?.is_test || course?.slug?.startsWith("zz-") || slug.startsWith("zz-"));

  // 4. Fetch Quizzes for this module (completely omitted for test courses)
  const { data: quizzes } = useQuery({
    queryKey: ["module-quizzes", currentModule?.id, isTestCourse],
    queryFn: async () => {
      if (isTestCourse) {
        return [];
      }

      const { data } = await supabase
        .from("quizzes")
        .select("id,module_id,question,options,correct_option,explanation,sort_order")
        .eq("module_id", currentModule!.id)
        .order("sort_order");

      if (data && data.length > 0) return data;

      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const staticCourse = AVAILABLE_COURSES.find((c) => c.slug === slug || c.id === course?.id);
      const staticMod = staticCourse?.modules?.find((m) => m.slug === moduleSlug);
      if (staticMod?.quizzes?.length) {
        return staticMod.quizzes.map((q, idx) => ({
          id: q.id ?? \`q-\${moduleSlug}-\${idx}\`,
          module_id: currentModule!.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: idx + 1,
        }));
      }

      const foundInNet = NETWORKING_MODULES.find((m) => m.slug === moduleSlug);
      if (foundInNet?.quizzes) {
        return foundInNet.quizzes.map((q, idx) => ({
          id: \`q-\${moduleSlug}-\${idx}\`,
          module_id: currentModule!.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: idx + 1,
        }));
      }

      const foundInLin = LINUX_MODULES.find((m) => m.slug === moduleSlug);
      if (foundInLin?.quizzes) {
        return foundInLin.quizzes.map((q, idx) => ({
          id: \`q-\${moduleSlug}-lin-\${idx}\`,
          module_id: currentModule!.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: idx + 1,
        }));
      }

      return [];
    },
    enabled: Boolean(currentModule && !isTestCourse),
  });`;

if (!quizBlockRegex.test(code)) {
  console.error("quizBlockRegex did not match!");
  process.exit(1);
}

code = code.replace(quizBlockRegex, replacement.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n'));

// Replace throw new Error(result.error); with throw new Error(result.message || result.error);
code = code.replace(
  /throw\s+new\s+Error\(result\.error\);/,
  `throw new Error(result.message || result.error);`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('learn.$slug.$moduleSlug.tsx successfully patched!');
