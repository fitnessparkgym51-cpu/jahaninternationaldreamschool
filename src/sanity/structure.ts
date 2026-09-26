import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const SINGLETONS = {
  homePage: 'Home page',
  aboutPage: 'About page',
  siteSettings: 'Site settings',
  navigation: 'Navigation',
} as const

type SingletonType = keyof typeof SINGLETONS

/** A single, fixed-id document: the Studio shows one "create" entry for it. */
function singletonItem(S: StructureBuilder, type: SingletonType) {
  return S.listItem()
    .title(SINGLETONS[type])
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(SINGLETONS[type]))
}

/**
 * Studio navigation, ordered the way an administrator thinks about the site:
 * the pages first, then the reusable content they draw from, then the site-wide
 * settings.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      singletonItem(S, 'homePage'),
      singletonItem(S, 'aboutPage'),

      S.divider(),

      S.documentTypeListItem('newsPost').title('News & events'),
      S.documentTypeListItem('studentSpotlight').title('Student spotlights'),
      S.documentTypeListItem('person').title('People'),

      S.divider(),

      singletonItem(S, 'siteSettings'),
      singletonItem(S, 'navigation'),
    ])
