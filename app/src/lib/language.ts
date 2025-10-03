const pluralRules = new Intl.PluralRules('uk', { type: 'cardinal' });

const wordForms = {
  hour: {
    zero: 'годин',
    one: 'година',
    two: 'години',
    few: 'години',
    many: 'годин',
    other: 'годин'
  },
  day: {
    zero: 'днів',
    one: 'день',
    two: 'дні',
    few: 'дні',
    many: 'днів',
    other: 'днів'
  },
  week: {
    zero: 'тижнів',
    one: 'тиждень',
    two: 'тижні',
    few: 'тижні',
    many: 'тижнів',
    other: 'тижнів'
  }
};

export const formatWord = (word: keyof typeof wordForms, amount: number) => {
  const forms: Record<Intl.LDMLPluralRule, string> = wordForms[word];
  const rule = pluralRules.select(amount);
  return `${amount} ${forms[rule]}`;
};
