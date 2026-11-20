import { CONTACT_PHONE, EVENT_DATE_LABEL } from "./contest";

/**
 * Every answer here is backed by the règlement or by the form itself — the
 * article numbers are cited so the claim can be checked.
 */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "Qui peut participer ?",
    answer:
      "Les étudiants, de la Licence 1 au Doctorat (D3), quelle que soit leur spécialité. Le formulaire propose l'USTM, l'INPTIC, l'ITA et l'IAI, et accepte tout autre établissement.",
  },
  {
    question: "Seul ou en équipe ?",
    answer:
      "Les deux. Une équipe compte au moins deux membres ; le premier inscrit en est le référent, c'est lui que l'organisation contacte.",
  },
  {
    question: "Que faut-il présenter ?",
    answer:
      "Une application que vous avez conçue vous-même : c'est l'engagement sur l'honneur qui ouvre le règlement. Le jury définit les critères qui départagent les projets (article 1).",
  },
  {
    question: "À qui appartient mon projet ?",
    answer:
      "À vous. Le club ne revendique jamais la paternité d'un projet (article 8). S'il vend votre application avec votre accord, le revenu est partagé à 80 % pour vous et 20 % pour le club (articles 9 et 10).",
  },
  {
    question: "Mon projet n'est pas terminé. Puis-je m'inscrire ?",
    answer:
      "Oui. Le règlement demande qu'un projet inachevé soit mené à terme par le candidat, puis présenté au club pour une éventuelle mise sur le marché (article 11).",
  },
  {
    question: "Qu'y a-t-il à gagner ?",
    answer:
      "Un ou plusieurs prix, par catégorie et par ordre de mérite (article 4). Leur nature peut être annoncée avant le concours, ou gardée jusqu'au jour J (article 5).",
  },
  {
    question: "Quand a lieu le concours ?",
    answer: `${EVENT_DATE_LABEL}. La durée de chaque présentation et l'ordre de passage sont fixés par le comité d'organisation (articles 2 et 3).`,
  },
  {
    question: "Je me suis trompé dans mon inscription. Que faire ?",
    answer: `Une inscription envoyée ne se modifie pas en ligne. Appelez le ${CONTACT_PHONE} et l'organisation la corrige pour vous.`,
  },
];

export const FAQ_TEASER = FAQ.slice(0, 4);
