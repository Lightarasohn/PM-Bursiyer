import React, { useState, useRef, createContext, useContext, useEffect, useCallback } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Space, 
  Popconfirm, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  InputNumber, 
  message, 
  Spin 
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
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

const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

// ==============================================
// TABLE CONFIGURATIONS
// ==============================================
const TABLE_CONFIGS = {
  scholar: {
    apiEndpoint: '/api/scholar',
    columns: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: 'Scholar Name', dataIndex: 'name', key: 'name', width: 200 },
      { title: 'Field', dataIndex: 'field', key: 'field', width: 150 },
      { title: 'University', dataIndex: 'university', key: 'university', width: 200 },
      { title: 'Publications', dataIndex: 'publications', key: 'publications', width: 120 },
      { title: 'H-Index', dataIndex: 'hIndex', key: 'hIndex', width: 100 },
    ],
    modalConfig: {
      title: 'Add New Scholar',
      width: 600,
      fields: [
        { name: 'name', label: 'Scholar Name', type: 'input', required: true, rules: [{ required: true, message: 'Please enter scholar name' }] },
        { name: 'field', label: 'Field of Study', type: 'input', required: true, rules: [{ required: true, message: 'Please enter field' }] },
        { name: 'university', label: 'University', type: 'input', required: true },
        { name: 'publications', label: 'Number of Publications', type: 'number', required: false },
        { name: 'hIndex', label: 'H-Index', type: 'number', required: false },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'bio', label: 'Biography', type: 'textarea', required: false }
      ]
    },
    addButtonText: 'Add Scholar',
    searchPlaceholder: 'Search scholars...',
    exportFileName: 'scholars'
  },
  
  document: {
    apiEndpoint: 'api/document',
    columns: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: 'Title', dataIndex: 'title', key: 'title', width: 250 },
      { title: 'Type', dataIndex: 'type', key: 'type', width: 120 },
      { title: 'Author', dataIndex: 'author', key: 'author', width: 180 },
      { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
      { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    ],
    modalConfig: {
      title: 'Add New Document',
      width: 700,
      fields: [
        { name: 'title', label: 'Document Title', type: 'input', required: true, rules: [{ required: true, message: 'Please enter document title' }] },
        { name: 'type', label: 'Document Type', type: 'select', required: true, options: [
          { value: 'article', label: 'Article' },
          { value: 'book', label: 'Book' },
          { value: 'thesis', label: 'Thesis' },
          { value: 'report', label: 'Report' }
        ]},
        { name: 'author', label: 'Author', type: 'input', required: true },
        { name: 'date', label: 'Publication Date', type: 'date', required: false },
        { name: 'status', label: 'Status', type: 'select', required: false, options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
          { value: 'archived', label: 'Archived' }
        ]},
        { name: 'abstract', label: 'Abstract', type: 'textarea', required: false },
        { name: 'keywords', label: 'Keywords', type: 'input', required: false, placeholder: 'Separate with commas' }
      ]
    },
    addButtonText: 'Add Document',
    searchPlaceholder: 'Search documents...',
    exportFileName: 'documents'
  },

  user: {
    apiEndpoint: '/api/user',
    columns: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', width: 200 },
      { title: 'Email', dataIndex: 'email', key: 'email', width: 220 },
      { title: 'Role', dataIndex: 'role', key: 'role', width: 120 },
      { title: 'Department', dataIndex: 'department', key: 'department', width: 150 },
      { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
    ],
    modalConfig: {
      title: 'Add New User',
      width: 550,
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'input', required: true, rules: [{ required: true, message: 'Please enter full name' }] },
        { name: 'email', label: 'Email', type: 'email', required: true, rules: [{ required: true, type: 'email', message: 'Please enter valid email' }] },
        { name: 'role', label: 'Role', type: 'select', required: true, options: [
          { value: 'admin', label: 'Admin' },
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' }
        ]},
        { name: 'department', label: 'Department', type: 'input', required: false },
        { name: 'phone', label: 'Phone', type: 'input', required: false }
      ]
    },
    addButtonText: 'Add User',
    searchPlaceholder: 'Search users...',
    exportFileName: 'users'
  }
};

