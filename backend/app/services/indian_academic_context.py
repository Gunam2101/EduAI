"""
Indian Engineering College Context Layer for LearnTrack AI (PS52)
Provides realistic Indian student names, faculty profiles, and the 12 Indian
engineering subjects with comprehensive unit topics aligned with AICTE / Anna University / VTU curriculum.
"""

from typing import Dict, List, Any

# Primary 20 user-specified names followed by authentic Indian student names up to 300
INDIAN_STUDENT_NAMES = [
    "Arjun Kumar",      # ID 1 (Demo Student)
    "Karthik S",        # ID 2
    "Priya M",          # ID 3
    "Harini P",         # ID 4
    "Rahul V",          # ID 5
    "Sneha R",          # ID 6
    "Vignesh K",        # ID 7
    "Divya S",          # ID 8
    "Aditya R",         # ID 9
    "Nandhini M",       # ID 10
    "Sanjay Kumar",     # ID 11
    "Keerthana S",      # ID 12
    "Pranav R",         # ID 13
    "Swetha P",         # ID 14
    "Dinesh K",         # ID 15
    "Ananya S",         # ID 16
    "Naveen Kumar",     # ID 17
    "Dharani M",        # ID 18
    "Ashwin R",         # ID 19
    "Pavithra K",       # ID 20
    "Manoj Kumar",      # ID 21
    "Deepika R",        # ID 22
    "Rohit Sharma",     # ID 23
    "Pooja N",          # ID 24
    "Aravind Swamy",    # ID 25
    "Sowmya V",         # ID 26
    "Siddharth Rao",    # ID 27
    "Meenakshi K",      # ID 28
    "Gokul Nath",       # ID 29
    "Bhavana S",        # ID 30
    "Kishore Babu",     # ID 31
    "Sandhya M",        # ID 32
    "Suresh Krishna",   # ID 33
    "Lavanya P",        # ID 34
    "Harish Kumar",     # ID 35
    "Kavitha R",        # ID 36
    "Surya Prakash",    # ID 37
    "Akshaya S",        # ID 38
    "Vijay Anand",      # ID 39
    "Gayathri N",       # ID 40
    "Rithvik M",        # ID 41
    "Aishwarya R",      # ID 42
    "Saravanan P",      # ID 43
    "Monika S",         # ID 44
    "Bala Murugan",     # ID 45
    "Janani K",         # ID 46
    "Deepak Raj",       # ID 47
    "Nivetha M",        # ID 48
    "Gautam V",         # ID 49
    "Subhashree S",     # ID 50
    "Raghavan T",       # ID 51
    "Shalini B",        # ID 52
    "Mohan Doss",       # ID 53
    "Archana V",        # ID 54
    "Ganesh Moorthy",   # ID 55
    "Sindhuja R",       # ID 56
    "Lokesh K",         # ID 57
    "Malathi S",        # ID 58
    "Shyam Sundar",     # ID 59
    "Abirami M",        # ID 60
    "Karthikeyan N",    # ID 61
    "Yamuna P",         # ID 62
    "Vasanth Kumar",    # ID 63
    "Mythili R",        # ID 64
    "Ranjith V",        # ID 65
    "Madhumitha S",     # ID 66
    "Ajay Rathinam",    # ID 67
    "Preethi K",        # ID 68
    "Vishnu Vardhan",   # ID 69
    "Ishwarya M",       # ID 70
    "Praveen Kumar",    # ID 71
    "Jayashree N",      # ID 72
    "Kunal Shah",       # ID 73
    "Radhika Iyer",     # ID 74
    "Sathish Kumar",    # ID 75
    "Revathi S",        # ID 76
    "Mukundhan R",      # ID 77
    "Gomathi P",        # ID 78
    "Anand Mohan",      # ID 79
    "Varsha R",         # ID 80
    "Chethan Gowda",    # ID 81
    "Sahana K",         # ID 82
    "Nitin V",          # ID 83
    "Tejaswini M",      # ID 84
    "Akash Verma",      # ID 85
    "Kalyani S",        # ID 86
    "Jithendra R",      # ID 87
    "Nirupama P",       # ID 88
    "Chirag Mehta",     # ID 89
    "Shreya Nair",      # ID 90
    "Hemanth Kumar",    # ID 91
    "Vandana S",        # ID 92
    "Bharathwaj K",     # ID 93
    "Rohini M",         # ID 94
    "Kiran Raj",        # ID 95
    "Bhuvaneshwari P",  # ID 96
    "Sumanth Rao",      # ID 97
    "Rashmi S",         # ID 98
    "Vinoth Kumar",     # ID 99
    "Padmavathi R",     # ID 100
    "Girish Babu",      # ID 101
    "Sangeetha K",      # ID 102
    "Mithun Chakravarthy", # ID 103
    "Geetha M",         # ID 104
    "Muthuvel P",       # ID 105
    "Aparna R",         # ID 106
    "Ramesh Babu",      # ID 107
    "Uma Maheshwari",   # ID 108
    "Santosh Nair",     # ID 109
    "Divyabharathi S",  # ID 110
    "Srihari V",        # ID 111
    "Kanimozhi T",      # ID 112
    "Prakash Raj",      # ID 113
    "Kokila M",         # ID 114
    "Venkat Raman",     # ID 115
    "Sudha R",          # ID 116
    "Sudhir Kumar",     # ID 117
    "Sumathi K",        # ID 118
    "Dhanush K",        # ID 119
    "Chitra S",         # ID 120
    "Sasi Kumar",       # ID 121
    "Sujatha N",        # ID 122
    "Gopinath R",       # ID 123
    "Usha Rani",        # ID 124
    "Jeyaraj V",        # ID 125
    "Sasikala P",       # ID 126
    "Manikandan S",     # ID 127
    "Menaka R",         # ID 128
    "Arun Prasath",     # ID 129
    "Suganya M",        # ID 130
    "Selva Kumar",      # ID 131
    "Kalaivani S",      # ID 132
    "Thirumalai N",     # ID 133
    "Renuka Devi",      # ID 134
    "Anbarasan K",      # ID 135
    "Vijayalakshmi R",  # ID 136
    "Rajesh Khanna",    # ID 137
    "Sowbarnika M",     # ID 138
    "Guru Prasad",      # ID 139
    "Poornima S",       # ID 140
    "Murugan K",        # ID 141
    "Brundha P",        # ID 142
    "Sathya Narayanan", # ID 143
    "Hema Malini",      # ID 144
    "Vimal Raj",        # ID 145
    "Bakyalakshmi S",   # ID 146
    "Sabari Nathan",    # ID 147
    "Dhanalakshmi M",   # ID 148
    "Tamilarasan P",    # ID 149
    "Punitha R",        # ID 150
    "Kadhiravan S",     # ID 151
    "Rajeshwari N",     # ID 152
    "Balamurugan T",    # ID 153
    "Kowsalya M",       # ID 154
    "Silambarasan R",   # ID 155
    "Saranya V",        # ID 156
    "Muthukumar P",     # ID 157
    "Prathiba K",       # ID 158
    "Senthil Nathan",   # ID 159
    "Nandini Devi",     # ID 160
    "Shanmuga Sundaram",# ID 161
    "Megala S",         # ID 162
    "Hariharan R",      # ID 163
    "Sowndharya P",     # ID 164
    "Sivakumar M",      # ID 165
    "Devaki N",         # ID 166
    "Velmurugan K",     # ID 167
    "Deepalakshmi R",   # ID 168
    "Kalyan Chakravarthy",# ID 169
    "Shanthi M",        # ID 170
    "Karthigeyan S",    # ID 171
    "Gunasundari P",    # ID 172
    "Chandrasekar R",   # ID 173
    "Jayanthi K",       # ID 174
    "Balasubramaniam V",# ID 175
    "Manjula S",        # ID 176
    "Gnanavel P",       # ID 177
    "Vijaya Rani",      # ID 178
    "Elango K",         # ID 179
    "Rajeswari M",      # ID 180
    "Sridhar Babu",     # ID 181
    "Malarvizhi R",     # ID 182
    "Ilango T",         # ID 183
    "Vennila S",        # ID 184
    "Parthiban M",      # ID 185
    "Jayapradha K",     # ID 186
    "Venkatesan R",     # ID 187
    "Kanmani P",        # ID 188
    "Soundararajan K",  # ID 189
    "Mohana Priya",     # ID 190
    "Sathyanarayana Rao",# ID 191
    "Indhumathi S",     # ID 192
    "Kothandaraman V",  # ID 193
    "Bharathi M",       # ID 194
    "Devaraj P",        # ID 195
    "Jothilakshmi R",   # ID 196
    "Sundaramoorthy K", # ID 197
    "Kamalam S",        # ID 198
    "Thangavel M",      # ID 199
    "Kasthuri P",       # ID 200
    "Loganathan R",     # ID 201
    "Vasuki T",         # ID 202
    "Mahendran S",      # ID 203
    "Selvi M",          # ID 204
    "Nedunchezhiyan K", # ID 205
    "Vijayashree R",    # ID 206
    "Natarajan P",      # ID 207
    "Mangalam S",       # ID 208
    "Pandian M",        # ID 209
    "Loganayaki K",     # ID 210
    "Ramasamy T",       # ID 211
    "Meenakumari R",    # ID 212
    "Somasundaram V",   # ID 213
    "Gowri S",          # ID 214
    "Palanisamy K",     # ID 215
    "Vanitha M",        # ID 216
    "Ravichandran R",   # ID 217
    "Kalpana P",        # ID 218
    "Saminathan P",     # ID 219
    "Karpagam S",       # ID 220
    "Theagarajan M",    # ID 221
    "Gandhimathi R",    # ID 222
    "Vadivelu K",       # ID 223
    "Eswari P",         # ID 224
    "Jayachandran S",   # ID 225
    "Shobana M",        # ID 226
    "Murugesan R",      # ID 227
    "Nirmala Devi",     # ID 228
    "Sankaralingam T",  # ID 229
    "Subha Lakshmi",    # ID 230
    "Ponraj K",         # ID 231
    "Hemavathi S",      # ID 232
    "Rajagopalan V",    # ID 233
    "Saraswathi P",     # ID 234
    "Subramanian M",    # ID 235
    "Lalitha R",        # ID 236
    "Swaminathan K",    # ID 237
    "Mythili S",        # ID 238
    "Ponnusamy T",      # ID 239
    "Angayarkanni M",   # ID 240
    "Kuppusamy R",      # ID 241
    "Amutha P",         # ID 242
    "Govindasamy S",    # ID 243
    "Nithya Kalyani",   # ID 244
    "Kalyanasundaram M",# ID 245
    "Gunasundari R",    # ID 246
    "Singaravelu P",    # ID 247
    "Thamizharasi K",   # ID 248
    "Meiyappan S",      # ID 249
    "Kaviyarasu M",     # ID 250
    "Nambi Rajan",      # ID 251
    "Thamarai Selvi",   # ID 252
    "Pugazhendhi R",    # ID 253
    "Valliammai P",     # ID 254
    "Senthamizh Selvan",# ID 255
    "Kothai Nachiyar",  # ID 256
    "Arunagiri S",      # ID 257
    "Kayalvizhi M",     # ID 258
    "Chellappa K",      # ID 259
    "Senthamil Selvi",  # ID 260
    "Karuppasamy R",    # ID 261
    "Muthulakshmi S",   # ID 262
    "Boominathan P",    # ID 263
    "Shenbagavalli M",  # ID 264
    "Vetrivelan T",     # ID 265
    "Sornamalar K",     # ID 266
    "Kathiresan S",     # ID 267
    "Kannagi R",        # ID 268
    "Periyasamy M",     # ID 269
    "Shenbagam P",      # ID 270
    "Vairamuthu K",     # ID 271
    "Gnanambal S",      # ID 272
    "Sitharthan R",     # ID 273
    "Poompavai M",      # ID 274
    "Muthurasu P",      # ID 275
    "Chellammal K",     # ID 276
    "Dharmarajan S",    # ID 277
    "Bhavadharani R",   # ID 278
    "Nallathambi M",    # ID 279
    "Kausalya P",       # ID 280
    "Mayilvaganan K",   # ID 281
    "Pavunammal S",     # ID 282
    "Gnanasekaran R",   # ID 283
    "Mullaikodi M",     # ID 284
    "Palanivelu P",     # ID 285
    "Chembavalam K",    # ID 286
    "Tamilarasu S",     # ID 287
    "Malar Kodi",       # ID 288
    "Komban R",         # ID 289
    "Manimegalai P",    # ID 290
    "Veluchamy M",      # ID 291
    "Anjugam S",        # ID 292
    "Seetharaman K",    # ID 293
    "Ponnammal R",      # ID 294
    "Madasamy P",       # ID 295
    "Thilagavathi M",   # ID 296
    "Vellaisamy S",     # ID 297
    "Maragatham K",     # ID 298
    "Sudalaimuthu R",   # ID 299
    "Parameshwari M",   # ID 300
]

