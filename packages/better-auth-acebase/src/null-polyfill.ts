export const NULL_MARKER = '__acebase_null__';

export const encodeNullToMarker = (data: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === null) {
      result[key] = NULL_MARKER;
    }
  }
  return result;
};

export const decodeMarkerFromRecord = (
  data: Record<string, unknown> | null
): Record<string, unknown> | null => {
  if (!data) {
    return data;
  }

  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === NULL_MARKER) {
      result[key] = null;
    }
  }
  return result;
};

export const decodeCollectionMarkers = (
  records: Record<string, unknown>[]
): Record<string, unknown>[] => {
  return records.map((r) => decodeMarkerFromRecord(r) ?? r);
};
