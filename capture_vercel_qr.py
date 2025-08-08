import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "admin@test.com",
    "password": "admin123"
}

def capture_vercel_qr():
    print("🔍 Capture d'un vrai QR code Vercel")
    print("=" * 50)
    
    # 1. Connexion avec admin@test.com
    print("\n1️⃣ Connexion avec admin@test.com...")
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
            
            # 2. Simuler différents formats QR code Vercel
            print("\n2️⃣ Formats QR code Vercel possibles...")
            
            # Format 1: Avec employeeId
            format1 = {
                'siteId': 1,
                'planningId': 5,
                'timesheetTypeId': 2,
                'siteName': 'HQ',
                'employeeId': 202,
                'timestamp': datetime.now().isoformat(),
                'validUntil': datetime.now().isoformat()
            }
            
            # Format 2: Sans employeeId (comme localhost)
            format2 = {
                'siteId': 1,
                'planningId': 5,
                'timesheetTypeId': 2,
                'siteName': 'HQ',
                'timestamp': datetime.now().isoformat(),
                'validUntil': datetime.now().isoformat()
            }
            
            # Format 3: Format simplifié
            format3 = {
                'siteId': 1,
                'planningId': 5,
                'timesheetTypeId': 2
            }
            
            print("Format 1 (avec employeeId):")
            print(f"   JSON: {json.dumps(format1)}")
            print(f"   Longueur: {len(json.dumps(format1))} caractères")
            
            print("\nFormat 2 (sans employeeId):")
            print(f"   JSON: {json.dumps(format2)}")
            print(f"   Longueur: {len(json.dumps(format2))} caractères")
            
            print("\nFormat 3 (simplifié):")
            print(f"   JSON: {json.dumps(format3)}")
            print(f"   Longueur: {len(json.dumps(format3))} caractères")
            
            # 3. Instructions pour tester
            print("\n3️⃣ Instructions pour capturer un vrai QR:")
            print("1. Allez sur https://timesheet-web-app.vercel.app/qr")
            print("2. Connectez-vous avec admin@test.com / admin123")
            print("3. Sélectionnez un site et un employé")
            print("4. Générez le QR code")
            print("5. Scannez avec une app QR scanner")
            print("6. Copiez le contenu JSON ici")
            
            # 4. Test avec format1
            print("\n4️⃣ Test avec format1...")
            test_data = {
                'code': 'VERCEL_TEST',
                'details': json.dumps(format1),
                'start': datetime.now().isoformat(),
                'planningId': 5,
                'timesheetTypeId': 2,
            }
            
            test_response = requests.post(
                f"{BASE_URL}/Timesheet",
                headers=headers,
                json=test_data
            )
            
            print(f"Status: {test_response.status_code}")
            if test_response.status_code in [200, 201]:
                print("✅ Format testé fonctionne")
            else:
                print(f"❌ Erreur: {test_response.text}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    capture_vercel_qr() 