import type {SchemaTypeDefinition} from 'sanity'

import {aboutPageType} from './documents/aboutPage'
import {homePageType, newsPostType, siteSettingsType, studentSpotlightType} from './documents'
import {personType} from './documents/person'
import {navigationType} from './objects/navigation'
import {
  breadcrumbItemType,
  pageCtaSectionType,
  pageHeroSectionType,
  peopleGridSectionType,
  pillarCardType,
  pillarsSectionType,
  principalSectionType,
} from './objects/pageSections'
import {
  buttonType,
  imageWithAltType,
  linkType,
  sectionHeaderType,
  seoType,
} from './objects/shared'
import {
  aboutStorySectionType,
  admissionBannerSectionType,
  featureCardType,
  featuresSectionType,
  heroSectionType,
  heroSlideType,
  newsSectionType,
  reviewBarSectionType,
  statItemType,
  statsBarSectionType,
  studentSpotlightSectionType,
} from './objects/sections'
import {
  brandType,
  contactBlockType,
  contactListItemType,
  floatingContactType,
  footerType,
  mapCardType,
  socialLinkType,
  socialPreviewCardType,
} from './objects/site'
import {
  headerType,
  navChildLinkType,
  navItemType,
  topBarLinkType,
  topBarType,
} from './objects/navigation'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    // Reusable objects
    imageWithAltType,
    linkType,
    buttonType,
    seoType,
    sectionHeaderType,
    brandType,
    contactBlockType,
    contactListItemType,
    socialLinkType,
    socialPreviewCardType,
    mapCardType,
    footerType,
    floatingContactType,
    topBarLinkType,
    navChildLinkType,
    navItemType,
    topBarType,
    headerType,

    // Home page section building blocks
    heroSlideType,
    heroSectionType,
    statItemType,
    statsBarSectionType,
    featureCardType,
    featuresSectionType,
    aboutStorySectionType,
    studentSpotlightSectionType,
    admissionBannerSectionType,
    newsSectionType,
    reviewBarSectionType,

    // Inner page section building blocks
    breadcrumbItemType,
    pageHeroSectionType,
    principalSectionType,
    peopleGridSectionType,
    pillarCardType,
    pillarsSectionType,
    pageCtaSectionType,

    // Documents
    homePageType,
    aboutPageType,
    siteSettingsType,
    navigationType,
    studentSpotlightType,
    newsPostType,
    personType,
  ],
}
