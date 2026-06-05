# Cameroon Memoria — Brief Business pour la mise en production

Ce document résume les services externes nécessaires au lancement de la plateforme, avec les coûts associés et les démarches à suivre.

---

## 1. Stripe (Paiements par carte bancaire)

### C'est quoi ?

Stripe est le service qui permet aux utilisateurs de faire des dons par **carte bancaire** (Visa, Mastercard) sur la plateforme.

### Créer un compte

1. Aller sur [stripe.com](https://stripe.com) et créer un compte
2. Renseigner les informations de l'entreprise/association (raison sociale, adresse, coordonnées bancaires pour recevoir les fonds)
3. Fournir une pièce d'identité du représentant légal
4. Délai d'activation : **2 à 5 jours ouvrés**

### Combien ça coûte ?

| Élément                         | Coût                                                                                   |
|---------------------------------|----------------------------------------------------------------------------------------|
| Création du compte              | **Gratuit**                                                                            |
| Abonnement mensuel              | **Aucun**                                                                              |
| Commission par transaction      | **2.9% + 0.30 USD** par paiement réussi                                                |
| Reversement sur compte bancaire | **Gratuit** (virement automatique sous 7 jours)                                        |
| Remboursements                  | Le montant est reversé au donateur, mais la commission Stripe n'est **pas remboursée** |

### Exemple concret

Un don de **10 000 FCFA** (~15 USD) :

- Commission Stripe : ~0.74 USD (~480 FCFA)
- Montant net reçu : ~**9 520 FCFA**

### Ce qu'il faut fournir au développeur

- L'adresse email du compte Stripe créé
- Les clés API (accessibles dans le Dashboard Stripe → Developers → API Keys)

---

## 2. Mobile Money (Orange Money & MTN MoMo)

### C'est quoi ?

Le service qui permet aux utilisateurs de faire des dons via **Orange Money** ou **MTN Mobile Money**, principal moyen de paiement au Cameroun.

### Comment ça marche ?

On passe par un **agrégateur de paiement** — un intermédiaire qui centralise Orange Money et MTN MoMo dans une seule interface. Pas besoin de négocier séparément avec Orange et MTN.

### Agrégateurs recommandés pour le Cameroun

| Agrégateur   | Inscription                          | Frais par transaction | Particularité                                |
|--------------|--------------------------------------|-----------------------|----------------------------------------------|
| **NotchPay** | [notchpay.co](https://notchpay.co)   | **1.5% à 2%**         | Basé au Cameroun, support local, API moderne |
| **CinetPay** | [cinetpay.com](https://cinetpay.com) | **2% à 3.5%**         | Leader Afrique francophone, très fiable      |
| **Monetbil** | [monetbil.com](https://monetbil.com) | **2% à 3%**           | Spécialisé Cameroun, intégration simple      |

> **Recommandation** : **NotchPay** — basé au Cameroun, frais compétitifs, support réactif en français.

### Créer un compte

1. S'inscrire sur le site de l'agrégateur choisi
2. Fournir les documents **KYC** : pièce d'identité, registre de commerce ou statuts de l'association, justificatif de domicile
3. Renseigner le numéro de compte bancaire ou Mobile Money pour recevoir les reversements
4. Délai d'activation : **3 à 10 jours ouvrés** (vérification des documents)

### Combien ça coûte ?

| Élément                    | Coût                                                            |
|----------------------------|-----------------------------------------------------------------|
| Création du compte         | **Gratuit**                                                     |
| Abonnement mensuel         | **Aucun**                                                       |
| Commission par transaction | **1.5% à 3.5%** selon l'agrégateur                              |
| Reversement                | Généralement **gratuit**, périodicité hebdomadaire ou mensuelle |

### Exemple concret (avec NotchPay à 2%)

Un don de **10 000 FCFA** :

- Commission : 200 FCFA
- Montant net reçu : **9 800 FCFA**

### Ce qu'il faut fournir au développeur

- Le nom de l'agrégateur choisi
- Les clés API du compte agrégateur

---

## 3. Emails automatiques (via OVHcloud)

### C'est quoi ?

Le service qui envoie les **emails automatiques** de la plateforme : confirmation de don, bienvenue à l'inscription, notification de condoléances, réinitialisation de mot de passe, etc.

### Pourquoi OVHcloud et pas SendGrid ?

Puisque le nom de domaine et le VPS sont déjà gérés chez OVHcloud, on utilise directement le **service email OVH (MX Plan)** inclus ou disponible avec le domaine. Cela évite de créer un compte supplémentaire chez un service tiers comme SendGrid.

### Combien ça coûte ?

| Élément               | Coût                                                  |
|-----------------------|-------------------------------------------------------|
| Email avec le domaine | **Inclus** ou ~2 EUR/mois selon l'offre (~1 300 FCFA) |
| Coût supplémentaire   | **Aucun**                                             |

### Limites d'envoi

| Limite            | Valeur               |
|-------------------|----------------------|
| Envoi par heure   | **200 emails/heure** |
| Destinataires max | **100 par message**  |

### Volume préconisé pour le lancement

La limite de **200 emails/heure** est largement suffisante pour le lancement :

| Type d'email                           | Fréquence estimée        |
|----------------------------------------|--------------------------|
| Confirmation de don                    | ~5 à 20/jour             |
| Notification au propriétaire d'annonce | ~5 à 20/jour             |
| Bienvenue à l'inscription              | ~2 à 10/jour             |
| Réinitialisation de mot de passe       | ~1 à 5/jour              |
| Notification de condoléances           | ~5 à 15/jour             |
| **Total estimé**                       | **~20 à 70 emails/jour** |

> **Si la plateforme grandit** et dépasse 200 emails/heure, on pourra migrer vers SendGrid ou un autre service spécialisé. Mais au lancement, le SMTP OVH est largement suffisant.

### Ce qu'il faut fournir au développeur

- L'adresse email d'envoi créée sur OVH (ex: `noreply@cameroonmemoria.com`)
- Le mot de passe de ce compte email

---

## 4. VPS (Serveur d'hébergement)

### C'est quoi ?

Un **VPS** (Virtual Private Server) est le serveur qui hébergera la plateforme Cameroon Memoria. C'est l'équivalent d'un ordinateur distant, allumé 24h/24, sur lequel tourne le site web.

### Fournisseur retenu : OVHcloud

**OVHcloud** a été choisi pour l'hébergement VPS et le nom de domaine. Avantages :

- Serveurs localisés en **France** (faible latence vers l'Afrique)
- Support en **français**
- Nom de domaine et VPS gérés au même endroit
- Protection **anti-DDoS** incluse
- Bande passante **illimitée** sur tous les plans

### Plans OVHcloud VPS disponibles

| Plan      | vCPU     | RAM   | Stockage        | Bande passante    | Prix mensuel                       |
|-----------|----------|-------|-----------------|-------------------|------------------------------------|
| **VPS-1** | 4 cœurs  | 8 Go  | 75 Go SSD       | 400 Mbps illimité | **~6,46 USD/mois** (~4 200 FCFA)   |
| **VPS-2** | 6 cœurs  | 12 Go | 100 Go SSD NVMe | 1 Gbps illimité   | **~9,99 USD/mois** (~6 500 FCFA)   |
| **VPS-3** | 8 cœurs  | 24 Go | 200 Go SSD NVMe | 1,5 Gbps illimité | **~19,97 USD/mois** (~13 000 FCFA) |
| **VPS-4** | 12 cœurs | 48 Go | 300 Go SSD NVMe | 2 Gbps illimité   | **~36,98 USD/mois** (~24 200 FCFA) |

> Tous les plans incluent : trafic illimité, sauvegarde quotidienne (24h), frais d'installation **gratuits**.

### Plan idéal pour Cameroon Memoria

> **Recommandation : VPS-1** (4 vCPU, 8 Go RAM, 75 Go SSD) à **~6,46 USD/mois** (~4 200 FCFA)

**Pourquoi ce plan ?**

- **4 vCPU + 8 Go RAM** : largement suffisant pour faire tourner l'application Next.js, la base de données PostgreSQL, et le stockage Minio simultanément via Docker
- **75 Go SSD** : espace confortable pour la base de données, les photos d'annonces et les médias. Permet de stocker des milliers d'annonces avec photos
- **400 Mbps illimité** : largement suffisant pour le trafic attendu au lancement
- **Sauvegarde quotidienne incluse** : protection automatique des données
- C'est le plan le **moins cher** et il offre déjà des ressources généreuses pour ce projet

**Quand passer au plan supérieur ?** Si la plateforme dépasse ~1 000 utilisateurs actifs par jour ou si le stockage approche 60 Go, passer au **VPS-2** (6 vCPU, 12 Go RAM, 100 Go SSD NVMe) pour ~6 500 FCFA/mois.

### Ce qu'il faut fournir au développeur

- Les identifiants d'accès au VPS (adresse IP, nom d'utilisateur, mot de passe ou clé SSH)
- Le nom de domaine qui sera utilisé (ex: `cameroonmemoria.com`)

---

## Résumé des coûts

### Coûts fixes mensuels

| Service                   | Coût mensuel               |
|---------------------------|----------------------------|
| Stripe                    | Gratuit (pas d'abonnement) |
| Mobile Money (agrégateur) | Gratuit (pas d'abonnement) |
| Emails (OVH SMTP)         | Inclus avec le domaine     |
| **VPS OVHcloud (VPS-1)**  | **~4 200 FCFA/mois**       |
| **Total mensuel estimé**  | **~4 200 FCFA/mois**       |

### Coûts variables (commissions sur les dons)

| Moyen de paiement       | Commission               |
|-------------------------|--------------------------|
| Carte bancaire (Stripe) | 2.9% + ~200 FCFA par don |
| Mobile Money            | 1.5% à 3.5% par don      |

### Coût total la première année (estimation)

| Élément                           | Coût annuel estimé |
|-----------------------------------|--------------------|
| VPS OVHcloud (VPS-1)              | ~50 400 FCFA       |
| Commissions (sur 5M FCFA de dons) | ~100 000 FCFA      |
| **Total annuel estimé**           | **~150 400 FCFA**  |

---

## Prochaines étapes

1. **Créer les comptes** : Stripe, agrégateur Mobile Money (NotchPay recommandé)
2. **Commander le VPS** : OVHcloud VPS Essential
3. **Acheter/transférer le nom de domaine** sur OVHcloud et le pointer vers le VPS
4. **Transmettre les accès** au développeur (clés API, accès VPS, domaine)
5. **Le développeur configure et déploie** la plateforme (1 à 2 jours)
6. **Tests en conditions réelles** : effectuer des dons test, vérifier les emails
7. **Lancement** 🚀
