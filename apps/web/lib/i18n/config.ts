import type { I18nConfig } from "@tasktrove/i18n"
import { languages, fallbackLng, namespaces, defaultNS, cookieName } from "./settings"

import authKoComponent from "../../components/auth/i18n/ko/auth.json"
import dialogsKoComponent from "../../components/dialogs/i18n/ko/dialogs.json"
import layoutKoComponent from "../../components/layout/i18n/ko/layout.json"
import navigationKoComponent from "../../components/navigation/i18n/ko/navigation.json"
import settingsKoComponent from "../../components/dialogs/settings-forms/i18n/ko/settings.json"
import taskKoComponent from "../../components/task/i18n/ko/task.json"

import authEnCore from "./locales/en/auth.json"
import commonEnCore from "./locales/en/common.json"
import dialogsEnCore from "./locales/en/dialogs.json"
import layoutEnCore from "./locales/en/layout.json"
import navigationEnCore from "./locales/en/navigation.json"
import settingsEnCore from "./locales/en/settings.json"
import taskEnCore from "./locales/en/task.json"

import commonKoCore from "./locales/ko/common.json"

export type AppLanguage = (typeof languages)[number]
export type AppNamespace = (typeof namespaces)[number]

const componentNamespaces = ["auth", "dialogs", "layout", "navigation", "settings", "task"] as const
type ComponentNamespace = (typeof componentNamespaces)[number]
type ComponentLanguage = Exclude<AppLanguage, typeof fallbackLng>
type CoreNamespaceResources = Record<typeof defaultNS, unknown> &
  Partial<Record<AppNamespace, unknown>>

const COMPONENT_NAMESPACE_RESOURCES: Record<
  ComponentNamespace,
  Record<ComponentLanguage, unknown>
> = {
  auth: {
    ko: authKoComponent,
  },
  dialogs: {
    ko: dialogsKoComponent,
  },
  layout: {
    ko: layoutKoComponent,
  },
  navigation: {
    ko: navigationKoComponent,
  },
  settings: {
    ko: settingsKoComponent,
  },
  task: {
    ko: taskKoComponent,
  },
}

const CORE_NAMESPACE_RESOURCES: Record<AppLanguage, CoreNamespaceResources> = {
  en: {
    auth: authEnCore,
    common: commonEnCore,
    dialogs: dialogsEnCore,
    layout: layoutEnCore,
    navigation: navigationEnCore,
    settings: settingsEnCore,
    task: taskEnCore,
  },
  ko: {
    common: commonKoCore,
  },
}

function isComponentNamespace(namespace: AppNamespace): namespace is ComponentNamespace {
  return componentNamespaces.some((name) => name === namespace)
}

function isComponentLanguage(language: AppLanguage): language is ComponentLanguage {
  return language !== fallbackLng
}

async function loadResources(language: AppLanguage, namespace: AppNamespace): Promise<unknown> {
  if (isComponentLanguage(language) && isComponentNamespace(namespace)) {
    const componentResource = COMPONENT_NAMESPACE_RESOURCES[namespace][language]
    if (componentResource) {
      return componentResource
    }

    console.warn(
      `Failed to load colocated ${namespace} translation for ${language}: missing build-time resource`,
    )
  }

  const coreResource = CORE_NAMESPACE_RESOURCES[language][namespace]
  if (coreResource) {
    return coreResource
  }

  const error = new Error(`Missing translation for ${language}/${namespace}`)
  console.warn(`Failed to load main translation for ${language}/${namespace}:`, error)
  throw error
}

export const i18nConfig: I18nConfig<AppLanguage, AppNamespace> = {
  languages,
  fallbackLng,
  namespaces,
  defaultNS,
  cookieName,
  resourceLoader: loadResources,
}
