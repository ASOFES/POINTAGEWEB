import requests
import json

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "Test@test.com",
    "password": "test123"
}

def verify_test_user():
    print("🔍 Vérification de l'utilisateur Test@test.com")
    print("=" * 50)
    
    # 1. Test de connexion
    print("\n1️⃣ Test de connexion...")
    try:
        login_response = requests.post(
            f"{BASE_URL}/Auth/login",
            json=LOGIN_CREDENTIALS,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get('token')
            print(f"✅ Connexion réussie - Token obtenu")
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # 2. Vérifier les utilisateurs
            print("\n2️⃣ Liste des utilisateurs...")
            try:
                users_response = requests.get(f"{BASE_URL}/Auth/users/1", headers=headers)
                print(f"Status: {users_response.status_code}")
                if users_response.status_code == 200:
                    users_data = users_response.json()
                    print(f"Type de réponse: {type(users_data)}")
                    print(f"Nombre d'utilisateurs: {len(users_data) if isinstance(users_data, list) else 1}")
                    print(f"Contenu: {json.dumps(users_data, indent=2)}")
                else:
                    print(f"❌ Erreur: {users_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test utilisateurs: {e}")
            
            # 3. Vérifier les sites
            print("\n3️⃣ Liste des sites...")
            try:
                sites_response = requests.get(f"{BASE_URL}/Site", headers=headers)
                print(f"Status: {sites_response.status_code}")
                if sites_response.status_code == 200:
                    sites_data = sites_response.json()
                    print(f"Nombre de sites: {len(sites_data)}")
                    print(f"Sites: {json.dumps(sites_data, indent=2)}")
                else:
                    print(f"❌ Erreur: {sites_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test sites: {e}")
            
            # 4. Vérifier les employés
            print("\n4️⃣ Liste des employés...")
            try:
                employees_response = requests.get(f"{BASE_URL}/Employee", headers=headers)
                print(f"Status: {employees_response.status_code}")
                if employees_response.status_code == 200:
                    employees_data = employees_response.json()
                    print(f"Nombre d'employés: {len(employees_data)}")
                    print(f"Employés: {json.dumps(employees_data, indent=2)}")
                else:
                    print(f"❌ Erreur: {employees_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test employés: {e}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    verify_test_user() 