import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

const SortableTable = ({ columns, data, sortBy, order, onSort, emptyMessage = "No data found" }) => {
  const getSortIcon = (field) => {
    if (sortBy !== field) return <ChevronsUpDown size={14} className="sort-icon sort-icon--neutral" />;
    return order === "asc"
      ? <ChevronUp size={14} className="sort-icon sort-icon--active" />
      : <ChevronDown size={14} className="sort-icon sort-icon--active" />;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? "th-sortable" : ""}
                onClick={() => col.sortable && onSort(col.key)}
              >
                <span className="th-content">
                  {col.label}
                  {col.sortable && getSortIcon(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx} className="table-row">
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? "—"}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
