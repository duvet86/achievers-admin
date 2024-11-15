import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: !process.env.CI,
        v3_singleFetch: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route(
            "auth/microsoft/callback",
            "routes/auth.microsoft.callback.tsx",
            {
              index: true,
            },
          );
          route("auth/microsoft", "routes/auth.microsoft.tsx", {
            index: true,
          });
          route(
            "chapters/:chapterId/attendances",
            "routes/chapters.$chapterId.attendances/route.tsx",
            {
              index: true,
            },
          );
          route("/", "routes/root/route.tsx", { index: true });
          route("admin", "routes/admin/layout.tsx", () => {
            route("home", "routes/admin.home/route.tsx", { index: true });
            route("chapters", "routes/admin.chapters/layout.tsx", () => {
              route("", "routes/admin.chapters/route.tsx", {
                index: true,
              });
              route(
                ":chapterId",
                "routes/admin.chapters.$chapterId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/mentors",
                "routes/admin.chapters.$chapterId.mentors/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/mentors/:mentorId",
                "routes/admin.chapters.$chapterId.mentors.$mentorId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-mentors",
                "routes/admin.chapters.$chapterId.roster-mentors/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-mentors/sessions/:sessionId",
                "routes/admin.chapters.$chapterId.roster-mentors.sessions.$sessionId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-mentors/:mentorId/attended-on/:attendedOn/new",
                "routes/admin.chapters.$chapterId.roster-mentors.$mentorId.attended-on.$attendedOn.new/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-students",
                "routes/admin.chapters.$chapterId.roster-students/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-students/:studentId/attended-on/:attendedOn/new",
                "routes/admin.chapters.$chapterId.roster-students.$studentId.attended-on.$attendedOn.new/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/students",
                "routes/admin.chapters.$chapterId.students/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/students/:studentId",
                "routes/admin.chapters.$chapterId.students.$studentId/route.tsx",
                {
                  index: true,
                },
              );
            });
            route("config", "routes/admin.config/layout.tsx", () => {
              route("", "routes/admin.config/route.tsx", {
                index: true,
              });
              route(
                "email-reminders-police-check",
                "routes/admin.config.email-reminders-police-check/route.tsx",
                {
                  index: true,
                },
              );
              route(
                "email-reminders-wwc",
                "routes/admin.config.email-reminders-wwc/route.tsx",
                {
                  index: true,
                },
              );
            });
            route(
              "school-terms/:year?",
              "routes/admin.school-terms.($year)/route.tsx",
              {
                index: true,
              },
            );
            route(
              "school-terms/new",
              "routes/admin.school-terms.new/route.tsx",
              {
                index: true,
              },
            );
            route(
              "student-sessions",
              "routes/admin.student-sessions/layout.tsx",
              () => {
                route("", "routes/admin.student-sessions/route.tsx", {
                  index: true,
                });
                route(
                  ":studentSessionId",
                  "routes/admin.student-sessions.$studentSessionId/route.tsx",
                  {
                    index: true,
                  },
                );
                route(
                  ":studentSessionId/mentors/:mentorId/write-report",
                  "routes/admin.student-sessions.$studentSessionId.mentors.$mentorId.write-report/route.tsx",
                  {
                    index: true,
                  },
                );
                route(
                  ":studentSessionId/report",
                  "routes/admin.student-sessions.$studentSessionId.report/route.tsx",
                  {
                    index: true,
                  },
                );
                route(
                  ":studentSessionId/remove",
                  "routes/admin.student-sessions.$studentSessionId.remove/route.tsx",
                  {
                    index: true,
                  },
                );
              },
            );
            route("students", "routes/admin.students/layout.tsx", () => {
              route("", "routes/admin.students/route.tsx", {
                index: true,
              });
              route(
                ":studentId",
                "routes/admin.students.$studentId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/archive",
                "routes/admin.students.$studentId.archive/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/guardians/:guardianId",
                "routes/admin.students.$studentId.guardians.$guardianId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/re-enable",
                "routes/admin.students.$studentId.re-enable/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/teachers/:teacherId",
                "routes/admin.students.$studentId.teachers.$teacherId/route.tsx",
                {
                  index: true,
                },
              );
              route("export", "routes/admin.students.export/route.tsx", {
                index: true,
              });
              route("import", "routes/admin.students.import/route.tsx", {
                index: true,
              });
              route(
                "import-history",
                "routes/admin.students.import-history/route.tsx",
                {
                  index: true,
                },
              );
            });
            route("users", "routes/admin.users/layout.tsx", () => {
              route("", "routes/admin.users/route.tsx", {
                index: true,
              });
              route(":userId", "routes/admin.users.$userId/route.tsx", {
                index: true,
              });
              route(
                ":userId/approval-mrc",
                "routes/admin.users.$userId.approval-mrc/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/archive",
                "routes/admin.users.$userId.archive/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/eoiProfile",
                "routes/admin.users.$userId.eoiProfile/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/give-access",
                "routes/admin.users.$userId.give-access/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/induction",
                "routes/admin.users.$userId.induction/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/police-check",
                "routes/admin.users.$userId.police-check/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/re-enable",
                "routes/admin.users.$userId.re-enable/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/references",
                "routes/admin.users.$userId.references/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/references/:referenceId",
                "routes/admin.users.$userId.references.$referenceId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/welcomeCall",
                "routes/admin.users.$userId.welcomeCall/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/wwc-check",
                "routes/admin.users.$userId.wwc-check/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/end-reason",
                "routes/admin.users.$userId.end-reason/route.tsx",
                {
                  index: true,
                },
              );
              route("export", "routes/admin.users.export/route.tsx", {
                index: true,
              });
              route("import", "routes/admin.users.import/route.tsx", {
                index: true,
              });
              route(
                "import-history",
                "routes/admin.users.import-history/route.tsx",
                {
                  index: true,
                },
              );
            });
            route("permissions", "routes/admin.permissions/layout.tsx", () => {
              route("", "routes/admin.permissions/route.tsx", {
                index: true,
              });
              route("add-user", "routes/admin.permissions.add-user/route.tsx", {
                index: true,
              });
            });
          });
          route("mentor", "routes/mentor/layout.tsx", () => {
            route("home", "routes/mentor.home/route.tsx", { index: true });
            route("partners", "routes/mentor.partners/route.tsx", {
              index: true,
            });
            route(
              "student-sessions",
              "routes/mentor.student-sessions/route.tsx",
              {
                index: true,
              },
            );
            route(
              "student-sessions/:studentSessionId",
              "routes/mentor.student-sessions.$studentSessionId/route.tsx",
              {
                index: true,
              },
            );
            route("write-report", "routes/mentor.write-report/route.tsx", {
              index: true,
            });
            route("roster", "routes/mentor.roster/route.tsx", {
              index: true,
            });
            route("students", "routes/mentor.students/route.tsx", {
              index: true,
            });
            route(
              "useful-resources",
              "routes/mentor.useful-resources/route.tsx",
              {
                index: true,
              },
            );
          });
          route("volunteer-agreement", "routes/volunteer-agreement/route.tsx", {
            index: true,
          });
          route("403", "routes/403.tsx", {
            index: true,
          });
          route("error", "routes/error.tsx", {
            index: true,
          });
          route("healthcheck", "routes/healthcheck.tsx", {
            index: true,
          });
          route("logout", "routes/logout.tsx", {
            index: true,
          });
        });
      },
    }),
    tsconfigPaths(),
  ],
});
