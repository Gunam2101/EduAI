"""
Personalized Learning Roadmap Engine for LearnTrack AI
Indian Engineering College Context Layer

Transforms student continuous assessment data into an explainable, 5-stage personalized
learning roadmap mapped to Indian Engineering subjects (DSA, DBMS, Engg Maths, OS, ML, etc.).
Integrates prioritized recommendations directly into actionable milestones.
"""

from typing import Dict, List, Any
from app.services.indian_academic_context import INDIAN_SUBJECTS_CATALOG, get_student_academic_meta

# Practice MCQs catalog for interactive in-roadmap practice & assessment
PRACTICE_BANK = {
    "Data Structures & Algorithms": [
        {
            "id": "dsa_q1",
            "question": "What is the time complexity of inserting a node at the beginning of a singly linked list with a head pointer?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correct": 0,
            "explanation": "Inserting at the head requires creating the node and updating head pointer in constant O(1) time."
        },
        {
            "id": "dsa_q2",
            "question": "Which data structure is primarily used for implementing recursion and depth-first search (DFS)?",
            "options": ["Queue", "Stack", "Binary Heap", "Hash Table"],
            "correct": 1,
            "explanation": "Call stacks and explicit LIFO stacks are used to manage recursion and DFS traversal."
        },
        {
            "id": "dsa_q3",
            "question": "What is the average and worst-case time complexity of QuickSort?",
            "options": ["O(n log n) average, O(n^2) worst", "O(n) average, O(n log n) worst", "O(log n) average, O(n) worst", "O(n^2) average, O(n^2) worst"],
            "correct": 0,
            "explanation": "QuickSort averages O(n log n), degrading to O(n^2) when poor pivot selection leads to unbalanced partitions."
        }
    ],
    "Engineering Mathematics": [
        {
            "id": "math_q1",
            "question": "If a square matrix A has a determinant of 0, what is true about its inverse?",
            "options": ["Its inverse is equal to its transpose", "The matrix has no multiplicative inverse (singular)", "Its inverse is the identity matrix", "The inverse exists only if eigenvalues are non-zero"],
            "correct": 1,
            "explanation": "A matrix with det(A) = 0 is singular and cannot be inverted."
        },
        {
            "id": "math_q2",
            "question": "In a continuous probability distribution, what does the total area under the probability density function (PDF) curve equal?",
            "options": ["0.5", "1.0", "Infinity", "Variance"],
            "correct": 1,
            "explanation": "By definition, the integral of a valid PDF across its entire support equals 1.0."
        },
        {
            "id": "math_q3",
            "question": "What are the eigenvalues of a 2x2 diagonal matrix with diagonal entries 3 and 7?",
            "options": ["3 and 7", "10 and 21", "1.5 and 3.5", "0 and 10"],
            "correct": 0,
            "explanation": "For any diagonal or triangular matrix, the eigenvalues are simply the diagonal entries."
        }
    ],
    "Database Management Systems": [
        {
            "id": "dbms_q1",
            "question": "Which normal form requires the elimination of transitive dependencies on a candidate key?",
            "options": ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "BCNF"],
            "correct": 2,
            "explanation": "3NF requires the relation to be in 2NF and have no non-prime attribute transitively dependent on any candidate key."
        },
        {
            "id": "dbms_q2",
            "question": "Which property in ACID ensures that all operations within a database transaction complete successfully, or none are applied?",
            "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
            "correct": 0,
            "explanation": "Atomicity follows the 'all-or-nothing' principle for database transaction execution."
        },
        {
            "id": "dbms_q3",
            "question": "Which SQL clause is used to filter aggregated group records produced by a GROUP BY clause?",
            "options": ["WHERE", "HAVING", "FILTER", "ORDER BY"],
            "correct": 1,
            "explanation": "HAVING applies conditions to grouped summaries, whereas WHERE filters individual rows prior to grouping."
        }
    ],
    "Operating Systems": [
        {
            "id": "os_q1",
            "question": "Which of the following is NOT one of Coffman's four conditions required for a deadlock to occur?",
            "options": ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
            "correct": 2,
            "explanation": "'No preemption' is the necessary condition. If preemption is allowed, deadlocks cannot occur."
        },
        {
            "id": "os_q2",
            "question": "What is the primary cause of 'thrashing' in virtual memory systems?",
            "options": ["Excessive page fault frequency where the CPU spends more time swapping pages than executing", "Deadlocks in thread synchronization", "Fragmented hard disk blocks", "Cache miss in L1 cache"],
            "correct": 0,
            "explanation": "Thrashing occurs when the working set exceeds physical RAM, causing continuous page swapping."
        }
    ],
    "Machine Learning": [
        {
            "id": "ml_q1",
            "question": "What is the effect of increasing L2 regularization (Ridge) parameter lambda in linear regression?",
            "options": ["Increases model variance and fits noise", "Shrinks coefficients towards zero, reducing variance and overfitting", "Forces coefficients to become strictly zero", "Doubles training accuracy"],
            "correct": 1,
            "explanation": "L2 regularization penalizes large weights, shrinking coefficients towards zero to prevent overfitting."
        },
        {
            "id": "ml_q2",
            "question": "Which metric is most appropriate for evaluating a binary classifier on an imbalanced medical diagnosis dataset?",
            "options": ["Raw Accuracy", "F1-Score / PR-AUC", "Mean Squared Error", "Adjusted R-squared"],
            "correct": 1,
            "explanation": "Precision-Recall AUC and F1-Score balance precision and recall, remaining informative under class skew."
        }
    ]
}

