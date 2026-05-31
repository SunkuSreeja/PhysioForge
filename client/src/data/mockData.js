export const mockExercises = [
  { id:'ex1', name:'Shoulder Pendulum', category:'mobility', difficulty:'easy', duration:300, reps:10, sets:3, bodyPart:['shoulder'], icon:'🔄', description:'Gentle gravity-assisted shoulder movement to restore range of motion.', instructions:['Stand beside table, lean forward 45°','Let arm hang freely','Move in small circles — clockwise 10x','Then counterclockwise 10x'], keyPoints:["Don't force the movement",'Keep elbow soft'], completed:true, postureScore:88 },
  { id:'ex2', name:'Hip Flexor Stretch', category:'flexibility', difficulty:'easy', duration:240, reps:3, sets:2, bodyPart:['hip'], icon:'🦵', description:'Opens hip flexors, reduces lower back tension, improves posture.', instructions:['Kneel on right knee','Left foot forward','Push hips gently forward','Hold 30 seconds each side'], keyPoints:["Don't arch lower back",'Keep front knee over ankle'], completed:true, postureScore:92 },
  { id:'ex3', name:'Quadriceps Strengthening', category:'strength', difficulty:'medium', duration:480, reps:15, sets:3, bodyPart:['knee'], icon:'💪', description:'Builds quad strength essential for knee stability.', instructions:['Sit in chair, feet flat','Slowly straighten one leg','Hold 3 seconds','Lower slowly'], keyPoints:['Control the descent','Do not lock knee'], completed:false, postureScore:null },
  { id:'ex4', name:'Ankle Circles', category:'mobility', difficulty:'easy', duration:180, reps:10, sets:2, bodyPart:['ankle'], icon:'⭕', description:'Improves ankle mobility and circulation.', instructions:['Sit comfortably','Lift one foot','Rotate in large circles','10 each direction'], keyPoints:['Keep leg still','Move only the ankle'], completed:false, postureScore:null },
  { id:'ex5', name:'Bridge Exercise', category:'strength', difficulty:'medium', duration:420, reps:12, sets:3, bodyPart:['hip','glutes'], icon:'🌉', description:'Activates glutes and core. Essential for hip rehabilitation.', instructions:['Lie on back, knees bent','Press feet into floor','Lift hips until body is straight','Hold 3 seconds, lower slowly'], keyPoints:['Squeeze glutes at top','Keep feet hip-width'], completed:false, postureScore:null },
  { id:'ex6', name:'Wall Slides', category:'mobility', difficulty:'medium', duration:360, reps:10, sets:3, bodyPart:['shoulder'], icon:'🧱', description:'Improves scapular control and posture.', instructions:['Stand back against wall','Arms in goalpost position','Slide arms up wall slowly','Keep elbows/wrists touching wall'], keyPoints:['Keep lower back flat','Move slowly'], completed:false, postureScore:null },
]

export const mockPatients = [
  { id:'p1', name:'Priya Singh', age:34, diagnosis:'ACL Rehabilitation', adherence:87, painLevel:3, recoveryScore:80, postureAccuracy:82, lastSession:'Today', streak:8, status:'On Track', avatar:'PS', doctor:'Dr. Arjun Sharma' },
  { id:'p2', name:'Rajesh Kumar', age:62, diagnosis:'Lower Back Pain', adherence:34, painLevel:7, recoveryScore:42, postureAccuracy:55, lastSession:'3 days ago', streak:1, status:'At Risk', avatar:'RK', doctor:'Dr. Arjun Sharma' },
  { id:'p3', name:'Sunita Devi', age:58, diagnosis:'Post Shoulder Surgery', adherence:72, painLevel:5, recoveryScore:61, postureAccuracy:68, lastSession:'Yesterday', streak:4, status:'Monitor', avatar:'SD', doctor:'Dr. Arjun Sharma' },
  { id:'p4', name:'Amit Patel', age:45, diagnosis:'Hip Replacement Recovery', adherence:91, painLevel:2, recoveryScore:78, postureAccuracy:89, lastSession:'Today', streak:12, status:'On Track', avatar:'AP', doctor:'Dr. Arjun Sharma' },
  { id:'p5', name:'Meera Nair', age:39, diagnosis:'Knee Osteoarthritis', adherence:65, painLevel:4, recoveryScore:58, postureAccuracy:74, lastSession:'2 days ago', streak:3, status:'Monitor', avatar:'MN', doctor:'Dr. Arjun Sharma' },
]

export const mockAlerts = [
  { patient:'Rajesh Kumar', type:'missed', message:'Missed 3 consecutive sessions', severity:'high', time:'2h ago' },
  { patient:'Sunita Devi', type:'pain', message:'Reported pain spike — 8/10', severity:'high', time:'4h ago' },
  { patient:'Meera Nair', type:'posture', message:'Posture accuracy dropped to 42%', severity:'medium', time:'1d ago' },
]

