from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)


OUTPUT = "output/pdf/Gungun_Wadhwani_Enhanced_Resume.pdf"


def link(url, text):
    return f'<link href="{url}"><font color="#1f4e79">{text}</font></link>'


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="Name",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15.2,
        leading=16.5,
        alignment=1,
        textColor=colors.HexColor("#111827"),
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="Contact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=8.6,
        alignment=1,
        textColor=colors.HexColor("#1f2937"),
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.35,
        leading=9.2,
        textColor=colors.HexColor("#111827"),
        borderWidth=0,
        borderPadding=0,
        spaceBefore=2.7,
        spaceAfter=1,
    )
)
styles.add(
    ParagraphStyle(
        name="EntryTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.6,
        leading=8.35,
        textColor=colors.HexColor("#111827"),
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.15,
        leading=7.95,
        textColor=colors.HexColor("#111827"),
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        parent=styles["Body"],
        fontSize=7.05,
        leading=7.85,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeBullet",
        parent=styles["Body"],
        leftIndent=8,
        firstLineIndent=-5,
        bulletIndent=0,
        spaceAfter=1.3,
    )
)


def section(title):
    return [
        Spacer(1, 0.6),
        Paragraph(title, styles["Section"]),
        Table([[""]], colWidths=[192 * mm], style=TableStyle([("LINEABOVE", (0, 0), (-1, -1), 0.55, colors.HexColor("#374151"))])),
    ]


def bullet(text):
    return Paragraph(text, styles["ResumeBullet"], bulletText="-")