def generate_personalized_roadmap(
    student_id: int,
    student_name: str,
    risk_level: str,
    learning_score: float,
    metrics: Dict[str, Any],
    weak_indicators: List[str]
) -> Dict[str, Any]:
    """
    Builds a structured 5-stage learning roadmap mapped to Indian Engineering subjects.
    Different students get differentiated roadmaps based on their exact performance profile:
    - Low Quizzes + Assignments: DSA + DBMS
    - Low Midterm / Final: Engineering Mathematics + Core Algorithms
    - Low Attendance / Labs: Operating Systems & Systems Lab
    - High Performance / Normal: Advanced Machine Learning & AI
    """
    meta = get_student_academic_meta(student_id)
    quiz_avg = metrics.get("quiz_average", 0.0)
    midterm = metrics.get("midterm_marks", 0.0)
    final = metrics.get("final_marks", 0.0)
    exam_pct = ((midterm + final) / 80.0) * 100.0 if (midterm + final) > 0 else 0.0
    att_pct = metrics.get("overall_attendance_rate", 0.0)
    assign_pct = metrics.get("assignment_completion_rate", 0.0)
    gpa = metrics.get("previous_gpa", 0.0)

    # 1. Determine Subject Archetype based on actual performance indicators
    if risk_level == "AT_RISK":
        status_label = "Needs Critical Intervention"
        if quiz_avg < 6.0 and assign_pct < 65.0:
            archetype = "DSA_DBMS"
            primary_subject = "Data Structures & Algorithms"
            secondary_subject = "Database Management Systems"
            focus_text = "Mastering foundational DSA linear structures and relational SQL problem sets."
        elif exam_pct < 50.0 or gpa < 2.5:
            archetype = "MATH_DSA"
            primary_subject = "Engineering Mathematics"
            secondary_subject = "Data Structures & Algorithms"
            focus_text = "Reinforcing Matrices, Probability foundations and core algorithmic recursion."
        else:
            archetype = "OS_SYS"
            primary_subject = "Operating Systems"
            secondary_subject = "Computer Networks"
            focus_text = "Rebuilding process scheduling concepts, memory management, and socket fundamentals."
    elif risk_level == "MODERATE":
        status_label = "Needs Improvement"
        if assign_pct < 70.0 or quiz_avg < 6.5:
            archetype = "DSA_DBMS"
            primary_subject = "Data Structures & Algorithms"
            secondary_subject = "Database Management Systems"
            focus_text = "Reinforcing Stacks, Trees, and SQL Normalization with weekly practice problems."
        elif exam_pct < 65.0:
            archetype = "MATH_DSA"
            primary_subject = "Engineering Mathematics"
            secondary_subject = "Data Structures & Algorithms"
            focus_text = "Strengthening Differential Equations, Probability, and Sorting algorithmic complexity."
        else:
            archetype = "SYS_NET"
            primary_subject = "Operating Systems"
            secondary_subject = "Computer Networks"
            focus_text = "Consolidating deadlocks, virtual memory paging, and TCP/IP routing mechanics."
    else:
        # High Performer / Normal
        status_label = "Good Standing (Enrichment)"
        archetype = "ADVANCED_AI"
        primary_subject = "Machine Learning"
        secondary_subject = "Artificial Intelligence"
        focus_text = "Advanced algorithmic optimization, ensemble architectures, and autonomous AI agents."

    # 2. Build 5 Sequential Stages
    steps = []

    if archetype == "DSA_DBMS":
        steps = [
            {
                "step_number": 1,
                "stage": "Foundation",
                "title": "DSA Foundation — Linear Structures",
                "subject": "Data Structures & Algorithms",
                "topics": ["Arrays", "Linked Lists"],
                "learning_activity": "Study node pointers, memory allocation, and array traversal complexities. Complete interactive code walkthroughs.",
                "estimated_effort": "3.5 Hours",
                "status": "COMPLETED",
                "progress": 100,
                "action_type": "review",
                "action_label": "Review Notes",
                "recommendation_tip": "Focus on two-pointer techniques to avoid redundant nested loops."
            },
            {
                "step_number": 2,
                "stage": "Concept Building",
                "title": "LIFO & FIFO Mechanics",
                "subject": "Data Structures & Algorithms",
                "topics": ["Stacks", "Queues"],
                "learning_activity": "Implement expression evaluation using stacks and circular buffer queues. Study real-world OS call-stack mechanisms.",
                "estimated_effort": "4.0 Hours",
                "status": "COMPLETED",
                "progress": 100,
                "action_type": "review",
                "action_label": "Review Code",
                "recommendation_tip": "Draw call stack diagrams manually before writing recursive functions."
            },
            {
                "step_number": 3,
                "stage": "Guided Practice",
                "title": "Relational Data Modeling & Normalization",
                "subject": "Database Management Systems",
                "topics": ["SQL", "Normalization", "Relational Algebra"],
                "learning_activity": "Solve 12 SQL schema queries including multi-table JOINs, subqueries, and decompose tables into 3NF / BCNF.",
                "estimated_effort": "5.0 Hours",
                "status": "CURRENT",
                "progress": 40,
                "action_type": "practice",
                "action_label": "Start Guided Practice",
                "recommendation_tip": "Identify functional dependencies explicitly before decomposing tables to preserve dependencies."
            },
            {
                "step_number": 4,
                "stage": "Assessment",
                "title": "Continuous Internal Assessment (CIA) Mock",
                "subject": "Data Structures & Algorithms",
                "topics": ["Trees", "Sorting", "Searching"],
                "learning_activity": "Take a 30-minute timed mock test covering binary search trees, heap properties, and QuickSort recurrence relations.",
                "estimated_effort": "2.5 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "quiz",
                "action_label": "Take Practice Assessment",
                "recommendation_tip": "Prioritize answering high-weightage questions on tree balancing algorithms first."
            },
            {
                "step_number": 5,
                "stage": "Progress Check",
                "title": "Longitudinal Mastery & Faculty Evaluation",
                "subject": "Academic Diagnostic Review",
                "topics": ["DSA & DBMS Synthesis", "Performance Comparison"],
                "learning_activity": "Analyze score improvement over baseline quizzes. Submit lab assignment verification to faculty mentor.",
                "estimated_effort": "1.5 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "eval",
                "action_label": "View Progress Report",
                "recommendation_tip": "Schedule a 15-minute verification session with Dr. S. Rangarajan to lock in credit completion."
            }
        ]
    elif archetype == "MATH_DSA":
        steps = [
            {
                "step_number": 1,
                "stage": "Foundation",
                "title": "Matrix Operations & Linear Equations",
                "subject": "Engineering Mathematics",
                "topics": ["Matrices", "Linear Algebra"],
                "learning_activity": "Review Gaussian elimination, matrix determinants, rank of matrices, and consistency of simultaneous equations.",
                "estimated_effort": "4.0 Hours",
                "status": "COMPLETED",
                "progress": 100,
                "action_type": "review",
                "action_label": "Review Formulas",
                "recommendation_tip": "Practice row reduction echelon steps carefully to eliminate algebraic sign errors."
            },
            {
                "step_number": 2,
                "stage": "Concept Building",
                "title": "Probability Distributions & Differential Equations",
                "subject": "Engineering Mathematics",
                "topics": ["Differential Equations", "Probability"],
                "learning_activity": "Master second-order linear differential equations with constant coefficients and Poisson / Normal distributions.",
                "estimated_effort": "4.5 Hours",
                "status": "CURRENT",
                "progress": 60,
                "action_type": "practice",
                "action_label": "Continue Practice",
                "recommendation_tip": "Memorize the standard auxiliary equation roots and complementary functions."
            },
            {
                "step_number": 3,
                "stage": "Guided Practice",
                "title": "Statistical Hypothesis Testing & Regression",
                "subject": "Statistics & Probability",
                "topics": ["Statistics", "Hypothesis Testing", "Correlation"],
                "learning_activity": "Perform t-test, Chi-square independence tests, and bivariate regression modeling on engineering datasets.",
                "estimated_effort": "4.0 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "practice",
                "action_label": "Start Problem Set",
                "recommendation_tip": "Clearly write null (H0) and alternative (H1) hypotheses before computing test statistics."
            },
            {
                "step_number": 4,
                "stage": "Assessment",
                "title": "End Semester Exam Simulation",
                "subject": "Engineering Mathematics",
                "topics": ["All 5 Units Combined"],
                "learning_activity": "Complete a 45-minute comprehensive written assessment mirroring university exam pattern Part A and Part B.",
                "estimated_effort": "3.0 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "quiz",
                "action_label": "Take Mock Exam",
                "recommendation_tip": "Pace your time: 1.5 minutes per mark. Allocate 20 minutes for final answer checking."
            },
            {
                "step_number": 5,
                "stage": "Progress Check",
                "title": "Benchmark Against Previous Internal Marks",
                "subject": "Academic Diagnostic Review",
                "topics": ["Targeted Improvement Check"],
                "learning_activity": "Compare mock assessment scores with baseline midterm to measure closing of conceptual gaps.",
                "estimated_effort": "1.5 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "eval",
                "action_label": "Compare Marks",
                "recommendation_tip": "A 15% increase in mock score qualifies you for the department honor roll."
            }
        ]
    elif archetype == "OS_SYS":
        steps = [
            {
                "step_number": 1,
                "stage": "Foundation",
                "title": "Process Lifecycle & CPU Scheduling",
                "subject": "Operating Systems",
                "topics": ["Processes", "CPU Scheduling"],
                "learning_activity": "Trace PCB state transitions, context switching overheads, Round Robin and Shortest Job First scheduling algorithms.",
                "estimated_effort": "3.5 Hours",
                "status": "COMPLETED",
                "progress": 100,
                "action_type": "review",
                "action_label": "Review Diagrams",
                "recommendation_tip": "Construct Gantt charts clearly when calculating average turnaround and waiting times."
            },
            {
                "step_number": 2,
                "stage": "Concept Building",
                "title": "Synchronization & Deadlock Prevention",
                "subject": "Operating Systems",
                "topics": ["Deadlocks", "Threads"],
                "learning_activity": "Study semaphore mutex locks, classical producer-consumer race conditions, and Banker's algorithm for safe states.",
                "estimated_effort": "4.0 Hours",
                "status": "CURRENT",
                "progress": 30,
                "action_type": "practice",
                "action_label": "Continue Module",
                "recommendation_tip": "Check allocation, max, and available resource vectors systematically in safety checks."
            },
            {
                "step_number": 3,
                "stage": "Guided Practice",
                "title": "Layered Protocol Architectures & IP Addressing",
                "subject": "Computer Networks",
                "topics": ["OSI Model", "TCP/IP", "IP Addressing"],
                "learning_activity": "Calculate IPv4 subnet masks, CIDR network prefixes, and compare TCP three-way handshake with UDP transmission.",
                "estimated_effort": "4.5 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "practice",
                "action_label": "Start Subnetting Drills",
                "recommendation_tip": "Practice binary conversions to master Classless Inter-Domain Routing (CIDR) calculations."
            },
            {
                "step_number": 4,
                "stage": "Assessment",
                "title": "Systems Core Diagnostic Quiz",
                "subject": "Operating Systems",
                "topics": ["Memory Management", "File Systems"],
                "learning_activity": "Take an interactive multiple-choice assessment covering paging, TLB hit ratios, and inode file allocation.",
                "estimated_effort": "2.5 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "quiz",
                "action_label": "Launch Quiz",
                "recommendation_tip": "Remember effective memory access time formula: EAT = hit_rate*(TLB+RAM) + miss_rate*(TLB+2*RAM)."
            },
            {
                "step_number": 5,
                "stage": "Progress Check",
                "title": "Lab Practical & Performance Audit",
                "subject": "Systems Laboratory & Theory Audit",
                "topics": ["Linux System Calls", "Socket Programs"],
                "learning_activity": "Execute fork() and pthread programs in Linux lab environment and verify with teaching assistant.",
                "estimated_effort": "2.0 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "eval",
                "action_label": "Verify Lab Signoff",
                "recommendation_tip": "Show working client-server echo program to get maximum internal lab marks."
            }
        ]
    else: # ADVANCED_AI
        steps = [
            {
                "step_number": 1,
                "stage": "Foundation",
                "title": "Mathematical Foundations of Machine Learning",
                "subject": "Machine Learning",
                "topics": ["Feature Engineering", "Data Preprocessing"],
                "learning_activity": "Implement standardization, one-hot encoding, and feature scaling pipelines from scratch using NumPy and Pandas.",
                "estimated_effort": "3.0 Hours",
                "status": "COMPLETED",
                "progress": 100,
                "action_type": "review",
                "action_label": "Inspect Pipeline",
                "recommendation_tip": "Always fit transformers on training splits only to prevent data leakage."
            },
            {
                "step_number": 2,
                "stage": "Concept Building",
                "title": "Supervised Learning & Ensemble Methods",
                "subject": "Machine Learning",
                "topics": ["Classification", "Linear Regression", "Model Evaluation"],
                "learning_activity": "Train Random Forests, Gradient Boosted Trees, and compute ROC-AUC, precision-recall curves on real datasets.",
                "estimated_effort": "4.5 Hours",
                "status": "COMPLETED",
                "progress": 100,
                "action_type": "review",
                "action_label": "Review Metrics",
                "recommendation_tip": "Evaluate on cross-validated holdout folds to verify model generalizability."
            },
            {
                "step_number": 3,
                "stage": "Guided Practice",
                "title": "State-Space Search & Knowledge Representation",
                "subject": "Artificial Intelligence",
                "topics": ["Search Algorithms", "Neural Networks", "AI Agents"],
                "learning_activity": "Implement A* heuristic graph search and build a two-layer backpropagation neural network in PyTorch.",
                "estimated_effort": "5.0 Hours",
                "status": "CURRENT",
                "progress": 75,
                "action_type": "practice",
                "action_label": "Complete PyTorch Notebook",
                "recommendation_tip": "Ensure the heuristic function h(n) is admissible (never overestimates) for A* optimality."
            },
            {
                "step_number": 4,
                "stage": "Assessment",
                "title": "Advanced AI Model Challenge",
                "subject": "Machine Learning",
                "topics": ["Clustering", "Deep Learning Fundamentals"],
                "learning_activity": "Complete a timed algorithmic challenge classifying high-dimensional educational datasets.",
                "estimated_effort": "3.0 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "quiz",
                "action_label": "Take Advanced Challenge",
                "recommendation_tip": "Use t-SNE or UMAP to visualize high-dimensional clusters before tuning hyper-parameters."
            },
            {
                "step_number": 5,
                "stage": "Progress Check",
                "title": "Capstone Research & Peer Mentorship",
                "subject": "Academic Excellence & Research",
                "topics": ["Paper Implementation", "Peer Tutoring"],
                "learning_activity": "Present an end-to-end predictive model to faculty committee and mentor peers in study circle.",
                "estimated_effort": "2.0 Hours",
                "status": "NOT_STARTED",
                "progress": 0,
                "action_type": "eval",
                "action_label": "View Distinction Certificate",
                "recommendation_tip": "Submit findings to the upcoming departmental national student symposium."
            }
        ]

    # Calculate overall roadmap progress
    total_progress = sum(s["progress"] for s in steps)
    overall_pct = round(total_progress / len(steps), 1)

    # Find the current active step
    current_step = next((s for s in steps if s["status"] == "CURRENT"), steps[0])

    # Extract relevant practice MCQs for current/primary subject
    practice_questions = PRACTICE_BANK.get(
        primary_subject,
        PRACTICE_BANK["Data Structures & Algorithms"]
    )

    return {
        "student_id": student_id,
        "student_name": student_name,
        "department": meta["department"],
        "year": meta["year"],
        "semester": meta["semester"],
        "section": meta["section"],
        "register_no": meta["register_no"],
        "regulation": meta["regulation"],
        "learning_score": round(learning_score, 1),
        "risk_level": risk_level,
        "status_label": status_label,
        "primary_weak_subject": primary_subject,
        "secondary_weak_subject": secondary_subject,
        "focus_summary": focus_text,
        "overall_progress_percentage": overall_pct,
        "current_step": current_step,
        "next_step_title": current_step["title"],
        "next_step_action": current_step["action_label"],
        "steps": steps,
        "practice_questions": practice_questions
    }
