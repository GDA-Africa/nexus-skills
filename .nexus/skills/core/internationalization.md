---
skill: internationalization
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "internationalization"
  - "i18n"
  - "localization"
  - "l10n"
  - "multi-language"
author: "@nexus-framework/skills"
status: active
---

# Skill: Internationalization (Shared)

## When to Read This
Read this skill when implementing multi-language support, handling date/number formatting, or designing for global audiences.

## Context
This project supports multiple languages and regions. Internationalization (i18n) ensures our application can be adapted to various languages and regions without engineering changes. Localization (l10n) adapts the application to specific locales with translated content and regional formatting. We use a consistent approach across all frameworks to maintain user experience quality.

## Steps
1. Extract all user-facing text into translation files
2. Use translation keys instead of hardcoded strings
3. Implement locale detection and switching
4. Handle date, time, number, and currency formatting
5. Support right-to-left (RTL) languages if needed
6. Test translations in context and validate completeness
7. Consider cultural differences in design and content
8. Implement fallback mechanisms for missing translations

## Patterns We Use
- Translation files: JSON-based with hierarchical keys
- Translation libraries: i18next, react-i18next, or framework-specific equivalents
- Locale detection: Browser settings, URL parameters, or user preferences
- Pluralization: Handle different plural forms per language
- Context: Provide context for translators to understand usage
- RTL support: CSS-in-JS or CSS variables for layout direction
- Date/number formatting: Use Intl API or dedicated libraries
- Translation management: Use tools like Lokalise, Crowdin, or manual processes

## Anti-Patterns — Never Do This
- ❌ Do not hardcode text strings in components
- ❌ Do not assume English is the default for all users
- ❌ Do not concatenate translated strings (breaks grammar)
- ❌ Do not ignore text expansion (translated text can be 30-40% longer)
- ❌ Do not forget to translate UI elements like tooltips and alt text
- ❌ Do not assume date formats are universal
- ❌ Do not ignore RTL language requirements
- ❌ Do not translate technical terms without context

## Example

```typescript
// ✅ Translation file structure (en.json)
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading..."
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email Address",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?"
    },
    "welcome": "Welcome back, {{name}}!"
  },
  "errors": {
    "required": "{{field}} is required",
    "email": "Please enter a valid email address",
    "network": "Network error. Please try again."
  },
  "count": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}
```

```typescript
// ✅ Using translations in React
import { useTranslation } from 'react-i18next';

export function LoginForm() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <form>
      <h2>{t('auth.login.title')}</h2>
      
      <div>
        <label htmlFor="email">{t('auth.login.email')}</label>
        <input 
          type="email" 
          id="email"
          placeholder={t('auth.login.email')}
        />
      </div>

      <div>
        <label htmlFor="password">{t('auth.login.password')}</label>
        <input 
          type="password" 
          id="password"
          placeholder={t('auth.login.password')}
        />
      </div>

      <button type="submit">
        {t('auth.login.submit')}
      </button>

      <button 
        type="button" 
        onClick={() => changeLanguage('es')}
      >
        Español
      </button>
      <button 
        type="button" 
        onClick={() => changeLanguage('fr')}
      >
        Français
      </button>
    </form>
  );
}
```

```typescript
// ✅ Date and number formatting
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const amount = 1234.56;

  return (
    <div>
      <p>
        {t('common.welcome')}, {t('auth.welcome', { name: 'John' })}
      </p>
      
      <p>
        {t('common.today')}: {now.toLocaleDateString(i18n.language)}
      </p>
      
      <p>
        {t('common.balance')}: {new Intl.NumberFormat(i18n.language, {
          style: 'currency',
          currency: 'USD'
        }).format(amount)}
      </p>
    </div>
  );
}
```

```typescript
// ✅ Pluralization handling
export function ItemList({ items }: { items: any[] }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3>
        {t('count', { 
          count: items.length,
          postProcess: 'interval',
          interval: [0, 1, 2]
        })}
      </h3>
      
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

```typescript
// ✅ RTL support with CSS-in-JS
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div<{ isRTL: boolean }>`
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  
  /* Use logical properties when possible */
  padding-inline-start: 1rem;
  margin-inline-end: 1rem;
`;

export function Layout() {
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);

  return (
    <Container isRTL={isRTL}>
      {/* Content */}
    </Container>
  );
}
```

```typescript
// ✅ Translation utility with fallback
export function translate(key: string, options?: any): string {
  const translations = {
    en: { /* English translations */ },
    es: { /* Spanish translations */ },
    fr: { /* French translations */ },
    // ...
  };

  const currentLang = getCurrentLanguage();
  const translation = translations[currentLang]?.[key];
  
  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return translations['en']?.[key] || key;
  }

  return interpolate(translation, options);
}

function interpolate(template: string, variables: any): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables?.[key] ?? match;
  });
}
```

## Notes
- Use Unicode CLDR data for accurate locale-specific formatting
- Consider text expansion when designing layouts (30-40% longer in some languages)
- Test with actual translated content, not just Lorem Ipsum
- Implement translation memory to maintain consistency
- Use translation keys that describe the content, not the location
- Consider cultural differences in colors, symbols, and imagery
- Support bidirectional text for languages like Arabic and Hebrew
- Use locale-aware sorting and comparison functions
- Plan for translation updates and version management
- Test accessibility with screen readers in different languages