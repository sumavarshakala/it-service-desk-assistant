import os
import re
import joblib
import numpy as np
from typing import List, Dict, Optional, Tuple
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

CATEGORIES = [
    "Network Issues", "Software Issues", "Hardware Issues", "Email Problems",
    "Account Access", "Security Issues", "Printer Issues", "Other"
]

PRIORITIES = ["Low", "Medium", "High", "Critical"]

# Rule-based priority keywords for enhancement
PRIORITY_RULES = {
    "Critical": [
        r"\b(entire office|all branches|data breach|ransomware|malware|compromised|"
        r"critical|outage|down for all|zero day|exfiltration|raid degraded|"
        r"server room|production down|company-wide)\b"
    ],
    "High": [
        r"\b(cannot (access|connect|login|send|receive)|vpn fail|locked out|"
        r"not working|crashes|urgent|failed|timeout|unauthorized)\b"
    ],
    "Low": [
        r"\b(forgot password|toner low|training request|feedback|miscellaneous|"
        r"new hire|documentation|ergonomic|asset tag|low priority)\b"
    ]
}

# Solution knowledge base
SOLUTION_KB = {
    "vpn": [
        "Restart the VPN client application",
        "Check network connectivity and try a different network",
        "Verify VPN credentials and re-enter password",
        "Clear VPN cache and reconnect",
        "Contact IT if corporate certificate has expired"
    ],
    "password": [
        "Use the self-service password reset portal",
        "Ensure Caps Lock is not enabled",
        "Wait 15 minutes if account is temporarily locked",
        "Contact IT admin for manual password reset"
    ],
    "printer": [
        "Check printer power and network connection",
        "Clear the print queue and restart print spooler",
        "Reinstall printer drivers from IT portal",
        "Verify correct printer is set as default",
        "Check for paper jams and toner levels"
    ],
    "email": [
        "Restart Outlook and check for pending updates",
        "Verify mailbox is not over quota",
        "Check spam/junk folder for missing emails",
        "Reconfigure email account settings",
        "Clear Outlook cache (ost file)"
    ],
    "network": [
        "Restart network adapter",
        "Flush DNS cache (ipconfig /flushdns)",
        "Try connecting via ethernet cable",
        "Check if other devices have same issue",
        "Report to network team if widespread"
    ],
    "software": [
        "Restart the application",
        "Check for pending software updates",
        "Run application as administrator",
        "Reinstall the application from software center",
        "Check system requirements compatibility"
    ],
    "hardware": [
        "Restart the computer",
        "Check all cable connections",
        "Run hardware diagnostics tool",
        "Update device drivers",
        "Submit hardware replacement request"
    ],
    "security": [
        "Do not click suspicious links",
        "Run full antivirus scan immediately",
        "Change all passwords immediately",
        "Report to security team via hotline",
        "Disconnect from network if malware suspected"
    ]
}