def role_line(left, right=None):
    if right:
        data = [[Paragraph(left, styles["EntryTitle"]), Paragraph(right, styles["Small"])]]
        return Table(data, colWidths=[148 * mm, 44 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("ALIGN", (1, 0), (1, 0), "RIGHT"), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return Paragraph(left, styles["EntryTitle"])


story = []

story.append(Paragraph("Gungun Wadhwani", styles["Name"]))
story.append(
    Paragraph(
        "+91 8770958514 | wadhwagungun09@gmail.com | "
        + link("https://linkedin.com/in/gungunwadhwani", "LinkedIn")
        + " | "
        + link("https://github.com/GungunW-0903", "GitHub")
        + " | "
        + link("https://gungunw-0903.github.io", "Portfolio")
        + " | "
        + link("https://leetcode.com/u/GungunW-0903/", "LeetCode")
        + " | Rewa, MP",
        styles["Contact"],
    )
)

story += section("Education")
edu = [
    [
        Paragraph("<b>National Institute of Technology, Patna</b> - B.Tech in Computer Science and Engineering", styles["Body"]),
        Paragraph("2024 - Present<br/><b>CGPA:</b> 8.75 / 10.0", styles["Small"]),
    ],
    [
        Paragraph("<b>Sacred Heart Convent School</b> - Higher Secondary Education, Rewa, Madhya Pradesh", styles["Body"]),
        Paragraph("Completed", styles["Small"]),
    ],
]
story.append(Table(edu, colWidths=[144 * mm, 48 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("ALIGN", (1, 0), (1, -1), "RIGHT"), ("BOTTOMPADDING", (0, 0), (-1, -1), 0.5)])))

story += section("Skills and Tools")
skills = [
    "<b>Languages:</b> Python, Java, C++",
    "<b>Web Development:</b> ReactJS, Node.js, Express.js, Tailwind CSS, REST APIs, UI/UX Design",
    "<b>Databases:</b> MongoDB, SQL",
    "<b>Tools & Platforms:</b> Firebase, Git, GitHub, Clerk Authentication, Stripe, Vercel",
    "<b>Core CS:</b> Data Structures & Algorithms, OOP, Computer Networks, DBMS, Compiler Design, Theory of Computation",
    "<b>Soft Skills:</b> Leadership, Teamwork, Communication, Time Management",
]
for item in skills:
    story.append(Paragraph(item, styles["Body"]))

story += section("Projects")
projects = [
    (
        "CineSnap - Full-Stack Movie Ticket Booking Platform | ReactJS, Vite, Node.js, Express.js, MongoDB, Clerk, Stripe",
        "Jun 2026 - Present",
        [
            "Built a MERN-style movie booking platform with movie discovery, detail pages, showtime selection, interactive seat booking, favorites, reviews, and booking history.",
            "Designed REST APIs for movies, shows, bookings, reviews, payments, users, email notifications, and admin workflows with MongoDB/Mongoose data models.",
            "Integrated Clerk-ready authentication, Stripe Checkout, and Nodemailer while keeping frontend and backend deployable as independent services.",
            link("https://github.com/GungunW-0903/CineSnap", "GitHub")
            + " | "
            + link("https://gungunw-0903.github.io/CineSnap/", "Deployed Link"),
        ],
    ),
    (
        "Velocity - AI-Powered Career Growth Platform | JavaScript, React, Firebase",
        "Hackathon Project",
        [
            "Led frontend development in a 4-member team at GDSC Techsprint, delivering AI-assisted resume enhancement, mock interviews, and skill-based job matching.",
            "Implemented a Fellowship & Challenges module where companies publish real-world tasks and assess candidates through practical performance.",
            "Helped the team secure a Top 10 rank in a competitive national-level online hackathon.",
            link("https://github.com/Mohnish27-dev/Velocity", "GitHub"),
        ],
    ),
    (
        "SafeExit - Safety & Emergency Assistance Platform | Next.js, React, Node.js, MongoDB",
        "Project",
        [
            "Developed a safety-focused web platform for emergency support, trusted-contact access, incident reporting, and dashboard-based monitoring.",
            "Structured protected flows, secure data handling, and role-aware dashboard screens for users and administrators in time-sensitive scenarios.",
            "Improved usability with modular components, reusable API patterns, and responsive layouts for mobile-first emergency access.",
        ],
    ),
]
for title, date, bullets in projects:
    block = [role_line(title, date)]
    block.extend(bullet(b) for b in bullets)
    story.append(KeepTogether(block))

story += section("Certifications and Coding")
certs = [
    "<b>NPTEL - The Joy of Computing Using Python (IIT Madras):</b> Strengthened Python fundamentals, computational thinking, and problem-solving.",
    "<b>Google Cloud Skills Boost:</b> Completed learning paths in Cloud Computing, ML Foundations, BigQuery, and Generative AI.",
    "<b>Competitive Programming:</b> Solved 350+ problems on LeetCode and GeeksforGeeks across arrays, trees, graphs, and DP. " + link("https://leetcode.com/u/GungunW-0903/", "LeetCode Profile"),
]
for item in certs:
    story.append(Paragraph(item, styles["Body"]))

story += section("Open Source Contributions")
story.append(role_line("Contributor - GirlScript Summer of Code (GSSoC 2026)", "2026"))
story.append(bullet("Shortlisted as an open-source contributor and merged multiple pull requests, demonstrating collaboration, code quality, and version-control discipline."))

story += section("Positions of Responsibility")
positions = [
    ("Web Developer, Web Development Cell - NIT Patna", "2025 - Present", "Developing and maintaining web applications using ReactJS, Node.js, and MongoDB."),
    ("PR Team Member, Robotics Club - NIT Patna", "2025 - Present", "Managed outreach, event promotion, and inter-college engagement for technical events."),
    ("Dance Member, Total Chaos Cultural Club - NIT Patna", "2025 - Present", "Contributed to choreography, rehearsals, and stage performances at inter-college events."),
]
for title, date, desc in positions:
    story.append(role_line(title, date))
    story.append(bullet(desc))

story += section("Achievements and Hackathons")
achievements = [
    "<b>National Hackathon - Top 10 Finish:</b> Ranked in the Top 10 at GDSC Techsprint, NIT Patna.",
    "<b>Smart India Hackathon:</b> Shortlisted in the internal college round among top-performing teams.",
    "<b>Campus Ambassador, IIT Delhi:</b> Awarded a Letter of Recommendation for exceptional performance.",
    "<b>Athletics & Cultural Excellence:</b> Secured 1st Prize in Group Dance and Individual Dance at IIT Patna; awarded in 200m and 400m running.",
    "<b>100% Attendance Award:</b> Recognised for consistent commitment and punctuality.",
]
for item in achievements:
    story.append(Paragraph(item, styles["Body"]))

story += section("Languages and Interests")
story.append(Paragraph("<b>Languages:</b> English (Fluent), Hindi (Fluent)", styles["Body"]))
story.append(Paragraph("<b>Interests:</b> Dancing, Drawing & Crafting, Carrom, Badminton, Athletics, Event Anchoring", styles["Body"]))

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=9 * mm,
    leftMargin=9 * mm,
    topMargin=8 * mm,
    bottomMargin=7 * mm,
    title="Gungun Wadhwani Resume",
    author="Gungun Wadhwani",
)
doc.build(story)
print(OUTPUT)
