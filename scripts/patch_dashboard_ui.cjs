const fs = require('fs');

const filePath = 'src/routes/_authenticated/dashboard.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Order module_progress by updated_at DESC and add quizAttempts & courseCompletions queries
const progressQueryRegex = /\s*\/\/\s*3\.\s*Fetch module progress[\s\S]*?enabled:\s*!+user,\r?\n\s*\}\);/;

const queriesReplacement = `
  // 3. Fetch module progress ordered by updated_at DESC
  const { data: progress } = useQuery({
    queryKey: ["dash-user-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id,completed,quiz_score,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // 3b. Fetch passed quiz attempts
  const { data: quizAttempts } = useQuery({
    queryKey: ["dash-quiz-attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("quiz_id,is_correct,score")
        .eq("user_id", user.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // 3c. Fetch course completions
  const { data: courseCompletions } = useQuery({
    queryKey: ["dash-course-completions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("course_completions")
        .select("course_id,completed_at")
        .eq("user_id", user.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });`;

code = code.replace(progressQueryRegex, queriesReplacement.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n'));

// 2. Update stats and add activeCourseData computation
const statsTargetRegex = /const completedModulesCount = completedModuleIds\.size;[\s\S]*?const totalXp = completedModulesCount \* 25 \+ completedLabsCount \* 100 \+ totalBadgesEarned \* 100;/;

const statsReplacement = `const completedModulesCount = completedModuleIds.size;
  const completedLabsCount = (labProgress ?? []).filter((l) => l.completed).length;
  const completedCoursesCount = courseCompletions?.length ?? 0;
  const passedQuizzesCount = useMemo(() => {
    const passed = new Set(
      (quizAttempts ?? []).filter((a) => a.is_correct || (a.score ?? 0) >= 70).map((a) => a.quiz_id)
    );
    return passed.size;
  }, [quizAttempts]);

  const totalBadgesEarned = Math.max((userBadges ?? []).length, completedModulesCount > 0 ? 1 : 0);
  const totalXp = completedModulesCount * 25 + passedQuizzesCount * 10 + completedLabsCount * 100 + totalBadgesEarned * 100;`;

code = code.replace(statsTargetRegex, statsReplacement.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n'));

// 3. Replace the hardcoded activeCourse with activeCourseData
const activeCourseTargetRegex = /\s*\/\/\s*Active track to resume[\s\S]*?courseModules\.find\(\(m\) => !completedModuleIds\.has\(m\.id\)\) \|\| courseModules\[0\];/;

const activeCourseReplacement = `
  // Active course resolution based on real authoritative database progress
  const activeCourseData = useMemo(() => {
    if (!courses || courses.length === 0 || !allModules || allModules.length === 0) {
      return null;
    }

    // 1. Check if user has progress rows, ordered by updated_at DESC
    if (progress && progress.length > 0) {
      for (const p of progress) {
        const mod = allModules.find((m) => m.id === p.module_id);
        if (mod) {
          const course = courses.find((c) => c.id === mod.course_id);
          if (course) {
            const courseModules = allModules
              .filter((m) => m.course_id === course.id)
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            const completedInCourse = courseModules.filter((m) => completedModuleIds.has(m.id));
            const nextIncomplete = courseModules.find((m) => !completedModuleIds.has(m.id)) || courseModules[0];
            const percent = courseModules.length > 0
              ? Math.round((completedInCourse.length / courseModules.length) * 100)
              : 0;

            return {
              course,
              courseModules,
              completedCount: completedInCourse.length,
              totalCount: courseModules.length,
              percent,
              lastAccessedModule: mod,
              nextModule: nextIncomplete,
              isAllComplete: completedInCourse.length >= courseModules.length,
            };
          }
        }
      }
    }

    return null;
  }, [courses, allModules, progress, completedModuleIds]);`;

code = code.replace(activeCourseTargetRegex, activeCourseReplacement.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n'));

// 4. Update the Main Content Column to place CONTINUE COURSE HERO at the very top
const primaryActionsRegex = /\{\/\*\s*SECTION:\s*PRIMARY ACTIONS\s*\*\/\}[\s\S]*?<\/section>/;

const continueHeroAndPrimaryActions = `{/* SECTION: CONTINUE COURSE HERO (TOP OF MAIN CONTENT) */}
        <section aria-label="Continue Course">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-primary" /> Active Course Trajectory
            </h2>
            {activeCourseData && (
              <span className="text-[0.65rem] font-mono text-primary font-semibold">
                {activeCourseData.completedCount} of {activeCourseData.totalCount} Modules Done ({activeCourseData.percent}%)
              </span>
            )}
          </div>

          {activeCourseData ? (
            <div className="nv-card p-6 shadow-sm border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {activeCourseData.course.level || "ALL LEVELS"}
                    </span>
                    {activeCourseData.isAllComplete ? (
                      <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-warning/15 text-warning font-semibold">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                    {activeCourseData.course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activeCourseData.course.description || "Master foundational and defensive cyber techniques through interactive labs and curriculum."}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Syllabus Completion</span>
                  <span className="font-bold text-foreground">{activeCourseData.percent}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: \`\${Math.max(activeCourseData.percent, 3)}%\` }}
                  />
                </div>
              </div>

              {/* Contextual Module Info & CTA */}
              <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs space-y-0.5">
                  <div className="text-muted-foreground font-mono">
                    {activeCourseData.isAllComplete ? "All modules complete" : "Next Incomplete Lesson:"}
                  </div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span>{activeCourseData.nextModule.title}</span>
                  </div>
                </div>

                <Link
                  to={\`/learn/\${activeCourseData.course.slug}/\${activeCourseData.nextModule.slug}\`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm tracking-wide hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
                >
                  <span>{activeCourseData.isAllComplete ? "Review Course" : "Continue Learning"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="nv-card p-6 sm:p-8 text-center space-y-4 border border-dashed border-border/80">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-display font-bold text-lg text-foreground">Start Your Learning Journey</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You haven't enrolled in a course yet. Choose a path in the Academy to begin mastering cybersecurity fundamentals and hands-on defense.
                </p>
              </div>
              <Link
                to="/academy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm tracking-wide hover:bg-primary/90 transition-all shadow-md cursor-pointer select-none"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* SECTION: PRIMARY ACTIONS */}
        <section aria-label="Primary Actions" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/cyber-range/labs"
            className="flex items-center justify-between p-5 sm:p-6 min-h-[80px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-card hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
          >
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl tracking-wider">OPEN IVVAB LABS</h3>
              <p className="text-xs sm:text-sm opacity-90 mt-1 font-medium">Access immersive cyber environments</p>
            </div>
            <Terminal className="w-7 h-7 sm:w-8 sm:h-8 opacity-80 shrink-0 ml-3" />
          </Link>
          <Link
            to="/academy"
            className="flex items-center justify-between p-5 sm:p-6 min-h-[80px] rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 transition-all duration-200 shadow-card hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
          >
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl tracking-wider">ALL COURSES</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Browse full Academy curriculum</p>
            </div>
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 opacity-80 shrink-0 text-primary ml-3" />
          </Link>
        </section>`;

code = code.replace(primaryActionsRegex, continueHeroAndPrimaryActions.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n'));

// 5. Update stats grid in Sidebar to 2x3 grid showing all synchronized metrics
const statsGridRegex = /<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;

const statsGridReplacement = `<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 nv-card space-y-1 shadow-xs hover:border-primary/40 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-warning font-bold">
                  Streak
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {userStreak} <span className="text-[0.65rem] text-muted-foreground font-normal">{userStreak === 1 ? 'Day' : 'Days'}</span>
                </div>
              </div>
              <div className="p-3.5 nv-card space-y-1 shadow-xs hover:border-primary/40 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-muted-foreground">
                  Skill XP
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-foreground">{totalXp}</div>
              </div>
              <div className="p-3.5 nv-card space-y-1 shadow-xs hover:border-primary/40 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-primary">
                  Courses
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {completedCoursesCount}
                </div>
              </div>
              <div className="p-3.5 nv-card space-y-1 shadow-xs hover:border-primary/40 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-muted-foreground">
                  Modules
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {completedModulesCount}
                </div>
              </div>
              <div className="p-3.5 nv-card space-y-1 shadow-xs hover:border-primary/40 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-warning">
                  Quizzes
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {passedQuizzesCount}
                </div>
              </div>
              <div className="p-3.5 nv-card space-y-1 shadow-xs hover:border-primary/40 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-success">
                  Labs
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {completedLabsCount}
                </div>
              </div>
            </div>
          </div>
        </section>`;

code = code.replace(statsGridRegex, statsGridReplacement.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n'));

fs.writeFileSync(filePath, code, 'utf8');
console.log('dashboard.tsx successfully patched!');

