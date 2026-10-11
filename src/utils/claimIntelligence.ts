import type { Product, Nutrition } from '../types';

export type ClaimVerdict = 'consistent' | 'attention' | 'unverifiable';

export interface ClaimCheck {
  claim: string;
  verdict: ClaimVerdict;
  explanation: string;
  /** Where this claim was found — helps the UI explain why a claim is showing up. */
  source: 'label' | 'text';
}

interface ClaimPattern {
  phrases: string[];
  evaluate: (n: Nutrition) => Omit<ClaimCheck, 'claim' | 'source'>;
}

// Each pattern is checked against real reported nutrition — every verdict here
// is derived from the product's own data, never guessed or invented.
const CLAIM_PATTERNS: ClaimPattern[] = [
  {
    phrases: ['sugar-free', 'sugar free', 'zero sugar'],
    evaluate: (n) => {
      if (n.sugar == null) {
        return { verdict: 'unverifiable', explanation: "Sugar content isn't reported for this product, so this claim can't be checked." };
      }
      if (n.sugar > 0.5) {
        return { verdict: 'attention', explanation: `Reports ${n.sugar}g of sugar per serving, which is inconsistent with a "sugar-free" claim.` };
      }
      return { verdict: 'consistent', explanation: `Reported sugar (${n.sugar}g) is consistent with this claim.` };
    },
  },
  {
    phrases: ['low sugar', 'low-sugar', 'reduced sugar'],
    evaluate: (n) => {
      if (n.sugar == null) {
        return { verdict: 'unverifiable', explanation: "Sugar content isn't reported for this product." };
      }
      if (n.sugar > 5) {
        return { verdict: 'attention', explanation: `Reports ${n.sugar}g of sugar per serving — higher than what's typically meant by "low sugar" (under 5g).` };
      }
      return { verdict: 'consistent', explanation: `Reported sugar (${n.sugar}g) supports this claim.` };
    },
  },
  {
    // "no sugar added" / "no added sugar" only claims nothing was added during
    // manufacturing — it does NOT mean sugar-free, so the threshold here is
    // deliberately looser (8g) than the sugar-free check above. A product can
    // still be flagged if its naturally-occurring sugar is high enough that
    // the claim reads as misleading on the shelf.
    phrases: ['no sugar added', 'no added sugar', 'unsweetened'],
    evaluate: (n) => {
      if (n.sugar == null) {
        return { verdict: 'unverifiable', explanation: "Sugar content isn't reported for this product." };
      }
      if (n.sugar > 8) {
        return { verdict: 'attention', explanation: `Reports ${n.sugar}g of sugar per serving. No sugar may have been added during manufacturing, but this is still a high amount of naturally-occurring sugar — the on-pack claim can read as misleading even though it's technically accurate.` };
      }
      return { verdict: 'consistent', explanation: `Reported sugar (${n.sugar}g) is consistent with this claim.` };
    },
  },
  {
    phrases: ['high protein', 'high-protein', 'protein rich'],
    evaluate: (n) => {
      if (n.protein == null) {
        return { verdict: 'unverifiable', explanation: "Protein content isn't reported for this product." };
      }
      if (n.protein < 10) {
        return { verdict: 'attention', explanation: `Reports ${n.protein}g of protein per serving — lower than what's typically meant by "high protein" (10g+).` };
      }
      return { verdict: 'consistent', explanation: `Reported protein (${n.protein}g) supports this claim.` };
    },
  },
  {
    phrases: ['low sodium', 'low-sodium', 'low salt'],
    evaluate: (n) => {
      if (n.sodium == null) {
        return { verdict: 'unverifiable', explanation: "Sodium content isn't reported for this product." };
      }
      if (n.sodium > 140) {
        return { verdict: 'attention', explanation: `Reports ${n.sodium}mg of sodium per serving — above the typical "low sodium" threshold (140mg).` };
      }
      return { verdict: 'consistent', explanation: `Reported sodium (${n.sodium}mg) supports this claim.` };
    },
  },
  {
    phrases: ['low fat', 'low-fat', 'fat free'],
    evaluate: (n) => {
      if (n.fat == null) {
        return { verdict: 'unverifiable', explanation: "Fat content isn't reported for this product." };
      }
      if (n.fat > 3) {
        return { verdict: 'attention', explanation: `Reports ${n.fat}g of fat per serving — above the typical "low fat" threshold (3g).` };
      }
      return { verdict: 'consistent', explanation: `Reported fat (${n.fat}g) supports this claim.` };
    },
  },
];

function matchPattern(text: string): { pattern: ClaimPattern; matchedPhrase: string } | null {
  const lower = text.toLowerCase();
  for (const pattern of CLAIM_PATTERNS) {
    const hit = pattern.phrases.find((p) => lower.includes(p));
    if (hit) return { pattern, matchedPhrase: hit };
  }
  return null;
}

/**
 * Cross-checks every claim we can find — both Open Food Facts' structured
 * `labels` field AND phrases embedded in the product name or raw ingredient
 * text (e.g. "NO SUGAR ADDED" printed on-pack but never tagged as a
 * structured label upstream) — against the product's own reported nutrition.
 */
export function checkClaims(product: Product): ClaimCheck[] {
  const labels = (product as unknown as { labels?: string[] }).labels || [];
  const rawText = (product as unknown as { ingredientsRawText?: string }).ingredientsRawText || '';
  const n = product.nutrition;
  const results: ClaimCheck[] = [];
  const seenPhrases = new Set<string>();

  // 1. Structured labels (Organic, Vegan, "No Sugar Added" if OFF tagged it properly, etc.)
  for (const label of labels) {
    const match = matchPattern(label);
    if (match) {
      seenPhrases.add(match.matchedPhrase);
      results.push({ claim: label, source: 'label', ...match.pattern.evaluate(n) });
    } else {
      results.push({
        claim: label,
        source: 'label',
        verdict: 'unverifiable',
        explanation: "This claim isn't something nutrition figures can confirm — it depends on certification or ingredient sourcing.",
      });
    }
  }

  // 2. Free text — product name and raw ingredient text. Only surfaces claims
  // not already covered above, so nothing is double-reported.
  const freeText = `${product.name} ${rawText}`;
  for (const pattern of CLAIM_PATTERNS) {
    const hit = pattern.phrases.find((p) => freeText.toLowerCase().includes(p) && !seenPhrases.has(p));
    if (hit) {
      seenPhrases.add(hit);
      // Show the claim capitalized the way it'd read on a label.
      const displayClaim = hit.replace(/\b\w/g, (c) => c.toUpperCase());
      results.push({ claim: displayClaim, source: 'text', ...pattern.evaluate(n) });
    }
  }

  return results;
}
