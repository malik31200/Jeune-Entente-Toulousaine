import { getTeams } from '../../lib/api'
import TeamGrid from '../../components/TeamGrid'

export const metadata = {
  title: 'Nos Équipes — Jeune Entente Toulousaine',
  description: 'Toutes les équipes de la JET : Foot à 11, Foot à 8, Foot à 5 et Futsal.',
}


export default async function EquipesPage() {
  const data = await getTeams().catch(() => [])
  const allTeams = Array.isArray(data) ? data : (data.results || [])

  // L'API trie déjà par le champ "order" (voir Team.Meta.ordering côté
  // backend) — on ne filtre que le Futsal, qui a sa propre page dédiée.
  // On ne trie plus par nom : un renommage d'équipe dans l'admin ne doit
  // jamais faire disparaître une équipe du site.
  const teams = allTeams.filter((t: any) => t.category !== 'SESM')

  return (
    <div className="container pt-12 pb-40">
      <h1 className="text-4xl text-center font-black uppercase mb-8 mt-8" style={{ color: 'var(--color-primary)' }}>
        Foot à 11
      </h1>
      <TeamGrid teams={teams} />
    </div>
  )
}
