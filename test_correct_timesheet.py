import requests
import json
from datetime import datetime

# Configuration du backend
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
TEST_EMAIL = "Test@test.com"
TEST_PASSWORD = "test123"

def login():
    """Connexion pour obtenir le token"""
    response = requests.post(
        f"{BASE_URL}/Auth/login",
        headers={"Content-Type": "application/json"},
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    
    if response.status_code == 200:
        return response.json().get('token')
    return None

def test_correct_timesheet_creation(token):
    """Tester la création de pointage avec la structure correcte"""
    print("⏰ Test de création de pointage avec structure correcte...")
    
    # Structure correcte basée sur les pointages existants
    import uuid
    unique_code = str(uuid.uuid4())[:8].upper()
    
    # Données JSON pour le champ details (comme dans les pointages existants)
    details_data = {
        "userId": 1,  # ID de l'utilisateur
        "userName": "Test User",
        "planningId": 5,  # Planning valide trouvé dans les tests
        "timestamp": datetime.now().isoformat(),
        "location": {
            "latitude": -11.6375185,
            "longitude": 27.5015375
        }
    }
    
    timesheet_data = {
        "code": unique_code,
        "details": json.dumps(details_data),  # Convertir en JSON string
        "start": datetime.now().isoformat(),
        "planningId": 5,  # Planning valide
        "timesheetTypeId": 2  # Type valide trouvé
    }
    
    print(f"📝 Données envoyées:")
    print(json.dumps(timesheet_data, indent=2))
    
    response = requests.post(
        f"{BASE_URL}/Timesheet",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json=timesheet_data
    )
    
    print(f"📥 Status: {response.status_code}")
    print(f"📥 Réponse: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Pointage créé avec succès!")
        print(f"ID du pointage: {result.get('id')}")
        print(f"Code du pointage: {result.get('code')}")
        return True
    else:
        print(f"❌ Échec création pointage: {response.status_code}")
        return False

def test_simple_timesheet_creation(token):
    """Tester avec une structure plus simple"""
    print("\n⏰ Test de création avec structure simple...")
    
    import uuid
    unique_code = str(uuid.uuid4())[:8].upper()
    
    # Structure plus simple
    timesheet_data = {
        "code": unique_code,
        "details": "Pointage test via API Flutter",  # Texte simple
        "start": datetime.now().isoformat(),
        "planningId": 5,
        "timesheetTypeId": 2
    }
    
    print(f"📝 Données envoyées:")
    print(json.dumps(timesheet_data, indent=2))
    
    response = requests.post(
        f"{BASE_URL}/Timesheet",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json=timesheet_data
    )
    
    print(f"📥 Status: {response.status_code}")
    print(f"📥 Réponse: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Pointage créé avec succès!")
        return True
    else:
        print(f"❌ Échec création pointage: {response.status_code}")
        return False

def main():
    print("🔧 Test de création de pointage avec structure correcte")
    print("=" * 60)
    
    # Connexion
    token = login()
    if not token:
        print("❌ Impossible de se connecter")
        return
    
    # Test 1: Structure complexe (comme les pointages existants)
    success1 = test_correct_timesheet_creation(token)
    
    # Test 2: Structure simple
    success2 = test_simple_timesheet_creation(token)
    
    print("\n" + "=" * 60)
    if success1 or success2:
        print("✅ Problème résolu! La création de pointage fonctionne")
        print("📱 Vous pouvez maintenant développer vos applications Flutter")
    else:
        print("❌ Le problème persiste - contacter l'équipe backend")
        print("💡 L'erreur 500 indique un problème côté serveur")

if __name__ == "__main__":
    main() 