import sys
import os

# Add backend to path
sys.path.insert(0, r"e:\EduAI\backend")

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.database.models import Student

client = TestClient(app)

def run_tests():
    print("Testing EduAI Backend Endpoints...")

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, f"Root endpoint failed: {res.text}"
    print("[OK] Root endpoint OK")

    # 2. Test predictions for Student 1 (At Risk), 4 (Moderate), 6 (Normal)
    for sid, expected_risk in [(1, "AT_RISK"), (4, "MODERATE"), (6, "NORMAL")]:
        # Prediction
        p_res = client.get(f"/api/predictions/student/{sid}")
        assert p_res.status_code == 200, f"Prediction failed for {sid}: {p_res.text}"
        p_data = p_res.json()
        print(f"[OK] Student {sid} Prediction: {p_data['predicted_score']:.1f}%, Status: {p_data['trajectory_status']}, Conf: {p_data['confidence_percentage']:.1f}%")

        # Risk Analysis
        r_res = client.get(f"/api/risk/student/{sid}")
        assert r_res.status_code == 200, f"Risk analysis failed for {sid}: {r_res.text}"
        r_data = r_res.json()
        assert r_data["risk_level"] == expected_risk, f"Expected {expected_risk}, got {r_data['risk_level']}"
        print(f"[OK] Student {sid} Risk: {r_data['risk_score']:.1f}/100, Level: {r_data['risk_level']}, Factors: {len(r_data['factors'])}")

        # Weak Topics
        w_res = client.get(f"/api/weak-topics/student/{sid}")
        assert w_res.status_code == 200, f"Weak topics failed for {sid}: {w_res.text}"
        w_data = w_res.json()
        print(f"[OK] Student {sid} Weak Topics: {w_data['weak_count']} Weak, {w_data['moderate_count']} Mod, {w_data['strong_count']} Strong")

        # Explanations
        e_res = client.get(f"/api/explanations/student/{sid}")
        assert e_res.status_code == 200, f"Explanations failed for {sid}: {e_res.text}"
        e_data = e_res.json()
        print(f"[OK] Student {sid} Next Best Action: {e_data['next_best_actions'][0]}")

        # Adaptive Study Plan
        a_res = client.get(f"/api/adaptive-study-plan/student/{sid}")
        assert a_res.status_code == 200, f"Adaptive plan failed for {sid}: {a_res.text}"
        a_data = a_res.json()
        print(f"[OK] Student {sid} Adaptive Plan: {a_data['total_tasks']} tasks, Today: {len(a_data['todays_tasks'])}, Target Improvement: +{a_data['target_score_improvement']}%")

    # 3. Test Adaptive Task Toggle
    first_task_id = a_data['todays_tasks'][0]['id']
    t_res = client.post(f"/api/adaptive-study-plan/student/6/task/{first_task_id}/toggle")
    assert t_res.status_code == 200, f"Toggle failed: {t_res.text}"
    t_data = t_res.json()
    print(f"[OK] Adaptive Task Toggle: task {t_data['task_id']}, is_completed={t_data['is_completed']}")

    # 4. Test Common Weak Topics
    c_res = client.get("/api/predictions/common-weak-topics")
    assert c_res.status_code == 200, f"Common weak topics failed: {c_res.text}"
    c_data = c_res.json()
    print(f"[OK] Common Weak Topics: {len(c_data['common_weak_topics'])} topics ranked across cohort")

    # 5. Test Alerts with Deduplication
    alt_res = client.get("/api/alerts?deduplicate=true")
    assert alt_res.status_code == 200, f"Alerts failed: {alt_res.text}"
    alt_data = alt_res.json()
    print(f"[OK] Deduplicated Alerts Count: {alt_data['total']}, High Unread: {alt_data['unread_high']}")

    # 6. Test Recommendation Toggle
    rec_toggle_res = client.post("/api/recommendations/1/item/1/toggle")
    assert rec_toggle_res.status_code == 200, f"Rec toggle failed: {rec_toggle_res.text}"
    rec_toggle_data = rec_toggle_res.json()
    print(f"[OK] Recommendation Toggle: item {rec_toggle_data['item_id']}, is_completed={rec_toggle_data['is_completed']}")

    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
