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

def get_plannings(token):
    """Récupérer les plannings disponibles"""
    print("📅 Récupération des plannings...")
    
    response = requests.get(
        f"{BASE_URL}/Planning",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        plannings = response.json()
        print(f"✅ {len(plannings)} plannings trouvés")
        for i, planning in enumerate(plannings[:5]):  # Afficher les 5 premiers
            print(f"   {i+1}. ID: {planning.get('id')}, User: {planning.get('userId')}, Site: {planning.get('siteId')}")
        return plannings
    else:
        print(f"❌ Erreur récupération plannings: {response.status_code}")
        return []

def get_timesheet_types(token):
    """Récupérer tous les types de pointage"""
    print("\n📋 Récupération des types de pointage...")
    
    response = requests.get(
        f"{BASE_URL}/TimesheetType/GetByParentId/1",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        types = response.json()
        print(f"✅ {len(types)} types trouvés")
        for i, type_item in enumerate(types):
            print(f"   {i+1}. ID: {type_item.get('id')}, Nom: {type_item.get('name')}")
        return types
    else:
        print(f"❌ Erreur récupération types: {response.status_code}")
        return []

def test_timesheet_creation_with_different_data(token):
    """Tester la création de pointage avec différentes données"""
    print("\n🧪 Tests de création de pointage avec différentes configurations...")
    
    # Test 1: Données minimales
    print("\n--- Test 1: Données minimales ---")
    test_data_1 = {
        "code": "TEST001",
        "details": "Test minimal",
        "start": datetime.now().isoformat()
    }
    test_creation(token, test_data_1, "Données minimales")
    
    # Test 2: Avec planningId
    print("\n--- Test 2: Avec planningId ---")
    test_data_2 = {
        "code": "TEST002",
        "details": "Test avec planning",
        "start": datetime.now().isoformat(),
        "planningId": 1
    }
    test_creation(token, test_data_2, "Avec planningId")
    
    # Test 3: Avec timesheetTypeId
    print("\n--- Test 3: Avec timesheetTypeId ---")
    test_data_3 = {
        "code": "TEST003",
        "details": "Test avec type",
        "start": datetime.now().isoformat(),
        "timesheetTypeId": 1
    }
    test_creation(token, test_data_3, "Avec timesheetTypeId")
    
    # Test 4: Données complètes
    print("\n--- Test 4: Données complètes ---")
    test_data_4 = {
        "code": "TEST004",
        "details": "Test complet",
        "start": datetime.now().isoformat(),
        "planningId": 1,
        "timesheetTypeId": 1
    }
    test_creation(token, test_data_4, "Données complètes")

def test_creation(token, data, test_name):
    """Tester la création avec des données spécifiques"""
    print(f"📝 Test: {test_name}")
    print(f"📤 Données envoyées: {json.dumps(data, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/Timesheet",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json=data
    )
    
    print(f"📥 Status: {response.status_code}")
    print(f"📥 Réponse: {response.text[:200]}...")
    
    if response.status_code == 200:
        print("✅ Succès!")
    elif response.status_code == 400:
        print("❌ Erreur 400 - Données invalides")
    elif response.status_code == 500:
        print("❌ Erreur 500 - Problème serveur")
    else:
        print(f"❌ Erreur {response.status_code}")

def analyze_existing_timesheets(token):
    """Analyser les pointages existants pour comprendre la structure"""
    print("\n📊 Analyse des pointages existants...")
    
    response = requests.get(
        f"{BASE_URL}/Timesheet",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        timesheets = response.json()
        print(f"✅ {len(timesheets)} pointages existants")
        
        if timesheets:
            # Analyser le premier pointage
            first_timesheet = timesheets[0]
            print("📋 Structure du premier pointage:")
            for key, value in first_timesheet.items():
                print(f"   {key}: {value}")
    else:
        print(f"❌ Erreur récupération pointages: {response.status_code}")

def main():
    print("🔍 Débogage de la création de pointage")
    print("=" * 50)
    
    # Connexion
    token = login()
    if not token:
        print("❌ Impossible de se connecter")
        return
    
    # Récupérer les données de référence
    plannings = get_plannings(token)
    timesheet_types = get_timesheet_types(token)
    
    # Analyser les pointages existants
    analyze_existing_timesheets(token)
    
    # Tester différentes configurations
    test_timesheet_creation_with_different_data(token)
    
    print("\n" + "=" * 50)
    print("🔍 Analyse terminée")
    print("💡 Suggestions:")
    print("   1. Vérifier les IDs de planning valides")
    print("   2. Vérifier les IDs de type de pointage valides")
    print("   3. Contacter l'équipe backend pour l'erreur 500")

if __name__ == "__main__":
    main() 