// Test helper: the first message zod gives for each field, or {} when the values are valid.
export async function messages(schema, values) {
  const result = await schema.safeParseAsync(values);
  const byField = {};
  for (const issue of result.error?.issues ?? []) {
    byField[issue.path.join(".")] ??= issue.message;
  }

  return byField;
}