class MLService:
    def __init__(self):
        self.category_model = None
        self.priority_model = None
        self.similarity_vectorizer = None
        self._load_models()

    def _load_models(self):
        try:
            cat_path = os.path.join(MODELS_DIR, "category_model.joblib")
            pri_path = os.path.join(MODELS_DIR, "priority_model.joblib")
            vec_path = os.path.join(MODELS_DIR, "similarity_vectorizer.joblib")

            if os.path.exists(cat_path):
                self.category_model = joblib.load(cat_path)
            if os.path.exists(pri_path):
                self.priority_model = joblib.load(pri_path)
            if os.path.exists(vec_path):
                self.similarity_vectorizer = joblib.load(vec_path)
        except Exception as e:
            print(f"Warning: Could not load ML models: {e}")

    def _combine_text(self, title: str, description: str) -> str:
        return f"{title} {description}".lower().strip()

    def predict_category(self, title: str, description: str) -> Tuple[str, float]:
        text = self._combine_text(title, description)
        if self.category_model:
            proba = self.category_model.predict_proba([text])[0]
            pred_idx = np.argmax(proba)
            category = self.category_model.classes_[pred_idx]
            confidence = float(proba[pred_idx])
            return category, round(confidence, 4)
        return self._rule_based_category(text), 0.5

    def predict_priority(self, title: str, description: str) -> Tuple[str, float]:
        text = self._combine_text(title, description)

        # Rule-based enhancement
        rule_priority = self._rule_based_priority(text)
        if rule_priority:
            return rule_priority, 0.85

        if self.priority_model:
            proba = self.priority_model.predict_proba([text])[0]
            pred_idx = np.argmax(proba)
            priority = self.priority_model.classes_[pred_idx]
            confidence = float(proba[pred_idx])
            return priority, round(confidence, 4)

        return "Medium", 0.5

    def _rule_based_category(self, text: str) -> str:
        keywords = {
            "Network Issues": ["vpn", "wifi", "network", "internet", "dns", "lan", "firewall", "bandwidth"],
            "Software Issues": ["software", "application", "outlook", "excel", "install", "crash", "browser"],
            "Hardware Issues": ["laptop", "keyboard", "mouse", "monitor", "hardware", "usb", "battery", "screen"],
            "Email Problems": ["email", "outlook", "mailbox", "spam", "attachment", "calendar"],
            "Account Access": ["password", "account", "login", "access", "permission", "sso", "mfa"],
            "Security Issues": ["security", "phishing", "malware", "ransomware", "breach", "unauthorized"],
            "Printer Issues": ["printer", "print", "toner", "scan", "fax"],
        }
        for category, words in keywords.items():
            if any(w in text for w in words):
                return category
        return "Other"

    def _rule_based_priority(self, text: str) -> Optional[str]:
        for priority in ["Critical", "High", "Low"]:
            for pattern in PRIORITY_RULES.get(priority, []):
                if re.search(pattern, text, re.IGNORECASE):
                    return priority
        return None

    def find_similar_tickets(
        self, title: str, description: str, historical_tickets: List[Dict], top_k: int = 5
    ) -> List[Dict]:
        if not historical_tickets or not self.similarity_vectorizer:
            return []

        query_text = self._combine_text(title, description)
        query_vec = self.similarity_vectorizer.transform([query_text])

        hist_texts = [
            self._combine_text(t["title"], t["description"]) for t in historical_tickets
        ]
        hist_vecs = self.similarity_vectorizer.transform(hist_texts)

        similarities = cosine_similarity(query_vec, hist_vecs)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.1:
                ticket = historical_tickets[idx]
                results.append({
                    "ticket_id": ticket["id"],
                    "title": ticket["title"],
                    "resolution": ticket.get("resolution"),
                    "similarity_score": round(score, 4)
                })
        return results

    def suggest_solutions(self, title: str, description: str, similar_tickets: List[Dict]) -> List[Dict]:
        text = self._combine_text(title, description)
        suggestions = []
        seen = set()

        # From knowledge base
        for keyword, solutions in SOLUTION_KB.items():
            if keyword in text:
                for sol in solutions[:3]:
                    if sol not in seen:
                        suggestions.append({"suggestion": sol, "source": "Knowledge Base"})
                        seen.add(sol)

        # From similar ticket resolutions
        for ticket in similar_tickets:
            resolution = ticket.get("resolution")
            if resolution and resolution not in seen:
                suggestions.append({
                    "suggestion": resolution,
                    "source": f"Similar Ticket #{ticket['ticket_id']}"
                })
                seen.add(resolution)

        # Default suggestions if none found
        if not suggestions:
            suggestions = [
                {"suggestion": "Restart the affected application or device", "source": "General"},
                {"suggestion": "Check if the issue persists after a system reboot", "source": "General"},
                {"suggestion": "Contact IT support with screenshots of the error", "source": "General"},
            ]

        return suggestions[:6]

    def full_prediction(self, title: str, description: str, historical_tickets: List[Dict] = None) -> Dict:
        category, cat_conf = self.predict_category(title, description)
        priority, pri_conf = self.predict_priority(title, description)
        similar = self.find_similar_tickets(title, description, historical_tickets or [])
        suggestions = self.suggest_solutions(title, description, similar)

        return {
            "category": category,
            "category_confidence": cat_conf,
            "priority": priority,
            "priority_confidence": pri_conf,
            "similar_tickets": similar,
            "suggestions": suggestions
        }


ml_service = MLService()
