import type {SchemaTypeDefinition} from 'sanity'

import {aboutPageType} from './documents/aboutPage'
import {academicsPageType} from './documents/academicsPage'
import {classLevelType} from './documents/classLevel'
import {classRoutineType} from './documents/classRoutine'
import {classRoutinePageType} from './documents/classRoutinePage'
import {admissionsPageType} from './documents/admissionsPage'
import {homePageType, newsPostType, siteSettingsType, studentSpotlightType} from './documents'
import {personType} from './documents/person'
import {complaintType} from './documents/complaint'
import {complaintPageType} from './documents/complaintPage'
import {branchPageType} from './documents/branchPage'
import {contactPageType, contactSubmissionType} from './documents/contactPage'
import {
  calloutSectionType,
  faqItemType,
  faqSectionType,
  featureImageSectionType,
  processStepType,
  processStepsSectionType,
} from './objects/admissionSections'
import {classTableColumnsType, classTableSectionType} from './objects/classTable'
import {classRoutineRowType, routineSectionType} from './objects/routine'
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
  postalAddressType,
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
    postalAddressType,
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

    // Admissions page section building blocks
    processStepType,
    processStepsSectionType,
    featureImageSectionType,
    calloutSectionType,
    faqItemType,
    faqSectionType,

    // Academics page section building blocks
    classTableColumnsType,
    classTableSectionType,

    // Class routine page section building blocks
    classRoutineRowType,
    routineSectionType,

    // Documents
    homePageType,
    aboutPageType,
    admissionsPageType,
    academicsPageType,
    classRoutinePageType,
    classLevelType,
    classRoutineType,
    siteSettingsType,
    navigationType,
    studentSpotlightType,
    newsPostType,
    personType,
    complaintType,
    contactPageType,
    branchPageType,
    complaintPageType,
    contactSubmissionType,
  ],
}
