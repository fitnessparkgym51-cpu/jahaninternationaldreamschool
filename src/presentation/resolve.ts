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