// ==============================================
// API SERVICE CLASS
// ==============================================
class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get(endpoint) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
      

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API POST Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API PUT Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint, id) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API DELETE Error for ${endpoint}:`, error);
      throw error;
    }
  }
}

// ==============================================
// DRAG & DROP CONTEXT
// ==============================================
const DragIndexContext = createContext({ active: -1, over: -1 });

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

// ==============================================
// DYNAMIC FORM MODAL COMPONENT
// ==============================================
const DynamicFormModal = ({ 
  visible, 
  onCancel, 
  onOk, 
  loading, 
  config,
  initialValues = {} 
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const renderField = (field) => {
    const { name, label, type, required, options, placeholder, rules = [] } = field;
    
    const commonProps = {
      placeholder: placeholder || `Enter ${label.toLowerCase()}`,
      disabled: loading
    };

    switch (type) {
      case 'input':
        return <Input {...commonProps} />;
      
      case 'email':
        return <Input {...commonProps} type="email" />;
      
      case 'textarea':
        return <TextArea {...commonProps} rows={4} />;
      
      case 'number':
        return <InputNumber {...commonProps} style={{ width: '100%' }} min={0} />;
      
      case 'select':
        return (
          <Select {...commonProps} placeholder={`Select ${label.toLowerCase()}`}>
            {options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      
      case 'date':
        return <DatePicker {...commonProps} style={{ width: '100%' }} />;
      
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Modal
      title={config?.title || 'Add New Item'}
      open={visible}
      onCancel={handleCancel}
      width={config?.width || 600}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
          icon={<PlusOutlined />}
        >
          Add
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        {config?.fields?.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || (field.required ? [{ required: true, message: `Please enter ${field.label.toLowerCase()}` }] : [])}
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

// ==============================================
// MAIN DOCUMENT ANTD TABLE COMPONENT
// ==============================================
/**
 * DocumentAntdTable Component - Complete reusable table with all features
 * @param {string} tableType - Type of table (scholar, document, user, or custom)
 * @param {Object} customConfig - Custom configuration to override defaults
 * @param {Array} customDataSource - Custom data source (overrides API calls)
 * @param {boolean} loading - External loading state
 * @param {boolean} sort - Enable sorting
 * @param {boolean} filter - Enable filtering
 * @param {boolean} columnDraggable - Enable column dragging
 * @param {boolean} rowDraggable - Enable row dragging
 * @param {boolean} showEdit - Show edit button column
 * @param {boolean} showDelete - Show delete button column
 * @param {boolean} showAddButton - Show add button
 * @param {boolean} showSearch - Show search functionality
 * @param {boolean} showRefresh - Show refresh button
 * @param {boolean} showExportButton - Show Excel export button
 * @param {Object} additionalFilters - Additional API filters
 * @param {Function} onDataChange - Callback when data changes
 * @param {Function} onEdit - Edit button click handler
 * @param {Function} onDelete - Delete button click handler
 * @param {Function} localizeThis - Localization function
 */
const DocumentAntdTable = ({
  // Configuration props
  tableType,
  customConfig = {},
  customDataSource = null,
  
  // Table behavior props
  loading: externalLoading = false,
  sort = false,
  filter = false,
  columnDraggable = false,
  rowDraggable = false,
  
  // Action props
  showEdit = false,
  showDelete = false,
  showAddButton = true,
  showSearch = true,
  showRefresh = true,
  showExportButton = false,
  
  // Data props
  additionalFilters = {},
  onDataChange,
  
  // Event handlers
  onEdit,
  onDelete,
  
  // Styling props
  className,
  style,
  size = "middle",
  bordered = true,
  
  // Localization
  localizeThis = (key) => key, // Default fallback
  
  // Table props
  rowKey = "id",
  pagination: paginationProp = { pageSize: 10 },
  scroll,
  showHeader = true,
  onRow,
}) => {
  // ==============================================
  // STATE MANAGEMENT
  // ==============================================
  const [dataSource, setDataSource] = useState(customDataSource || []);
  const [loading, setLoading] = useState(externalLoading);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState({ active: -1, over: -1 });
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: paginationProp?.pageSize || 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    ...paginationProp
  });

  const searchInput = useRef(null);
  const apiService = new ApiService();

  // ==============================================
  // CONFIGURATION
  // ==============================================
  const config = tableType ? { ...TABLE_CONFIGS[tableType], ...customConfig } : customConfig;
  
  // ==============================================
  // TABLE COLUMNS MANAGEMENT
  // ==============================================
  const createEditColumn = () => ({
    title: localizeThis("editTitle") || "Edit",
    key: "edit",
    width: 45,
    fixed: false,
    align: "center",
    render: (_, record, index) => (
      <Button
        type="default"
        size="small"
        danger={false}
        icon={<EditOutlined />}
        onClick={() => onEdit && onEdit(record, index)}
        loading={false}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minWidth: "32px",
          padding: "4px 6px"
        }}
      />
    ),
  });

  const createDeleteColumn = () => ({
    title: localizeThis("deleteTitle") || "Delete",
    key: "delete",
    width: 45,
    fixed: false,
    align: "center",
    render: (_, record, index) => (
      <Popconfirm
        title={localizeThis("deleteConfirmTitle") || "Are you sure?"}
        description={localizeThis("deleteConfirmDescription") || "This action cannot be undone."}
        onConfirm={() => onDelete && onDelete(record, index)}
        okText={localizeThis("deleteConfirmOkText") || "Yes"}
        cancelText={localizeThis("deleteConfirmCancelText") || "No"}
      >
        <Button
          type="default"
          size="small"
          danger={true}
          icon={<DeleteOutlined />}
          loading={false}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            minWidth: "32px",
            padding: "4px 6px"
          }}
        />
      </Popconfirm>
    ),
  });

  const createAddButtonColumn = () => ({
    title: 'Actions',
    key: 'actions',
    width: 100,
    fixed: 'right',
    align: 'center',
    render: (_, record, index) => {
      if (index === 0) {
        return (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            {config?.addButtonText || 'Add'}
          </Button>
        );
      }
      return null;
    },
  });

  const prepareColumns = () => {
    let columnsWithKeys = (config?.columns || []).map((column, i) => ({
      ...column,
      key: column.key || `${i}`,
      onHeaderCell: columnDraggable
        ? () => ({ id: column.key || `${i}` })
        : column.onHeaderCell,
      onCell: columnDraggable
        ? () => ({ id: column.key || `${i}` })
        : column.onCell,
    }));

    if (showEdit) {
      const editColumn = createEditColumn();
      columnsWithKeys.unshift({
        ...editColumn,
        onHeaderCell: columnDraggable ? () => ({ id: "edit" }) : editColumn.onHeaderCell,
        onCell: columnDraggable ? () => ({ id: "edit" }) : editColumn.onCell,
      });
    }

    if (showDelete) {
      const deleteColumn = createDeleteColumn();
      columnsWithKeys.push({
        ...deleteColumn,
        onHeaderCell: columnDraggable ? () => ({ id: "delete" }) : deleteColumn.onHeaderCell,
        onCell: columnDraggable ? () => ({ id: "delete" }) : deleteColumn.onCell,
      });
    }
    
    if (showAddButton && dataSource.length > 0) {
      columnsWithKeys.push(createAddButtonColumn());
    }

    return columnsWithKeys;
  };

  const [tableColumns, setTableColumns] = useState(() => prepareColumns());

  // ==============================================
  // API OPERATIONS
  // ==============================================
  const fetchData = useCallback(async (params = {}) => {
    if (customDataSource || !config?.apiEndpoint) {
      setDataSource(customDataSource || []);
      return;
    }

    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: globalSearchText,
        ...additionalFilters,
        ...params
      };

      const response = await apiService.get(config.apiEndpoint, queryParams);
      const { data, total, current, pageSize } = response;
      
      setDataSource(data || response || []);
      setPagination(prev => ({
        ...prev,
        total: total || data?.length || 0,
        current: current || prev.current,
        pageSize: pageSize || prev.pageSize
      }));

      if (onDataChange) {
        onDataChange(data || response || []);
      }
    } catch (error) {
      message.error(`Failed to load data: ${error.message}`);
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddItem = async (values) => {
    if (!config?.apiEndpoint) {
      message.error('API endpoint not configured');
      return;
    }

    setModalLoading(true);
    try {
      await apiService.post(config.apiEndpoint, values);
      message.success(`${tableType || 'Item'} added successfully!`);
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(`Failed to add ${tableType || 'item'}: ${error.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // ==============================================
  // SEARCH & FILTER FUNCTIONALITY
  // ==============================================
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
          placeholder={`${localizeThis("searchPlaceholder") || "Search"} ${dataIndex}`}
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
            {localizeThis("searchButtonText") || "Search"}
          </Button>
          <Button
            onClick={() => {
              handleReset(clearFilters);
              handleSearch(selectedKeys, confirm, dataIndex);
            }}
            size="small"
            style={{ width: 90 }}
          >
            {localizeThis("resetButtonText") || "Reset"}
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

  const handleGlobalSearch = (value) => {
    setGlobalSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // ==============================================
  // EXCEL EXPORT FUNCTIONALITY
  // ==============================================
  const exportToExcel = async () => {
    try {
      setExportLoading(true);

      const exportColumns = tableColumns.filter(
        (col) => col.key !== "edit" && col.key !== "delete" && col.key !== "actions"
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        localizeThis("excelWorksheetName") || "Export"
      );

      const headers = exportColumns.map((col) => col.title || col.dataIndex);
      worksheet.addRow(headers);

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6FA" },
      };

      dataSource.forEach((row) => {
        const formattedRow = [];
        exportColumns.forEach((col) => {
          const value = row[col.dataIndex];

          if (col.render && typeof col.render === "function") {
            try {
              const rendered = col.render(value, row);
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

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${config?.exportFileName || 'export'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel export error:", error);
      message.error(`${localizeThis("excelExportError") || "Export failed"}: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // ==============================================
  // DRAG & DROP FUNCTIONALITY
  // ==============================================
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setTableColumns((prevState) => {
        const activeIndex = prevState.findIndex((i) => i.key === active.id);
        const overIndex = prevState.findIndex((i) => i.key === over?.id);
        const newColumns = arrayMove(prevState, activeIndex, overIndex);
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

  // ==============================================
  // TABLE EVENT HANDLERS
  // ==============================================
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(newPagination);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // ==============================================
  // ENHANCED COLUMNS WITH FILTERS AND SORTING
  // ==============================================
  const enhancedColumns = tableColumns.map((col) => {
    let newCol = { ...col };

    if (col.key === "edit" || col.key === "delete" || col.key === "actions") {
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

  // ==============================================
  // TABLE COMPONENTS CONFIGURATION
  // ==============================================
  const tableComponents = {
    header: columnDraggable ? { cell: TableHeaderCell } : {},
    body: {
      cell: columnDraggable ? TableBodyCell : undefined,
      row: rowDraggable ? Row : undefined,
    },
  };

  // ==============================================
  // STYLES
  // ==============================================
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

  const customClassName = `enhanced-table ${className || ''}`;

  // ==============================================
  // EFFECTS
  // ==============================================
  useEffect(() => {
    if (!customDataSource) {
      fetchData();
    }
  }, [fetchData, customDataSource]);

  useEffect(() => {
    setTableColumns(prepareColumns());
  }, [config?.columns, showEdit, showDelete, showAddButton, dataSource.length, localizeThis]);

  useEffect(() => {
    if (customDataSource) {
      setDataSource(customDataSource);
    }
  }, [customDataSource]);

  useEffect(() => {
    setLoading(externalLoading);
  }, [externalLoading]);

  // ==============================================
  // ERROR HANDLING
  // ==============================================
  if (!config && !customConfig.columns) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Table configuration not found for type: {tableType}</p>
        <p>Please provide either a valid tableType or customConfig with columns.</p>
      </div>
    );
  }

  // ==============================================
  // RENDER
  // ==============================================
  return (
    <div>
      <style>{customTableStyles}</style>
      
      {/* Control Bar */}
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <Space>
          {showSearch && (
            <Search
              placeholder={config?.searchPlaceholder || 'Search...'}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleGlobalSearch}
              style={{ width: 300 }}
            />
          )}
          {showRefresh && (
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              {localizeThis("refreshButtonText") || "Refresh"}
            </Button>
          )}
        </Space>
        
        <Space>
          {showExportButton && (
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
              loading={exportLoading || loading}
              disabled={!dataSource || dataSource.length === 0}
            >
              {localizeThis("exportToExcelButtonText") || "Export Excel"}
            </Button>
          )}
          
          {showAddButton && dataSource.length === 0 && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              {config?.addButtonText || 'Add'}
            </Button>
          )}
        </Space>
      </div>

      {/* Main Table */}
      <Spin spinning={loading}>
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
                onChange={handleTableChange}
                size={size}
                scroll={scroll}
                bordered={bordered}
                showHeader={showHeader}
                onRow={onRow}
                className={customClassName}
                style={style}
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
      </Spin>

      {/* Dynamic Modal */}
      <DynamicFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddItem}
        loading={modalLoading}
        config={config?.modalConfig}
      />
    </div>
  );
};

export default DocumentAntdTable;

// ==============================================
// USAGE EXAMPLES
// ==============================================

/* 
// Basic Usage with predefined config
<DocumentAntdTable tableType="scholar" />

// Custom configuration
<DocumentAntdTable
  tableType="document"
  customConfig={{
    addButtonText: 'New Document',
    columns: [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'Title', dataIndex: 'title', key: 'title' },
    ]
  }}
/>

// Full featured usage
<DocumentAntdTable
  tableType="user"
  sort={true}
  filter={true}
  columnDraggable={true}
  showEdit={true}
  showDelete={true}
  showExportButton={true}
  onEdit={(record, index) => console.log('Edit:', record)}
  onDelete={(record, index) => console.log('Delete:', record)}
  additionalFilters={{ status: 'active' }}
  onDataChange={(data) => console.log('Data changed:', data)}
  localizeThis={(key) => translations[key] || key}
/>

// Custom data source (no API calls)
<DocumentAntdTable
  customConfig={{
    columns: [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
    ],
    addButtonText: 'Add Person',
    modalConfig: {
      title: 'Add New Person',
      fields: [
        { name: 'name', label: 'Name', type: 'input', required: true },
        { name: 'age', label: 'Age', type: 'number', required: true },
      ]
    }
  }}
  customDataSource={[
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
  ]}
  showAddButton={true}
/>
*/