import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/root/route.tsx"),
  route("auth/microsoft/callback", "routes/auth.microsoft.callback.tsx", {
    index: true,
  }),
  layout(
    "routes/chapters.$chapterId.attendances/layout.tsx",
    prefix("chapters/:chapterId/attendances", [
      index("routes/chapters.$chapterId.attendances/route.tsx"),
      route(
        "mentors",
        "routes/chapters.$chapterId.attendances.mentors/route.tsx",
        {
          index: true,
        },
      ),
      route(
        "students",
        "routes/chapters.$chapterId.attendances.students/route.tsx",
        {
          index: true,
        },
      ),
    ]),
  ),
  layout(
    "routes/admin/layout.tsx",
    prefix("admin", [
      route("home", "routes/admin.home/route.tsx", { index: true }),
      ...prefix("chapters", [
        index("routes/admin.chapters/route.tsx"),
        route(":chapterId", "routes/admin.chapters.$chapterId/route.tsx", {
          index: true,
        }),
        route(
          ":chapterId/mentors",
          "routes/admin.chapters.$chapterId.mentors/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/mentors/:mentorId",
          "routes/admin.chapters.$chapterId.mentors.$mentorId/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-mentors",
          "routes/admin.chapters.$chapterId.roster-mentors/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-mentors/export",
          "routes/admin.chapters.$chapterId.roster-mentors.export/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-mentors/mentor-sessions/:mentorSessionId",
          "routes/admin.chapters.$chapterId.roster-mentors.mentor-sessions.$mentorSessionId/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-mentors/:mentorId/attended-on/:attendedOn/new",
          "routes/admin.chapters.$chapterId.roster-mentors.$mentorId.attended-on.$attendedOn.new/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-students",
          "routes/admin.chapters.$chapterId.roster-students/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-students/:studentId/attended-on/:attendedOn/new",
          "routes/admin.chapters.$chapterId.roster-students.$studentId.attended-on.$attendedOn.new/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-students/:studentId/attended-on/:attendedOn/unavailable",
          "routes/admin.chapters.$chapterId.roster-students.$studentId.attended-on.$attendedOn.unavailable/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-students/export",
          "routes/admin.chapters.$chapterId.roster-students.export/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/roster-students/student-sessions/:studentSessionId",
          "routes/admin.chapters.$chapterId.roster-students.student-sessions.$studentSessionId/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/students",
          "routes/admin.chapters.$chapterId.students/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/students/:studentId",
          "routes/admin.chapters.$chapterId.students.$studentId/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/attendances/mentors",
          "routes/admin.chapters.$chapterId.attendances.mentors/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":chapterId/attendances/students",
          "routes/admin.chapters.$chapterId.attendances.students/route.tsx",
          {
            index: true,
          },
        ),
      ]),
      ...prefix("config", [
        layout("routes/admin.config/layout.tsx", [
          index("routes/admin.config/route.tsx"),
          route(
            "email-reminders-police-check",
            "routes/admin.config.email-reminders-police-check/route.tsx",
            {
              index: true,
            },
          ),
          route(
            "email-reminders-wwc",
            "routes/admin.config.email-reminders-wwc/route.tsx",
            {
              index: true,
            },
          ),
        ]),
      ]),
      route(
        "school-terms/:year?",
        "routes/admin.school-terms.($year)/route.tsx",
        {
          index: true,
        },
      ),
      route("school-terms/new", "routes/admin.school-terms.new/route.tsx", {
        index: true,
      }),
      ...prefix("sessions", [
        layout("routes/admin.sessions/layout.tsx", [
          index("routes/admin.sessions/route.tsx"),
          route(":sessionId", "routes/admin.sessions.$sessionId/route.tsx", {
            index: true,
          }),
          route(
            ":sessionId/write-report",
            "routes/admin.sessions.$sessionId.write-report/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":sessionId/report",
            "routes/admin.sessions.$sessionId.report/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":sessionId/cancel",
            "routes/admin.sessions.$sessionId.cancel/route.tsx",
            {
              index: true,
            },
          ),
        ]),
      ]),
      ...prefix("goals", [
        layout("routes/admin.goals/layout.tsx", [
          index("routes/admin.goals/route.tsx"),
          route(":goalId", "routes/admin.goals.$goalId/route.tsx", {
            index: true,
          }),
        ]),
      ]),
      ...prefix("students", [
        layout("routes/admin.students/layout.tsx", [
          index("routes/admin.students/route.tsx"),
          route(":studentId", "routes/admin.students.$studentId/route.tsx", {
            index: true,
          }),
          route(
            ":studentId/archive",
            "routes/admin.students.$studentId.archive/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":studentId/guardians/:guardianId",
            "routes/admin.students.$studentId.guardians.$guardianId/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":studentId/re-enable",
            "routes/admin.students.$studentId.re-enable/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":studentId/teachers/:teacherId",
            "routes/admin.students.$studentId.teachers.$teacherId/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":studentId/school-reports",
            "routes/admin.students.$studentId.school-reports/route.tsx",
            {
              index: true,
            },
          ),
          route("export", "routes/admin.students.export/route.tsx", {
            index: true,
          }),
          route("import", "routes/admin.students.import/route.tsx", {
            index: true,
          }),
          route(
            "import-history",
            "routes/admin.students.import-history/route.tsx",
            {
              index: true,
            },
          ),
          route("eois", "routes/admin.students.eois/route.tsx", {
            index: true,
          }),
          route("eois/:eoiId", "routes/admin.students.eois.$eoiId/route.tsx", {
            index: true,
          }),
          route(
            "eois/:eoiId/teachers/:teacherId",
            "routes/admin.students.eois.$eoiId.teachers.$teacherId/route.tsx",
            {
              index: true,
            },
          ),
          route(
            "eois/:eoiId/guardians/:guardianId",
            "routes/admin.students.eois.$eoiId.guardians.$guardianId/route.tsx",
            {
              index: true,
            },
          ),
          route(
            "eois/:eoiId/promote",
            "routes/admin.students.eois.$eoiId.promote/route.tsx",
            {
              index: true,
            },
          ),
        ]),
      ]),
      ...prefix("users", [
        layout("routes/admin.users/layout.tsx", [
          index("routes/admin.users/route.tsx"),
          route(":userId", "routes/admin.users.$userId/route.tsx", {
            index: true,
          }),
          route(
            ":userId/approval-mrc",
            "routes/admin.users.$userId.approval-mrc/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/archive",
            "routes/admin.users.$userId.archive/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/eoiProfile",
            "routes/admin.users.$userId.eoiProfile/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/give-access",
            "routes/admin.users.$userId.give-access/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/remove-access",
            "routes/admin.users.$userId.remove-access/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/induction",
            "routes/admin.users.$userId.induction/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/police-check",
            "routes/admin.users.$userId.police-check/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/re-enable",
            "routes/admin.users.$userId.re-enable/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/references",
            "routes/admin.users.$userId.references/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/references/:referenceId",
            "routes/admin.users.$userId.references.$referenceId/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/welcomeCall",
            "routes/admin.users.$userId.welcomeCall/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/wwc-check",
            "routes/admin.users.$userId.wwc-check/route.tsx",
            {
              index: true,
            },
          ),
          route(
            ":userId/end-reason",
            "routes/admin.users.$userId.end-reason/route.tsx",
            {
              index: true,
            },
          ),
          route("export", "routes/admin.users.export/route.tsx", {
            index: true,
          }),
          route("import", "routes/admin.users.import/route.tsx", {
            index: true,
          }),
          route(
            "import-history",
            "routes/admin.users.import-history/route.tsx",
            {
              index: true,
            },
          ),
        ]),
      ]),
      ...prefix("permissions", [
        layout("routes/admin.permissions/layout.tsx", [
          index("routes/admin.permissions/route.tsx"),
        ]),
      ]),
    ]),
  ),
  layout(
    "routes/mentor/layout.tsx",
    prefix("mentor", [
      route("home", "routes/mentor.home/route.tsx", { index: true }),
      route("partners", "routes/mentor.partners/route.tsx", {
        index: true,
      }),
      route("sessions", "routes/mentor.sessions/route.tsx", {
        index: true,
      }),
      route(
        "sessions/:sessionId",
        "routes/mentor.sessions.$sessionId/route.tsx",
        {
          index: true,
        },
      ),
      route("write-report", "routes/mentor.write-report/route.tsx", {
        index: true,
      }),
      route("roster", "routes/mentor.roster/route.tsx", {
        index: true,
      }),
      ...prefix("students", [
        index("routes/mentor.students/route.tsx"),
        route(
          ":studentId/goals",
          "routes/mentor.students.$studentId.goals/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":studentId/goals/:goalId",
          "routes/mentor.students.$studentId.goals.$goalId/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":studentId/school-reports",
          "routes/mentor.students.$studentId.school-reports/route.tsx",
          {
            index: true,
          },
        ),
        route(
          ":studentId/report-to-admin",
          "routes/mentor.students.$studentId.report-to-admin/route.tsx",
          {
            index: true,
          },
        ),
      ]),
      route("useful-resources", "routes/mentor.useful-resources/route.tsx", {
        index: true,
      }),
    ]),
  ),
  route("volunteer-agreement", "routes/volunteer-agreement/route.tsx", {
    index: true,
  }),
  route("403", "routes/403.tsx", {
    index: true,
  }),
  route("healthcheck", "routes/healthcheck.tsx", {
    index: true,
  }),
  route("logout", "routes/logout.tsx", {
    index: true,
  }),
  route("report-error", "routes/report-error/route.tsx", {
    index: true,
  }),
] satisfies RouteConfig;
