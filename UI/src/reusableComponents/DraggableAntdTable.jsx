import React, { useState, useRef, createContext, useContext, useEffect } from "react";
import { Table, Input, Button, Space, Popconfirm } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ExcelJS from "exceljs";

// Drag context for column styling
const DragIndexContext = createContext({ active: -1, over: -1 });

// Drag active style function
const dragActiveStyle = (dragState, id) => {
  const { active, over, direction } = dragState;
  let style = {};
  if (active && active === id) {
    style = { backgroundColor: "gray", opacity: 0.5 };
  } else if (over && id === over && active !== over) {
    style =
      direction === "right"
        ? { borderRight: "1px dashed gray" }
        : { borderLeft: "1px dashed gray" };
  }
  return style;
};

// Table header cell component for draggable columns
const TableHeaderCell = (props) => {
  const dragState = useContext(DragIndexContext);
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: props.id,
  });

  const style = {
    ...props.style,
    cursor: "move",
    ...(isDragging
      ? { position: "relative", zIndex: 9999, userSelect: "none" }
      : {}),
    ...dragActiveStyle(dragState, props.id),
  };

  return (
    <th
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

// Table body cell component for drag styling
const TableBodyCell = (props) => {
  const dragState = useContext(DragIndexContext);
  return (
    <td
      {...props}
      style={{
        ...props.style,
        ...dragActiveStyle(dragState, props.id),
      }}
    />
  );
};

// Row component for row dragging (if needed)
const Row = ({ children, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props["data-row-key"],
    });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "move",
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </tr>
  );
};

/**
 * DraggableAntdTable Component
 * @param {Object} props - Component props
 * @param {Array} props.dataSource - Data source for the table
 * @param {Array} props.columns - Column definitions
 * @param {boolean} [props.loading=false] - Loading state
 * @param {boolean} [props.sort=false] - Enable sorting
 * @param {boolean} [props.filter=false] - Enable filtering
 * @param {boolean} [props.columnDraggable=false] - Enable column dragging
 * @param {boolean} [props.rowDraggable=false] - Enable row dragging
 * @param {string|Function} [props.rowKey="id"] - Row key
 * @param {Object|false} [props.pagination] - Pagination configuration
 * @param {string} [props.size="middle"] - Table size (small, middle, large)
 * @param {Object} [props.scroll] - Scroll configuration {x, y}
 * @param {boolean} [props.bordered=false] - Show borders
 * @param {boolean} [props.showHeader=true] - Show table header
 * @param {Function} [props.onRow] - Row event handler
 * @param {Function} [props.onColumnOrderChange] - Callback when column order changes
 * @param {string} [props.className] - CSS class name
 * @param {Object} [props.style] - Inline styles
 * @param {boolean} [props.showExportButton=false] - Show Excel export button
 * @param {string} [props.exportFileName="export"] - Excel file name (without extension)
 * @param {Function} [props.onExport] - Custom export callback
 * @param {Function} props.t - Translation function
 *
 * // Aksiyon prop'ları
 * @param {boolean} [props.showEdit=false] - Show edit button column
 * @param {boolean} [props.showDelete=false] - Show delete button column
 * @param {Object} [props.editConfig] - Edit button configuration object
 * @param {Object} [props.deleteConfig] - Delete button configuration object
 * @param {Function} [props.onEdit] - Edit button click handler (record, index) => void
 * @param {Function} [props.onDelete] - Delete button click handler (record, index) => void
 */
