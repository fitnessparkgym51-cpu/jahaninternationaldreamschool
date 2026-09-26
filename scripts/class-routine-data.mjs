/**
 * Weekly timetable data for every class, transcribed from JIDS/classroutine.html.
 *
 * DEVELOPMENT ONLY. This is the initial content that `seed-class-routine.mjs`
 * uploads to Sanity. The website never imports it: once seeded, the timetable
 * lives in Sanity and is edited in the Studio.
 *
 * Assembly and break rows are deliberately absent. Those slots carry a `kind` on
 * the page and render their own label, so storing them thirteen times here would
 * be data the school has to keep in sync by hand.
 *
 * Run `node scripts/seed-class-routine.mjs` after `node scripts/seed-academics.mjs`,
 * because every routine references a Class document that the Academics seed creates.
 */
export const CLASS_ROUTINES = [
  {
    _id: 'class-routine-play',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-play-group',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 12:30 PM',
    sortOrder: 10,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Play Activity', 'Circle Time', 'Play Activity', 'Circle Time', 'Play Activity']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['Story Time', 'Play Activity', 'Rhymes', 'Play Activity', 'Craft']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Snack & Play', 'Play Activity', 'Music', 'Play Activity', 'Music']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Colouring', 'Play Activity', 'Colouring', 'Play Activity', 'Colouring']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['Story Time', 'Free Play', 'Story Time', 'Free Play', 'Show & Tell']},
    ],
  },
  {
    _id: 'class-routine-nursery',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-nursery',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 12:30 PM',
    sortOrder: 20,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Learning Through Play', 'Play', 'Learning Through Play', 'Rhymes', 'Play']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['Story Time', 'Art', 'Play', 'Craft', 'Music']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Play', 'Language', 'Play', 'Language', 'Play']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Colouring', 'Clay Activity', 'Play', 'Colouring', 'Clay Activity']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['Play', 'Songs', 'Play', 'Show & Tell', 'Play']},
    ],
  },
  {
    _id: 'class-routine-kg',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-kg',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 1:15 PM',
    sortOrder: 30,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'English', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Play & Activity', 'EVS', 'Play & Activity', 'EVS', 'Play & Activity']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Art', 'Music', 'Physical Ed.', 'Art', 'Music']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT Intro', 'Religion', 'Activity', 'ICT Intro', 'Religion']},
    ],
  },
  {
    _id: 'class-routine-c1',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-1',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 40,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Bangla', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'EVS', 'English', 'EVS', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Art', 'Physical Ed.', 'Music', 'Art', 'Music']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['Religion', 'ICT', 'EVS', 'ICT', 'Religion']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Free Play', 'Free Play', 'Free Play', 'Free Play', 'Free Play']},
    ],
  },
  {
    _id: 'class-routine-c2',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-2',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 50,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['English', 'Bangla', 'English', 'Bangla', 'English']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['Bangla', 'English', 'Maths', 'English', 'Bangla']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'EVS', 'Maths', 'EVS', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Art', 'Music', 'Physical Ed.', 'Music', 'Art']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'ICT', 'Religion', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Library', 'Library', 'Library', 'Library', 'Library']},
    ],
  },
  {
    _id: 'class-routine-c3',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-3',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 60,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'English', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Science', 'EVS', 'Science', 'EVS']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Science', 'Social Studies', 'Science', 'Social Studies', 'Science']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Music', 'ICT', 'Religion']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Physical Ed.', 'Library', 'Physical Ed.', 'Library', 'Physical Ed.']},
    ],
  },
  {
    _id: 'class-routine-c4',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-4',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 70,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Science', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Science', 'Social Studies', 'Science', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Social Studies', 'ICT', 'Science', 'Social Studies', 'ICT']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['Religion', 'Art', 'Physical Ed.', 'Music', 'Religion']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Computer Lab', 'Library', 'Computer Lab', 'Library', 'Computer Lab']},
    ],
  },
  {
    _id: 'class-routine-c5',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-5',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 80,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Science', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Science', 'Social Studies', 'Science', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['History', 'Geography', 'History', 'Geography', 'History']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Physical Ed.', 'Art', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Library', 'Music', 'Library', 'Music', 'Library']},
    ],
  },
  {
    _id: 'class-routine-c6',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-6',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 90,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Science', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Science', 'History', 'Science', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Geography', 'Social Studies', 'Geography', 'Social Studies', 'Geography']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Art', 'Physical Ed.', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Library', 'Computer Lab', 'Library', 'Computer Lab', 'Library']},
    ],
  },
  {
    _id: 'class-routine-c7',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-7',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:00 PM',
    sortOrder: 100,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Science', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Science', 'Geography', 'Science', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['History', 'Civics', 'History', 'Civics', 'History']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Physical Ed.', 'Music', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Computer Lab', 'Library', 'Computer Lab', 'Library', 'Computer Lab']},
    ],
  },
  {
    _id: 'class-routine-c8',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-8',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:15 PM',
    sortOrder: 110,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Higher Math', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Physics', 'Chemistry', 'Physics', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Biology', 'Social Studies', 'Biology', 'Social Studies', 'Biology']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Physical Ed.', 'Art', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Computer Lab', 'Library', 'Computer Lab', 'Library', 'Computer Lab']},
    ],
  },
  {
    _id: 'class-routine-c9',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-9',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:15 PM',
    sortOrder: 120,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Higher Math', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Physics', 'Chemistry', 'Physics', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Biology', 'History', 'Geography', 'Civics', 'Biology']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Physical Ed.', 'Music', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Computer Lab', 'Library', 'Computer Lab', 'Library', 'Computer Lab']},
    ],
  },
  {
    _id: 'class-routine-c10',
    _type: 'classRoutine',
    classLevel: {
      _type: 'reference',
      _ref: 'class-class-10',
      _weak: false,
      _strengthenOnPublish: {type: 'classLevel'},
    },
    session: 'Morning Session: 8:00 AM – 2:15 PM',
    sortOrder: 130,
    isVisible: true,
    rows: [
      {_key: 'period-1', _type: 'classRoutineRow', slotKey: 'period-1', cells: ['Bangla', 'English', 'Bangla', 'English', 'Bangla']},
      {_key: 'period-2', _type: 'classRoutineRow', slotKey: 'period-2', cells: ['English', 'Maths', 'Higher Math', 'Maths', 'English']},
      {_key: 'period-3', _type: 'classRoutineRow', slotKey: 'period-3', cells: ['Maths', 'Physics', 'Chemistry', 'Physics', 'Maths']},
      {_key: 'period-4', _type: 'classRoutineRow', slotKey: 'period-4', cells: ['Biology', 'History', 'Geography', 'Civics', 'Biology']},
      {_key: 'period-5', _type: 'classRoutineRow', slotKey: 'period-5', cells: ['ICT', 'Religion', 'Physical Ed.', 'Art', 'ICT']},
      {_key: 'period-6', _type: 'classRoutineRow', slotKey: 'period-6', cells: ['Computer Lab', 'Library', 'Computer Lab', 'Library', 'Computer Lab']},
    ],
  },
]

export const ROUTINE_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday"]

export const ROUTINE_SLOTS = [
  {
    "key": "assembly",
    "time": "8:00 – 8:30",
    "label": "Assembly",
    "kind": "all"
  },
  {
    "key": "period-1",
    "time": "8:30 – 9:15",
    "label": "Period 1",
    "kind": "lesson"
  },
  {
    "key": "period-2",
    "time": "9:15 – 10:00",
    "label": "Period 2",
    "kind": "lesson"
  },
  {
    "key": "break-1",
    "time": "10:00 – 10:30",
    "label": "Break",
    "kind": "break"
  },
  {
    "key": "period-3",
    "time": "10:30 – 11:15",
    "label": "Period 3",
    "kind": "lesson"
  },
  {
    "key": "period-4",
    "time": "11:15 – 12:00",
    "label": "Period 4",
    "kind": "lesson"
  },
  {
    "key": "lunch",
    "time": "12:00 – 12:30",
    "label": "Lunch",
    "kind": "break"
  },
  {
    "key": "period-5",
    "time": "12:30 – 1:15",
    "label": "Period 5",
    "kind": "lesson"
  },
  {
    "key": "period-6",
    "time": "1:15 – 2:00",
    "label": "Period 6",
    "kind": "lesson"
  }
]
