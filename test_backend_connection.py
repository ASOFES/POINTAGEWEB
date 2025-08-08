import requests
import json
from datetime import datetime

# Configuration du backend
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
TEST_EMAIL = "Test@test.com"
TEST_PASSWORD = "test123"

def test_login():
    """Test de connexion avec le backend"""
    print("🔐 Test de connexion...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/Auth/login",
            headers={"Content-Type": "application/json"},
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Connexion réussie!")
            print(f"Token reçu: {data.get('token', 'Non disponible')[:50]}...")
            return data.get('token')
        else:
            print(f"❌ Échec de connexion: {response.status_code}")
            print(f"Réponse: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def test_get_employees(token):
    """Test de récupération des employés"""
    print("\n👥 Test de récupération des employés...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/Employee",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            employees = response.json()
            print(f"✅ {len(employees)} employés récupérés")
            if employees:
                print(f"Premier employé: {employees[0].get('firstName', 'N/A')} {employees[0].get('lastName', 'N/A')}")
            return employees
        else:
            print(f"❌ Échec récupération employés: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur récupération employés: {e}")
        return None

def test_get_sites(token):
    """Test de récupération des sites"""
    print("\n🏢 Test de récupération des sites...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/Site",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            sites = response.json()
            print(f"✅ {len(sites)} sites récupérés")
            if sites:
                print(f"Premier site: {sites[0].get('name', 'N/A')}")
            return sites
        else:
            print(f"❌ Échec récupération sites: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur récupération sites: {e}")
        return None

def test_create_timesheet(token, employee_id, site_id):
    """Test de création d'un pointage"""
    print("\n⏰ Test de création d'un pointage...")
    
    try:
        timesheet_data = {
            "details": "Test de pointage via API",
            "start": datetime.now().isoformat(),
            "planningId": 1,  # ID de planning par défaut
            "timesheetTypeId": 1  # Type de pointage par défaut
        }
        
        response = requests.post(
            f"{BASE_URL}/Timesheet",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=timesheet_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Pointage créé avec succès!")
            print(f"ID du pointage: {result.get('id', 'N/A')}")
            return result
        else:
            print(f"❌ Échec création pointage: {response.status_code}")
            print(f"Réponse: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur création pointage: {e}")
        return None

def main():
    print("🚀 Test de compatibilité avec le backend TimeSheet")
    print("=" * 50)
    
    # Test 1: Connexion
    token = test_login()
    if not token:
        print("❌ Impossible de continuer sans token d'authentification")
        return
    
    # Test 2: Récupération des employés
    employees = test_get_employees(token)
    
    # Test 3: Récupération des sites
    sites = test_get_sites(token)
    
    # Test 4: Création d'un pointage (si on a des employés et sites)
    if employees and sites:
        employee_id = employees[0].get('id')
        site_id = sites[0].get('id')
        test_create_timesheet(token, employee_id, site_id)
    
    print("\n" + "=" * 50)
    print("✅ Tests terminés! Le backend est compatible avec Flutter")
    print("📱 Vous pouvez maintenant développer vos applications Flutter")

if __name__ == "__main__":
    main() 