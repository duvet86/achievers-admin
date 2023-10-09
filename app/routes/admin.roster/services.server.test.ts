import { prisma } from "../../db.server";

import { getStateAsync, terms } from "./services.server";

vi.mock("../../db.server");

const mockPrisma = vi.mocked(prisma, true);

describe("Services", () => {
  it.skip("should return page state", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      {
        firstName: "test_0",
        lastName: "user_0",
        frequencyInDays: null,
        mentorToStudentAssignement: [
          {
            studentId: 164,
            userId: 175,
            student: {
              firstName: "student_1",
              lastName: "student_lastname_1",
            },
          },
          {
            studentId: 169,
            userId: 175,
            student: {
              firstName: "student_6",
              lastName: "student_lastname_6",
            },
          },
          {
            studentId: 170,
            userId: 175,
            student: {
              firstName: "student_7",
              lastName: "student_lastname_7",
            },
          },
          {
            studentId: 175,
            userId: 175,
            student: {
              firstName: "student_12",
              lastName: "student_lastname_12",
            },
          },
        ],
        mentorToStudentSession: [
          {
            attendedOn: new Date("2023-10-21T16:00:00.000Z"),
            studentId: 163,
            userId: 175,
          },
          {
            attendedOn: new Date("2023-10-28T16:00:00.000Z"),
            studentId: 163,
            userId: 175,
          },
          {
            attendedOn: new Date("2023-11-11T16:00:00.000Z"),
            studentId: 163,
            userId: 175,
          },
          {
            attendedOn: new Date("2023-10-28T16:00:00.000Z"),
            studentId: 164,
            userId: 175,
          },
          {
            attendedOn: new Date("2023-10-21T16:00:00.000Z"),
            studentId: 166,
            userId: 175,
          },
          {
            attendedOn: new Date("2023-10-21T16:00:00.000Z"),
            studentId: 172,
            userId: 175,
          },
          {
            attendedOn: new Date("2023-11-25T16:00:00.000Z"),
            studentId: 174,
            userId: 175,
          },
        ],
      },
      {
        firstName: "test_1",
        lastName: "user_1",
        frequencyInDays: null,
        mentorToStudentAssignement: [
          {
            studentId: 164,
            userId: 176,
            student: {
              firstName: "student_1",
              lastName: "student_lastname_1",
            },
          },
          {
            studentId: 166,
            userId: 176,
            student: {
              firstName: "student_3",
              lastName: "student_lastname_3",
            },
          },
          {
            studentId: 167,
            userId: 176,
            student: {
              firstName: "student_4",
              lastName: "student_lastname_4",
            },
          },
          {
            studentId: 178,
            userId: 176,
            student: {
              firstName: "student_15",
              lastName: "student_lastname_15",
            },
          },
        ],
        mentorToStudentSession: [
          {
            attendedOn: new Date("2023-10-14T16:00:00.000Z"),
            studentId: 164,
            userId: 176,
          },
          {
            attendedOn: new Date("2023-10-21T16:00:00.000Z"),
            studentId: 164,
            userId: 176,
          },
        ],
      },
      {
        firstName: "test_2",
        lastName: "user_2",
        frequencyInDays: null,
        mentorToStudentAssignement: [
          {
            studentId: 165,
            userId: 177,
            student: {
              firstName: "student_2",
              lastName: "student_lastname_2",
            },
          },
        ],
        mentorToStudentSession: [],
      },
    ] as any);

    const state = await getStateAsync(1, terms[3]);

    expect(state).toStrictEqual({
      students: [
        {
          mentorId: 0,
          studentId: 164,
          userId: 175,
          student: {
            firstName: "student_1",
            lastName: "student_lastname_1",
          },
        },
        {
          mentorId: 0,
          studentId: 169,
          userId: 175,
          student: {
            firstName: "student_6",
            lastName: "student_lastname_6",
          },
        },
        {
          mentorId: 0,
          studentId: 170,
          userId: 175,
          student: {
            firstName: "student_7",
            lastName: "student_lastname_7",
          },
        },
        {
          mentorId: 0,
          studentId: 175,
          userId: 175,
          student: {
            firstName: "student_12",
            lastName: "student_lastname_12",
          },
        },
        {
          mentorId: 1,
          studentId: 164,
          userId: 176,
          student: {
            firstName: "student_1",
            lastName: "student_lastname_1",
          },
        },
        {
          mentorId: 1,
          studentId: 166,
          userId: 176,
          student: {
            firstName: "student_3",
            lastName: "student_lastname_3",
          },
        },
        {
          mentorId: 1,
          studentId: 167,
          userId: 176,
          student: {
            firstName: "student_4",
            lastName: "student_lastname_4",
          },
        },
        {
          mentorId: 1,
          studentId: 178,
          userId: 176,
          student: {
            firstName: "student_15",
            lastName: "student_lastname_15",
          },
        },
        {
          mentorId: 2,
          studentId: 165,
          userId: 177,
          student: {
            firstName: "student_2",
            lastName: "student_lastname_2",
          },
        },
      ],
      studentsLookup: {
        "164": {
          "2023-10-14T16:00:00.000Z": {
            "175": {
              disabled: true,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: true,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "175": {
              disabled: true,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: true,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: true,
            },
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
            "176": {
              disabled: false,
              checked: false,
            },
          },
        },
        "165": {
          "2023-10-14T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "177": {
              disabled: false,
              checked: false,
            },
          },
        },
        "166": {
          "2023-10-14T16:00:00.000Z": {
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
        },
        "167": {
          "2023-10-14T16:00:00.000Z": {
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
        },
        "169": {
          "2023-10-14T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "175": {
              disabled: true,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
        },
        "170": {
          "2023-10-14T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "175": {
              disabled: true,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
        },
        "175": {
          "2023-10-14T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "175": {
              disabled: true,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "175": {
              disabled: false,
              checked: false,
            },
          },
        },
        "178": {
          "2023-10-14T16:00:00.000Z": {
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-10-21T16:00:00.000Z": {
            "176": {
              disabled: true,
              checked: false,
            },
          },
          "2023-10-28T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-04T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-11T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-18T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-11-25T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-02T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
          "2023-12-09T16:00:00.000Z": {
            "176": {
              disabled: false,
              checked: false,
            },
          },
        },
      },
      mentors: [
        {
          firstName: "test_0",
          lastName: "user_0",
          frequencyInDays: null,
          mentorToStudentAssignement: [
            {
              studentId: 164,
              userId: 175,
              student: {
                firstName: "student_1",
                lastName: "student_lastname_1",
              },
            },
            {
              studentId: 169,
              userId: 175,
              student: {
                firstName: "student_6",
                lastName: "student_lastname_6",
              },
            },
            {
              studentId: 170,
              userId: 175,
              student: {
                firstName: "student_7",
                lastName: "student_lastname_7",
              },
            },
            {
              studentId: 175,
              userId: 175,
              student: {
                firstName: "student_12",
                lastName: "student_lastname_12",
              },
            },
          ],
        },
        {
          firstName: "test_1",
          lastName: "user_1",
          frequencyInDays: null,
          mentorToStudentAssignement: [
            {
              studentId: 164,
              userId: 176,
              student: {
                firstName: "student_1",
                lastName: "student_lastname_1",
              },
            },
            {
              studentId: 166,
              userId: 176,
              student: {
                firstName: "student_3",
                lastName: "student_lastname_3",
              },
            },
            {
              studentId: 167,
              userId: 176,
              student: {
                firstName: "student_4",
                lastName: "student_lastname_4",
              },
            },
            {
              studentId: 178,
              userId: 176,
              student: {
                firstName: "student_15",
                lastName: "student_lastname_15",
              },
            },
          ],
        },
        {
          firstName: "test_2",
          lastName: "user_2",
          frequencyInDays: null,
          mentorToStudentAssignement: [
            {
              studentId: 165,
              userId: 177,
              student: {
                firstName: "student_2",
                lastName: "student_lastname_2",
              },
            },
          ],
        },
      ],
      datesInTerm: [
        "2023-10-14T16:00:00.000Z",
        "2023-10-21T16:00:00.000Z",
        "2023-10-28T16:00:00.000Z",
        "2023-11-04T16:00:00.000Z",
        "2023-11-11T16:00:00.000Z",
        "2023-11-18T16:00:00.000Z",
        "2023-11-25T16:00:00.000Z",
        "2023-12-02T16:00:00.000Z",
        "2023-12-09T16:00:00.000Z",
      ],
    });
  });
});
