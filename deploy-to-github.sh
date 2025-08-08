#!/bin/bash

# Script de déploiement automatique sur GitHub
# TimeSheet Employee App - Web Mobile

echo "🚀 Déploiement TimeSheet Web Mobile sur GitHub"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé. Veuillez installer Git d'abord.${NC}"
    exit 1
fi

# Vérifier si on est dans un repository Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📁 Initialisation du repository Git...${NC}"
    git init
fi

# Ajouter tous les fichiers
echo -e "${BLUE}📦 Ajout des fichiers...${NC}"
git add .

# Vérifier s'il y a des changements
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  Aucun changement détecté.${NC}"
    exit 0
fi

# Demander le message de commit
echo -e "${BLUE}💬 Message de commit (défaut: 'Update TimeSheet Web App'):${NC}"
read -r commit_message
commit_message=${commit_message:-"Update TimeSheet Web App"}

# Faire le commit
echo -e "${BLUE}💾 Création du commit...${NC}"
git commit -m "$commit_message"

# Vérifier si le remote existe
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}🔗 Ajout du remote GitHub...${NC}"
    echo -e "${BLUE}Entrez l'URL de votre repository GitHub:${NC}"
    read -r github_url
    git remote add origin "$github_url"
fi

# Pousser vers GitHub
echo -e "${BLUE}🚀 Poussage vers GitHub...${NC}"
if git push -u origin main; then
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
    echo -e "${GREEN}🌐 Votre application sera disponible sur GitHub Pages${NC}"
    echo -e "${BLUE}📱 N'oubliez pas de configurer GitHub Pages dans les paramètres du repository${NC}"
else
    echo -e "${RED}❌ Erreur lors du push vers GitHub${NC}"
    echo -e "${YELLOW}💡 Vérifiez votre connexion internet et vos permissions GitHub${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo -e "${BLUE}1. Aller sur GitHub → Settings → Pages${NC}"
echo -e "${BLUE}2. Activer GitHub Pages${NC}"
echo -e "${BLUE}3. Configurer l'URL de votre API dans auth.js${NC}"
echo -e "${BLUE}4. Tester l'application sur mobile${NC}"
echo ""
echo -e "${GREEN}Merci d'utiliser TimeSheet Web Mobile ! 📱${NC}"
