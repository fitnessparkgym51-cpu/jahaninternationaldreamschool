import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const SINGLETONS = {
  homePage: 'Home page',
  aboutPage: 'About page',
  admissionsPage: 'Admissions page',
  academicsPage: 'Academics page',
  classRoutinePage: 'Class routine page',
  contactPage: 'Contact page',
  branchPage: 'Branch page',
  complaintPage: 'Complaint Box page',
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
      singletonItem(S, 'admissionsPage'),
      singletonItem(S, 'academicsPage'),
      singletonItem(S, 'classRoutinePage'),
      singletonItem(S, 'contactPage'),
      singletonItem(S, 'branchPage'),
      singletonItem(S, 'complaintPage'),
      S.divider(),

      S.documentTypeListItem('newsPost').title('News & events'),
      S.documentTypeListItem('studentSpotlight').title('Student spotlights'),
      S.documentTypeListItem('person').title('People'),
      S.documentTypeListItem('classLevel').title('Classes'),
      S.documentTypeListItem('classRoutine').title('Class routines'),
      S.listItem()
        .title('Complaints')
        .id('complaints')
        .child(
          S.documentTypeList('complaint')
            .title('Complaints')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Contact inquiries')
        .id('contactSubmissions')
        .child(
          S.documentTypeList('contactSubmission')
            .title('Contact inquiries')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),

      S.divider(),

      singletonItem(S, 'siteSettings'),
      singletonItem(S, 'navigation'),
    ])
