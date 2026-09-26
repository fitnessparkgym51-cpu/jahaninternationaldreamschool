'use client'

import {useEffect, useState} from 'react'

import {Icon} from '@/components/ui/Icon'
import {SanityImage} from '@/components/ui/SanityImage'
import {ButtonLink, SmartLink} from '@/components/ui/SmartLink'
import {editAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {Brand, HeaderNav, NavItem} from '@/sanity/types/home'

import {TopBar} from './TopBar'
import type {TopBar as TopBarType} from '@/sanity/types/home'

type HeaderProps = {
  /** `_id` of the Navigation singleton, used for click-to-edit targets. */
  documentId: string
  /** `_id` of the Site settings singleton, used for click-to-edit targets. */
  siteSettingsId: string
  header?: HeaderNav | null
  brand?: Brand | null
  topBar?: TopBarType | null
}

/** Sticky main navigation, including the mobile slide-out menu. */
export function Header({documentId, siteSettingsId, header, brand, topBar}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const items = header?.items ?? []

  const headerField = (...rest: PathStep[]) =>
    editAttribute({id: documentId, type: 'navigation', path: ['header', ...rest]})
  const itemField = (itemKey: string, ...rest: PathStep[]) =>
    headerField('items', {_key: itemKey}, ...rest)
  const brandField = (...rest: string[]) =>
    editAttribute({id: siteSettingsId, type: 'siteSettings', path: ['brand', ...rest]})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  if (header?.enabled === false) return null

  return (
    <>
      <TopBar documentId={documentId} topBar={topBar} />

      <header
        className={`jid-nav sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm ${scrolled ? 'is-scrolled' : ''}`.trim()}
        {...editTargetAttr}
      >
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <SmartLink
            url={header?.homeUrl || '/'}
            className="flex items-center gap-3"
            aria-label={brand?.name ?? 'Home'}
          >
            <div
              className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-0.5 shadow-sm"
              data-sanity={brandField('logo')}
            >
              {brand?.logo ? (
                <SanityImage
                  image={brand.logo}
                  sourceWidth={96}
                  sizes="48px"
                  className="object-contain"
                  editAttribute={brandField('logo')}
                />
              ) : null}
            </div>
            <div>
              <div
                className="text-lg font-extrabold leading-tight tracking-tight text-jids-green sm:text-xl"
                data-sanity={brandField('name')}
              >
                {brand?.name}
              </div>
              {brand?.acronym || brand?.establishedLabel || header?.brandSubline ? (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-amber-600 sm:text-xs">
                  {brand?.acronym ? (
                    <span data-sanity={brandField('acronym')}>{brand.acronym}</span>
                  ) : null}
                  {brand?.acronym && brand?.establishedLabel ? (
                    <span className="text-gray-300">•</span>
                  ) : null}
                  {brand?.establishedLabel ? (
                    <span
                      className="font-medium text-gray-500"
                      data-sanity={brandField('establishedLabel')}
                    >
                      {brand.establishedLabel}
                    </span>
                  ) : null}
                  {header?.brandSubline ? (
                    <span className="font-medium text-gray-500" data-sanity={headerField('brandSubline')}>
                      {header.brandSubline}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SmartLink>

          <nav className="hidden items-center gap-4 whitespace-nowrap text-[15px] font-medium text-gray-700 xl:flex 2xl:gap-6">
            {items.map((item) => (
              <DesktopNavItem
                key={item._key}
                item={item}
                itemField={itemField}
              />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ButtonLink
              button={header?.cta}
              className="hidden whitespace-nowrap px-6 py-2.5 text-sm sm:inline-block"
              editAttribute={headerField('cta')}
            />
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`jid-menu-btn xl:hidden ${menuOpen ? 'is-open' : ''}`.trim()}
            >
              <i />
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`jid-menu-overlay xl:hidden ${menuOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`jid-mobile-menu xl:hidden ${menuOpen ? 'is-open' : ''}`.trim()}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-[#eef2ea] px-5 py-4">
          <span className="font-extrabold text-jids-green">
            {header?.mobileMenuTitle || brand?.acronym || 'Menu'}
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-none bg-jids-green/10 text-sm text-jids-green transition-colors hover:bg-jids-green/20"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-5 py-3">
          {items.map((item) => (
            <div key={`${item._key}-mobile`}>
              <SmartLink
                url={item.url}
                onClick={() => setMenuOpen(false)}
                editAttribute={itemField(item._key)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-[0.95rem] font-semibold text-[#243c2a] transition-colors hover:bg-jids-green/10 ${
                  item.highlight ? 'bg-jids-green/10 text-jids-green' : ''
                }`}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">›</span>
              </SmartLink>
              {item.children?.length ? (
                <div className="mb-1 ml-3 flex flex-col border-l border-[#eef2ea] pl-3">
                  {item.children.map((child) => (
                    <SmartLink
                      key={`${child._key}-mobile`}
                      url={child.url}
                      onClick={() => setMenuOpen(false)}
                      editAttribute={itemField(item._key, 'children', {_key: child._key})}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-jids-green"
                    >
                      <Icon name={child.icon} size={16} className="text-jids-green" />
                      <span>{child.label}</span>
                    </SmartLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        {header?.mobileMenuCta?.label ? (
          <div className="mt-auto flex flex-col gap-2.5 border-t border-[#eef2ea] px-5 pb-7 pt-5">
            <ButtonLink
              button={header.mobileMenuCta}
              variant="green"
              className="w-full px-4 py-3 text-sm"
              editAttribute={headerField('mobileMenuCta')}
            />
          </div>
        ) : null}
      </aside>
    </>
  )
}

function DesktopNavItem({
  item,
  itemField,
}: {
  item: NavItem
  /** Builds a `data-sanity` value for a field inside this menu item. */
  itemField: (itemKey: string, ...rest: PathStep[]) => string | undefined
}) {
  const hasDropdown = Boolean(item.children?.length)
  const isActive = item.highlight ?? item.isCurrentPage ?? false

  return (
    <div className="relative group">
      <SmartLink
        url={item.url}
        editAttribute={itemField(item._key)}
        className={`nav-underline flex items-center gap-1 transition-colors hover:text-jids-green ${
          isActive ? 'is-active rounded-full bg-jids-green-soft px-4 py-1.5 font-semibold !text-jids-green' : ''
        }`.trim()}
      >
        <span>{item.label}</span>
        {item.showChevron ?? hasDropdown ? (
          <Icon
            name="chevron-down"
            size={14}
            className="chev-rotate text-gray-500 transition-colors group-hover:text-jids-green"
          />
        ) : null}
      </SmartLink>

      {hasDropdown ? (
        <div className="invisible absolute left-0 top-full z-50 w-52 pt-2 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
          <div className="rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
            {item.children?.map((child) => (
              <SmartLink
                key={child._key}
                url={child.url}
                editAttribute={itemField(item._key, 'children', {_key: child._key})}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-jids-green"
              >
                {child.icon ? <Icon name={child.icon} size={16} className="shrink-0" /> : null}
                <span>{child.label}</span>
              </SmartLink>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
