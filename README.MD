# Projet 2 – Application Web de Gestion de Cabinet d’Avocats

Ceci est une application web complète pour gérer un cabinet d’avocats. Elle permet de gérer les utilisateurs (avocats, clients), les dossiers juridiques, la facturation, les communications et les activités du cabinet à travers une interface intuitive et sécurisée.

## Général

---

## Fonctionnalités par page

| Page                               | Fonctionnalité                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Accueil**                  | Page principale avec accès aux documents récents ajoutés et aux utilisateurs récents.        |
| **Inscription / SignUp**     | Permet de s’inscrire en tant qu’avocat ou client.                                              |
| **Connexion / Login**        | Permet de se connecter pour accéder aux fonctionnalités.                                       |
| **Home**                     | Tableau de bord central affichant les documents et utilisateurs récents.                        |
| **Gestion des dossiers**     | Drag & drop pour téléverser et gérer les fichiers des dossiers.                               |
| **Agenda / Planning**        | Planifier des rendez-vous ou événements.                                                       |
| **Facturation**              | Créer de nouvelles factures et consulter l’historique des paiements.                           |
| **Communications / CRM**     | Composer/envoyer des emails, accéder à la boîte de réception, et rechercher des messages.    |
| **Reporting et Analytique**  | Statistiques : emails envoyés, documents téléversés, temps de session, activités récentes. |
| **Gestion des utilisateurs** | Ajouter, modifier ou supprimer des utilisateurs.                                                 |

---

## Base de données

Tables principales :

- **Utilisateurs**
- **Documents**
- **Factures**
- **Communications**

---

## Déploiement

1. Générer l’application :

```bash
node serveur.js
```
