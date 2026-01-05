# Build Instructions pour ng-doc-pro

## 🎯 Objectif

Construire une image Docker multi-architecture (linux/amd64 et linux/arm64) pour que l'application fonctionne sur :
- ✅ Serveurs x86_64 (Intel/AMD)
- ✅ Raspberry Pi (ARM64)
- ✅ Mac M1/M2/M3 (ARM64)

## 🚀 Méthode recommandée : GitHub Actions

### Avantages :
- ✅ Construit sur les serveurs GitHub (pas de problème local)
- ✅ Supporte nativement le multi-arch
- ✅ Gratuit pour les dépôts publics
- ✅ Historique des builds

### Comment déclencher le build :

#### Option 1 : Push sur la branche main

Le workflow se déclenche automatiquement quand vous poussez des modifications sur `main` :

```bash
git add .
git commit -m "Update application"
git push origin main
```

#### Option 2 : Déclenchement manuel

1. Allez sur GitHub : https://github.com/pierrenedelec/ng-doc-pro
2. Cliquez sur l'onglet **"Actions"**
3. Sélectionnez **"Build and Push Multi-Arch Docker Image"** dans la liste
4. Cliquez sur **"Run workflow"** → **"Run workflow"**

### Récupérer le digest après le build

1. Une fois le workflow terminé, cliquez sur le run
2. Regardez le **Summary** qui affiche :
   ```yaml
   image: ghcr.io/pierrenedelec/ng-doc-pro:latest@sha256:xxxxx
   ```
3. Copiez cette ligne et mettez-la à jour dans :
   ```
   /pierrenedelec-umbrel-store/pierrenedelec-ng-doc/docker-compose.yml
   ```

Ou récupérez-le en ligne de commande :

```bash
docker buildx imagetools inspect ghcr.io/pierrenedelec/ng-doc-pro:latest | grep "Digest:"
```

## 🔧 Configuration GitHub

### Permissions requises

Le workflow utilise `GITHUB_TOKEN` qui est automatiquement fourni par GitHub Actions.

**Assurez-vous que :**
1. Votre dépôt est **public** OU
2. Vous avez activé les GitHub Packages pour les dépôts privés

### Vérifier que les packages sont publics

1. Allez sur https://github.com/pierrenedelec?tab=packages
2. Trouvez **ng-doc-pro**
3. Cliquez sur **"Package settings"**
4. Descendez à **"Danger Zone"**
5. Assurez-vous que le package est **public**

## 📋 Structure du workflow

Le workflow fait :

1. **Checkout** du code
2. **Setup QEMU** pour l'émulation multi-arch
3. **Setup Docker Buildx** pour les builds avancés
4. **Login** à GitHub Container Registry
5. **Build** pour linux/amd64 et linux/arm64
6. **Push** vers `ghcr.io/pierrenedelec/ng-doc-pro:latest`
7. **Affiche** le digest SHA256 dans le summary

## 🐛 Dépannage

### Le workflow échoue avec "permission denied"

Vérifiez que dans **Settings** → **Actions** → **General** :
- **Workflow permissions** est sur **"Read and write permissions"**

### L'image n'est pas trouvée

Vérifiez que le package est public :
```bash
docker pull ghcr.io/pierrenedelec/ng-doc-pro:latest
```

Si ça échoue, rendez le package public dans les settings GitHub.

### Comment voir les logs du build

1. Onglet **Actions**
2. Cliquez sur le workflow run
3. Cliquez sur **"build-and-push"**
4. Développez les étapes pour voir les logs détaillés

## 📦 Vérification de l'image

Une fois construite, vérifiez les architectures supportées :

```bash
docker buildx imagetools inspect ghcr.io/pierrenedelec/ng-doc-pro:latest
```

Vous devriez voir :
```
Platform: linux/amd64
Platform: linux/arm64
```

## ✅ Mise à jour d'Umbrel

Une fois l'image construite avec le nouveau SHA256 :

```bash
cd /path/to/pierrenedelec-umbrel-store/pierrenedelec-ng-doc

# Mettre à jour docker-compose.yml avec le nouveau SHA256
# Puis sur Umbrel :
./scripts/app update pierrenedelec-ng-doc
```

## 🎉 C'est tout !

Votre image sera désormais compatible avec toutes les architectures, y compris votre serveur Umbrel x86_64 !

