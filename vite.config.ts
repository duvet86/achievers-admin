import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
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
          route("/", "routes/_index/route.tsx", { index: true });
          route("admin", "routes/admin/layout.tsx", () => {
            route("home", "routes/admin.home/route.tsx", { index: true });
            route("chapters", "routes/admin.chapters/layout.tsx", () => {
              route("", "routes/admin.chapters._index/route.tsx", {
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
                "routes/admin.chapters.$chapterId_.mentors/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/mentors/:mentorId",
                "routes/admin.chapters.$chapterId_.mentors_.$mentorId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-mentors",
                "routes/admin.chapters.$chapterId_.roster-mentors/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/roster-students",
                "routes/admin.chapters.$chapterId_.roster-students/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/sessions/:attendedOn/new-assignment",
                "routes/admin.chapters.$chapterId_.sessions.$attendedOn.new-assignment/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/sessions/:sessionId/update-assignment",
                "routes/admin.chapters.$chapterId_.sessions.$sessionId.update-assignment/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/students",
                "routes/admin.chapters.$chapterId_.students/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":chapterId/students/:studentId",
                "routes/admin.chapters.$chapterId_.students_.$studentId/route.tsx",
                {
                  index: true,
                },
              );
            });
            route("config", "routes/admin.config/layout.tsx", () => {
              route("", "routes/admin.config._index/route.tsx", {
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
            route("sessions", "routes/admin.sessions/layout.tsx", () => {
              route("", "routes/admin.sessions._index/route.tsx", {
                index: true,
              });
              route(
                ":attendedOn/chapters/:chapterId/mentors/:mentorId/new",
                "routes/admin.sessions.$attendedOn.chapters.$chapterId.mentors.$mentorId.new/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":attendedOn/chapters/:chapterId/students/:studentId/new",
                "routes/admin.sessions.$attendedOn.chapters.$chapterId.students.$studentId.new/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":sessionId",
                "routes/admin.sessions.$sessionId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":sessionId/cancel",
                "routes/admin.sessions.$sessionId_.cancel/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":sessionId/mentors/:mentorId/write-report",
                "routes/admin.sessions.$sessionId_.mentors.$mentorId.write-report/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":sessionId/report",
                "routes/admin.sessions.$sessionId_.report/route.tsx",
                {
                  index: true,
                },
              );
            });
            route("students", "routes/admin.students/layout.tsx", () => {
              route("", "routes/admin.students._index/route.tsx", {
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
                "routes/admin.students.$studentId_.archive/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/guardians/:guardianId",
                "routes/admin.students.$studentId_.guardians.$guardianId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/re-enable",
                "routes/admin.students.$studentId_.re-enable/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":studentId/teachers/:teacherId",
                "routes/admin.students.$studentId_.teachers.$teacherId/route.tsx",
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
              route("", "routes/admin.users._index/route.tsx", {
                index: true,
              });
              route(":userId", "routes/admin.users.$userId/route.tsx", {
                index: true,
              });
              route(
                ":userId/approval-mrc",
                "routes/admin.users.$userId_.approval-mrc/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/archive",
                "routes/admin.users.$userId_.archive/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/eoiProfile",
                "routes/admin.users.$userId_.eoiProfile/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/give-access",
                "routes/admin.users.$userId_.give-access/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/induction",
                "routes/admin.users.$userId_.induction/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/police-check",
                "routes/admin.users.$userId_.police-check/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/re-enable",
                "routes/admin.users.$userId_.re-enable/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/references",
                "routes/admin.users.$userId_.references/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/references/:referenceId",
                "routes/admin.users.$userId_.references_.$referenceId/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/welcomeCall",
                "routes/admin.users.$userId_.welcomeCall/route.tsx",
                {
                  index: true,
                },
              );
              route(
                ":userId/wwc-check",
                "routes/admin.users.$userId_.wwc-check/route.tsx",
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
          });
          route("mentor", "routes/mentor/layout.tsx", () => {
            route("home", "routes/mentor.home/route.tsx", { index: true });
            route("partner", "routes/mentor.partner/route.tsx", {
              index: true,
            });
            route("reports", "routes/mentor.reports/route.tsx", {
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