export const mockAppointments = [
  { id:'a1', patient:'Priya Singh', doctor:'Dr. Arjun Sharma', date:'Today', time:'2:00 PM', type:'video', status:'confirmed', topic:'ACL Progress Review' },
  { id:'a2', patient:'Meera Nair', doctor:'Dr. Arjun Sharma', date:'Today', time:'4:30 PM', type:'in-person', status:'confirmed', topic:'Knee Assessment' },
  { id:'a3', patient:'Amit Patel', doctor:'Dr. Arjun Sharma', date:'Tomorrow', time:'10:00 AM', type:'video', status:'pending', topic:'Monthly Check-in' },
]

export const weeklyData = [
  { day:'Mon', score:72, pain:4, sessions:2 },
  { day:'Tue', score:75, pain:3, sessions:2 },
  { day:'Wed', score:0, pain:0, sessions:0 },
  { day:'Thu', score:78, pain:3, sessions:2 },
  { day:'Fri', score:80, pain:3, sessions:2 },
  { day:'Sat', score:82, pain:2, sessions:1 },
  { day:'Sun', score:0, pain:0, sessions:0 },
]

export const recoveryJourney = [
  { id:1, label:'Pain Reduced', status:'done', date:'Week 1', icon:'💊', desc:'Initial pain levels dropped from 8/10 to 4/10' },
  { id:2, label:'Mobility Improving', status:'done', date:'Week 2', icon:'🦵', desc:'Range of motion increased by 35%' },
  { id:3, label:'Strength Building', status:'active', date:'Week 3 — Now', icon:'💪', desc:'Quadriceps strength at 68% of target' },
  { id:4, label:'Full Range of Motion', status:'pending', date:'Week 4', icon:'🔄', desc:'Target: 130° flexion' },
  { id:5, label:'Final Recovery', status:'pending', date:'Week 5–6', icon:'🏁', desc:'Return to normal daily activities' },
]

export const feedCards = [
  { id:1, type:'tip', icon:'📐', title:'The 90-90 Rule', body:'Knees, hips, and elbows at 90° when seated reduces spinal load by 40%. This single change can prevent back pain from worsening during recovery.', tag:'Posture Tips', color:'teal', readTime:'2 min' },
  { id:2, type:'mistake', icon:'⚠️', title:"Don't Lock Your Knees", body:'Hyperextending during standing exercises damages ligaments. Keep a micro-bend at all times. This mistake causes 1 in 3 rehab setbacks.', tag:'Common Mistakes', color:'red', readTime:'1 min' },
  { id:3, type:'science', icon:'💤', title:'Why Rest Days Matter', body:"Muscle repair happens during sleep, not exercise. Skipping rest days reduces recovery speed by 34% and significantly increases re-injury risk.", tag:'Recovery Science', color:'blue', readTime:'3 min' },
  { id:4, type:'guide', icon:'🧊', title:'Ice vs Heat: When to Use', body:'Acute injury (0–72h): ice 15 min. Chronic stiffness: heat 20 min. Using the wrong one can increase swelling 2×. Ask your PhysioAI for guidance.', tag:'Pain Management', color:'amber', readTime:'2 min' },
  { id:5, type:'story', icon:'🏆', title:"Ramesh's Comeback", body:"After his hip replacement at 58, Ramesh was walking 5km in just 6 weeks using PhysioForge. 'The AI caught every mistake I was making,' he says.", tag:'Success Stories', color:'green', readTime:'3 min' },
  { id:6, type:'tip', icon:'📱', title:'Screen at Eye Level', body:"Looking down at a phone 6h/day adds 27kg of pressure on your cervical spine. During recovery, raise your screen — it's a simple habit with huge impact.", tag:'Posture Tips', color:'purple', readTime:'1 min' },
]

export const wrappedData = {
  sessionsCompleted: 47, postureAccuracy: 82, painReduction: 62,
  mostImproved: 'Shoulder Pendulum', activeDays: 21, totalMinutes: 940,
  topExercise: 'Hip Flexor Stretch', badges: ['Consistent Performer','Recovery Champion','7-Day Warrior'],
  monthlyScore: [42,45,50,55,58,60,62,65,67,70,72,74,75,76,78,79,80,81,80,82,83,82,84,83,85,84,86,85,87,88],
  painTrend: [8,7,7,6,6,5,5,4,4,3,3,3,2,3,2,2,2,3,2,2,1,2,2,3,2,2,1,2,2,3],
}

export const testimonials = [
  { name:'Priya Singh', age:34, city:'Bengaluru', recovery:'ACL Rehabilitation', quote:'PhysioForge caught my wrong knee angle every session. My doctor said my recovery is 3 weeks ahead of schedule!', rating:5, avatar:'PS' },
  { name:'Rajesh Kumar', age:62, city:'Varanasi', recovery:'Lower Back Pain', quote:'The voice guide in Hindi made it so easy. I do my exercises every morning now without needing my son to help.', rating:5, avatar:'RK' },
  { name:'Dr. Ananya Mehta', age:41, city:'Mumbai', recovery:'Physiotherapist', quote:"I monitor 12 patients remotely. The adherence data and posture accuracy reports have transformed how I practise.", rating:5, avatar:'AM' },
]
