# Company Adapter Documentation

This document describes the functions used to adapt company data between the Supabase database and the frontend application.

## isValidContentStatus

```typescript
function isValidContentStatus(status: string): status is ContentStatus {
  return ['draft', 'published', 'archived', 'pending'].includes(status);
}
```

This function is a type guard that checks if a given string is a valid `ContentStatus`. It returns `true` if the status is one of `'draft'`, `'published'`, `'archived'`, or `'pending'`, and `false` otherwise.

## adaptCompanyFromDatabase

```typescript
export function adaptCompanyFromDatabase(dbCompany: SupabaseCompany): Company {
  // ...
}
```

This function adapts a company record from the Supabase database (`SupabaseCompany`) to the frontend `Company` model.

### Validation

The function performs the following validation checks:

*   **Required fields:** It checks if the `id` and `name` fields are present. If either of them is missing, it throws an error with a descriptive message.
*   **Valid status:** It uses the `isValidContentStatus` function to check if the `status` field is a valid `ContentStatus`. If it's not valid, it throws an error.

### Nullish Coalescing

The function uses the nullish coalescing operator (`??`) to provide default values for optional fields:

*   `coverImage`: If `dbCompany.cover_image` is `null` or `undefined`, it defaults to `undefined`.
*   `industry`: If `dbCompany.industry` is `null` or `undefined`, it defaults to `[]`.
*   `website`: If `dbCompany.website` is `null` or `undefined`, it defaults to `undefined`.
*   `featured`: If `dbCompany.featured` is `null` or `undefined`, it defaults to `false`.

## adaptCompanyToSupabaseUpdate

```typescript
export function adaptCompanyToSupabaseUpdate(company: Partial<Company>): Partial<SupabaseCompany> {
  // ...
}
```

This function adapts a partial `Company` object to a format suitable for updating a company record in the Supabase database.

### Status Validation

If the `status` field is present in the `company` object, the function validates it using the `isValidContentStatus` function. If the status is invalid, it throws an error.

### Nullish Coalescing

The function uses the nullish coalescing operator (`??`) to handle optional fields:

*   `cover_image`: If `company.coverImage` is defined, it uses `company.coverImage ?? null` to ensure that `null` values are passed to Supabase when the field is explicitly set to `null`.
*   `website`: If `company.website` is defined, it uses `company.website ?? null` to ensure that `null` values are passed to Supabase when the field is explicitly set to `null`.
*   `featured`: If `company.featured` is defined, it uses `company.featured ?? null` to ensure that `null` values are passed to Supabase when the field is explicitly set to `null`.

## adaptCompanyToSupabaseInsert

```typescript
export function adaptCompanyToSupabaseInsert(company: Partial<Omit<Company, 'id' | 'created_at'>>): Database['public']['Tables']['companies']['Insert'] {
  // ...
}
```

This function adapts a partial `Company` object to a format suitable for inserting a new company record in the Supabase database.

### Status Validation

If the `status` field is provided in the `company` object, the function validates it using the `isValidContentStatus` function. If the status is invalid, it throws an error.

### Default Values

The function provides default values for the following required fields:

*   `name`: Defaults to `''`.
*   `description`: Defaults to `''`.
*   `logo`: Defaults to `''`.
*   `size`: Defaults to `''`.
*   `founded`: Defaults to `''`.
*   `location`: Defaults to `''`.
*   `status`: Defaults to `'draft'`.

For optional fields that can be `null` in the database, the function explicitly sets them to `null` if they are undefined in the `company` object:

*   `cover_image`: Set to `null` if `company.coverImage` is undefined.
*   `website`: Set to `null` if `company.website` is undefined.