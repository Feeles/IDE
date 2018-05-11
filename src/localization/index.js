import includes from 'lodash/includes';
import en from './en';
import ja from './ja';

const localizations = [en, ja];

export const defaultLanguage = 'en-us';

export default languages => {
  for (const _lang of languages) {
    const lang = _lang.toLowerCase();
    const hit = localizations.find(loc => includes(loc.accept, lang));
    if (hit) {
      return hit;
    }
  }

  return en; // default
};

export const acceptedLanguages = localizations.map(({ accept, native }) => ({
  accept,
  native
}));
