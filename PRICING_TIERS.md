# 📋 Plans Tarifaires — Cameroon Memoria Announcements

## 🎯 Principe Fondateur
- **Annonce gratuite** pour tous (accès démocratique au deuil)
- **Features premium** optionnelles payantes (à la carte)
- **Gestion multi-admin** : plusieurs personnes peuvent administrer l'annonce
  - Cas d'usage : créateur au Cameroun + admin en diaspora (France, etc.) qui paie les services premium
- **Prestations séparées** : facturées directement aux prestataires, zéro holding de fonds par CM

---

## 💰 PLANS TARIFAIRES

### **PLAN 1: GRATUIT — Base**
**Prix:** 0 XAF  
**Cas d'usage:** Annonces locales, informations essentielles

#### ✅ Inclus
- Annonce texte (titre + description)
- **1 photo du défunt** (non modifiable/non échangeable)
  - Si veut changer de photo → passage à plan payant
- Nom & prononciation du défunt
- Date de décès
- Relationmoji au défunt
- **Lieux & dates des obsèques** (basique, sans détails horaires)
- Bannière simple (presets)
- Condoléances & messages (modérés)
- Offrandes virtuelles (limitées : 3 types)
- **Gestion multi-admin** (inviter d'autres admins pour co-administrer)

#### ❌ Non inclus
- Photos supplémentaires / galerie
- Remplacement de photo du défunt
- Vidéos
- Déroulé détaillé des obsèques (heures précises, lieux intermédiaires)
- Biographie / témoignages
- Cagnotte pour dons
- Livestream
- Livre d'or

---

### **PLAN 2: ESSENTIEL — 5,000 F CFA**
**Durée:** À la carte (achat unique)  
**Cas d'usage:** Familles qui veulent un mieux finalisé

#### ✅ Inclus (Gratuit +)
- **Remplacement de photo** du défunt (modifier 1x)
- **Déroulé détaillé des obsèques**
  - Heures précises de chaque événement
  - Lieux intermédiaires (mairie, église, cimetière, etc.)
  - Description courte par étape
- Offrandes illimitées (fleurs, bougies, dons virtuels)
- Liens directs vers prestataires (fleurs, catering, etc.)
- Bannière personalisée (couleurs)

#### ❌ Non inclus
- Photos supplémentaires
- Vidéos
- Biographie / témoignages
- Cagnotte
- Livestream

---

### **PLAN 3: COMPLET — 10,000 F CFA**
**Durée:** À la carte  
**Cas d'usage:** Familles fortunées, obsèques d'importance sociale

#### ✅ Inclus (Essentiel +)
- **Galerie media** (5-10 photos)
  - Remplacement illimité de la photo principale
  - Photos de jeunesse, famille, moments importants
- **Vidéos** (1-2 min)
  - Diaporama, témoignage vidéo court
- **Section Biographie**
  - Historique de vie du défunt (parcours, réussites)
  - Chronologie importante
- **Témoignages/Anecdotes**
  - Section dédiée pour publier histoires, citations
  - Modération CM
- **Livre d'or virtuel**
  - Visiteurs laissent messages publics signés
  - Compilation partageable avec famille
- Priorité modération (publication rapide)

#### ❌ Non inclus
- Cagnotte pour dons
- Livestream
- Accès prioritaire aux prestataires

---

### **PLAN 4: PREMIUM — 15,000 F CFA**
**Durée:** À la carte  
**Cas d'usage:** Personnages publics, célébrités, familles royales

#### ✅ Inclus (Complet +)
- **Galerie media illimitée**
  - Photos, vidéos, documents, certificats
- **Page dédiée pour Cagnotte**
  - Collecte de dons numériques (pour famille ou œuvre)
  - Compteur visible, remerciements publics
  - Frais: 5% + frais Stripe (CM gagne ici)
- **Livestream des obsèques** (optionnel)
  - Retransmission en direct accessible via lien partagé
  - Enregistrement archivé (7j visible)
- **Historique Familial**
  - Généalogie simplifiée (parents, enfants, frères-sœurs)
  - Photos d'autres générations
- **Support prioritaire CM**
  - Aide pour mise en page / contenu
  - Réponse dans 24h

---

## 🛠️ PRESTATIONS PRESTATAIRES (Facturées Séparément)

**Modèle:** Paiement direct au prestataire via Stripe Connect (zéro holding par CM)

| Prestation | Initiateur | Paiement | Commission CM |
|-----------|-----------|---------|---|
| Fleurs virtuelles | Visiteurs → Prestataire fleuriste | Direct Stripe Connect | 8-12% (variable) |
| Catering/Repas | Famille → Prestataire catering | Direct Stripe Connect | 5-10% |
| Transport | Famille → Entreprise de transport | Direct Stripe Connect | 5-10% |
| Photographe | Famille → Photographe | Direct Stripe Connect | 10-15% |
| Musique/DJ | Famille → Musicien | Direct Stripe Connect | 10% |

**Flux paiement** :
```
1. Client paie service → Stripe reçoit
2. CM prélève commission % (immédiat)
3. Prestataire reçoit solde (immédiat)
4. Zéro escrow → Zéro opérateur financier
5. Remboursement possible (48h) si litige → Via Stripe refund
```

---

## 📊 Résumé Cas d'Usage

| Profil | Plan Recommandé | Raison |
|--------|---|---|
| Annonce locale, famille modeste | GRATUIT | Information suffisante |
| Famille de taille moyenne, diaspora | ESSENTIEL (5K) | Budget modéré, détails obsèques clairs |
| Famille importante, cérémonie publique | COMPLET (10K) | Biographie, galerie, livre d'or |
| Personnage public, cérémonie d'état | PREMIUM (15K) | Cagnotte, livestream, archive |

---

## 🔄 Modèle "Multi-Admin"

**Cas d'usage typique:**
1. **Créateur** (au Cameroun) : crée annonce → plan gratuit
2. **Co-admin en diaspora** (France) : invité comme admin
3. **Co-admin paie** pour ESSENTIEL/COMPLET/PREMIUM
4. **Bénéfice** : famille divisée géographiquement, chacun peut contribuer au financement

**Implémentation** : Ajouter modèle `AnnouncementAdmin` avec relation Many-to-Many

```prisma
model Announcement {
  id String @id
  // ...
  admins AnnouncementAdmin[]
}

model AnnouncementAdmin {
  id String @id
  announcementId String
  userId String
  role String // CREATOR, ADMIN, VIEWER
  addedAt DateTime
  
  announcement Announcement @relation(fields: [announcementId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

---

## 💡 Notes Importantes

1. **Pas de ratingprestataires** : Clients ne connaissent pas les prestataires → pas d'avis étoiles
2. **Pas d'escrow** : Paiement immédiat → CM n'est pas opérateur financier
3. **Commission flexible** : CM choisit au cas par cas selon prestataire/service
4. **Cagnotte = seul flux CM directs** : Autres prestations = commissions invisibles dans Stripe Connect