const DraggableAntdTable = ({
  dataSource,
  columns,
  loading = false,
  sort = false,
  filter = false,
  columnDraggable = false,
  rowDraggable = false,
  rowKey = "id",
  pagination = { pageSize: 10 },
  size = "middle",
  scroll,
  showHeader = true,
  onRow,
  onColumnOrderChange,
  className,
  style,
  showExportButton = false,
  exportFileName = "export",
  onExport,
  localizeThis,
  showEdit = false,
  showDelete = false,
  editConfig = {},
  deleteConfig = {},
  onEdit,
  onDelete,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const searchInput = useRef(null);
  // const { setLanguage, language, t } = useLocalization();
  
  // Edit konfigürasyonu için default değerler
  const defaultEditConfig = {
    title: localizeThis("editTitle"),
    buttonText: localizeThis("editButtonText"),
    buttonType: "default",
    buttonSize: "small",
    buttonDanger: false,
    icon: <EditOutlined />,
    width: 45,
    fixed: false,
    ...editConfig,
  };

  // Delete konfigürasyonu için default değerler
  const defaultDeleteConfig = {
    title: localizeThis("deleteTitle"),
    buttonText: localizeThis("deleteButtonText"),
    buttonType: "default",
    buttonSize: "small",
    buttonDanger: true,
    icon: <DeleteOutlined />,
    confirmTitle: localizeThis("deleteConfirmTitle"),
    confirmDescription: localizeThis("deleteConfirmDescription"),
    confirmOkText: localizeThis("deleteConfirmOkText"),
    confirmCancelText: localizeThis("deleteConfirmCancelText"),
    width: 45,
    fixed: false,
    ...deleteConfig,
  };

  // Edit kolonunu oluştur
  const createEditColumn = () => ({
    title: defaultEditConfig.title,
    key: "edit",
    width: defaultEditConfig.width,
    fixed: defaultEditConfig.fixed ? "left" : false,
    align: "center",
    render: (_, record, index) => (
      <Button
        type={defaultEditConfig.buttonType}
        size={defaultEditConfig.buttonSize}
        danger={defaultEditConfig.buttonDanger}
        icon={defaultEditConfig.icon}
        onClick={() => onEdit && onEdit(record, index)}
        loading={false}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minWidth: "32px",
          padding: "4px 6px"
        }}
      >
        {!defaultEditConfig.icon && defaultEditConfig.buttonText}
      </Button>
    ),
  });

  // Delete kolonunu oluştur
  const createDeleteColumn = () => ({
    title: defaultDeleteConfig.title,
    key: "delete",
    width: defaultDeleteConfig.width,
    fixed: defaultDeleteConfig.fixed ? "right" : false,
    align: "center",
    render: (_, record, index) => (
      <Popconfirm
        title={defaultDeleteConfig.confirmTitle}
        description={defaultDeleteConfig.confirmDescription}
        onConfirm={() => onDelete && onDelete(record, index)}
        okText={defaultDeleteConfig.confirmOkText}
        cancelText={defaultDeleteConfig.confirmCancelText}
      >
        <Button
          type={defaultDeleteConfig.buttonType}
          size={defaultDeleteConfig.buttonSize}
          danger={defaultDeleteConfig.buttonDanger}
          icon={defaultDeleteConfig.icon}
          loading={false}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            minWidth: "32px",
            padding: "4px 6px"
          }}
        >
          {!defaultDeleteConfig.icon && defaultDeleteConfig.buttonText}
        </Button>
      </Popconfirm>
    ),
  });

  // Kolonları hazırla (edit en başta, delete en sonda)
  const prepareColumns = () => {
    let columnsWithKeys = columns.map((column, i) => ({
      ...column,
      key: column.key || `${i}`,
      onHeaderCell: columnDraggable
        ? () => ({ id: column.key || `${i}` })
        : column.onHeaderCell,
      onCell: columnDraggable
        ? () => ({ id: column.key || `${i}` })
        : column.onCell,
    }));

    // Edit kolonunu en başa ekle
    if (showEdit) {
      const editColumn = createEditColumn();
      columnsWithKeys.unshift({
        ...editColumn,
        onHeaderCell: columnDraggable
          ? () => ({ id: "edit" })
          : editColumn.onHeaderCell,
        onCell: columnDraggable ? () => ({ id: "edit" }) : editColumn.onCell,
      });
    }

    // Delete kolonunu en sona ekle
    if (showDelete) {
      const deleteColumn = createDeleteColumn();
      columnsWithKeys.push({
        ...deleteColumn,
        onHeaderCell: columnDraggable
          ? () => ({ id: "delete" })
          : deleteColumn.onHeaderCell,
        onCell: columnDraggable
          ? () => ({ id: "delete" })
          : deleteColumn.onCell,
      });
    }

    return columnsWithKeys;
  };
  

  const [tableColumns, setTableColumns] = useState(() => prepareColumns());
  const [dragIndex, setDragIndex] = useState({ active: -1, over: -1 });

  // ExcelJS ile Excel export function
  const exportToExcel = async () => {
    try {
      setExportLoading(true);

      // Custom export callback varsa onu kullan
      if (onExport) {
        await onExport(dataSource, tableColumns);
        return;
      }

      // Aksiyon kolonlarını export'tan çıkar
      const exportColumns = tableColumns.filter(
        (col) => col.key !== "edit" && col.key !== "delete"
      );

      // Yeni workbook oluştur
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        localizeThis("excelWorksheetName")
      );

      // Header'ları ekle
      const headers = exportColumns.map((col) => col.title || col.dataIndex);
      worksheet.addRow(headers);

      // Header stilini ayarla
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6FA" },
      };

      // Veriyi formatla ve ekle
      dataSource.forEach((row) => {
        const formattedRow = [];
        exportColumns.forEach((col) => {
          const value = row[col.dataIndex];

          // Render fonksiyonu varsa ve basit string döndürüyorsa onu kullan
          if (col.render && typeof col.render === "function") {
            try {
              const rendered = col.render(value, row);
              // Eğer render edilen değer string veya number ise onu kullan
              if (
                typeof rendered === "string" ||
                typeof rendered === "number"
              ) {
                formattedRow.push(rendered);
              } else {
                formattedRow.push(value || "");
              }
            } catch {
              formattedRow.push(value || "");
            }
          } else {
            formattedRow.push(value || "");
          }
        });
        worksheet.addRow(formattedRow);
      });

      // Kolon genişliklerini otomatik ayarla
      exportColumns.forEach((col, index) => {
        const column = worksheet.getColumn(index + 1);
        const maxLength = Math.max(
          col.title?.length || 0,
          ...dataSource.map((row) => {
            const value = row[col.dataIndex];
            return value ? value.toString().length : 0;
          })
        );
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      });

      // Border ekle
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Dosyayı buffer olarak oluştur ve indir
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download link oluştur
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${exportFileName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel export error:", error);
      alert(localizeThis("excelExportError") + ": " + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Filter dropdown and search properties
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={localizeThis("searchPlaceholder") + " " + dataIndex}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {localizeThis("searchButtonText")}
          </Button>
          <Button
            onClick={() => {
              handleReset(clearFilters);
              handleSearch(selectedKeys, confirm, dataIndex);
            }}
            size="small"
            style={{ width: 90 }}
          >
            {localizeThis("resetButtonText")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  useEffect(() => {
      setTableColumns(prepareColumns());
    }, [columns,localizeThis]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  // Column drag handlers
  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setTableColumns((prevState) => {
        const activeIndex = prevState.findIndex((i) => i.key === active.id);
        const overIndex = prevState.findIndex((i) => i.key === over?.id);
        const newColumns = arrayMove(prevState, activeIndex, overIndex);

        // Call callback if provided
        if (onColumnOrderChange) {
          onColumnOrderChange(newColumns);
        }

        return newColumns;
      });
    }
    setDragIndex({ active: -1, over: -1 });
  };

  const onDragOver = ({ active, over }) => {
    const activeIndex = tableColumns.findIndex((i) => i.key === active.id);
    const overIndex = tableColumns.findIndex((i) => i.key === over?.id);
    setDragIndex({
      active: active.id,
      over: over?.id,
      direction: overIndex > activeIndex ? "right" : "left",
    });
  };

  // Enhance columns with filter and sort capabilities
  const enhancedColumns = tableColumns.map((col) => {
    let newCol = { ...col };

    // Aksiyon kolonları için filter ve sort ekleme
    if (col.key === "edit" || col.key === "delete") {
      return newCol;
    }

    if (filter && col.dataIndex) {
      newCol = { ...newCol, ...getColumnSearchProps(col.dataIndex) };
    }

    if (sort && col.dataIndex) {
      newCol.sorter = (a, b) => {
        const aVal = a[col.dataIndex];
        const bVal = b[col.dataIndex];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal;
        }

        return aVal?.toString().localeCompare(bVal?.toString());
      };

      newCol.sortDirections = ["ascend", "descend"];
    }

    return newCol;
  });

  // Table components configuration
  const tableComponents = {
    header: columnDraggable ? { cell: TableHeaderCell } : {},
    body: {
      cell: columnDraggable ? TableBodyCell : undefined,
      row: rowDraggable ? Row : undefined,
    },
  };

  // Improved table styles with zebra striping and better borders
  const tableStyle = {
    ...style,
  };

  const customClassName = `
    enhanced-table
    ${className || ''}
  `;

  // CSS styles for enhanced table appearance
  const customTableStyles = `
    .enhanced-table .ant-table-thead > tr > th {
      background: linear-gradient(145deg, #f8f9fa, #e9ecef) !important;
      border: 1px solid #dee2e6 !important;
      font-weight: 600;
      color: #495057;
      text-align: center;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    }
    
    .enhanced-table .ant-table-tbody > tr > td {
      border: 1px solid #dee2e6 !important;
      transition: background-color 0.2s ease;
    }
    
    .enhanced-table .ant-table-tbody > tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .enhanced-table .ant-table-tbody > tr:nth-child(odd) {
      background-color: #ffffff;
    }
    
    .enhanced-table .ant-table-tbody > tr:hover > td {
      background-color: #e3f2fd !important;
    }
    
    .enhanced-table .ant-table {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .enhanced-table .ant-table-container {
      border-radius: 8px;
    }
    
    .enhanced-table .ant-table-thead > tr:first-child > th:first-child {
      border-top-left-radius: 7px;
    }
    
    .enhanced-table .ant-table-thead > tr:first-child > th:last-child {
      border-top-right-radius: 7px;
    }
    
    .enhanced-table .ant-pagination {
      margin-top: 16px;
      text-align: center;
    }
    
    .enhanced-table .ant-btn {
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .enhanced-table .ant-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `;

  return (
    <div>
      <style>{customTableStyles}</style>
      
      {showExportButton && (
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            loading={exportLoading || loading}
            disabled={!dataSource || dataSource.length === 0}
          >
            {localizeThis("exportToExcelButtonText")}
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        modifiers={columnDraggable ? [restrictToHorizontalAxis] : []}
        onDragEnd={columnDraggable ? onDragEnd : undefined}
        onDragOver={columnDraggable ? onDragOver : undefined}
        collisionDetection={closestCenter}
      >
        <SortableContext
          items={
            columnDraggable
              ? tableColumns.map((i) => i.key)
              : rowDraggable
              ? dataSource.map((item) =>
                  typeof rowKey === "function" ? rowKey(item) : item[rowKey]
                )
              : []
          }
          strategy={
            columnDraggable
              ? horizontalListSortingStrategy
              : verticalListSortingStrategy
          }
        >
          <DragIndexContext.Provider value={dragIndex}>
            <Table
              rowKey={rowKey}
              columns={enhancedColumns}
              dataSource={dataSource}
              loading={loading}
              components={tableComponents}
              pagination={pagination}
              size={size}
              scroll={scroll}
              bordered={true}
              showHeader={showHeader}
              onRow={onRow}
              className={customClassName}
              style={tableStyle}
            />
          </DragIndexContext.Provider>
        </SortableContext>

        {columnDraggable && (
          <DragOverlay>
            <div
              style={{
                backgroundColor: "gray",
                padding: 16,
                border: "1px solid #d9d9d9",
                fontWeight: "bold",
                textAlign: "center",
                minWidth: 100,
                borderRadius: 4,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              {tableColumns.find((i) => i.key === dragIndex.active)?.title}
            </div>
          </DragOverlay>
        )}
      </DndContext>
    </div>
  );
};

export default DraggableAntdTable;