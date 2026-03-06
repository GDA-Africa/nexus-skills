---
skill: internationalization
version: 1.0.0
framework: react-vite
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

# Skill: Internationalization (React + Vite)

## When to Read This
Read this skill when implementing multi-language support, handling date/number formatting, or designing for global audiences in a React + Vite application.

## Context
This project supports multiple languages and regions using i18next with react-i18next. We follow a consistent approach for translation management, locale detection, and content formatting. All user-facing text should be externalized and translatable, with proper handling of pluralization, context, and RTL languages when needed.

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
- Translation library: i18next with react-i18next integration
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
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from '../locales/en/common.json';
import frTranslations from '../locales/fr/common.json';
import esTranslations from '../locales/es/common.json';

i18n
  // Load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      es: {
        translation: esTranslations,
      },
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // React options
    react: {
      useSuspense: false, // Set to true if using Suspense
    },
  });

export default i18n;
```

```typescript
// src/locales/en/common.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email Address",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?",
      "rememberMe": "Remember me"
    },
    "register": {
      "title": "Create Account",
      "name": "Full Name",
      "confirmPassword": "Confirm Password",
      "submit": "Create Account"
    },
    "welcome": "Welcome back, {{name}}!"
  },
  "errors": {
    "required": "{{field}} is required",
    "email": "Please enter a valid email address",
    "password": {
      "tooShort": "Password must be at least {{count}} characters",
      "mismatch": "Passwords do not match"
    },
    "network": "Network error. Please try again.",
    "notFound": "The requested resource was not found."
  },
  "count": {
    "one": "{{count}} item",
    "other": "{{count}} items",
    "zero": "No items"
  },
  "date": {
    "today": "Today",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "at": "at {{time}}"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout"
  }
}
```

```typescript
// src/locales/fr/common.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "loading": "Chargement...",
    "error": "Une erreur s'est produite",
    "success": "Succès",
    "close": "Fermer",
    "back": "Retour",
    "next": "Suivant",
    "search": "Rechercher",
    "filter": "Filtrer",
    "sort": "Trier"
  },
  "auth": {
    "login": {
      "title": "Se Connecter",
      "email": "Adresse Email",
      "password": "Mot de Passe",
      "submit": "Se Connecter",
      "forgotPassword": "Mot de passe oublié ?",
      "rememberMe": "Se souvenir de moi"
    },
    "register": {
      "title": "Créer un Compte",
      "name": "Nom Complet",
      "confirmPassword": "Confirmer le Mot de Passe",
      "submit": "Créer le Compte"
    },
    "welcome": "Bienvenue, {{name}} !"
  },
  "errors": {
    "required": "{{field}} est requis",
    "email": "Veuillez saisir une adresse email valide",
    "password": {
      "tooShort": "Le mot de passe doit contenir au moins {{count}} caractères",
      "mismatch": "Les mots de passe ne correspondent pas"
    },
    "network": "Erreur réseau. Veuillez réessayer.",
    "notFound": "La ressource demandée n'a pas été trouvée."
  },
  "count": {
    "one": "{{count}} élément",
    "other": "{{count}} éléments",
    "zero": "Aucun élément"
  },
  "date": {
    "today": "Aujourd'hui",
    "yesterday": "Hier",
    "tomorrow": "Demain",
    "at": "à {{time}}"
  },
  "navigation": {
    "home": "Accueil",
    "dashboard": "Tableau de bord",
    "profile": "Profil",
    "settings": "Paramètres",
    "logout": "Déconnexion"
  }
}
```

```tsx
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../hooks/useForm';

interface FormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
  } = useForm<FormData>({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: Partial<FormData> = {};
      
      if (!values.email) {
        errors.email = t('errors.required', { field: t('auth.login.email') });
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = t('errors.email');
      }
      
      if (!values.password) {
        errors.password = t('errors.required', { field: t('auth.login.password') });
      }
      
      return errors;
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Submit form
      console.log('Login data:', data);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="login-form">
      <div className="language-switcher">
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('fr')}>Français</button>
        <button onClick={() => changeLanguage('es')}>Español</button>
      </div>

      <h2>{t('auth.login.title')}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">{t('auth.login.email')}</label>
          <input
            type="email"
            id="email"
            value={values.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            placeholder={t('auth.login.email')}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('auth.login.password')}</label>
          <input
            type="password"
            id="password"
            value={values.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            placeholder={t('auth.login.password')}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn--primary"
          >
            {isLoading ? t('common.loading') : t('auth.login.submit')}
          </button>
          <button type="button" className="btn btn--secondary">
            {t('auth.login.forgotPassword')}
          </button>
        </div>
      </form>
    </div>
  );
}
```

```tsx
// src/components/ItemList.tsx
import { useTranslation } from 'react-i18next';
import { useItems } from '../hooks/useItems';

export function ItemList() {
  const { t, i18n } = useTranslation();
  const { items, isLoading, error } = useItems();

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  if (error) {
    return <div>{t('common.error')}: {error.message}</div>;
  }

  return (
    <div className="item-list">
      <h2>{t('navigation.dashboard')}</h2>
      
      {items.length === 0 ? (
        <p>{t('count.zero')}</p>
      ) : (
        <>
          <p className="item-count">
            {t('count', { 
              count: items.length,
              postProcess: 'interval',
              interval: [0, 1, 2]
            })}
          </p>
          
          <ul>
            {items.map(item => (
              <li key={item.id} className="item-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span className="item-date">
                  {t('date.at', { 
                    time: new Date(item.createdAt).toLocaleString(i18n.language) 
                  })}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

```tsx
// src/components/DateTime.tsx
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, es } from 'date-fns/locale';

interface DateTimeProps {
  date: Date;
  format?: 'relative' | 'absolute';
}

export function DateTime({ date, format = 'relative' }: DateTimeProps) {
  const { t, i18n } = useTranslation();
  
  const locales = {
    en: enUS,
    fr: fr,
    es: es,
  };

  const locale = locales[i18n.language as keyof typeof locales] || enUS;

  if (format === 'relative') {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return (
        <time dateTime={date.toISOString()}>
          {formatDistanceToNow(date, { addSuffix: true, locale })}
        </time>
      );
    }
  }

  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </time>
  );
}
```

```tsx
// src/components/Layout.tsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check if current language is RTL
    const rtlLanguages = ['ar', 'he', 'fa'];
    setIsRTL(rtlLanguages.includes(i18n.language));
    
    // Apply direction to document
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  return (
    <div className={`layout ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="header">
        <h1>{t('navigation.home')}</h1>
        <nav className="navigation">
          <ul>
            <li><a href="/">{t('navigation.home')}</a></li>
            <li><a href="/dashboard">{t('navigation.dashboard')}</a></li>
            <li><a href="/profile">{t('navigation.profile')}</a></li>
            <li><a href="/settings">{t('navigation.settings')}</a></li>
          </ul>
        </nav>
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} {t('common.appName')}</p>
      </footer>
    </div>
  );
}
```

```css
/* src/styles/i18n.css */
/* RTL support */
.rtl {
  direction: rtl;
  text-align: right;
}

.rtl .header {
  text-align: right;
}

.rtl .navigation ul {
  flex-direction: row-reverse;
}

.rtl .form-group {
  text-align: right;
}

.rtl .form-group label {
  text-align: right;
}

.rtl .btn {
  float: left;
}

/* Text expansion support */
.item-card h3 {
  max-width: 100%;
  word-wrap: break-word;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
}

/* Language switcher */
.language-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.language-switcher button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.language-switcher button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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