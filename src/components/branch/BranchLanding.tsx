import {stegaClean} from 'next-sanity'

import {Icon} from '@/components/ui/Icon'
import {Reveal} from '@/components/ui/Reveal'
import {SanityImage} from '@/components/ui/SanityImage'
import {ButtonLink} from '@/components/ui/SmartLink'
import {documentFieldAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {IconName} from '@/lib/iconNames'
import type {BranchPageQueryResult} from '@/sanity/types/sanity.types'

type Branch = NonNullable<BranchPageQueryResult['branch']>
type IconItem = {_key: string; icon: string | null; title: string | null; text: string | null}

function Eyebrow({children}: {children?: string | null}) {
  return children ? (
    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-jids-green">{children}</p>
  ) : null
}

function IconRow({items, big}: {items?: IconItem[] | null; big?: boolean}) {
  if (!items?.length) return null
  return (
    <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x lg:divide-jids-green-line">
      {items.map((item) => (
        <div key={item._key} className="flex flex-col items-center px-4 text-center" {...editTargetAttr}>
          {item.icon ? (
            <Icon name={stegaClean(item.icon) as IconName} size={big ? 40 : 36} strokeWidth={1.5} className="mb-3 text-jids-green" />
          ) : null}
          <h3 className={`font-bold text-gray-900 ${big ? 'text-base' : 'text-[15px]'}`}>{item.title}</h3>
          {item.text ? <p className="mt-1.5 max-w-[16rem] text-sm leading-snug text-gray-600">{item.text}</p> : null}
        </div>
      ))}
    </div>
  )
}

/** The Branch landing page. Every string and image is CMS content. */
export function BranchLanding({branch}: {branch: Branch}) {
  const edit = (...path: PathStep[]) => documentFieldAttribute({id: branch.id, type: 'branchPage', path})
  const {hero, features, about, programs, teachers} = branch

  return (
    <>
      {hero ? (
        <section className="relative overflow-hidden bg-gradient-to-br from-jids-green-tint via-white to-jids-green-soft">
          {hero.image?.asset ? (
            <div className="absolute inset-y-0 right-0 hidden w-[60%] md:block">
              <SanityImage
                image={hero.image}
                sizes="60vw"
                priority
                className="h-full w-full object-cover"
                editAttribute={edit('hero', 'image')}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
            </div>
          ) : null}
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-28">
            <Reveal className="max-w-xl">
              <Eyebrow>{hero.eyebrow}</Eyebrow>
              <h1 className="whitespace-pre-line text-4xl font-extrabold leading-tight tracking-tight text-jids-green-deep sm:text-5xl">
                {hero.heading}
              </h1>
              {hero.text ? <p className="mt-5 text-base leading-relaxed text-gray-700 sm:text-lg">{hero.text}</p> : null}
              <div className="mt-8">
                <ButtonLink
                  button={hero.button}
                  editAttribute={edit('hero', 'button')}
                  className="rounded-full px-6 py-3 text-sm"
                  icon={null}
                />
              </div>
            </Reveal>
          </div>
          {hero.image?.asset ? (
            <SanityImage image={hero.image} sizes="100vw" className="h-64 w-full object-cover md:hidden" />
          ) : null}
        </section>
      ) : null}

      {features?.enabled !== false && features?.items?.length ? (
        <section className="border-y border-jids-green-line bg-jids-green-tint/60 px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <IconRow items={features.items} />
          </div>
        </section>
      ) : null}

      {about && about.enabled !== false ? (
        <section id="mission" className="bg-white px-4 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
            <Reveal>
              {about.image?.asset ? (
                <SanityImage
                  image={about.image}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[5/3] w-full rounded-xl object-cover shadow-md"
                  editAttribute={edit('about', 'image')}
                />
              ) : (
                <div className="aspect-[5/3] w-full rounded-xl bg-jids-green-soft" data-sanity={edit('about', 'image')} />
              )}
            </Reveal>
            <Reveal>
              <Eyebrow>{about.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-extrabold tracking-tight text-jids-green-deep sm:text-4xl">{about.heading}</h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-700">
                {(about.paragraphs ?? []).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <ButtonLink
                  button={about.button}
                  editAttribute={edit('about', 'button')}
                  className="rounded-full px-6 py-3 text-sm"
                />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {programs && programs.enabled !== false ? (
        <section className="bg-jids-green-tint/60 px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <Eyebrow>{programs.eyebrow}</Eyebrow>
            <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-jids-green-deep">{programs.heading}</h2>
            <IconRow items={programs.items} big />
          </div>
        </section>
      ) : null}

      {teachers && teachers.enabled !== false ? (
        <section className="bg-white px-4 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <Eyebrow>{teachers.eyebrow}</Eyebrow>
            <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-jids-green-deep sm:text-4xl">
              {teachers.heading}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(teachers.items ?? []).map((t) => (
                <div
                  key={t._key}
                  className="flex items-center gap-5 rounded-xl bg-gray-50 p-6 shadow-sm"
                  {...editTargetAttr}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-jids-green-soft">
                    {t.photo?.asset ? (
                      <SanityImage image={t.photo} sizes="56px" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-end justify-center text-jids-green">
                        <Icon name="user" size={44} strokeWidth={0} className="fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    {t.role ? <p className="mt-0.5 text-sm text-gray-500">{t.role}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
