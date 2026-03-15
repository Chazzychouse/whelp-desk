/**
 * Converts a filter DTO into a Prisma `where` object by stripping any keys
 * whose value is `undefined`. This allows filter DTOs to be spread directly
 * into Prisma queries without manually checking each field — new fields added
 * to the DTO are automatically included.
 */
export function toWhere<T extends object>(dto: T | undefined): Partial<T> {
    return Object.fromEntries(
        Object.entries(dto ?? {}).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
}
