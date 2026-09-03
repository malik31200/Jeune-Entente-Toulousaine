# Import manuel des matchs FFF

Depuis juillet 2026, l'API FFF (`api-dofa.fff.fr`) bloque les requêtes automatisées
avec un 403 Akamai (Bot Manager), y compris depuis Railway. Un vrai navigateur
passe sans problème, donc en attendant que ça se débloque (ou qu'on paye un
service anti-bot), les matchs sont récupérés à la main via cette procédure.

## 1. Trouver l'URL de la compétition/poule

Sur le site FFF (fff.fr ou occitanie.fff.fr), navigue jusqu'au calendrier de
l'équipe concernée et repère l'appel réseau (DevTools → Network → filtre
`matchs`) vers une URL du type :

```
https://api-dofa.fff.fr/api/compets/{cp_no}/phases/{ph_no}/poules/{gp_no}/matchs?page=1
```

`cp_no`/`ph_no`/`gp_no` changent chaque saison et par catégorie — il faut les
retrouver à chaque rentrée (voir le champ `competition.cp_no` dans le JSON, et
les champs `cp_no`/`phase_no`/`poule_no` du modèle `Team` dans l'admin Django,
à mettre à jour en conséquence).

## 2. Récupérer toutes les pages d'un coup (script navigateur)

Plutôt que de copier chaque page à la main :

1. Ouvre l'URL de la page 1 de la poule dans un nouvel onglet (celle trouvée
   à l'étape 1).
2. Ouvre la Console DevTools (F12) **sur cet onglet**.
3. Colle le script ci-dessous en remplaçant `PAGE1_URL` par le chemin
   (relatif, à partir de `/api/...`) de la page 1, puis valide.

```js
(async () => {
  const baseUrl = "https://api-dofa.fff.fr";
  let nextUrl = "PAGE1_URL"; // ex: "/api/compets/449992/phases/1/poules/2/matchs?page=1"
  let allMatches = [];
  while (nextUrl) {
    const res = await fetch(baseUrl + nextUrl, { headers: { Accept: "application/json" } });
    if (!res.ok) { console.error("Erreur", res.status, nextUrl); break; }
    const data = await res.json();
    allMatches = allMatches.concat(data["hydra:member"] || []);
    console.log("Page récupérée, total matchs cumulés :", allMatches.length);
    nextUrl = data["hydra:view"] && data["hydra:view"]["hydra:next"];
  }
  const blob = new Blob([JSON.stringify(allMatches, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fff_matchs.json";
  a.click();
  console.log("Terminé :", allMatches.length, "matchs au total. Fichier téléchargé.");
})();
```

Le navigateur télécharge un seul fichier `fff_matchs.json` contenant tous les
matchs de toutes les pages (simple liste, pas d'enrobage `hydra:member`).

## 3. Importer

Renomme/déplace le fichier téléchargé dans ce dossier (ex.
`2026-09-10-seniors.json`), commit + push, puis sur Railway (Console) :

```
python manage.py import_fff_manual club/fff_manual_imports/2026-09-10-seniors.json
```

La commande accepte aussi bien une liste brute qu'une réponse hydra complète,
et plusieurs fichiers à la fois. Elle ignore automatiquement les matchs qui ne
concernent pas la JET (utile si le fichier vient d'une poule entière).

## 4. Répéter par catégorie

Une exécution du script = une compétition/poule (donc une catégorie en
général). Pour couvrir tout le club, répéter l'étape 1-3 pour chaque équipe
ayant un `cp_no` renseigné dans l'admin (Seniors, Seniors 2, U19, U17, U16,
U15, U14, Féminines, Futsal...).
