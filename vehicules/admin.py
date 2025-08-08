from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from .models import Chauffeur, Vehicule, Mission, Maintenance

@admin.register(Chauffeur)
class ChauffeurAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'nom_complet', 'telephone', 'statut', 'date_embauche']
    list_filter = ['statut', 'date_embauche']
    search_fields = ['matricule', 'user__first_name', 'user__last_name', 'telephone']
    readonly_fields = ['date_creation', 'date_modification']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('user', 'matricule', 'telephone', 'adresse')
        }),
        ('Informations professionnelles', {
            'fields': ('date_embauche', 'permis_conduire', 'statut')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )

    def nom_complet(self, obj):
        return obj.nom_complet
    nom_complet.short_description = 'Nom complet'


@admin.register(Vehicule)
class VehiculeAdmin(admin.ModelAdmin):
    list_display = ['immatriculation', 'marque', 'modele', 'type_vehicule', 'statut', 'kilometrage', 'annee_fabrication']
    list_filter = ['statut', 'type_vehicule', 'type_carburant', 'marque']
    search_fields = ['immatriculation', 'marque', 'modele', 'numero_chassis']
    readonly_fields = ['date_creation', 'date_modification']
    
    fieldsets = (
        ('Identification', {
            'fields': ('marque', 'modele', 'immatriculation', 'numero_chassis', 'couleur', 'annee_fabrication')
        }),
        ('Caractéristiques', {
            'fields': ('type_vehicule', 'type_carburant', 'capacite_reservoir')
        }),
        ('État actuel', {
            'fields': ('statut', 'kilometrage')
        }),
        ('Informations d\'achat', {
            'fields': ('date_achat', 'prix_achat')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            nb_missions=Count('mission'),
            nb_maintenances=Count('maintenance')
        )


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ['objet', 'vehicule', 'chauffeur', 'destination', 'date_debut', 'statut', 'distance_km']
    list_filter = ['statut', 'date_debut', 'vehicule__type_vehicule']
    search_fields = ['objet', 'destination', 'vehicule__immatriculation', 'chauffeur__matricule']
    readonly_fields = ['date_creation', 'date_modification', 'distance_km', 'duree_mission']
    date_hierarchy = 'date_debut'
    
    fieldsets = (
        ('Mission', {
            'fields': ('objet', 'destination', 'lieu_depart', 'demandeur')
        }),
        ('Affectation', {
            'fields': ('vehicule', 'chauffeur')
        }),
        ('Planning', {
            'fields': ('date_debut', 'date_fin', 'date_retour_prevue', 'date_retour_effective')
        }),
        ('Kilométrage', {
            'fields': ('km_depart', 'km_retour', 'distance_km')
        }),
        ('Coûts', {
            'fields': ('cout_carburant', 'autres_frais')
        }),
        ('État', {
            'fields': ('statut', 'observations')
        }),
        ('Métadonnées', {
            'fields': ('duree_mission', 'date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )

    def distance_km(self, obj):
        distance = obj.distance_parcourue
        if distance:
            return f"{distance} km"
        return "-"
    distance_km.short_description = 'Distance'

    def duree_mission(self, obj):
        duree = obj.duree
        if duree:
            heures = duree.total_seconds() // 3600
            minutes = (duree.total_seconds() % 3600) // 60
            return f"{int(heures)}h {int(minutes)}m"
        return "-"
    duree_mission.short_description = 'Durée'

    actions = ['marquer_en_cours', 'marquer_terminee']

    def marquer_en_cours(self, request, queryset):
        for mission in queryset:
            mission.marquer_en_cours()
        self.message_user(request, f"{queryset.count()} mission(s) marquée(s) en cours.")
    marquer_en_cours.short_description = "Marquer comme en cours"

    def marquer_terminee(self, request, queryset):
        count = 0
        for mission in queryset.filter(statut='en_cours'):
            if mission.km_retour:
                mission.terminer_mission(mission.km_retour)
                count += 1
        self.message_user(request, f"{count} mission(s) terminée(s).")
    marquer_terminee.short_description = "Terminer les missions (avec km retour)"


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ['vehicule', 'type_maintenance', 'date_maintenance', 'km_maintenance', 'cout', 'statut']
    list_filter = ['statut', 'type_maintenance', 'date_maintenance']
    search_fields = ['vehicule__immatriculation', 'description', 'garage', 'technicien']
    readonly_fields = ['date_creation', 'date_modification']
    date_hierarchy = 'date_maintenance'
    
    fieldsets = (
        ('Véhicule et maintenance', {
            'fields': ('vehicule', 'type_maintenance', 'description')
        }),
        ('Planning', {
            'fields': ('date_maintenance', 'km_maintenance', 'statut')
        }),
        ('Prestation', {
            'fields': ('garage', 'technicien', 'cout')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vehicule')


# Configuration personnalisée du site admin
admin.site.site_header = "Administration IPSCO - Gestion de Véhicules"
admin.site.site_title = "IPSCO Admin"
admin.site.index_title = "Tableau de bord de la gestion des véhicules"
