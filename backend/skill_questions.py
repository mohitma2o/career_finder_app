SKILL_QUESTIONS = {
    "Technology": [
        {
            "question": "Which of the following is a core principle of RESTful APIs?",
            "options": ["Stateful communication", "Statelessness", "Tight coupling", "Binary data only"],
            "correct": 1
        },
        {
            "question": "What does 'Big O Notation' describe in computer science?",
            "options": ["Database size", "Memory capacity", "Algorithm complexity", "Network latency"],
            "correct": 2
        },
        {
            "question": "Which protocol is primarily used for secure web communication?",
            "options": ["HTTP", "FTP", "HTTPS", "SMTP"],
            "correct": 2
        },
        {
            "question": "In version control, what is a 'branch' used for?",
            "options": ["Backing up files", "Developing features in isolation", "Increasing download speed", "Deleting old code"],
            "correct": 1
        },
        {
            "question": "What is the primary purpose of a 'Docker' container?",
            "options": ["Storing large databases", "Ensuring consistent environments", "Speeding up CPU performance", "Managing user passwords"],
            "correct": 1
        }
    ],
    "Healthcare": [
        {
            "question": "What is the medical term for high blood pressure?",
            "options": ["Hypotension", "Hypertension", "Tachycardia", "Bradycardia"],
            "correct": 1
        },
        {
            "question": "Which organ is primarily responsible for filtering blood and producing urine?",
            "options": ["Liver", "Heart", "Kidney", "Lungs"],
            "correct": 2
        },
        {
            "question": "What does 'HIPAA' primarily regulate in a clinical setting?",
            "options": ["Surgical procedures", "Drug dosages", "Patient data privacy", "Hospital cleanliness"],
            "correct": 2
        },
        {
            "question": "Which part of the human brain is associated with balance and coordination?",
            "options": ["Cerebrum", "Cerebellum", "Brainstem", "Thalamus"],
            "correct": 1
        },
        {
            "question": "What is the standard first-aid treatment for a suspected minor sprain?",
            "options": ["Heat and massage", "Stretching", "RICE (Rest, Ice, Compression, Elevation)", "Immediate weight-bearing"],
            "correct": 2
        }
    ],
    "Engineering": [
        {
            "question": "In thermodynamics, what does the 'Second Law' state about entropy in an isolated system?",
            "options": ["It always decreases", "It remains constant", "It never decreases", "It is always zero"],
            "correct": 2
        },
        {
            "question": "What is the primary function of a 'Capacitor' in an electrical circuit?",
            "options": ["Blocking current flow", "Storing electrical energy", "Increasing voltage", "Measuring resistance"],
            "correct": 1
        },
        {
            "question": "Which material property describes its resistance to indentation or scratching?",
            "options": ["Ductility", "Toughness", "Hardness", "Elasticity"],
            "correct": 2
        },
        {
            "question": "What does 'CAD' stand for in engineering design?",
            "options": ["Computer-Aided Design", "Centralized Analysis Dashboard", "Calculated Architectural Drawing", "Circuit Automated Design"],
            "correct": 0
        },
        {
            "question": "In structural engineering, what is 'Stress' defined as?",
            "options": ["Total force applied", "Change in length", "Force per unit area", "Internal energy"],
            "correct": 2
        }
    ],
    "Finance": [
        {
            "question": "What does 'P/E Ratio' stand for in stock market analysis?",
            "options": ["Profit to Expense", "Price to Earnings", "Portfolio to Equity", "Percentage of Earnings"],
            "correct": 1
        },
        {
            "question": "Which financial statement shows a company's assets, liabilities, and equity at a specific point in time?",
            "options": ["Income Statement", "Cash Flow Statement", "Balance Sheet", "Retained Earnings Statement"],
            "correct": 2
        },
        {
            "question": "What is the 'Time Value of Money' concept?",
            "options": ["Money loses value over time due to taxes", "Money today is worth more than the same amount in the future", "Time is the most expensive asset", "Interest rates never change"],
            "correct": 1
        },
        {
            "question": "In accounting, what is 'Liquidity'?",
            "options": ["Total annual revenue", "Ability to convert assets into cash quickly", "Amount of debt a company has", "Market value of the company"],
            "correct": 1
        },
        {
            "question": "What does 'Diversification' aim to achieve in an investment portfolio?",
            "options": ["Maximizing short-term gains", "Reducing risk by spreading investments", "Eliminating all taxes", "Increasing trading frequency"],
            "correct": 1
        }
    ],
    "Design": [
        {
            "question": "What does 'Typography' primarily focus on?",
            "options": ["Color theory", "Arrangement and style of text", "3D modeling", "Photo editing"],
            "correct": 1
        },
        {
            "question": "In UX design, what is a 'Wireframe'?",
            "options": ["Final high-fidelity mockup", "A low-fidelity blueprint of a page layout", "The backend database structure", "A type of animation"],
            "correct": 1
        },
        {
            "question": "Which color model is primarily used for digital screens?",
            "options": ["CMYK", "RYB", "RGB", "PMS"],
            "correct": 2
        },
        {
            "question": "What is the 'Rule of Thirds' used for in visual composition?",
            "options": ["Pricing design services", "Dividing an image into a 3x3 grid for balance", "Selecting three primary colors", "Limiting the number of fonts"],
            "correct": 1
        },
        {
            "question": "What is 'White Space' (Negative Space) in design?",
            "options": ["The part of the design left blank", "A mistake in the layout", "A specific shade of white paint", "Area for advertisement"],
            "correct": 0
        }
    ],
    "Business": [
        {
            "question": "What does 'ROI' stand for?",
            "options": ["Rate of Inflation", "Return on Investment", "Revenue over Income", "Risk of Insolvency"],
            "correct": 1
        },
        {
            "question": "In a SWOT analysis, what does the 'O' stand for?",
            "options": ["Operations", "Objectives", "Opportunities", "Ownership"],
            "correct": 2
        },
        {
            "question": "What is a 'Niche Market'?",
            "options": ["The entire global market", "A specialized segment of a larger market", "A market with no competitors", "A physical marketplace"],
            "correct": 1
        },
        {
            "question": "Which of these is a 'Fixed Cost' for a business?",
            "options": ["Raw materials", "Sales commissions", "Monthly Rent", "Shipping fees"],
            "correct": 2
        },
        {
            "question": "What is the primary goal of 'Market Segmentation'?",
            "options": ["Reducing production costs", "Grouping customers with similar needs", "Eliminating competition", "Increasing product price"],
            "correct": 1
        }
    ]
}

