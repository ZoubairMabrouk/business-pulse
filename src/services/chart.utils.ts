export const getBestDimension = (
  data: Record<string, any>[],
  columns: string[]
) => {
  const stats = columns.map((col) => ({
    col,
    uniqueCount: new Set(
      data.map((row) => row[col])
    ).size,
    total: data.length,
    isNumeric:
      typeof data[0][col] === "number",
  }));

  let dimensions = stats.filter(
    (c) =>
      !c.isNumeric &&
      c.uniqueCount > 1 &&
      c.uniqueCount < c.total
  );

  const seen = new Set<number>();

  dimensions = dimensions.filter((d) => {
    if (seen.has(d.uniqueCount)) {
      return false;
    }

    seen.add(d.uniqueCount);

    return true;
  });

  dimensions.sort(
    (a, b) =>
      a.uniqueCount - b.uniqueCount
  );

  return dimensions[0]?.col || null;
};

export const groupChartData = (
  data: Record<string, any>[],
  groupBy: string,
  measures: string[]
) => {
  const map = new Map<string, any>();

  data.forEach((row) => {
    const key = row[groupBy];

    if (!map.has(key)) {
      const record: Record<
        string,
        any
      > = {
        [groupBy]: key,
      };

      measures.forEach((measure) => {
        record[measure] =
          typeof row[measure] === "number"
            ? row[measure]
            : 0;
      });

      map.set(key, record);
    } else {
      const existing = map.get(key);

      measures.forEach((measure) => {
        if (
          typeof row[measure] === "number"
        ) {
          existing[measure] +=
            row[measure];
        }
      });
    }
  });

  return Array.from(map.values());
};

export const getGroupableColumns = (
  data: Record<string, any>[],
  columns: string[]
) => {
  const stats = columns.map((col) => ({
    col,
    uniqueCount: new Set(
      data.map((row) => row[col])
    ).size,
    total: data.length,
  }));

  let candidates = stats.filter(
    (c) =>
      c.uniqueCount > 1 &&
      c.uniqueCount < c.total
  );

  const seen = new Set<number>();

  candidates = candidates.filter(
    (candidate) => {
      if (
        seen.has(candidate.uniqueCount)
      ) {
        return false;
      }

      seen.add(candidate.uniqueCount);

      return true;
    }
  );

  candidates.sort(
    (a, b) =>
      a.uniqueCount - b.uniqueCount
  );

  return candidates.map(
    (candidate) => candidate.col
  );
};

export const groupTableData = (
  data: Record<string, any>[],
  groupBy: string
) => {
  const map = new Map<string, any>();

  data.forEach((row) => {
    const key = row[groupBy];

    if (!map.has(key)) {
      map.set(key, { ...row });
    } else {
      const existing = map.get(key);

      Object.keys(row).forEach((column) => {
        if (
          column !== groupBy &&
          typeof row[column] ===
            "number"
        ) {
          existing[column] +=
            row[column];
        }
      });
    }
  });

  return Array.from(map.values());
};