CKEDITOR.addTemplates('jet', {
    imagesPath: '',
    templates: [
        {
            title: '📊 Cards statistiques (3 chiffres)',
            description: 'Bloc avec 3 grands chiffres côte à côte (matchs, buts, classement...)',
            html:
                '<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">' +
                  '<tr>' +
                    '<td style="text-align:center;padding:1.2rem;border:1px solid #e5e7eb;width:33%;">' +
                      '<div style="font-size:2.2rem;font-weight:900;color:#111111;">6</div>' +
                      '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-top:0.3rem;">MATCHS JOUÉS</div>' +
                    '</td>' +
                    '<td style="text-align:center;padding:1.2rem;border:1px solid #e5e7eb;width:33%;">' +
                      '<div style="font-size:2.2rem;font-weight:900;color:#111111;">1</div>' +
                      '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-top:0.3rem;">BUT ENCAISSÉ</div>' +
                    '</td>' +
                    '<td style="text-align:center;padding:1.2rem;border:1px solid #e5e7eb;width:33%;">' +
                      '<div style="font-size:2.2rem;font-weight:900;color:#111111;">2e</div>' +
                      '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-top:0.3rem;">RANG FINAL</div>' +
                    '</td>' +
                  '</tr>' +
                '</table>'
        },
        {
            title: '🏆 Parcours du tournoi',
            description: 'Tableau avec victoires (✓), nuls (–) et défaites (✗) — modifier les noms et scores',
            html:
                '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem;margin:1.5rem 0;max-width:340px;">' +
                  '<div style="font-size:0.72rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#111111;margin-bottom:0.75rem;border-bottom:2px solid #f97316;padding-bottom:0.5rem;">PARCOURS DU TOURNOI</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0;border-bottom:1px solid #f3f4f6;">' +
                    '<div><span style="color:#22c55e;font-weight:700;margin-right:0.5rem;">✓</span><span style="font-size:0.875rem;">FC Adversaire 1</span></div>' +
                    '<span style="font-size:0.875rem;font-weight:700;color:#22c55e;">3 – 0</span>' +
                  '</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0;border-bottom:1px solid #f3f4f6;">' +
                    '<div><span style="color:#22c55e;font-weight:700;margin-right:0.5rem;">✓</span><span style="font-size:0.875rem;">FC Adversaire 2</span></div>' +
                    '<span style="font-size:0.875rem;font-weight:700;color:#22c55e;">2 – 1</span>' +
                  '</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0;border-bottom:1px solid #f3f4f6;">' +
                    '<div><span style="color:#6b7280;font-weight:700;margin-right:0.5rem;">–</span><span style="font-size:0.875rem;">FC Adversaire 3</span></div>' +
                    '<span style="font-size:0.875rem;font-weight:700;color:#6b7280;">0 – 0</span>' +
                  '</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0;">' +
                    '<div><span style="color:#ef4444;font-weight:700;margin-right:0.5rem;">✗</span><span style="font-size:0.875rem;">FC Adversaire 4</span></div>' +
                    '<span style="font-size:0.875rem;font-weight:700;color:#ef4444;">1 – 2</span>' +
                  '</div>' +
                '</div>'
        },
        {
            title: '💬 Citation / mise en avant',
            description: 'Bloc citation avec bordure orange',
            html:
                '<blockquote style="border-left:4px solid #f97316;margin:1.5rem 0;padding:1rem 1.5rem;background:#fff7ed;border-radius:0 8px 8px 0;">' +
                  '<p style="font-style:italic;color:#374151;margin:0;font-size:1.05rem;">"Votre citation ici"</p>' +
                '</blockquote>'
        },
        {
            title: '📌 Sous-titre chapô',
            description: 'Texte introductif en italique centré sous le titre',
            html:
                '<p style="text-align:center;font-style:italic;font-size:1.1rem;color:#6b7280;margin:0.5rem 0 2rem 0;">' +
                  'Écris ici le résumé de l\'article en une ou deux phrases.' +
                '</p>'
        },
        {
            title: '🏷️ Ligne de catégories',
            description: 'Petite ligne de tags en haut d\'article (ex: FOOTBALL FÉMININ · JET)',
            html:
                '<p style="text-align:center;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;margin-bottom:0.5rem;">' +
                  'CATÉGORIE · JET TOULOUSAINE · SAISON 2025/2026' +
                '</p>'
        },
        {
            title: '🟠 Titre de section orange',
            description: 'Titre de section avec trait orange en dessous',
            html:
                '<h2 style="font-size:1.3rem;font-weight:900;text-transform:uppercase;color:#111111;margin:2rem 0 0.5rem 0;padding-bottom:0.4rem;border-bottom:3px solid #f97316;display:inline-block;">' +
                  'TITRE DE SECTION' +
                '</h2>'
        },
        {
            title: '📋 Encadré infos pratiques',
            description: 'Bloc gris avec informations clés (date, lieu, horaire...)',
            html:
                '<div style="background:#f3f4f6;border-radius:8px;padding:1.2rem 1.5rem;margin:1.5rem 0;">' +
                  '<div style="font-size:0.72rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#f97316;margin-bottom:0.75rem;">INFOS PRATIQUES</div>' +
                  '<p style="margin:0.3rem 0;font-size:0.9rem;color:#374151;"><strong>📅 Date :</strong> Samedi 24 mai 2026</p>' +
                  '<p style="margin:0.3rem 0;font-size:0.9rem;color:#374151;"><strong>📍 Lieu :</strong> Stade Municipal, Toulouse</p>' +
                  '<p style="margin:0.3rem 0;font-size:0.9rem;color:#374151;"><strong>⏰ Horaire :</strong> 15h00</p>' +
                  '<p style="margin:0.3rem 0;font-size:0.9rem;color:#374151;"><strong>🏟️ Compétition :</strong> Championnat Régional</p>' +
                '</div>'
        }
    ]
});
