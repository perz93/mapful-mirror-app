# Modèles d'e-mails Upvibe (Supabase Auth)

À coller dans **Supabase → Authentication → Emails → Templates**.
Pour chaque modèle : remplacer le sujet, puis tout le contenu du « Message body »
par le contenu du fichier `.html` correspondant, et enregistrer.

| Modèle Supabase        | Fichier             | Sujet                                  |
|------------------------|---------------------|----------------------------------------|
| Confirm signup         | `confirmation.html` | Ton code d'activation · Upvibe |
| Reset Password         | `recovery.html`     | Ton code de réinitialisation · Upvibe |
| Change Email Address   | `email-change.html` | Ton code de confirmation · Upvibe |
| Magic Link             | `magic-link.html`   | Ton lien de connexion Upvibe             |

Inscription, mot de passe oublié et changement d'e-mail envoient un **code à 6 chiffres** (`{{ .Token }}`)
saisi dans l'app : un lien ouvrirait Safari au lieu de l'app installée sur iPhone.

Les variables `{{ .Token }}`, `{{ .ConfirmationURL }}`, `{{ .Email }}` et `{{ .NewEmail }}` sont
remplacées automatiquement par Supabase : ne pas les modifier.

Style « Bandeau noir » (P2). Mise en page : tableaux + styles en ligne et
polices système (Arial), compatibles Gmail, Outlook et Apple Mail. Aucune image : le logo
« upvibe. » et les catégories sont en texte, rien n'est bloqué par les messageries.
