import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

/**
 * Maps Sanity documents to frontend routes.
 *
 * Two things happen here, and both are aimed at a non-developer:
 *
 * - `mainDocuments`: when the preview navigates to a URL, the Studio opens the
 *   matching document. Every built page must be listed here.
 * - `locations`: the Studio shows editors where a document is used ("Used on"),
 *   and the Presentation Tool's navigator can jump straight to it. Reusable
 *   documents resolve to the pages that reference them.
 */
export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    {
      route: '/',
      type: 'homePage',
    },
    {
      route: '/about-us',
      type: 'aboutPage',
    },
    {
      route: '/admissions',
      type: 'admissionsPage',
    },
    {
      route: '/academics',
      type: 'academicsPage',
    },
    {
      route: '/academics/class-routine',
      type: 'classRoutinePage',
    },
    {
      route: '/contact',
      type: 'contactPage',
    },
    {route: '/branch', type: 'branchPage'},
  ]),

  locations: {
    homePage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Home page', href: '/'}],
      }),
    }),

    aboutPage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'About page', href: '/about-us'}],
      }),
    }),

    admissionsPage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Admissions page', href: '/admissions'}],
      }),
    }),

    academicsPage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Academics page', href: '/academics'}],
      }),
    }),

    classRoutinePage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Class routine page', href: '/academics/class-routine'}],
      }),
    }),

    contactPage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Contact page', href: '/contact'}],
      }),
    }),

    branchPage: defineLocations({
      select: {title: 'internalTitle'},
      resolve: () => ({locations: [{title: 'Branch page', href: '/branch'}]}),
    }),

    /** A class timetable, shown on the Class routine page. */
    classRoutine: defineLocations({
      select: {className: 'classLevel.name', session: 'session'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.className ? `${doc.className} routine` : 'Class routine',
            href: '/academics/class-routine#routine',
          },
        ],
      }),
    }),

    /**
     * A class is listed in the Academics table, and the same documents feed the
     * Admissions and Contact content built later. The anchor jumps to the table.
     */
    classLevel: defineLocations({
      select: {name: 'name', ageRange: 'ageRange'},
      resolve: (doc) => {
        const label = doc?.name
          ? doc.ageRange
            ? `${doc.name} (${doc.ageRange})`
            : doc.name
          : 'Class'
        return {locations: [{title: label, href: '/academics#curriculum-table'}]}
      },
    }),

    studentSpotlight: defineLocations({
      select: {name: 'name', classLabel: 'classLabel', schoolName: 'schoolName'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.name
              ? `${doc.name}${doc.classLabel ? ` (${doc.classLabel})` : ''}`
              : 'Student spotlight',
            href: '/',
          },
        ],
      }),
    }),

    newsPost: defineLocations({
      select: {title: 'title', category: 'category'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'News & event',
            href: '/',
          },
        ],
      }),
    }),

    /**
     * A person is referenced by the About page in two places: the principal
     * profile and the team grid. The anchor lets "Used on" jump to the right card.
     */
    person: defineLocations({
      select: {name: 'name', designation: 'designation', role: 'role'},
      resolve: (doc) => {
        const isPrincipal = doc?.role === 'principal'
        return {
          locations: [
            {
              title: isPrincipal
                ? `${doc?.name || 'Principal'} — principal profile`
                : `${doc?.name || 'Person'} — team grid`,
              href: isPrincipal ? '/about-us' : '/about-us#our-teachers',
            },
          ],
        }
      },
    }),

    // Global documents: shown on every page rather than at one URL.
    siteSettings: defineLocations({
      message: 'School identity, contact details, footer and social sharing defaults — used across the whole site.',
      tone: 'caution',
    }),

    navigation: defineLocations({
      message: 'Top announcement bar and main menu — used across the whole site.',
      tone: 'caution',
    }),
  },
}
