import {Reveal} from '@/components/ui/Reveal'
import {SanityImage} from '@/components/ui/SanityImage'
import {ButtonLink} from '@/components/ui/SmartLink'
import {editAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {EditField} from '@/components/home/HomeSections'
import type {StudentSpotlightSection as StudentSpotlightSectionData} from '@/sanity/types/home'

type StudentSpotlightSectionProps = {
  section: StudentSpotlightSectionData
  editField: EditField
}

/** Student success cards. Each card is a separate Student spotlight document. */
export function StudentSpotlightSection({section, editField}: StudentSpotlightSectionProps) {
  const students = (section.students ?? []).filter((student) => student.isVisible !== false)
  if (!students.length) return null

  return (
    <section
      className="bg-white px-4 py-20 sm:px-8"
      data-sanity={editField('students')}
      data-sanity-edit-target=""
    >
      <div className="mx-auto max-w-7xl text-center">
        <Reveal className="mx-auto mb-14 max-w-3xl" editAttribute={editField('header')}>
          {section.header?.heading ? (
            <h2 className="mb-3 text-2xl font-extrabold text-[#1a202c] sm:text-4xl">
              {section.header.heading}
            </h2>
          ) : null}
          <div className="title-accent-bar" />
          {section.header?.subheading ? (
            <p className="mt-4 text-sm text-gray-500 sm:text-base">{section.header.subheading}</p>
          ) : null}
        </Reveal>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {students.map((student, index) => {
            // The card renders a referenced document, so its own fields belong to
            // that document â€” clicking the card must open the Student spotlight,
            // not the Home page section that lists it.
            const studentField = (...rest: PathStep[]) =>
              editAttribute({id: student.id, type: 'studentSpotlight', path: rest})

            return (
              <Reveal
                key={student.id}
                delay={(index % 4) * 120}
                className="card-soft-hover flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md"
                {...editTargetAttr}
              >
                <div
                  className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-600 p-1"
                  data-sanity={studentField('photo')}
                >
                  <SanityImage
                    image={student.photo}
                    sizes="96px"
                    className="rounded-full object-cover"
                    editAttribute={studentField('photo')}
                  />
                </div>

                <h3
                  className="text-lg font-bold text-gray-900"
                  data-sanity={studentField('name')}
                >
                  {student.name}
                  {student.classLabel ? (
                    <span className="font-semibold text-gray-500"> ({student.classLabel})</span>
                  ) : null}
                </h3>

                {student.cohortLabel ? (
                  <p className="mb-3 mt-1 text-xs font-medium text-gray-500">
                    {student.cohortLabel}
                  </p>
                ) : null}

                {student.schoolName ? (
                  <div
                    className="mb-4 w-full rounded-full bg-jids-green-soft px-3 py-1.5 text-center text-xs font-semibold text-jids-green"
                    data-sanity={studentField('schoolName')}
                  >
                    {student.schoolName}
                  </div>
                ) : null}

                {student.note ? (
                  <p className="text-xs italic text-gray-500" data-sanity={studentField('note')}>
                    {student.note}
                  </p>
                ) : null}
              </Reveal>
            )
          })}
        </div>

        {section.cta ? (
          <Reveal>
            <ButtonLink
              button={section.cta}
              variant="outline"
              className="px-8 py-3 text-sm sm:text-base"
              editAttribute={editField('cta')}
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}