def get_indian_student_name(student_id: int) -> str:
    """Returns a deterministic realistic Indian name for any student ID (1..300)."""
    idx = student_id - 1
    if 0 <= idx < len(INDIAN_STUDENT_NAMES):
        return INDIAN_STUDENT_NAMES[idx]
    return f"Student {student_id}"

def get_student_academic_meta(student_id: int) -> Dict[str, str]:
    """
    Returns realistic Indian engineering college academic metadata.
    Evenly distributes students across AI & Data Science, CSE, and IT.
    """
    departments = [
        "Artificial Intelligence & Data Science",
        "Computer Science & Engineering",
        "Information Technology"
    ]
    sections = ["A", "B", "C"]
    dept = departments[(student_id - 1) % len(departments)]
    sec = sections[((student_id - 1) // 3) % len(sections)]
    reg_no = f"2022AD{student_id:04d}"

    return {
        "college": "Sri Krishna College of Engineering & Technology (Autonomous)",
        "degree": "B.Tech / B.E.",
        "department": dept,
        "year": "3rd Year",
        "semester": "Semester VI",
        "section": f"Section {sec}",
        "register_no": reg_no,
        "academic_year": "2026 - 2027",
        "regulation": "Regulation 2021 (Autonomous / Anna University Aligned)",
        "mentor_faculty": "Dr. S. Rangarajan, Associate Professor (CSE)"
    }

# The 12 Indian Engineering Subjects and exact Topics requested by user
INDIAN_SUBJECTS_CATALOG = [
    {
        "code": "MA3354",
        "name": "Engineering Mathematics",
        "credits": 4,
        "description": "Foundational mathematical techniques including Linear Algebra, Differential Equations, and Probability for engineering problems.",
        "topics": [
            {"name": "Matrices", "unit": 1, "level": "Easy", "hours": 4.0},
            {"name": "Differential Equations", "unit": 2, "level": "Hard", "hours": 5.0},
            {"name": "Probability", "unit": 3, "level": "Intermediate", "hours": 4.5},
            {"name": "Statistics", "unit": 4, "level": "Intermediate", "hours": 4.0},
            {"name": "Linear Algebra", "unit": 5, "level": "Intermediate", "hours": 4.5}
        ]
    },
    {
        "code": "CS3301",
        "name": "Data Structures & Algorithms",
        "credits": 4,
        "description": "Linear and non-linear data structures, algorithmic design paradigms, asymptotic analysis, sorting, and graph algorithms.",
        "topics": [
            {"name": "Arrays", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "Linked Lists", "unit": 1, "level": "Intermediate", "hours": 4.0},
            {"name": "Stacks", "unit": 2, "level": "Easy", "hours": 3.0},
            {"name": "Queues", "unit": 2, "level": "Easy", "hours": 3.0},
            {"name": "Trees", "unit": 3, "level": "Hard", "hours": 5.0},
            {"name": "Graphs", "unit": 4, "level": "Hard", "hours": 5.5},
            {"name": "Sorting", "unit": 5, "level": "Intermediate", "hours": 3.5},
            {"name": "Searching", "unit": 5, "level": "Easy", "hours": 2.5}
        ]
    },
    {
        "code": "CS3492",
        "name": "Database Management Systems",
        "credits": 3,
        "description": "Relational data modeling, SQL query optimization, normal forms, transaction ACID properties, and database indexing.",
        "topics": [
            {"name": "ER Model", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "SQL", "unit": 2, "level": "Intermediate", "hours": 4.5},
            {"name": "Relational Algebra", "unit": 2, "level": "Intermediate", "hours": 3.5},
            {"name": "Normalization", "unit": 3, "level": "Hard", "hours": 4.5},
            {"name": "Transactions", "unit": 4, "level": "Hard", "hours": 4.0},
            {"name": "Indexing", "unit": 5, "level": "Intermediate", "hours": 3.5}
        ]
    },
    {
        "code": "CS3251",
        "name": "Python Programming",
        "credits": 3,
        "description": "Core Python language syntax, dynamic collections, functional constructs, OOP design, file streams, and robust exception handling.",
        "topics": [
            {"name": "Variables & Data Types", "unit": 1, "level": "Easy", "hours": 2.5},
            {"name": "Functions", "unit": 2, "level": "Easy", "hours": 3.0},
            {"name": "Lists & Dictionaries", "unit": 3, "level": "Intermediate", "hours": 3.5},
            {"name": "OOP in Python", "unit": 4, "level": "Intermediate", "hours": 4.0},
            {"name": "File Handling", "unit": 5, "level": "Intermediate", "hours": 3.0},
            {"name": "Exception Handling", "unit": 5, "level": "Easy", "hours": 2.5}
        ]
    },
    {
        "code": "CS3391",
        "name": "Object Oriented Programming",
        "credits": 3,
        "description": "Object-oriented principles in C++/Java encompassing encapsulation, inheritance hierarchies, runtime polymorphism, and abstract contracts.",
        "topics": [
            {"name": "Classes & Objects", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "Inheritance", "unit": 2, "level": "Intermediate", "hours": 4.0},
            {"name": "Polymorphism", "unit": 3, "level": "Intermediate", "hours": 4.0},
            {"name": "Abstraction", "unit": 4, "level": "Intermediate", "hours": 3.5},
            {"name": "Encapsulation", "unit": 5, "level": "Easy", "hours": 2.5}
        ]
    },
    {
        "code": "CS3591",
        "name": "Computer Networks",
        "credits": 3,
        "description": "Layered protocol architectures, ISO-OSI stack, TCP/IP, IP routing algorithms, socket programming, and transport layer security.",
        "topics": [
            {"name": "OSI Model", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "TCP/IP", "unit": 2, "level": "Intermediate", "hours": 3.5},
            {"name": "IP Addressing", "unit": 3, "level": "Intermediate", "hours": 4.0},
            {"name": "Routing", "unit": 4, "level": "Hard", "hours": 4.5},
            {"name": "Transport Layer", "unit": 4, "level": "Intermediate", "hours": 3.5},
            {"name": "Network Security", "unit": 5, "level": "Intermediate", "hours": 4.0}
        ]
    },
    {
        "code": "CS3451",
        "name": "Operating Systems",
        "credits": 3,
        "description": "Kernel architecture, process lifecycle, thread synchronization, CPU scheduling algorithms, deadlock prevention, and virtual memory.",
        "topics": [
            {"name": "Processes", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "Threads", "unit": 1, "level": "Intermediate", "hours": 3.0},
            {"name": "CPU Scheduling", "unit": 2, "level": "Intermediate", "hours": 4.0},
            {"name": "Deadlocks", "unit": 3, "level": "Hard", "hours": 4.5},
            {"name": "Memory Management", "unit": 4, "level": "Hard", "hours": 4.5},
            {"name": "File Systems", "unit": 5, "level": "Easy", "hours": 3.0}
        ]
    },
    {
        "code": "AI3401",
        "name": "Machine Learning",
        "credits": 4,
        "description": "Statistical learning theory, supervised linear and logistic classification, unsupervised clustering, and evaluation metrics.",
        "topics": [
            {"name": "Data Preprocessing", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "Feature Engineering", "unit": 2, "level": "Intermediate", "hours": 4.0},
            {"name": "Linear Regression", "unit": 3, "level": "Intermediate", "hours": 3.5},
            {"name": "Classification", "unit": 3, "level": "Intermediate", "hours": 4.0},
            {"name": "Clustering", "unit": 4, "level": "Intermediate", "hours": 4.0},
            {"name": "Model Evaluation", "unit": 5, "level": "Intermediate", "hours": 3.5}
        ]
    },
    {
        "code": "AI3402",
        "name": "Artificial Intelligence",
        "credits": 3,
        "description": "Intelligent agent architectures, informed graph search (A*), constraint satisfaction, knowledge representation, and neural nets.",
        "topics": [
            {"name": "Search Algorithms", "unit": 1, "level": "Intermediate", "hours": 4.0},
            {"name": "Knowledge Representation", "unit": 2, "level": "Intermediate", "hours": 3.5},
            {"name": "Expert Systems", "unit": 3, "level": "Easy", "hours": 3.0},
            {"name": "Neural Networks", "unit": 4, "level": "Hard", "hours": 5.0},
            {"name": "AI Agents", "unit": 5, "level": "Intermediate", "hours": 3.5}
        ]
    },
    {
        "code": "MA3391",
        "name": "Statistics & Probability",
        "credits": 4,
        "description": "Descriptive statistics, random variables, probability distributions, bivariate correlation, regression analysis, and hypothesis testing.",
        "topics": [
            {"name": "Descriptive Statistics", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "Probability", "unit": 2, "level": "Intermediate", "hours": 4.0},
            {"name": "Distributions", "unit": 3, "level": "Intermediate", "hours": 4.5},
            {"name": "Correlation", "unit": 4, "level": "Intermediate", "hours": 3.5},
            {"name": "Regression", "unit": 4, "level": "Intermediate", "hours": 4.0},
            {"name": "Hypothesis Testing", "unit": 5, "level": "Hard", "hours": 5.0}
        ]
    },
    {
        "code": "BD3501",
        "name": "Big Data Analytics",
        "credits": 3,
        "description": "Distributed file architectures, Hadoop ecosystem, MapReduce computation model, Apache Spark pipelines, and stream processing.",
        "topics": [
            {"name": "Hadoop", "unit": 1, "level": "Intermediate", "hours": 3.5},
            {"name": "MapReduce", "unit": 2, "level": "Hard", "hours": 4.5},
            {"name": "Spark", "unit": 3, "level": "Hard", "hours": 4.5},
            {"name": "Data Processing", "unit": 4, "level": "Intermediate", "hours": 3.5},
            {"name": "Distributed Systems", "unit": 5, "level": "Intermediate", "hours": 4.0}
        ]
    },
    {
        "code": "AI3601",
        "name": "Natural Language Processing",
        "credits": 3,
        "description": "Computational linguistics, text tokenization, morphological analysis, TF-IDF vectorization, word embeddings (Word2Vec), and sentiment classifiers.",
        "topics": [
            {"name": "Text Preprocessing", "unit": 1, "level": "Easy", "hours": 3.0},
            {"name": "Tokenization", "unit": 1, "level": "Easy", "hours": 2.5},
            {"name": "Stemming", "unit": 2, "level": "Easy", "hours": 2.5},
            {"name": "TF-IDF", "unit": 3, "level": "Intermediate", "hours": 3.5},
            {"name": "Word Embeddings", "unit": 4, "level": "Hard", "hours": 4.5},
            {"name": "Text Classification", "unit": 5, "level": "Intermediate", "hours": 4.0}
        ]
    }
]
