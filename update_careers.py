import pandas as pd
import numpy as np

df = pd.read_csv("careers_data.csv")

# Ensure columns exist and fill NaNs
if 'roadmap' not in df.columns:
    df['roadmap'] = ""
if 'free_resources' not in df.columns:
    df['free_resources'] = ""

df['roadmap'] = df['roadmap'].fillna("")
df['free_resources'] = df['free_resources'].fillna("")

# Update existing rows if roadmap/resources are empty or too short
for idx, row in df.iterrows():
    if len(str(row['roadmap']).strip()) < 5:
        df.at[idx, 'roadmap'] = "Degree/Diploma → Online Certifications → Build Portfolio → Internships → Full-time Role"
    if len(str(row['free_resources']).strip()) < 5:
        df.at[idx, 'free_resources'] = "Coursera (Free Audit), edX, YouTube Masterclasses, Khan Academy"

# NEW FUTURE-PROOF CAREERS TO ADD
new_careers = [
    {
        "career": "AI Prompt Engineer",
        "category": "Technology",
        "avg_salary_inr": 1200000,
        "avg_salary_usd": 100000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's/Any",
        "description": "Designs and optimizes prompts for Large Language Models to generate high-quality AI outputs.",
        "key_skills": "Prompt Design, NLP, Creative Writing, Critical Thinking, Logic",
        "top_certifications": "OpenAI/Anthropic Certs, DeepLearning.AI Prompting",
        "work_environment": "Remote/Office",
        "roadmap": "Learn NLP Basics → Master LLM Behaviors → Build Prompt Libraries → Freelance/Tech Roles",
        "free_resources": "LearnPrompting.org, DeepLearning.AI ChatGPT Course (Free), OpenAI API Docs"
    },
    {
        "career": "Web3 Security Auditor",
        "category": "Technology",
        "avg_salary_inr": 2500000,
        "avg_salary_usd": 180000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's",
        "description": "Reviews smart contracts and blockchain protocols to identify and fix critical security vulnerabilities.",
        "key_skills": "Solidity, Rust, Cryptography, Ethical Hacking, Code Auditing",
        "top_certifications": "Certified Smart Contract Auditor",
        "work_environment": "Remote",
        "roadmap": "Master Solidity/Rust → Learn Blockchain Architecture → Participate in Bug Bounties → Audit Firm",
        "free_resources": "Immunefi Bootcamps, Ethernaut by OpenZeppelin, Cyfrin Updraft, YouTube: Smart Contract Programmer"
    },
    {
        "career": "Quantum Software Developer",
        "category": "Technology",
        "avg_salary_inr": 1800000,
        "avg_salary_usd": 140000,
        "growth_outlook": "High",
        "min_education": "Master's/PhD",
        "description": "Writes algorithms for quantum computers to solve complex problems faster than classical supercomputers.",
        "key_skills": "Qiskit, Linear Algebra, Quantum Mechanics, Python, C++",
        "top_certifications": "IBM Quantum Developer",
        "work_environment": "Lab/Office",
        "roadmap": "CS/Physics Degree → Learn Qiskit/Cirq → Contribute to Open Source Quantum → Research Lab",
        "free_resources": "IBM Quantum Learning, Qiskit Textbook (Free), MIT OpenCourseWare Quantum Physics"
    },
    {
        "career": "Generative AI Specialist",
        "category": "Technology",
        "avg_salary_inr": 1600000,
        "avg_salary_usd": 130000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's",
        "description": "Develops and integrates generative AI models (Text, Image, Audio) into enterprise applications.",
        "key_skills": "PyTorch, Transformers, Stable Diffusion, MLOps, Python",
        "top_certifications": "Google Cloud Gen AI, AWS ML",
        "work_environment": "Remote/Office",
        "roadmap": "Learn Deep Learning → Master HuggingFace Transformers → Build GenAI Apps → AI Engineer",
        "free_resources": "HuggingFace NLP Course (Free), Fast.ai Deep Learning, YouTube: Andrej Karpathy"
    },
    {
        "career": "No-Code/Low-Code Developer",
        "category": "Technology",
        "avg_salary_inr": 800000,
        "avg_salary_usd": 70000,
        "growth_outlook": "High",
        "min_education": "Any",
        "description": "Builds software applications and automations rapidly using visual platforms without writing traditional code.",
        "key_skills": "Bubble, Webflow, Zapier, Logic/Workflow Design, UI/UX",
        "top_certifications": "Bubble Developer, Webflow Expert",
        "work_environment": "Remote/Freelance",
        "roadmap": "Learn UI/UX Basics → Master Bubble/Webflow → Build Portfolio Projects → Freelance Agency",
        "free_resources": "Webflow University (Free), Bubble Academy, YouTube: Buildcamp, 100DaysOfNoCode"
    },
    {
        "career": "MLOps Engineer",
        "category": "Technology",
        "avg_salary_inr": 1500000,
        "avg_salary_usd": 120000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's",
        "description": "Bridges the gap between data science and operations to deploy and monitor ML models in production.",
        "key_skills": "Docker, Kubernetes, MLflow, CI/CD, Python, AWS/GCP",
        "top_certifications": "AWS Machine Learning, CKA",
        "work_environment": "Remote/Office",
        "roadmap": "Software/DevOps Engineering → Learn ML Basics → Master MLflow/Kubernetes → MLOps Role",
        "free_resources": "DataTalks.Club MLOps Zoomcamp (Free), Made With ML (Free), YouTube: MLOps Community"
    },
    {
        "career": "Sustainable Tech Analyst",
        "category": "Environment",
        "avg_salary_inr": 1000000,
        "avg_salary_usd": 85000,
        "growth_outlook": "High",
        "min_education": "Bachelor's",
        "description": "Evaluates the environmental impact of technologies and advises companies on achieving net-zero emissions.",
        "key_skills": "ESG Reporting, Data Analysis, Carbon Accounting, Sustainability Planning",
        "top_certifications": "GRI Certified, LEED",
        "work_environment": "Office/Consulting",
        "roadmap": "Environmental Science/Business Degree → Learn ESG Frameworks → Carbon Analysis Projects → Consulting",
        "free_resources": "UN CC:e-Learn (Free), Coursera Sustainability Courses (Audit), GHG Protocol Training"
    },
    {
        "career": "Digital Twin Engineer",
        "category": "Engineering",
        "avg_salary_inr": 1300000,
        "avg_salary_usd": 105000,
        "growth_outlook": "High",
        "min_education": "Bachelor's/Master's",
        "description": "Creates highly detailed virtual simulations of physical objects, factories, or cities for analysis and optimization.",
        "key_skills": "3D Modeling, IoT Data Integration, Simulation Software, Python, Analytics",
        "top_certifications": "Digital Twin Consortium Cert",
        "work_environment": "Office/Lab",
        "roadmap": "Mechanical/Systems Engineering → Master CAD & IoT → Learn Simulation Tools → Industry Role",
        "free_resources": "Siemens Digital Industries Software Trials, Unity Learn (Industrial), Coursera IoT"
    },
    {
        "career": "Synthography Artist (AI Art)",
        "category": "Creative",
        "avg_salary_inr": 700000,
        "avg_salary_usd": 60000,
        "growth_outlook": "Medium",
        "min_education": "Any",
        "description": "Uses AI image generators (Midjourney, DALL-E) alongside traditional editing to create commercial art.",
        "key_skills": "Prompt Engineering, Midjourney, Photoshop, Composition, Visual Storytelling",
        "top_certifications": "Adobe Certified Professional",
        "work_environment": "Studio/Freelance",
        "roadmap": "Learn Art Fundamentals → Master Prompting & Image Models → Post-Processing in Photoshop → Portfolio",
        "free_resources": "Midjourney Documentation, YouTube: Olivio Sarikas, Stable Diffusion Tutorials"
    },
    {
        "career": "Cloud FinOps Practitioner",
        "category": "Business",
        "avg_salary_inr": 1400000,
        "avg_salary_usd": 115000,
        "growth_outlook": "Very High",
        "min_education": "Bachelor's",
        "description": "Manages and optimizes cloud computing spending across large enterprise architectures.",
        "key_skills": "AWS Cost Explorer, Financial Modeling, Cloud Architecture, Analytics",
        "top_certifications": "FinOps Certified Practitioner",
        "work_environment": "Office/Remote",
        "roadmap": "Finance/IT Background → Learn Cloud Pricing Models (AWS/Azure) → Get FinOps Certified",
        "free_resources": "FinOps Foundation (Free resources), AWS Cloud Financial Management Guides"
    }
]

new_df = pd.DataFrame(new_careers)
final_df = pd.concat([df, new_df], ignore_index=True)

# Save back to CSV
final_df.to_csv("careers_data.csv", index=False)
print(f"Successfully updated CSV! Total careers: {len(final_df)}")
