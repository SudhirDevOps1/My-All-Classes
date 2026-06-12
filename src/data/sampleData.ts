import { DayData } from '../types';

// Sample data - 4 days of realistic study tracking
// Matches the exact JSON structure from FlowTrack export
// STATUS VALUES: "planned" | "in_progress" | "completed" | "skipped"

export const sampleData: Record<string, DayData> = {
  // ====== DAY 1: 11-06-2026 (Yesterday - All Completed) ======
  '11-06-2026': {
    "app": "FlowTrack",
    "exportedAt": "2026-06-11T18:00:00.000Z",
    "subjects": [
      {
        "id": "ai_ml_001",
        "name": "AI / ML Study",
        "color": "#9C27B0",
        "createdAt": "2026-06-11T07:00:00.000Z"
      },
      {
        "id": "webdev_002",
        "name": "Web Development",
        "color": "#2196F3",
        "createdAt": "2026-06-11T07:00:00.000Z"
      },
      {
        "id": "java_003",
        "name": "Java Programming",
        "color": "#FF5722",
        "createdAt": "2026-06-11T07:00:00.000Z"
      },
      {
        "id": "assignment_004",
        "name": "Assignment / Exam Prep",
        "color": "#F44336",
        "createdAt": "2026-06-11T07:00:00.000Z"
      },
      {
        "id": "english_005",
        "name": "English Language",
        "color": "#00BCD4",
        "createdAt": "2026-06-11T07:00:00.000Z"
      }
    ],
    "sessions": [
      {
        "id": "session_ai_1",
        "subjectId": "ai_ml_001",
        "startTime": "2026-06-11T04:45:00.000Z",
        "endTime": "2026-06-11T06:45:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 7140,
        "colorTag": "#9C27B0",
        "notes": "AI/ML: Neural Networks & backpropagation deep dive",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-11T04:45:00.000Z",
        "updatedAt": "2026-06-11T06:44:30.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_web_1",
        "subjectId": "webdev_002",
        "startTime": "2026-06-11T07:00:00.000Z",
        "endTime": "2026-06-11T09:00:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 6980,
        "colorTag": "#2196F3",
        "notes": "Web Dev: React hooks + custom hook practice",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-11T07:00:00.000Z",
        "updatedAt": "2026-06-11T08:56:20.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_java_1",
        "subjectId": "java_003",
        "startTime": "2026-06-11T09:30:00.000Z",
        "endTime": "2026-06-11T11:30:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 7200,
        "colorTag": "#FF5722",
        "notes": "Java: Collections Framework + Stream API",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-11T09:30:00.000Z",
        "updatedAt": "2026-06-11T11:30:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_eng_1",
        "subjectId": "english_005",
        "startTime": "2026-06-11T11:45:00.000Z",
        "endTime": "2026-06-11T12:45:00.000Z",
        "plannedMinutes": 60,
        "actualSeconds": 3600,
        "colorTag": "#00BCD4",
        "notes": "English: Vocabulary + grammar exercises",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-11T11:45:00.000Z",
        "updatedAt": "2026-06-11T12:45:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_assign_1",
        "subjectId": "assignment_004",
        "startTime": "2026-06-11T12:45:00.000Z",
        "endTime": "2026-06-11T14:45:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 6540,
        "colorTag": "#F44336",
        "notes": "Assignment / Exam Prep: completed DBMS assignment",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-11T12:45:00.000Z",
        "updatedAt": "2026-06-11T14:34:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      }
    ]
  },

  // ====== DAY 2: 12-06-2026 (Today - Mixed statuses, EXACT user JSON) ======
  '12-06-2026': {
    "app": "FlowTrack",
    "exportedAt": "2026-06-12T07:41:07.014Z",
    "subjects": [
      {
        "id": "ai_ml_001",
        "name": "AI / ML Study",
        "color": "#9C27B0",
        "createdAt": "2026-06-12T07:00:00.000Z"
      },
      {
        "id": "webdev_002",
        "name": "Web Development",
        "color": "#2196F3",
        "createdAt": "2026-06-12T07:00:00.000Z"
      },
      {
        "id": "java_003",
        "name": "Java Programming",
        "color": "#FF5722",
        "createdAt": "2026-06-12T07:00:00.000Z"
      },
      {
        "id": "assignment_004",
        "name": "Assignment / Exam Prep",
        "color": "#F44336",
        "createdAt": "2026-06-12T07:00:00.000Z"
      },
      {
        "id": "english_005",
        "name": "English Language",
        "color": "#00BCD4",
        "createdAt": "2026-06-12T07:00:00.000Z"
      }
    ],
    "sessions": [
      {
        "id": "session_assign_1",
        "subjectId": "assignment_004",
        "startTime": "2026-06-12T12:45:00.000Z",
        "endTime": "2026-06-12T14:45:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 0,
        "colorTag": "#F44336",
        "notes": "Assignment / Exam preparation: complete pending tasks (2 hours)",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-12T07:00:00.000Z",
        "updatedAt": "2026-06-12T07:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_eng_1",
        "subjectId": "english_005",
        "startTime": "2026-06-12T11:45:00.000Z",
        "endTime": "2026-06-12T12:45:00.000Z",
        "plannedMinutes": 60,
        "actualSeconds": 66,
        "colorTag": "#00BCD4",
        "notes": "English: vocabulary, grammar, reading comprehension (1 hour)",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-12T07:00:00.000Z",
        "updatedAt": "2026-06-12T07:40:27.749Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_java_1",
        "subjectId": "java_003",
        "startTime": "2026-06-12T09:30:00.000Z",
        "endTime": "2026-06-12T11:30:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 1200,
        "colorTag": "#FF5722",
        "notes": "Java: OOP, DSA, coding problems (2 hours)",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-12T07:00:00.000Z",
        "updatedAt": "2026-06-12T07:40:54.290Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_web_1",
        "subjectId": "webdev_002",
        "startTime": "2026-06-12T07:00:00.000Z",
        "endTime": "2026-06-12T09:00:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 3480,
        "colorTag": "#2196F3",
        "notes": "Web Development: HTML/CSS/JS or framework practice (2 hours)",
        "tags": ["focus"],
        "status": "in_progress",
        "createdAt": "2026-06-12T07:00:00.000Z",
        "updatedAt": "2026-06-12T07:40:35.602Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_ai_1",
        "subjectId": "ai_ml_001",
        "startTime": "2026-06-12T04:45:00.000Z",
        "endTime": "2026-06-12T06:45:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 16,
        "colorTag": "#9C27B0",
        "notes": "AI/ML study: theory + coding practice (2 hours)",
        "tags": ["focus"],
        "status": "completed",
        "createdAt": "2026-06-12T07:00:00.000Z",
        "updatedAt": "2026-06-12T07:39:46.202Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      }
    ]
  },

  // ====== DAY 3: 13-06-2026 (Tomorrow - All Planned) ======
  '13-06-2026': {
    "app": "FlowTrack",
    "exportedAt": "2026-06-13T00:00:00.000Z",
    "subjects": [
      {
        "id": "ai_ml_001",
        "name": "AI / ML Study",
        "color": "#9C27B0",
        "createdAt": "2026-06-13T00:00:00.000Z"
      },
      {
        "id": "webdev_002",
        "name": "Web Development",
        "color": "#2196F3",
        "createdAt": "2026-06-13T00:00:00.000Z"
      },
      {
        "id": "java_003",
        "name": "Java Programming",
        "color": "#FF5722",
        "createdAt": "2026-06-13T00:00:00.000Z"
      },
      {
        "id": "assignment_004",
        "name": "Assignment / Exam Prep",
        "color": "#F44336",
        "createdAt": "2026-06-13T00:00:00.000Z"
      },
      {
        "id": "english_005",
        "name": "English Language",
        "color": "#00BCD4",
        "createdAt": "2026-06-13T00:00:00.000Z"
      }
    ],
    "sessions": [
      {
        "id": "session_ai_3",
        "subjectId": "ai_ml_001",
        "startTime": "2026-06-13T04:45:00.000Z",
        "endTime": "2026-06-13T06:45:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 0,
        "colorTag": "#9C27B0",
        "notes": "AI/ML: Computer Vision with OpenCV + CNN practice",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-13T00:00:00.000Z",
        "updatedAt": "2026-06-13T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_web_3",
        "subjectId": "webdev_002",
        "startTime": "2026-06-13T07:00:00.000Z",
        "endTime": "2026-06-13T09:00:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 0,
        "colorTag": "#2196F3",
        "notes": "Web Dev: Next.js Server Components + routing",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-13T00:00:00.000Z",
        "updatedAt": "2026-06-13T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_java_3",
        "subjectId": "java_003",
        "startTime": "2026-06-13T09:30:00.000Z",
        "endTime": "2026-06-13T11:30:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 0,
        "colorTag": "#FF5722",
        "notes": "Java: Multithreading & Concurrency problems",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-13T00:00:00.000Z",
        "updatedAt": "2026-06-13T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_eng_3",
        "subjectId": "english_005",
        "startTime": "2026-06-13T11:45:00.000Z",
        "endTime": "2026-06-13T12:45:00.000Z",
        "plannedMinutes": 60,
        "actualSeconds": 0,
        "colorTag": "#00BCD4",
        "notes": "English: Essay writing + reading comprehension",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-13T00:00:00.000Z",
        "updatedAt": "2026-06-13T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_assign_3",
        "subjectId": "assignment_004",
        "startTime": "2026-06-13T12:45:00.000Z",
        "endTime": "2026-06-13T14:45:00.000Z",
        "plannedMinutes": 120,
        "actualSeconds": 0,
        "colorTag": "#F44336",
        "notes": "Assignment / Exam Prep: OS & CN revision",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-13T00:00:00.000Z",
        "updatedAt": "2026-06-13T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      }
    ]
  },

  // ====== DAY 4: 14-06-2026 (Day After - All Planned, Weekend Focus) ======
  '14-06-2026': {
    "app": "FlowTrack",
    "exportedAt": "2026-06-14T00:00:00.000Z",
    "subjects": [
      {
        "id": "ai_ml_001",
        "name": "AI / ML Study",
        "color": "#9C27B0",
        "createdAt": "2026-06-14T00:00:00.000Z"
      },
      {
        "id": "webdev_002",
        "name": "Web Development",
        "color": "#2196F3",
        "createdAt": "2026-06-14T00:00:00.000Z"
      },
      {
        "id": "java_003",
        "name": "Java Programming",
        "color": "#FF5722",
        "createdAt": "2026-06-14T00:00:00.000Z"
      },
      {
        "id": "assignment_004",
        "name": "Assignment / Exam Prep",
        "color": "#F44336",
        "createdAt": "2026-06-14T00:00:00.000Z"
      },
      {
        "id": "english_005",
        "name": "English Language",
        "color": "#00BCD4",
        "createdAt": "2026-06-14T00:00:00.000Z"
      }
    ],
    "sessions": [
      {
        "id": "session_ai_4",
        "subjectId": "ai_ml_001",
        "startTime": "2026-06-14T05:00:00.000Z",
        "endTime": "2026-06-14T08:00:00.000Z",
        "plannedMinutes": 180,
        "actualSeconds": 0,
        "colorTag": "#9C27B0",
        "notes": "AI/ML: Deep dive into Transformers & attention mechanism (3 hours)",
        "tags": ["focus", "weekend"],
        "status": "planned",
        "createdAt": "2026-06-14T00:00:00.000Z",
        "updatedAt": "2026-06-14T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_web_4",
        "subjectId": "webdev_002",
        "startTime": "2026-06-14T08:30:00.000Z",
        "endTime": "2026-06-14T11:30:00.000Z",
        "plannedMinutes": 180,
        "actualSeconds": 0,
        "colorTag": "#2196F3",
        "notes": "Web Dev: Full project build - backend + frontend integration (3 hours)",
        "tags": ["focus", "weekend"],
        "status": "planned",
        "createdAt": "2026-06-14T00:00:00.000Z",
        "updatedAt": "2026-06-14T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_java_4",
        "subjectId": "java_003",
        "startTime": "2026-06-14T12:30:00.000Z",
        "endTime": "2026-06-14T15:30:00.000Z",
        "plannedMinutes": 180,
        "actualSeconds": 0,
        "colorTag": "#FF5722",
        "notes": "Java: LeetCode medium problems - Trees & Graphs (3 hours)",
        "tags": ["focus", "weekend"],
        "status": "planned",
        "createdAt": "2026-06-14T00:00:00.000Z",
        "updatedAt": "2026-06-14T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_eng_4",
        "subjectId": "english_005",
        "startTime": "2026-06-14T15:45:00.000Z",
        "endTime": "2026-06-14T17:00:00.000Z",
        "plannedMinutes": 75,
        "actualSeconds": 0,
        "colorTag": "#00BCD4",
        "notes": "English: Advanced vocabulary + IELTS practice",
        "tags": ["focus"],
        "status": "planned",
        "createdAt": "2026-06-14T00:00:00.000Z",
        "updatedAt": "2026-06-14T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      },
      {
        "id": "session_assign_4",
        "subjectId": "assignment_004",
        "startTime": "2026-06-14T17:00:00.000Z",
        "endTime": "2026-06-14T19:30:00.000Z",
        "plannedMinutes": 150,
        "actualSeconds": 0,
        "colorTag": "#F44336",
        "notes": "Assignment / Exam Prep: Weekly revision + mock test",
        "tags": ["focus", "weekend"],
        "status": "planned",
        "createdAt": "2026-06-14T00:00:00.000Z",
        "updatedAt": "2026-06-14T00:00:00.000Z",
        "manualEntry": false,
        "seriesId": null,
        "parentSessionId": null,
        "recurrence": null
      }
    ]
  }
};
