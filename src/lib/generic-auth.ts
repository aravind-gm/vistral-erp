export const TEST_AUTH_COOKIE = "vistral_test_session";

export type GenericSessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function encodeGenericSession(user: GenericSessionUser) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

export function decodeGenericSession(value?: string | null): GenericSessionUser | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<GenericSessionUser>;

    if (!parsed.id || !parsed.name || !parsed.email || !parsed.role) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}
