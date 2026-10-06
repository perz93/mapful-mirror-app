# Modèles d'e-mails VIBE (Supabase Auth)

À coller dans **Supabase → Authentication → Emails → Templates**.
Pour chaque modèle : remplacer le sujet, puis tout le contenu du « Message body »
par le contenu du fichier `.html` correspondant, et enregistrer.

| Modèle Supabase        | Fichier             | Sujet                                  |
|------------------------|---------------------|----------------------------------------|
| Confirm signup         | `confirmation.html` | Bienvenue sur VIBE ✦ active ton compte |
| Reset Password         | `recovery.html`     | Ton nouveau mot de passe VIBE |
| Change Email Address   | `email-change.html` | Confirme ta nouvelle adresse e-mail    |
| Magic Link             | `magic-link.html`   | Ton lien de connexion VIBE             |

Les variables `{{ .ConfirmationURL }}`, `{{ .Email }}` et `{{ .NewEmail }}` sont
remplacées automatiquement par Supabase : ne pas les modifier.

Style « Poster lime » (E4). Mise en page : tableaux + styles en ligne et
polices système (Arial), compatibles Gmail, Outlook et Apple Mail. Le logo
« vibe. » est en texte ; seules les 3 icônes de l'e-mail de bienvenue sont des
images, servies depuis `public/email/` du site en production : elles
s'affichent une fois cette branche mise en ligne.
