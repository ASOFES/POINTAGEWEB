import os
import subprocess
import sys

def check_apk_files():
    print("🔍 Diagnostic des APK")
    print("=" * 50)
    
    # Vérifier les APK existants
    apk_dir = "build/app/outputs/flutter-apk"
    if os.path.exists(apk_dir):
        print(f"✅ Répertoire APK trouvé: {apk_dir}")
        files = os.listdir(apk_dir)
        for file in files:
            if file.endswith('.apk'):
                file_path = os.path.join(apk_dir, file)
                size = os.path.getsize(file_path) / (1024 * 1024)  # MB
                print(f"📱 {file} - {size:.1f}MB")
    else:
        print("❌ Répertoire APK non trouvé")
        return False
    
    return True

def check_android_manifest():
    print("\n🔍 Vérification du manifest Android...")
    manifest_path = "android/app/src/main/AndroidManifest.xml"
    
    if os.path.exists(manifest_path):
        print(f"✅ Manifest trouvé: {manifest_path}")
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Vérifier les permissions
        permissions = [
            'android.permission.CAMERA',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION',
            'android.permission.INTERNET'
        ]
        
        for permission in permissions:
            if permission in content:
                print(f"✅ Permission: {permission}")
            else:
                print(f"❌ Permission manquante: {permission}")
    else:
        print("❌ Manifest non trouvé")

def suggest_solutions():
    print("\n💡 Solutions pour l'échec d'installation:")
    print("1️⃣ Vérifiez que l'installation depuis des sources inconnues est activée")
    print("2️⃣ Désinstallez l'ancienne version si elle existe")
    print("3️⃣ Redémarrez le téléphone")
    print("4️⃣ Essayez un APK différent (arm64-v8a pour la plupart des téléphones)")
    print("5️⃣ Vérifiez l'espace de stockage disponible")

if __name__ == "__main__":
    print("📱 Diagnostic des APK TimeSheet")
    print("=" * 50)
    
    if check_apk_files():
        check_android_manifest()
        suggest_solutions()
    else:
        print("❌ Aucun APK trouvé. Relancez la construction.") 