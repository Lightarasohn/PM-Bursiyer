import React, { useState, useEffect } from "react";
import { Modal, Button, Upload, message, Form, Input, Select, Space, Divider } from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import DraggableAntdTable from "./DraggableAntdTable";

const { Option } = Select;

/**
 * DocumentManagementModal Component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Modal görünürlük durumu
 * @param {Function} props.onCancel - Modal kapatma callback'i
 * @param {Function} props.onOk - Modal onay callback'i (documents) => void
 * @param {string} [props.title="Doküman Yönetimi"] - Modal başlığı
 * @param {number} [props.width=1200] - Modal genişliği
 * @param {string} props.moduleType - Modül tipi (scholar, project, etc.)
 * @param {number} props.recordId - İlgili kayıt ID'si
 * @param {number} [props.documentTypeId] - Doküman türü ID'si
 * @param {Array} [props.allowedFileTypes] - İzin verilen dosya tipleri
 * @param {number} [props.maxFileSize=10] - Maximum dosya boyutu (MB)
 * @param {Function} [props.localizeThis] - Çeviri fonksiyonu
 * @param {Function} [props.onRefresh] - Liste yenileme callback'i
 */
const DocumentManagementModal = ({
  visible,
  onCancel,
  onOk,
  title = "Doküman Yönetimi",
  width = 1200,
  moduleType,
  recordId,
  documentTypeId,
  allowedFileTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
  maxFileSize = 10,
  localizeThis = (key) => key,
  onRefresh,
}) => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [addDocumentModalVisible, setAddDocumentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // Dosya listesi state'i ekledik

  // Modal açıldığında verileri yükle
  useEffect(() => {
    if (visible) {
      loadDocuments();
      loadDocumentTypes();
    }
  }, [visible, moduleType, recordId]);

  // Dokümanları yükle
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:5156/api/scholar-document/${recordId}/${documentTypeId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data || []);
      }
    } catch (error) {
      console.error("Doküman listesi yüklenirken hata:", error);
      message.error("Doküman listesi yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Doküman türlerini yükle
  const loadDocumentTypes = async () => {
    try {
      const response = await fetch(`https://localhost:5156/api/document-type`);
      if (response.ok) {
        const data = await response.json();
        setDocumentTypes(data || []);
        console.log(data)
      }
    } catch (error) {
      console.error("Doküman türleri yüklenirken hata:", error);
      // Varsayılan türler
      setDocumentTypes([
        { id: 1, name: "Genel Doküman" },
        { id: 2, name: "Rapor" },
        { id: 3, name: "Sunum" },
        { id: 4, name: "Diğer" }
      ]);
    }
  };

  // Dosya upload öncesi validasyon
  const beforeUpload = (file) => {
    const isValidType = allowedFileTypes.some(type => 
      file.name.toLowerCase().endsWith(type.toLowerCase())
    );
    
    if (!isValidType) {
      message.error(`Sadece ${allowedFileTypes.join(", ")} formatları desteklenmektedir!`);
      return Upload.LIST_IGNORE;
    }

    const isValidSize = file.size / 1024 / 1024 < maxFileSize;
    if (!isValidSize) {
      message.error(`Dosya boyutu ${maxFileSize}MB'dan küçük olmalıdır!`);
      return Upload.LIST_IGNORE;
    }

    return false; // Upload'u manuel olarak kontrol edeceğiz
  };

  // Dosya değişimi işleyicisi
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleAddDocument = async (values) => {
    try {
      setUploading(true);
      
      console.log("Form values:", values);
      console.log("Modüle Type", moduleType);
      console.log("File list:", fileList);

      // Dosya kontrolü
      if (!fileList || fileList.length === 0) {
        message.error("Lütfen bir dosya seçin!");
        return;
      }

      const fileObj = fileList[0].originFileObj || fileList[0];
      if (!fileObj) {
        message.error("Dosya bulunamadı!");
        return;
      }

      console.log("File object:", fileObj);
      console.log("File object type:", typeof fileObj);
      console.log("File object constructor:", fileObj.constructor.name);
      console.log("File size:", fileObj.size);

      const formData = new FormData();

      // API'nın beklediği alan adlarını kullan
      formData.append("GrantedRoles", "admin");
      formData.append("DocName", fileObj.name);
      formData.append("Path", "");
      formData.append("DocInfo", values.title || "title");
      formData.append("DocTypeId", values.documentTypeId?.toString() || "0");
      formData.append("DocSource", moduleType || 0);
      formData.append("FullPath", "");
      formData.append("DocSourceTableId", recordId?.toString() || "0");
      formData.append("Title", values.title || "title");
      formData.append("CreUserId", "1");
      formData.append("Extension", fileObj.name.split('.').pop());
      
      // Dosyayı ekle - farklı isimlerle dene
      formData.append("FileContent", fileObj, fileObj.name);
      formData.append("file", fileObj, fileObj.name);
      formData.append("File", fileObj, fileObj.name);

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("https://localhost:5156/api/documentService", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Başarılı yükleme:", result);
        message.success("Doküman başarıyla yüklendi!");
        
        // Form ve state'leri temizle
        form.resetFields();
        setFileList([]);
        setAddDocumentModalVisible(false);
        
        // Listeyi yenile
        loadDocuments();
        onRefresh?.();
      } else {
        const errorText = await response.text();
        console.error("Hata yanıtı:", errorText);
        message.error("Yükleme başarısız: " + errorText);
      }

    } catch (error) {
      console.error("İstek hatası:", error);
      message.error("Sunucuya bağlanırken hata oluştu: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Doküman silme
  const handleDeleteDocument = async (record) => {
    try {
      const response = await fetch(`/api/documents/delete/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success("Doküman silindi!");
        loadDocuments();
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Doküman silme hatası:", error);
      message.error("Doküman silinirken bir hata oluştu!");
    }
  };

  // Doküman önizleme
 
  const handleMainModalOk = () => {
    if (onOk) {
      onOk(documents);
    }
    onCancel();
  };

  // Modal kapatma işleyicisi
  const handleAddModalCancel = () => {
    setAddDocumentModalVisible(false);
    form.resetFields();
    setFileList([]);
  };


  const handleDownloadDocument = (record) => {
  const fileUrl = record.document?.fullPath;
  const fileName = record.document?.docName || "dosya";

  if (!fileUrl) {
    message.error("Dosya yolu bulunamadı.");
    return;
  }

  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  // Tablo kolonları
 const columns = [
  {
    title: "Başlık",
    dataIndex: ["document", "title"],
    key: "title",
    ellipsis: true,
    render: (text) => (
      <Space>
        <FileOutlined style={{ color: '#1890ff' }} />
        <span title={text}>{text}</span>
      </Space>
    ),
  },
  {
    title: "Dosya Adı",
    dataIndex: ["document", "docName"],
    key: "fileName",
    ellipsis: true,
  },
  {
    title: "Doküman Türü",
    key: "documentTypeName",
    width: 150,
    render: (_, record) => {
      
      const docTypeId = record.document?.docTypeId;
      return docTypeId || "Belirtilmemiş";
    },
  },
  
  {
    title: "Yükleme Tarihi",
    dataIndex: ["document", "creDate"],
    key: "uploadDate",
    width: 140,
    align: "center",
    render: (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("tr-TR");
    },
  },
  {
    title: "İşlemler",
    key: "actions",
    width: 150,
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <Space size="small">
        
       <Button
  type="default"
  size="small"
  icon={<DownloadOutlined />}
  onClick={() => handleDownloadDocument(record)}
  title="İndir"
/>
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteDocument(record)}
          title="Sil"
        />
        
      </Space>
    ),
  },
];


  return (
    <>
      {/* Ana Modal */}
      <Modal
        title={title}
        open={visible}
        onCancel={onCancel}
        onOk={handleMainModalOk}
        width={width}
        okText="Tamam"
        cancelText="İptal"
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddDocumentModalVisible(true)}
            size="large"
            style={{
              background: 'linear-gradient(45deg, #1890ff, #36cfc9)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
            }}
          >
            Doküman Ekle
          </Button>
        </div>

        <DraggableAntdTable
          dataSource={documents}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1000, y: 400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} doküman`,
          }}
          localizeThis={localizeThis}
          loading={loading}
        />

        {documents.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#999',
            fontSize: '16px'
          }}>
            <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>Henüz doküman eklenmedi</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Doküman eklemek için yukarıdaki butonu kullanın
            </div>
          </div>
        )}
      </Modal>

      {/* Doküman Ekleme Modal'ı */}
      <Modal
        title="Yeni Doküman Ekle"
        open={addDocumentModalVisible}
        onCancel={handleAddModalCancel}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={uploading}
        okText="Yükle"
        cancelText="İptal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDocument}
          initialValues={{
            documentTypeId: documentTypeId
          }}
        >
          <Form.Item
            name="title"
            label="Başlık"
            rules={[{ required: true, message: "Lütfen başlık girin!" }]}
          >
            <Input placeholder="Doküman başlığı" size="large" />
          </Form.Item>

          <Form.Item
            name="documentTypeId"
            label="Doküman Türü"
            rules={[{ required: true, message: "Lütfen doküman türü seçin!" }]}
          >
            <Select placeholder="Doküman türü seçin" size="large">
              {documentTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Dosya Seçimi"
            rules={[{ required: true, message: "Lütfen dosya seçin!" }]}
          >
            <Upload
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              fileList={fileList}
              maxCount={1}
              accept={allowedFileTypes.join(',')}
              listType="text"
            >
              <Button icon={<UploadOutlined />} size="large" block>
                Dosya Seç ({allowedFileTypes.join(", ")})
              </Button>
            </Upload>
          </Form.Item>

          <div style={{ 
            background: '#f6f6f6', 
            padding: '12px', 
            borderRadius: '6px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>Dosya Kuralları:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Maksimum dosya boyutu: {maxFileSize}MB</li>
              <li>Desteklenen formatlar: {allowedFileTypes.join(", ")}</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default DocumentManagementModal;