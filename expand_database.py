import pandas as pd

# Load existing data
df = pd.read_csv("careers_data.csv")

# Massive expansion list
expansion = [
    # HEALTHCARE
    {
        "career": "Cardiologist",
        "category": "Healthcare",
        "avg_salary_inr": 4500000,
        "avg_salary_usd": 350000,
        "growth_outlook": "High",
        "min_education": "MBBS + MD + DM/DNB",
        "description": "Specializes in diagnosing and treating diseases of the cardiovascular system.",
        "key_skills": "Clinical Diagnosis, Surgery, Patient Care, Medical Imaging",
        "top_certifications": "Board Certification in Cardiology",
        "work_environment": "Hospital/Clinic",
        "roadmap": "MBBS Degree → MD (Medicine) → DM (Cardiology) → Specialization",
        "free_resources": "American College of Cardiology (Free content), PubMed, Medscape"
    },
    {
        "career": "Psychiatrist",
        "category": "Healthcare",
        "avg_salary_inr": 2500000,
        "avg_salary_usd": 280000,
        "growth_outlook": "Very High",
        "min_education": "MBBS + MD (Psychiatry)",
        "description": "Medical doctor specializing in mental health, including substance use disorders.",
        "key_skills": "Psychotherapy, Pharmacology, Empathy, Diagnosis",
        "top_certifications": "Psychiatric Board Certification",
        "work_environment": "Clinic/Hospital/Private Practice",
        "roadmap": "MBBS → MD Psychiatry → Super-specialization (e.g. Child Psychiatry)",
        "free_resources": "APA Learning Center, Psychology Today, Coursera Mental Health"
    },
    {
        "career": "Radiologist",
        "category": "Healthcare",
        "avg_salary_inr": 3500000,
        "avg_salary_usd": 400000,
        "growth_outlook": "High",
        "min_education": "MBBS + MD/DNB (Radiology)",
        "description": "Uses medical imaging techniques (X-ray, MRI, CT) to diagnose and treat diseases.",
        "key_skills": "Imaging Analysis, Technical Proficiency, Anatomy Knowledge",
        "top_certifications": "Radiology Board Certification",
        "work_environment": "Diagnostic Center/Hospital",
        "roadmap": "MBBS → MD Radiology → Fellowship in Interventional Radiology",
        "free_resources": "Radiopaedia, RSNA Training, YouTube: Radiology Tutorials"
    },
    
    # CREATIVE & ARTS
    {
        "career": "Film Director",
        "category": "Creative",
        "avg_salary_inr": 2000000,
        "avg_salary_usd": 150000,
        "growth_outlook": "Medium",
        "min_education": "Diploma/Degree in Filmmaking (Optional)",
        "description": "Directs the making of a film by visualizing the script and guiding the crew/actors.",
        "key_skills": "Storytelling, Visual Aesthetics, Leadership, Editing",
        "top_certifications": "Film School Diploma",
        "work_environment": "Sets/Studios",
        "roadmap": "Short Films → Assistant Direction → Independent Projects → Features",
        "free_resources": "StudioBinder YouTube, No Film School, Masterclass (Select content)"
    },
    {
        "career": "Music Producer",
        "category": "Creative",
        "avg_salary_inr": 1200000,
        "avg_salary_usd": 90000,
        "growth_outlook": "High",
        "min_education": "None/Diploma in Sound Engineering",
        "description": "Oversees and manages the sound recording and production of a band or performer's music.",
        "key_skills": "DAW (Ableton/FL Studio), Music Theory, Mixing, Mastering",
        "top_certifications": "Avid Certified User (Pro Tools)",
        "work_environment": "Recording Studio/Home",
        "roadmap": "Learn Instruments → Master DAW → Build Portfolio → Studio Intern → Producer",
        "free_resources": "Sound On Sound, YouTube: In The Mix, Coursera Music Production"
    },
    {
        "career": "Interior Designer",
        "category": "Creative",
        "avg_salary_inr": 800000,
        "avg_salary_usd": 75000,
        "growth_outlook": "High",
        "min_education": "Bachelor's/Diploma in Design",
        "description": "Plans and supervises the design and execution of architectural interiors and their furnishings.",
        "key_skills": "AutoCAD, SketchUp, Color Theory, Space Planning",
        "top_certifications": "NCIDQ Certification",
        "work_environment": "Studio/Client Sites",
        "roadmap": "Design Degree → Internship → Junior Designer → Senior/Lead Designer",
        "free_resources": "Houzz, ArchDaily, YouTube: Designing with Karin"
    },
    
    # LEGAL & FINANCE
    {
        "career": "Corporate Lawyer",
        "category": "Legal",
        "avg_salary_inr": 2500000,
        "avg_salary_usd": 180000,
        "growth_outlook": "High",
        "min_education": "LLB / JD",
        "description": "Advises businesses on their legal rights, responsibilities, and obligations.",
        "key_skills": "Contract Law, Negotiation, Legal Research, M&A",
        "top_certifications": "Bar Association Membership",
        "work_environment": "Law Firm/Office",
        "roadmap": "Law Degree (LLB) → Internships → Bar Exam → Associate in Law Firm",
        "free_resources": "Legal500, Khan Academy Law, YouTube: LegalEagle (Basics)"
    },
    {
        "career": "Actuary",
        "category": "Finance",
        "avg_salary_inr": 2000000,
        "avg_salary_usd": 130000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's in Math/Stats",
        "description": "Uses mathematics and statistics to assess risk in insurance, finance, and other industries.",
        "key_skills": "Statistical Modeling, Risk Analysis, Calculus, SQL/R",
        "top_certifications": "FSA (Fellow of the Society of Actuaries)",
        "work_environment": "Office/Insurance Company",
        "roadmap": "Degree in Math → Clear Actuarial Exams (P, FM, etc.) → Internship → Analyst",
        "free_resources": "Society of Actuaries (SOA) Free Guides, Khan Academy Statistics"
    },
    {
        "career": "Quantitative Analyst",
        "category": "Finance",
        "avg_salary_inr": 3000000,
        "avg_salary_usd": 175000,
        "growth_outlook": "High",
        "min_education": "Master's/PhD in Quantitative Field",
        "description": "Applies mathematical and statistical methods to financial and risk management problems.",
        "key_skills": "C++, Python, Stochastic Calculus, Financial Modeling",
        "top_certifications": "CQF (Certificate in Quantitative Finance)",
        "work_environment": "Hedge Fund/Investment Bank",
        "roadmap": "Math/Physics/CS Degree → Master's in Financial Engineering → Quant Intern → Quant",
        "free_resources": "QuantStart, MIT OpenCourseWare Finance, YouTube: QuantPy"
    },
    
    # TRADES & LOGISTICS
    {
        "career": "Commercial Pilot",
        "category": "Logistics",
        "avg_salary_inr": 4000000,
        "avg_salary_usd": 160000,
        "growth_outlook": "Very High",
        "min_education": "High School + Pilot Training",
        "description": "Operates and flies aircraft for airlines, transport, or private corporations.",
        "key_skills": "Navigation, Situation Awareness, Communication, Calmness under pressure",
        "top_certifications": "Commercial Pilot License (CPL)",
        "work_environment": "Cockpit/Traveling",
        "roadmap": "PPL → CPL → Instrument Rating → Multi-engine Rating → Airline Pilot",
        "free_resources": "FAA Training Handbooks (Free), YouTube: Mentour Pilot, Boldmethod"
    },
    {
        "career": "Supply Chain Manager",
        "category": "Logistics",
        "avg_salary_inr": 1500000,
        "avg_salary_usd": 110000,
        "growth_outlook": "High",
        "min_education": "Bachelor's/MBA",
        "description": "Oversees and manages every stage of the production flow, from raw materials to delivery.",
        "key_skills": "Logistics, Strategic Planning, Data Analytics, Sourcing",
        "top_certifications": "CSCP (Certified Supply Chain Professional)",
        "work_environment": "Office/Warehouse",
        "roadmap": "Business/Eng Degree → Supply Chain Associate → Planner → Manager",
        "free_resources": "ASCM Free Webinars, Coursera SCM Specialization, MIT SCM MicroMasters"
    },
    
    # SCIENTIFIC
    {
        "career": "Marine Biologist",
        "category": "Science",
        "avg_salary_inr": 900000,
        "avg_salary_usd": 80000,
        "growth_outlook": "Medium",
        "min_education": "Bachelor's/Master's in Biology",
        "description": "Studies marine organisms, their behaviors, and interactions with the environment.",
        "key_skills": "SCUBA Diving, Research, Data Collection, Species Identification",
        "top_certifications": "PADI Diving Cert",
        "work_environment": "Ocean/Lab/Research Vessel",
        "roadmap": "Biology Degree → Master's in Marine Science → Research Assistant → Biologist",
        "free_resources": "MarineBio.org, NOAA Education, National Geographic Society"
    },
    {
        "career": "Astrophysicist",
        "category": "Science",
        "avg_salary_inr": 1500000,
        "avg_salary_usd": 120000,
        "growth_outlook": "Medium",
        "min_education": "PhD in Physics/Astrophysics",
        "description": "Studies the physical properties and evolution of celestial bodies and the universe.",
        "key_skills": "Advanced Mathematics, Python, Data Analysis, Scientific Computing",
        "top_certifications": "Doctorate (PhD)",
        "work_environment": "Observatory/Lab/University",
        "roadmap": "Physics Degree → PhD Astrophysics → Post-doc Research → Professor/Scientist",
        "free_resources": "NASA Learning, World Wide Telescope, MIT OpenCourseWare Astrophysics"
    },
    
    # SOCIAL & ACADEMIC
    {
        "career": "Social Worker",
        "category": "Social",
        "avg_salary_inr": 600000,
        "avg_salary_usd": 55000,
        "growth_outlook": "High",
        "min_education": "Bachelor's/Master's in Social Work",
        "description": "Provides help and support to people with personal and social problems.",
        "key_skills": "Empathy, Crisis Intervention, Counseling, Advocacy",
        "top_certifications": "Licensed Clinical Social Worker (LCSW)",
        "work_environment": "NGO/Government/Clinic",
        "roadmap": "BSW → MSW → Licensing → Clinical/Community Social Work",
        "free_resources": "NASW Website, edX Social Work Courses, YouTube: Social Work Haven"
    },
    {
        "career": "Professor",
        "category": "Academic",
        "avg_salary_inr": 1800000,
        "avg_salary_usd": 110000,
        "growth_outlook": "Medium",
        "min_education": "Master's + PhD + NET (India)",
        "description": "Teaches academic subjects to undergraduate and postgraduate students, and conducts research.",
        "key_skills": "Teaching, Research, Public Speaking, Academic Writing",
        "top_certifications": "PhD",
        "work_environment": "University Campus",
        "roadmap": "Bachelor's → Master's → PhD → Assistant Professor → Associate → Professor",
        "free_resources": "Google Scholar, ResearchGate, Coursera (Higher Ed Teaching)"
    },
    
    # TECHNOLOGY (Expansion)
    {
        "career": "Robotics Engineer",
        "category": "Technology",
        "avg_salary_inr": 1400000,
        "avg_salary_usd": 115000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's in Mechanical/Electronics",
        "description": "Designs, builds, and maintains robots and robotic systems for various industries.",
        "key_skills": "ROS, Python/C++, CAD, Control Systems, AI/ML",
        "top_certifications": "Certified Robotics Professional",
        "work_environment": "Lab/Manufacturing",
        "roadmap": "Engineering Degree → Master's in Robotics → Intern at Tech Firm → Robotics Engineer",
        "free_resources": "ROS.org (Free tutorials), edX Robotics MicroMasters, YouTube: Robotics Guy"
    },
    {
        "career": "Cybersecurity Architect",
        "category": "Technology",
        "avg_salary_inr": 2800000,
        "avg_salary_usd": 170000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's",
        "description": "Designs and builds complex security systems to protect an organization's network and data.",
        "key_skills": "Cloud Security, Network Architecture, Risk Assessment, Python",
        "top_certifications": "CISSP, CEH",
        "work_environment": "Remote/Office",
        "roadmap": "IT Support → Network Security Admin → Security Analyst → Security Architect",
        "free_resources": "Cybrary (Free), TryHackMe, OWASP Training, YouTube: NetworkChuck"
    }
]

new_df = pd.DataFrame(expansion)
final_df = pd.concat([df, new_df], ignore_index=True)

# Drop duplicates based on career name
final_df = final_df.drop_duplicates(subset=['career'], keep='last')

final_df.to_csv("careers_data.csv", index=False)
print(f"Successfully expanded database! Total careers now: {len(final_df)}")
