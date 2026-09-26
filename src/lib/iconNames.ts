/**
 * Single source of truth for the icon set available to content editors.
 *
 * `ICON_OPTIONS` drives the Sanity icon picker, `IconName` drives the
 * TypeScript types and `<Icon />` maps a name to the matching SVG.
 */
export const ICON_OPTIONS = [
  {value: 'book', title: 'Book'},
  {value: 'book-open', title: 'Open book'},
  {value: 'monitor-play', title: 'Multimedia screen'},
  {value: 'shield-check', title: 'Shield with tick (safety)'},
  {value: 'sparkle', title: 'Sparkles (excellence)'},
  {value: 'smile', title: 'Smiley (fun & activities)'},
  {value: 'users', title: 'People (team)'},
  {value: 'user', title: 'Single person'},
  {value: 'graduation-cap', title: 'Graduation cap'},
  {value: 'award', title: 'Award / trophy'},
  {value: 'trophy', title: 'Trophy'},
  {value: 'heart', title: 'Heart (care)'},
  {value: 'palette', title: 'Palette (art)'},
  {value: 'camera', title: 'Camera (gallery)'},
  {value: 'lightbulb', title: 'Lightbulb (creativity)'},
  {value: 'headset', title: 'Headset (spoken classes)'},
  {value: 'file-text', title: 'Document (forms & papers)'},
  {value: 'mosque', title: 'Mosque (religious education)'},
  {value: 'ball', title: 'Ball (sports)'},
  {value: 'clock', title: 'Clock (timings)'},
  {value: 'globe', title: 'Globe (global)'},
  {value: 'message-circle', title: 'Speech bubble (testimonial)'},
  {value: 'calendar', title: 'Calendar / routine'},
  {value: 'alert-triangle', title: 'Warning triangle (notice)'},
  {value: 'whatsapp', title: 'WhatsApp'},
  {value: 'facebook', title: 'Facebook'},
  {value: 'phone', title: 'Telephone'},
  {value: 'mobile', title: 'Mobile phone'},
  {value: 'mail', title: 'Envelope'},
  {value: 'map-pin', title: 'Map pin'},
  {value: 'pin', title: 'Location pin (filled)'},
  {value: 'play', title: 'Play'},
  {value: 'external-link', title: 'Open in new tab'},
  {value: 'chevron-down', title: 'Chevron down'},
  {value: 'chevron-left', title: 'Chevron left'},
  {value: 'chevron-right', title: 'Chevron right'},
  {value: 'star', title: 'Star'},
  {value: 'pencil', title: 'Pencil'},
] as const

export type IconName = (typeof ICON_OPTIONS)[number]['value']

export const ICON_TITLES: Record<IconName, string> = Object.fromEntries(
  ICON_OPTIONS.map((option) => [option.value, option.title]),
) as Record<IconName, string>
