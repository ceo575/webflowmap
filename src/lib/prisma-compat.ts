import { Prisma } from "@prisma/client";

function getPrismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }

  return null;
}

export function isLegacySchemaError(error: unknown): boolean {
  const code = getPrismaErrorCode(error);
  return code === "P2021" || code === "P2022";
}

export async function withLegacyFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (!isLegacySchemaError(error)) throw error;
    return fallback();
  }
}
