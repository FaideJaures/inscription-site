import { CONTEST_NAME } from "@/app/lib/contest";

/**
 * The contest rules, transcribed from public/conditions/condition.jpg so they
 * can be read on a phone, searched, and scrolled through before accepting.
 * The /conditions page and the registration form both render this component, so
 * the text agreed to and the text published cannot drift apart.
 */
export const ARTICLES: { n: number; text: string }[] = [
  {
    n: 1,
    text: "L'objectif premier de cet événement est la mise sur le marché de tous les projets. Le jury définit les critères d'évaluation qui permettront de les départager.",
  },
  {
    n: 2,
    text: "La durée de présentation de chaque projet est définie par le comité d'organisation du club de programmation.",
  },
  {
    n: 3,
    text: "L'ordre de passage des candidats est défini par le comité d'organisation du club de programmation.",
  },
  {
    n: 4,
    text: "Un ou plusieurs prix seront remis au(x) vainqueur(s) du concours, par catégorie et par ordre de mérite.",
  },
  {
    n: 5,
    text: "La nature et le nombre des prix (récompenses) peuvent être divulgués avant la date du concours, mais peuvent aussi être tenus à la discrétion du comité d'organisation jusqu'à la date du concours.",
  },
  {
    n: 6,
    text: `Le concours de programmation « ${CONTEST_NAME} » est un tremplin offert par le CPE aux participants de cet événement.`,
  },
  {
    n: 7,
    text: "Tout projet acheté, vendu, financé ou préfinancé le jour de la présentation finale du concours de programmation doit l'être en présence des organisateurs du concours et respecter les clauses de l'article 10.",
  },
  {
    n: 8,
    text: "Le CPE se doit de garder l'idée et les projets de chaque candidat, mais ne jamais revendiquer la paternité de ces projets, ni ne jamais s'initier à la vente sans en faire bénéficier le(s) propriétaire(s).",
  },
  {
    n: 9,
    text: "Le CPE, avec votre accord, s'autorise à démarcher et vendre votre application et vos projets auprès des entreprises et collectivités locales qui manifesteront le désir de se procurer votre produit. Pour chaque vente, le partage se fera à 20 % pour le CPE et 80 % pour le(s) propriétaire(s).",
  },
  {
    n: 10,
    text: "Le partage des revenus de chaque projet se fera à hauteur de 80 % pour le candidat et 20 % pour le CPE.",
  },
  {
    n: 11,
    text: "Tout projet inachevé doit être mené à terme par le candidat, puis présenté au CPE pour une éventuelle mise sur le marché.",
  },
  {
    n: 12,
    text: "Pour toute mise à jour, nouvelle version ou évolution du projet, le CPE ne peut se prévaloir d'aucun droit lors de la vente de ce dernier projet.",
  },
  {
    n: 13,
    text: "Aucun candidat ne peut reprendre l'idée d'un autre candidat, sauf avis de ce dernier.",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function Reglement() {
  return (
    <div className="reglement">
      <p className="reglement-preamble">
        En ma (notre) qualité de développeur(s) (programmeur(s)) candidat(s) au concours de programmation dénommé
        « {CONTEST_NAME} », organisé par le club de programmation de l&apos;école (CPE), je (nous) m&apos;engage
        (nous engageons) sur l&apos;honneur à présenter une application conçue par ma (notre) personne et à respecter
        toutes les règles dudit concours qui me (nous) sont applicables, telles qu&apos;elles sont définies dans les
        articles suivants.
      </p>

      <ol className="articles">
        {ARTICLES.map((article) => (
          <li className="article" key={article.n} id={`article-${article.n}`}>
            <p className="article-num">Art. {pad(article.n)}</p>
            <p className="article-text">{article.text}</p>
          </li>
        ))}
      </ol>

      <p className="reglement-summary">
        <strong>En résumé.</strong> À toutes fins utiles, il est rappelé que les objectifs premiers de cet événement
        sont la mise sur le marché des projets (applications et logiciels).
      </p>
    </div>
  );
}
