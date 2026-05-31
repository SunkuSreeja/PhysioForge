const mockExercises = [
  {
    id: 'ex1', name: 'Shoulder Pendulum', category: 'mobility', difficulty: 'easy',
    description: 'Gentle gravity-assisted shoulder movement to restore range of motion.',
    instructions: ['Stand beside table, lean forward 45°','Let arm hang freely','Move in small circles — clockwise 10x','Then counterclockwise 10x','Keep shoulder relaxed, let gravity work'],
    duration: 300, reps: 10, sets: 3, bodyPart: ['shoulder'],
    keyPoints: ['Do not force the movement', 'Keep elbow soft', 'Breathe steadily'],
    painRange: [1, 4], icon: '🔄',
  },
  {
    id: 'ex2', name: 'Hip Flexor Stretch', category: 'flexibility', difficulty: 'easy',
    description: 'Opens hip flexors, reduces lower back tension, improves posture.',
    instructions: ['Kneel on right knee, left foot forward','Push hips forward gently','Keep torso upright, hands on left thigh','Hold 30 seconds each side','Repeat 3 times per side'],
    duration: 240, reps: 3, sets: 2, bodyPart: ['hip', 'lower-back'],
    keyPoints: ['Don\'t arch lower back', 'Keep front knee over ankle', 'Feel stretch in front of hip'],
    painRange: [0, 5], icon: '🦵',
  },
  {
    id: 'ex3', name: 'Quadriceps Strengthening', category: 'strength', difficulty: 'medium',
    description: 'Builds quad strength essential for knee stability and ACL recovery.',
    instructions: ['Sit in chair, feet flat','Slowly straighten one leg','Hold at top for 3 seconds','Lower slowly over 3 seconds','Complete all reps before switching'],
    duration: 480, reps: 15, sets: 3, bodyPart: ['knee', 'thigh'],
    keyPoints: ['Control the descent', 'Do not lock knee at top', 'Keep thigh on chair'],
    painRange: [2, 6], icon: '💪',
  },
  {
    id: 'ex4', name: 'Ankle Circles', category: 'mobility', difficulty: 'easy',
    description: 'Improves ankle mobility and circulation. Good warm-up exercise.',
    instructions: ['Sit or lie down comfortably','Lift one foot slightly off ground','Rotate ankle in large circles','10 clockwise, 10 counter-clockwise','Switch feet and repeat'],
    duration: 180, reps: 10, sets: 2, bodyPart: ['ankle', 'foot'],
    keyPoints: ['Make circles as large as comfortable', 'Move only the ankle', 'Keep leg still'],
    painRange: [0, 3], icon: '⭕',
  },
  {
    id: 'ex5', name: 'Bridge Exercise', category: 'strength', difficulty: 'medium',
    description: 'Activates glutes and core. Essential for hip and lower back rehabilitation.',
    instructions: ['Lie on back, knees bent, feet flat','Press feet into floor','Lift hips until body forms straight line','Hold 3 seconds at top','Lower slowly, repeat'],
    duration: 420, reps: 12, sets: 3, bodyPart: ['hip', 'glutes', 'lower-back'],
    keyPoints: ['Don\'t push lower back into ground', 'Squeeze glutes at top', 'Keep feet hip-width apart'],
    painRange: [1, 5], icon: '🌉',
  },
  {
    id: 'ex6', name: 'Wall Slides', category: 'mobility', difficulty: 'medium',
    description: 'Shoulder blade movement exercise. Improves scapular control and posture.',
    instructions: ['Stand with back against wall','Arms at 90° (goalpost position)','Slowly slide arms up wall','Keep elbows and wrists touching wall','Return slowly to start'],
    duration: 360, reps: 10, sets: 3, bodyPart: ['shoulder', 'upper-back'],
    keyPoints: ['Keep lower back flat against wall', 'Don\'t shrug shoulders', 'Move slowly and controlled'],
    painRange: [2, 6], icon: '🧱',
  },
];

const getExercises = (req, res) => {
  const { category, difficulty } = req.query;
  let exercises = [...mockExercises];
  if (category) exercises = exercises.filter(e => e.category === category);
  if (difficulty) exercises = exercises.filter(e => e.difficulty === difficulty);
  res.json({ success: true, data: exercises });
};

const getExerciseById = (req, res) => {
  const ex = mockExercises.find(e => e.id === req.params.id);
  if (!ex) return res.status(404).json({ success: false, message: 'Exercise not found' });
  res.json({ success: true, data: ex });
};

const getTodayPlan = (req, res) => {
  const plan = {
    date: new Date().toISOString().split('T')[0],
    totalDuration: 28,
    exercises: [
      { ...mockExercises[0], completed: true, postureScore: 88 },
      { ...mockExercises[1], completed: true, postureScore: 92 },
      { ...mockExercises[2], completed: false, postureScore: null },
      { ...mockExercises[3], completed: false, postureScore: null },
    ],
  };
  res.json({ success: true, data: plan });
};

module.exports = { getExercises, getExerciseById, getTodayPlan };
