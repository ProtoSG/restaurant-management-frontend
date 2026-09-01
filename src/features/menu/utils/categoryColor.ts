// Paleta pastel ya definida en index.css — nada de colores nuevos, solo se reutilizan para
// distinguir categorías cuando un producto todavía no tiene foto. Rotación determinística por
// id de categoría: la misma categoría siempre cae en el mismo color, sin guardar nada nuevo.
const CATEGORY_COLOR_CLASSES = [
  "bg-green/15 text-green",
  "bg-orange/15 text-orange",
  "bg-blue/15 text-blue",
  "bg-purple/15 text-purple",
  "bg-pink/15 text-pink",
  "bg-teal/15 text-teal",
  "bg-yellow/15 text-yellow",
  "bg-brown/15 text-brown",
  "bg-mint/15 text-mint",
  "bg-red/15 text-red",
] as const;

export function categoryColorClasses(categoryId: number): string {
  return CATEGORY_COLOR_CLASSES[categoryId % CATEGORY_COLOR_CLASSES.length];
}
