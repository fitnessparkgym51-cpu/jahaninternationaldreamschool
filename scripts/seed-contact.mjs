// Seeds the Contact page singleton from JIDS/contactus.html (additive; never overwrites).
// Usage: node --env-file=.env.local scripts/seed-contact.mjs
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const WA = 'https://wa.me/8801717103326'
const btn = (label, url, variant) => ({_type: 'button', label, url, newTab: true, variant})

const doc = {
  _id: 'contactPage',
  _type: 'contactPage',
  internalTitle: 'Contact page',
  hero: {
    _type: 'pageHeroSection',
    enabled: true,
    heading: 'Contact Us',
    appearance: 'pattern',
    crumbs: [
      {_key: 'home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
      {_key: 'contact', _type: 'breadcrumbItem', label: 'Contact'},
    ],
  },
  infoCard: {
    heading: 'Visit, Call Or Message',
    items: [
      {_key: 'address', _type: 'contactDetail', icon: 'map-pin', label: 'Address', value: 'TNT, Tongi, Gazipur'},
      {_key: 'phone', _type: 'contactDetail', icon: 'phone', label: 'Phone', value: '01717-103326'},
      {_key: 'whatsapp', _type: 'contactDetail', icon: 'whatsapp', label: 'WhatsApp', value: '+880 1717-103326'},
      {_key: 'email', _type: 'contactDetail', icon: 'mail', label: 'Email', value: 'jids21@gmail.com'},
      {_key: 'hours', _type: 'contactDetail', icon: 'clock', label: 'Office Hours', value: 'Sunday–Thursday: 8:00am–3:00pm', note: 'Friday & Saturday: Closed'},
    ],
    button: btn('Chat On WhatsApp', WA, 'primary'),
  },
  mapCard: {
    title: 'Jahan International Dream School',
    address: 'TNT, Tongi, Gazipur',
    rating: '4.7',
    reviewCount: '(140+)',
    pinLabel: 'JIDS Campus',
    landmarks: ['Tongi Govt. College', 'Dhaka-Mymensingh Hwy'],
    attribution: 'Map data ©2026 Gazipur City',
    button: btn('Chat On WhatsApp', WA, 'outline'),
  },
  form: {
    heading: "What's Happening At Jahan International Dream School",
    intro: 'A glimpse of recent classroom moments, competitions and celebrations, or send us an inquiry.',
    nameLabel: 'Your Name',
    namePlaceholder: 'Parent / guardian name',
    whatsappLabel: 'Your WhatsApp Number',
    whatsappPrefix: '+880',
    whatsappPlaceholder: '01717-103326',
    ageLabel: "Child's Age",
    agePlaceholder: 'Select age...',
    ageOptions: ['3 Years', '4 Years', '5 Years', '6 Years', '7+ Years'],
    classLabel: 'Class Interested In',
    classPlaceholder: 'Select class...',
    classOptions: ['Play Group', 'Nursery', 'Kindergarten (KG)', 'Class 1', 'Class 2', 'Class 3 to 5', 'Class 6 to 10'],
    messageLabel: 'Your Message',
    messagePlaceholder: 'Tell us how we can help...',
    robotLabel: "I'm not a robot",
    submitLabel: 'Send Message',
    successMessage: 'Thank you! We have received your message and will contact you soon.',
  },
  review: {
    enabled: true,
    rating: '4.7',
    headline: 'Happy With Jahan International Dream School? Please Leave Us A Review!',
    text: "We're rated 4.7 by 140+ families on Google. Your review helps other parents find us.",
    button: btn('Leave A Google Review', 'https://g.page/r/review', 'green'),
  },
}

const res = await client.createIfNotExists(doc)
console.log('contactPage ready:', res._id)
