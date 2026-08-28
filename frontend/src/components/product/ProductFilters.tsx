import { Search, SlidersHorizontal } from 'lucide-react'
import { Chip, Input, Select } from '@/components/ui'
import { useCategories } from '@/hooks/use-categories'
import { useProductCities } from '@/hooks/use-products'
import type { ProductQuery } from '@/types'

interface ProductFiltersProps {
  query: ProductQuery
  onChange: (patch: Partial<ProductQuery>) => void
}

const sortOptions = [
  { value: 'popularityScore', label: 'Popülerlik' },
  { value: 'rating', label: 'Puan' },
  { value: 'price', label: 'Fiyat' },
  { value: 'createdAt', label: 'Yenilik' },
] as const

export const ProductFilters = ({ query, onChange }: ProductFiltersProps) => {
  const { data: categories } = useCategories(true)
  const { data: cities } = useProductCities()

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={query.search ?? ''}
          onChange={(event) => onChange({ search: event.target.value, page: 1 })}
          placeholder="Aktivite ara…"
          leftIcon={<Search className="size-4" />}
          aria-label="Aktivite ara"
        />

        <Select
          value={query.city ?? ''}
          onChange={(event) => onChange({ city: event.target.value || undefined, page: 1 })}
          aria-label="Şehir filtresi"
          className="sm:w-44"
        >
          <option value="">Tüm şehirler</option>
          {cities?.map((city) => (
            <option key={city.city} value={city.city}>
              {city.city} ({city.count})
            </option>
          ))}
        </Select>

        <Select
          value={query.sortBy ?? 'popularityScore'}
          onChange={(event) => onChange({ sortBy: event.target.value as ProductQuery['sortBy'], page: 1 })}
          aria-label="Sıralama"
          className="sm:w-40"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Chip selected={!query.categoryId} onClick={() => onChange({ categoryId: undefined, page: 1 })}>
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            Tümü
          </span>
        </Chip>
        {categories?.map((category) => (
          <Chip
            key={category.id}
            selected={query.categoryId === category.id}
            onClick={() =>
              onChange({
                categoryId: query.categoryId === category.id ? undefined : category.id,
                page: 1,
              })
            }
            className="whitespace-nowrap"
          >
            {category.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}
