import requests
import json

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_ENDPOINT = f"{BASE_URL}/Auth/login"

# Liste d'utilisateurs à tester (vous pouvez ajouter d'autres utilisateurs de votre base)
TEST_USERS = [
    {"email": "Test@test.com", "password": "test123", "description": "Compte de test par défaut"},
    {"email": "admin@test.com", "password": "admin123", "description": "Compte admin"},
    {"email": "user1@test.com", "password": "user123", "description": "Utilisateur 1"},
    {"email": "user2@test.com", "password": "user123", "description": "Utilisateur 2"},
    # Ajoutez ici d'autres utilisateurs de votre base de données
]

def test_user_login(email, password, description):
    """Teste la connexion d'un utilisateur"""
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            headers={'Content-Type': 'application/json'},
            json={
                'email': email,
                'password': password,
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token', 'N/A')
            print(f"✅ {description}")
            print(f"   Email: {email}")
            print(f"   Token: {token[:20]}..." if len(token) > 20 else f"   Token: {token}")
            print(f"   Status: Connexion réussie")
            return True
        else:
            print(f"❌ {description}")
            print(f"   Email: {email}")
            print(f"   Status: Échec de connexion ({response.status_code})")
            print(f"   Erreur: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ {description}")
        print(f"   Email: {email}")
        print(f"   Status: Erreur de connexion")
        print(f"   Erreur: {str(e)}")
        return False

def main():
    """Teste tous les utilisateurs"""
    print("🔐 Test de connexion avec différents utilisateurs")
    print("=" * 60)
    
    successful_logins = 0
    total_users = len(TEST_USERS)
    
    for user in TEST_USERS:
        print(f"\n📧 Test: {user['description']}")
        print("-" * 40)
        
        if test_user_login(user['email'], user['password'], user['description']):
            successful_logins += 1
        
        print()
    
    # Résumé
    print("=" * 60)
    print(f"📊 Résumé des tests:")
    print(f"   Connexions réussies: {successful_logins}/{total_users}")
    print(f"   Taux de succès: {(successful_logins/total_users)*100:.1f}%")
    
    if successful_logins > 0:
        print(f"\n✅ Utilisateurs fonctionnels disponibles pour les tests!")
        print(f"   Vous pouvez utiliser ces identifiants dans les applications.")
    else:
        print(f"\n⚠️  Aucun utilisateur testé n'a fonctionné.")
        print(f"   Vérifiez les identifiants ou ajoutez des utilisateurs valides.")

if __name__ == "__main__":
    main() 