DEFAULT_QUESTIONS = [
    {
        "question": "How familiar are you with the fundamental tools and software used in this field?",
        "options": ["Unfamiliar", "Beginner", "Intermediate", "Expert"],
        "correct": 2
    },
    {
        "question": "Have you worked on any real-world projects or internships related to this career?",
        "options": ["None", "Academic projects", "Personal projects", "Professional experience"],
        "correct": 3
    },
    {
        "question": "How would you rate your problem-solving skills in context-specific scenarios?",
        "options": ["Basic", "Average", "Above Average", "Exceptional"],
        "correct": 2
    },
    {
        "question": "Do you regularly keep up with industry news and emerging trends in this field?",
        "options": ["Rarely", "Occasionally", "Frequently", "Obsessively"],
        "correct": 2
    },
    {
        "question": "How comfortable are you with collaborating in a team-based environment?",
        "options": ["Prefer solo work", "Somewhat comfortable", "Very comfortable", "Natural collaborator"],
        "correct": 3
    }
]

def get_questions_for_career(career_name, category=None):
    # Try category first
    if category in SKILL_QUESTIONS:
        return SKILL_QUESTIONS[category]
    
    # Fallback to generic but somewhat tailored questions if we can't find specific ones
    return DEFAULT_QUESTIONS
