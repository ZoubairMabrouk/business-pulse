import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getGroupableColumns,
  groupTableData,
} from "@/services/chart.utils";

type Props = {
  data: Record<string, any>[];
};

export const DynamicTable: React.FC<Props> = ({
  data,
}) => {
  const [groupBy, setGroupBy] =
    useState("");

  const columns = useMemo(() => {
    if (!data?.length) return [];

    return Object.keys(data[0]);
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.every(
        (col) =>
          row[col] !== null &&
          row[col] !== undefined
      )
    );
  }, [data, columns]);

  const groupableColumns = useMemo(() => {
    return getGroupableColumns(
      filteredData,
      columns
    );
  }, [filteredData, columns]);

  useEffect(() => {
    if (
      groupableColumns.length &&
      !groupBy
    ) {
      setGroupBy(groupableColumns[0]);
    }
  }, [groupableColumns]);

  const groupedData = useMemo(() => {
    if (!groupBy) return filteredData;

    return groupTableData(
      filteredData,
      groupBy
    );
  }, [filteredData, groupBy]);

  if (!data?.length) return null;

  return (
    <div className="glass-card rounded-xl p-3 space-y-3">
      {groupableColumns.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">
            Grouper par:
          </span>

          <select
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value)
            }
            className="h-7 px-2 rounded-md bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">
              Aucun
            </option>

            {groupableColumns.map((col) => (
              <option
                key={col}
                value={col}
              >
                {col}
              </option>
            ))}
          </select>

          <span className="ml-auto text-muted-foreground">
            {groupedData.length} ligne(s)
          </span>
        </div>
      )}

      <div className="overflow-auto max-h-[320px] scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card/95 backdrop-blur">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column}
                  className="text-left font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider text-[10px]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groupedData.map(
              (row, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-3 py-2 font-mono"
                    >
                      {typeof row[column] ===
                      "number"
                        ? new Intl.NumberFormat(
                            "fr-TN"
                          ).format(
                            row[column]
                          )
                        : String(
                            row[column]
                          )}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};