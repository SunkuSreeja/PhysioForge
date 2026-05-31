const mockPatients = [
  { id: 'p1', name: 'Priya Singh', age: 34, diagnosis: 'ACL Rehabilitation', adherence: 87, painLevel: 3, recoveryScore: 80, postureAccuracy: 82, lastSession: '2025-05-13', streak: 8, doctor: 'Dr. Arjun Sharma', status: 'On Track', avatar: 'PS' },
  { id: 'p2', name: 'Rajesh Kumar', age: 62, diagnosis: 'Lower Back Pain', adherence: 34, painLevel: 7, recoveryScore: 42, postureAccuracy: 55, lastSession: '2025-05-10', streak: 1, doctor: 'Dr. Arjun Sharma', status: 'At Risk', avatar: 'RK' },
  { id: 'p3', name: 'Sunita Devi', age: 58, diagnosis: 'Post Shoulder Surgery', adherence: 72, painLevel: 5, recoveryScore: 61, postureAccuracy: 68, lastSession: '2025-05-12', streak: 4, doctor: 'Dr. Arjun Sharma', status: 'Monitor', avatar: 'SD' },
  { id: 'p4', name: 'Amit Patel', age: 45, diagnosis: 'Hip Replacement Recovery', adherence: 91, painLevel: 2, recoveryScore: 78, postureAccuracy: 89, lastSession: '2025-05-13', streak: 12, doctor: 'Dr. Arjun Sharma', status: 'On Track', avatar: 'AP' },
  { id: 'p5', name: 'Meera Nair', age: 39, diagnosis: 'Knee Osteoarthritis', adherence: 65, painLevel: 4, recoveryScore: 58, postureAccuracy: 74, lastSession: '2025-05-11', streak: 3, doctor: 'Dr. Arjun Sharma', status: 'Monitor', avatar: 'MN' },
];

const getPatients = (req, res) => {
  res.json({ success: true, data: mockPatients });
};

const getPatientStats = (req, res) => {
  const stats = {
    todayRecoveryScore: 80,
    consistency: 75,
    painLevel: 3,
    sessionsCompleted: 18,
    streak: 8,
    weeklyData: [
      { day: 'Mon', score: 72, pain: 4, sessions: 2 },
      { day: 'Tue', score: 75, pain: 3, sessions: 2 },
      { day: 'Wed', score: 0, pain: 0, sessions: 0 },
      { day: 'Thu', score: 78, pain: 3, sessions: 2 },
      { day: 'Fri', score: 80, pain: 3, sessions: 2 },
      { day: 'Sat', score: 82, pain: 2, sessions: 1 },
      { day: 'Sun', score: 0, pain: 0, sessions: 0 },
    ],
    monthlyPain: [8,7,7,6,6,5,5,4,4,3,3,3,2,3,2,2,2,3,2,2,1,2,2,3,2,2,1,2,2,3],
    monthlyScore: [42,45,50,55,58,60,62,65,67,70,72,74,75,76,78,79,80,81,80,82,83,82,84,83,85,84,86,85,87,88],
    badges: ['Consistent Performer', 'Recovery Champion', '7-Day Warrior'],
    recoveryJourney: [
      { id: 1, label: 'Pain Reduced', status: 'done', date: 'Week 1', icon: '💊' },
      { id: 2, label: 'Mobility Improving', status: 'done', date: 'Week 2', icon: '🦵' },
      { id: 3, label: 'Strength Building', status: 'active', date: 'Week 3 — Now', icon: '💪' },
      { id: 4, label: 'Full Range of Motion', status: 'pending', date: 'Week 4', icon: '🔄' },
      { id: 5, label: 'Final Recovery', status: 'pending', date: 'Week 5–6', icon: '🏁' },
    ],
    wrappedData: {
      sessionsCompleted: 47,
      postureAccuracy: 82,
      painReduction: 62,
      mostImproved: 'Shoulder Pendulum',
      activeDays: 21,
      totalMinutes: 940,
      topExercise: 'Hip Flexor Stretch',
    },
  };
  res.json({ success: true, data: stats });
};

module.exports = { getPatients, getPatientStats };
