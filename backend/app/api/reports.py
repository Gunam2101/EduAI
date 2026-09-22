import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Dict, Any, List, Optional

from app.database.connection import get_db
from app.database.models import Student, LearningMetric, DifficultyResult
from app.services.indian_academic_context import get_indian_student_name, get_student_academic_meta

from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/api/reports", tags=["Reports"])

def normalize_gender(val: Optional[str]) -> Optional[str]:
    if not val or val.lower() in ("all", "both", "*", ""):
        return None
    if val.strip().lower() in ("male", "m"):
        return "Male"
    if val.strip().lower() in ("female", "f"):
        return "Female"
    return val.capitalize()

@router.get("/data")
def get_report_data(
    report_type: str = Query("overall", pattern="^(overall|attendance|assessment|difficulty|at_risk|progress)$"),
    gender: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(300, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Student).join(LearningMetric).join(DifficultyResult)

    if report_type == "at_risk":
        query = query.filter(DifficultyResult.risk_level == "AT_RISK")
    elif report_type == "attendance":
        query = query.filter(LearningMetric.overall_attendance_rate < 75.0)

    if risk_level and risk_level.upper() != "ALL" and report_type != "at_risk":
        query = query.filter(DifficultyResult.risk_level == risk_level.upper())

    norm_g = normalize_gender(gender)
    if norm_g:
        query = query.filter(func.lower(Student.gender) == norm_g.lower())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(or_(
            Student.name.ilike(search_term),
            Student.id.cast(Student.id.type).ilike(search_term)
        ))

    students = query.limit(limit).all()

    rows = []
    for s in students:
        m = s.metrics
        d = s.difficulty
        iname = get_indian_student_name(s.id)
        meta = get_student_academic_meta(s.id)

        if report_type == "overall":
            rows.append({
                "student_id": s.id,
                "name": iname,
                "gender": s.gender,
                "register_no": meta["register_no"],
                "department": meta["department"],
                "quiz_average": round(m.quiz_average, 1) if m else 0.0,
                "midterm_marks": round(m.midterm_marks, 1) if m else 0.0,
                "final_marks": round(m.final_marks, 1) if m else 0.0,
                "gpa": m.previous_gpa if m else 0.0,
                "attendance": f"{m.overall_attendance_rate:.1f}%" if m else "0.0%",
                "performance_score": f"{m.learning_performance_score:.1f}" if m else "0.0",
                "risk_level": d.risk_level if d else "NORMAL"
            })
        elif report_type == "attendance":
            rows.append({
                "student_id": s.id,
                "name": iname,
                "gender": s.gender,
                "register_no": meta["register_no"],
                "lectures_attended": f"{m.lectures_attended}/{m.total_lectures}" if m else "0/12",
                "lecture_rate": f"{m.lecture_attendance_rate:.1f}%" if m else "0.0%",
                "labs_attended": f"{m.labs_attended}/{m.total_lab_sessions}" if m else "0/6",
                "lab_rate": f"{m.lab_attendance_rate:.1f}%" if m else "0.0%",
                "overall_attendance": f"{m.overall_attendance_rate:.1f}%" if m else "0.0%",
                "risk_level": d.risk_level if d else "NORMAL"
            })
        elif report_type == "assessment":
            rows.append({
                "student_id": s.id,
                "name": iname,
                "gender": s.gender,
                "quiz1": m.quiz1_marks if m else 0.0,
                "quiz2": m.quiz2_marks if m else 0.0,
                "quiz3": m.quiz3_marks if m else 0.0,
                "quiz_average": round(m.quiz_average, 1) if m else 0.0,
                "midterm": m.midterm_marks if m else 0.0,
                "final": m.final_marks if m else 0.0,
                "exam_average": f"{m.exam_average:.1f}%" if m else "0.0%"
            })
        elif report_type in ("difficulty", "at_risk"):
            rows.append({
                "student_id": s.id,
                "name": iname,
                "gender": s.gender,
                "performance_score": f"{m.learning_performance_score:.1f}" if m else "0.0",
                "difficulty_score": f"{d.difficulty_score:.1f}" if d else "0.0",
                "risk_level": d.risk_level if d else "NORMAL",
                "attendance": f"{m.overall_attendance_rate:.1f}%" if m else "0.0%",
                "final_marks": m.final_marks if m else 0.0,
                "weak_areas": d.weak_indicators if d else "None"
            })
        elif report_type == "progress":
            prev = (m.previous_gpa / 4.0) * 100 if m else 50.0
            diff = (m.learning_performance_score - prev) if m else 0.0
            rows.append({
                "student_id": s.id,
                "name": iname,
                "gender": s.gender,
                "baseline_gpa": m.previous_gpa if m else 0.0,
                "baseline_normalized": f"{prev:.1f}",
                "current_score": f"{m.learning_performance_score:.1f}" if m else "0.0",
                "improvement": f"{diff:+.1f}%",
                "status": "Improved" if diff > 0 else "Needs Monitoring"
            })

    return {
        "report_type": report_type,
        "total_records": len(rows),
        "data": rows
    }

@router.get("/export/csv")
def export_report_csv(
    report_type: str = Query("overall"),
    gender: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    report_res = get_report_data(
        report_type=report_type,
        gender=gender,
        risk_level=risk_level,
        search=search,
        limit=500,
        db=db
    )
    rows = report_res["data"]
    if not rows:
        raise HTTPException(status_code=404, detail="No student records matched the export criteria")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)

    filename = f"LearnTrack_PS52_{report_type.upper()}_Report.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/pdf")
def export_report_pdf(
    report_type: str = Query("overall"),
    gender: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    report_res = get_report_data(
        report_type=report_type,
        gender=gender,
        risk_level=risk_level,
        search=search,
        limit=50,
        db=db
    )
    rows = report_res["data"]
    if not rows:
        raise HTTPException(status_code=404, detail="No data available for export")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), leftMargin=24, rightMargin=24, topMargin=24, bottomMargin=24)
    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="TitleStyle",
        parent=styles["Heading1"],
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#1e3a8a"),
        spaceAfter=6
    )

    meta_style = ParagraphStyle(
        name="MetaStyle",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10
    )

    filter_info = []
    if gender:
        filter_info.append(f"Gender: {gender}")
    if risk_level:
        filter_info.append(f"Risk: {risk_level}")
    filter_str = f" | Filters: {', '.join(filter_info)}" if filter_info else ""

    elements.append(Paragraph(f"LearnTrack AI — PS52 Academic Analytics: {report_type.upper().replace('_', ' ')} REPORT", title_style))
    elements.append(Paragraph(f"Institution: Sri Krishna College of Engineering & Technology | Department: Computer Science & Engineering | Records: {len(rows)}{filter_str}", meta_style))

    # Convert rows to table matrix
    headers = list(rows[0].keys())[:8]
    table_data = [[h.replace("_", " ").title() for h in headers]]
    for r in rows[:40]:
        row_vals = [str(r.get(h, ""))[:25] for h in headers]
        table_data.append(row_vals)

    pdf_table = Table(table_data)
    pdf_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
    ]))

    elements.append(pdf_table)
    doc.build(elements)
    buffer.seek(0)

    filename = f"LearnTrack_PS52_{report_type.upper()}_Report.pdf"
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
