#!/bin/bash

# Script de déploiement pour serveur web classique
# Usage: ./deploy.sh [serveur]

set -e

# Configuration
PROJECT_NAME="timesheet-web-secure"
BUILD_DIR="./dist"
SERVER_USER="www-data"
SERVER_GROUP="www-data"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    print_message "Vérification des prérequis..."
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "index.html" ]; then
        print_error "index.html non trouvé. Assurez-vous d'être dans le répertoire du projet."
        exit 1
    fi
    
    # Vérifier que les fichiers essentiels existent
    local required_files=("app.js" "auth.js" "config.js")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_warning "Fichier $file manquant"
        fi
    done
    
    print_success "Prérequis vérifiés"
}

# Nettoyer le répertoire de build
clean_build() {
    print_message "Nettoyage du répertoire de build..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_success "Répertoire de build nettoyé"
    fi
}

# Créer le répertoire de build
create_build() {
    print_message "Création du répertoire de build..."
    
    mkdir -p "$BUILD_DIR"
    
    # Copier tous les fichiers du projet
    cp -r *.html *.js *.css *.toml *.json *.md "$BUILD_DIR/" 2>/dev/null || true
    
    # Créer le répertoire .github s'il existe
    if [ -d ".github" ]; then
        cp -r .github "$BUILD_DIR/"
    fi
    
    print_success "Build créé dans $BUILD_DIR"
}

# Optimiser les fichiers pour la production
optimize_build() {
    print_message "Optimisation des fichiers pour la production..."
    
    cd "$BUILD_DIR"
    
    # Créer un fichier de version
    echo "Build: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" > version.txt
    echo "Commit: $(git rev-parse HEAD 2>/dev/null || echo 'Unknown')" >> version.txt
    
    # Créer un fichier de configuration serveur
    cat > .htaccess << 'EOF'
# Configuration Apache pour Timesheet Web Secure
RewriteEngine On

# Redirection HTTPS (décommenter si nécessaire)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Headers de sécurité
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache pour les ressources statiques
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Pas de cache pour les fichiers HTML
<FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</FilesMatch>

# Fallback pour SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF

    # Créer un fichier de configuration Nginx
    cat > nginx.conf << 'EOF'
# Configuration Nginx pour Timesheet Web Secure
server {
    listen 80;
    server_name _;
    root /var/www/timesheet-web-secure;
    index index.html;

    # Headers de sécurité
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache pour les ressources statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Pas de cache pour les fichiers HTML
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Fallback pour SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

    print_success "Fichiers optimisés pour la production"
    cd ..
}

# Déployer sur serveur local
deploy_local() {
    print_message "Déploiement local..."
    
    local local_web_dir="/var/www/html/$PROJECT_NAME"
    
    if [ ! -d "/var/www/html" ]; then
        print_warning "Répertoire /var/www/html non trouvé. Création..."
        sudo mkdir -p "/var/www/html"
    fi
    
    if [ -d "$local_web_dir" ]; then
        sudo rm -rf "$local_web_dir"
    fi
    
    sudo cp -r "$BUILD_DIR" "$local_web_dir"
    sudo chown -R "$SERVER_USER:$SERVER_GROUP" "$local_web_dir"
    sudo chmod -R 755 "$local_web_dir"
    
    print_success "Déployé localement dans $local_web_dir"
    print_message "Accédez à http://localhost/$PROJECT_NAME"
}

# Déployer sur serveur distant
deploy_remote() {
    local server="$1"
    
    if [ -z "$server" ]; then
        print_error "Adresse du serveur non spécifiée"
        print_message "Usage: ./deploy.sh user@server.com"
        exit 1
    fi
    
    print_message "Déploiement sur $server..."
    
    # Créer un archive tar.gz
    local archive_name="${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$archive_name" -C "$BUILD_DIR" .
    
    # Transférer sur le serveur
    scp "$archive_name" "$server:/tmp/"
    
    # Déployer sur le serveur
    ssh "$server" << EOF
        cd /tmp
        tar -xzf "$archive_name"
        sudo rm -rf /var/www/html/$PROJECT_NAME
        sudo mv . /var/www/html/$PROJECT_NAME
        sudo chown -R $SERVER_USER:$SERVER_GROUP /var/www/html/$PROJECT_NAME
        sudo chmod -R 755 /var/www/html/$PROJECT_NAME
        rm "$archive_name"
        echo "Déploiement terminé sur $server"
EOF
    
    # Nettoyer l'archive locale
    rm "$archive_name"
    
    print_success "Déployé avec succès sur $server"
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS] [SERVER]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -l, --local    Déployer localement"
    echo "  -r, --remote   Déployer sur serveur distant"
    echo ""
    echo "Exemples:"
    echo "  $0              # Déploiement local"
    echo "  $0 user@server.com  # Déploiement distant"
    echo ""
    echo "Fichiers créés:"
    echo "  - $BUILD_DIR/          # Répertoire de build"
    echo "  - .htaccess            # Configuration Apache"
    echo "  - nginx.conf           # Configuration Nginx"
    echo "  - version.txt          # Informations de version"
}

# Fonction principale
main() {
    print_message "🚀 Déploiement de $PROJECT_NAME"
    
    case "${1:-local}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--local|local)
            check_prerequisites
            clean_build
            create_build
            optimize_build
            deploy_local
            ;;
        -r|--remote|remote)
            check_prerequisites
            clean_build
            create_build
            optimize_build
            deploy_remote "$2"
            ;;
        *)
            if [[ "$1" == *"@"* ]]; then
                # C'est une adresse de serveur
                check_prerequisites
                clean_build
                create_build
                optimize_build
                deploy_remote "$1"
            else
                # Déploiement local par défaut
                check_prerequisites
                clean_build
                create_build
                optimize_build
                deploy_local
            fi
            ;;
    esac
    
    print_success "🎉 Déploiement terminé avec succès !"
}

# Exécuter le script principal
main "$@"
