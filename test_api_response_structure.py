import requests
import json

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "Test@test.com",
    "password": "test123"
}

def test_auth_endpoints():
    print("🔍 Test de la structure des réponses API Auth")
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
            
            # 2. Test endpoint /Auth/me
            print("\n2️⃣ Test endpoint /Auth/me...")
            try:
                me_response = requests.get(f"{BASE_URL}/Auth/me", headers=headers)
                print(f"Status: {me_response.status_code}")
                if me_response.status_code == 200:
                    me_data = me_response.json()
                    print(f"Type de réponse: {type(me_data)}")
                    print(f"Contenu: {json.dumps(me_data, indent=2)}")
                else:
                    print(f"❌ Erreur: {me_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test /Auth/me: {e}")
            
            # 3. Test endpoint /Auth/users/1
            print("\n3️⃣ Test endpoint /Auth/users/1...")
            try:
                user_response = requests.get(f"{BASE_URL}/Auth/users/1", headers=headers)
                print(f"Status: {user_response.status_code}")
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    print(f"Type de réponse: {type(user_data)}")
                    print(f"Contenu: {json.dumps(user_data, indent=2)}")
                else:
                    print(f"❌ Erreur: {user_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test /Auth/users/1: {e}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    test_auth_endpoints() 