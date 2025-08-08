from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.utils import timezone

class Chauffeur(models.Model):
    """Modèle pour les chauffeurs"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Utilisateur")
    matricule = models.CharField(max_length=20, unique=True, verbose_name="Matricule")
    telephone = models.CharField(
        max_length=15, 
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        verbose_name="Téléphone"
    )
    adresse = models.TextField(verbose_name="Adresse")
    date_embauche = models.DateField(verbose_name="Date d'embauche")
    permis_conduire = models.CharField(max_length=50, verbose_name="Numéro de permis")
    statut = models.CharField(
        max_length=20,
        choices=[
            ('actif', 'Actif'),
            ('inactif', 'Inactif'),
            ('conge', 'En congé'),
            ('arret', 'Arrêt maladie')
        ],
        default='actif',
        verbose_name="Statut"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Chauffeur"
        verbose_name_plural = "Chauffeurs"
        ordering = ['user__last_name', 'user__first_name']

    def __str__(self):
        return f"{self.matricule} - {self.user.get_full_name()}"

    @property
    def nom_complet(self):
        return self.user.get_full_name()


class Vehicule(models.Model):
    """Modèle pour les véhicules"""
    marque = models.CharField(max_length=50, verbose_name="Marque")
    modele = models.CharField(max_length=50, verbose_name="Modèle")
    immatriculation = models.CharField(max_length=20, unique=True, verbose_name="Immatriculation")
    numero_chassis = models.CharField(max_length=50, unique=True, verbose_name="Numéro de châssis")
    couleur = models.CharField(max_length=30, verbose_name="Couleur")
    annee_fabrication = models.IntegerField(verbose_name="Année de fabrication")
    type_vehicule = models.CharField(
        max_length=30,
        choices=[
            ('voiture', 'Voiture'),
            ('camion', 'Camion'),
            ('bus', 'Bus'),
            ('moto', 'Moto'),
            ('utilitaire', 'Utilitaire')
        ],
        verbose_name="Type de véhicule"
    )
    type_carburant = models.CharField(
        max_length=20,
        choices=[
            ('essence', 'Essence'),
            ('diesel', 'Diesel'),
            ('electrique', 'Électrique'),
            ('hybride', 'Hybride')
        ],
        verbose_name="Type de carburant"
    )
    capacite_reservoir = models.FloatField(verbose_name="Capacité du réservoir (L)")
    kilometrage = models.IntegerField(default=0, verbose_name="Kilométrage")
    statut = models.CharField(
        max_length=20,
        choices=[
            ('disponible', 'Disponible'),
            ('en_mission', 'En mission'),
            ('maintenance', 'En maintenance'),
            ('panne', 'En panne'),
            ('reforme', 'Réformé')
        ],
        default='disponible',
        verbose_name="Statut"
    )
    date_achat = models.DateField(verbose_name="Date d'achat")
    prix_achat = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Prix d'achat")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Véhicule"
        verbose_name_plural = "Véhicules"
        ordering = ['marque', 'modele', 'immatriculation']

    def __str__(self):
        return f"{self.marque} {self.modele} - {self.immatriculation}"

    @property
    def nom_complet(self):
        return f"{self.marque} {self.modele} {self.annee_fabrication}"


class Mission(models.Model):
    """Modèle pour les missions"""
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE, verbose_name="Véhicule")
    chauffeur = models.ForeignKey(Chauffeur, on_delete=models.CASCADE, verbose_name="Chauffeur")
    demandeur = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='missions_demandees',
        verbose_name="Demandeur"
    )
    
    # Détails de la mission
    objet = models.CharField(max_length=200, verbose_name="Objet de la mission")
    destination = models.CharField(max_length=200, verbose_name="Destination")
    lieu_depart = models.CharField(max_length=200, default="Bureau principal", verbose_name="Lieu de départ")
    
    # Dates et heures
    date_debut = models.DateTimeField(verbose_name="Date et heure de début")
    date_fin = models.DateTimeField(verbose_name="Date et heure de fin")
    date_retour_prevue = models.DateTimeField(null=True, blank=True, verbose_name="Date de retour prévue")
    date_retour_effective = models.DateTimeField(null=True, blank=True, verbose_name="Date de retour effective")
    
    # Kilométrage
    km_depart = models.IntegerField(verbose_name="Kilométrage au départ")
    km_retour = models.IntegerField(null=True, blank=True, verbose_name="Kilométrage au retour")
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=[
            ('planifiee', 'Planifiée'),
            ('en_cours', 'En cours'),
            ('terminee', 'Terminée'),
            ('annulee', 'Annulée'),
            ('retard', 'En retard')
        ],
        default='planifiee',
        verbose_name="Statut"
    )
    
    # Informations complémentaires
    observations = models.TextField(blank=True, verbose_name="Observations")
    cout_carburant = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Coût carburant"
    )
    autres_frais = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Autres frais"
    )
    
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mission"
        verbose_name_plural = "Missions"
        ordering = ['-date_debut']

    def __str__(self):
        return f"Mission {self.objet} - {self.destination} ({self.date_debut.strftime('%d/%m/%Y')})"

    @property
    def duree(self):
        """Calcule la durée de la mission"""
        if self.date_fin:
            return self.date_fin - self.date_debut
        return None

    @property
    def distance_parcourue(self):
        """Calcule la distance parcourue"""
        if self.km_retour and self.km_depart:
            return self.km_retour - self.km_depart
        return None

    @property
    def cout_total(self):
        """Calcule le coût total de la mission"""
        total = 0
        if self.cout_carburant:
            total += self.cout_carburant
        if self.autres_frais:
            total += self.autres_frais
        return total

    def marquer_en_cours(self):
        """Marque la mission comme en cours"""
        self.statut = 'en_cours'
        self.vehicule.statut = 'en_mission'
        self.vehicule.save()
        self.save()

    def terminer_mission(self, km_retour, observations=""):
        """Termine la mission"""
        self.km_retour = km_retour
        self.date_retour_effective = timezone.now()
        self.statut = 'terminee'
        self.observations = observations
        
        # Mettre à jour le kilométrage du véhicule
        self.vehicule.kilometrage = km_retour
        self.vehicule.statut = 'disponible'
        self.vehicule.save()
        
        self.save()


class Maintenance(models.Model):
    """Modèle pour la maintenance des véhicules"""
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE, verbose_name="Véhicule")
    type_maintenance = models.CharField(
        max_length=30,
        choices=[
            ('preventive', 'Préventive'),
            ('corrective', 'Corrective'),
            ('revision', 'Révision'),
            ('reparation', 'Réparation')
        ],
        verbose_name="Type de maintenance"
    )
    description = models.TextField(verbose_name="Description")
    date_maintenance = models.DateField(verbose_name="Date de maintenance")
    km_maintenance = models.IntegerField(verbose_name="Kilométrage à la maintenance")
    cout = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Coût")
    garage = models.CharField(max_length=100, verbose_name="Garage/Atelier")
    technicien = models.CharField(max_length=100, verbose_name="Technicien")
    statut = models.CharField(
        max_length=20,
        choices=[
            ('planifiee', 'Planifiée'),
            ('en_cours', 'En cours'),
            ('terminee', 'Terminée'),
            ('annulee', 'Annulée')
        ],
        default='planifiee',
        verbose_name="Statut"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Maintenance"
        verbose_name_plural = "Maintenances"
        ordering = ['-date_maintenance']

    def __str__(self):
        return f"Maintenance {self.vehicule} - {self.type_maintenance} ({self.date_maintenance})"
