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
import DraggableAntdTable from "./DraggableAntdTable"; // Ekteki component

const { Option } = Select;

/**
 * DocumentAddModalGlobal Component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Modal görünürlük durumu
 * @param {Function} props.onCancel - Modal kapatma callback'i
 * @param {Function} props.onOk - Modal onay callback'i (documents) => void
 * @param {string} [props.title="Döküman Yönetimi"] - Modal başlığı
 * @param {number} [props.width=1200] - Modal genişliği
 * @param {string} [props.moduleType="document"] - Modül tipi (document, scholar, project, academician)
 * @param {Array} [props.allowedFileTypes] - İzin verilen dosya tipleri
 * @param {number} [props.maxFileSize=10] - Maximum dosya boyutu (MB)
 * @param {boolean} [props.multiple=true] - Çoklu dosya seçimi
 * @param {Object} [props.customFields] - Özel form alanları
 * @param {Function} [props.localizeThis] - Çeviri fonksiyonu
 * @param {boolean} [props.showPreview=true] - Önizleme özelliği
 * @param {boolean} [props.showDownload=true] - İndirme özelliği
 * @param {Function} [props.onPreview] - Önizleme callback'i
 * @param {Function} [props.onDownload] - İndirme callback'i
 * @param {Object} [props.tableProps] - Tablo için ek özellikler
 */
const DocumentAddModalGlobal = ({
  visible,
  onCancel,
  onOk,
  title = "Döküman Yönetimi",
  width = 1200,
  moduleType = "document",
  allowedFileTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png"],
  maxFileSize = 10,
  multiple = true,
  customFields = {},
  localizeThis = (key) => key,
  showPreview = true,
  showDownload = true,
  onPreview,
  onDownload,
  tableProps = {},
}) => {
  const [documents, setDocuments] = useState([]);
  const [addDocumentModalVisible, setAddDocumentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  // Modal açıldığında tabloyu sıfırla
  useEffect(() => {
    if (visible) {
      setDocuments([]);
      form.resetFields();
    }
  }, [visible, form]);

  // Dosya upload öncesi validasyon
  const beforeUpload = (file) => {
    const isValidType = allowedFileTypes.some(type => 
      file.name.toLowerCase().endsWith(type.toLowerCase())
    );
    
    if (!isValidType) {
      message.error(`Sadece ${allowedFileTypes.join(", ")} formatları desteklenmektedir!`);
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < maxFileSize;
    if (!isValidSize) {
      message.error(`Dosya boyutu ${maxFileSize}MB'dan küçük olmalıdır!`);
      return false;
    }

    return false; // Upload'u manuel olarak kontrol edeceğiz
  };

  // Dosya seçildiğinde
  const handleFileSelect = (info) => {
    const { fileList } = info;
    // Seçilen dosyaları form state'ine kaydet
    form.setFieldsValue({ files: fileList });
  };

  // Yeni döküman ekleme
  const handleAddDocument = async (values) => {
    try {
      setUploading(true);
      
      const { files, documentName, description, category, tags, ...otherFields } = values;
      
      if (!files || files.length === 0) {
        message.error("Lütfen en az bir dosya seçin!");
        return;
      }

      // Her dosya için döküman objesi oluştur
      const newDocuments = files.map((file, index) => {
        const docId = `doc_${Date.now()}_${index}`;
        return {
          id: docId,
          key: docId,
          documentName: documentName || file.name,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          fileType: file.name.split('.').pop().toUpperCase(),
          description: description || "",
          category: category || "Genel",
          tags: tags || [],
          uploadDate: new Date().toLocaleDateString("tr-TR"),
          moduleType,
          file: file.originFileObj || file,
          status: "Yüklendi",
          ...otherFields
        };
      });

      // Mevcut dökümanları güncelle
      setDocuments(prev => [...prev, ...newDocuments]);
      
      message.success(`${newDocuments.length} döküman başarıyla eklendi!`);
      setAddDocumentModalVisible(false);
      form.resetFields();
      
    } catch (error) {
      console.error("Döküman ekleme hatası:", error);
      message.error("Döküman eklenirken bir hata oluştu!");
    } finally {
      setUploading(false);
    }
  };

  // Döküman silme
  const handleDeleteDocument = (record) => {
    setDocuments(prev => prev.filter(doc => doc.id !== record.id));
    message.success("Döküman silindi!");
  };

  // Döküman önizleme
  const handlePreviewDocument = (record) => {
    if (onPreview) {
      onPreview(record);
    } else {
      // Varsayılan önizleme davranışı
      if (record.file) {
        const url = URL.createObjectURL(record.file);
        window.open(url, '_blank');
      }
    }
  };

  // Döküman indirme
  const handleDownloadDocument = (record) => {
    if (onDownload) {
      onDownload(record);
    } else {
      // Varsayılan indirme davranışı
      if (record.file) {
        const url = URL.createObjectURL(record.file);
        const link = document.createElement('a');
        link.href = url;
        link.download = record.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };

  // Ana modal onay
  const handleMainModalOk = () => {
    if (onOk) {
      onOk(documents);
    }
    onCancel();
  };

  // Tablo kolonları
  const columns = [
    {
      title: "Döküman Adı",
      dataIndex: "documentName",
      key: "documentName",
      ellipsis: true,
      render: (text, record) => (
        <Space>
          <FileOutlined style={{ color: '#1890ff' }} />
          <span title={text}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Dosya Adı",
      dataIndex: "fileName",
      key: "fileName",
      ellipsis: true,
    },
    {
      title: "Dosya Tipi",
      dataIndex: "fileType",
      key: "fileType",
      width: 100,
      align: "center",
      render: (text) => (
        <span style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {text}
        </span>
      ),
    },
    {
      title: "Boyut",
      dataIndex: "fileSize",
      key: "fileSize",
      width: 100,
      align: "center",
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Yükleme Tarihi",
      dataIndex: "uploadDate",
      key: "uploadDate",
      width: 120,
      align: "center",
    },
    {
      title: "İşlemler",
      key: "actions",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {showPreview && (
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewDocument(record)}
              title="Önizle"
            />
          )}
          {showDownload && (
            <Button
              type="default"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadDocument(record)}
              title="İndir"
            />
          )}
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

  // Özel alanları form'a ekle
  const renderCustomFields = () => {
    return Object.keys(customFields).map(fieldKey => {
      const field = customFields[fieldKey];
      
      switch (field.type) {
        case 'select':
          return (
            <Form.Item
              key={fieldKey}
              name={fieldKey}
              label={field.label}
              rules={field.rules}
            >
              <Select placeholder={field.placeholder}>
                {field.options?.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        case 'textarea':
          return (
            <Form.Item
              key={fieldKey}
              name={fieldKey}
              label={field.label}
              rules={field.rules}
            >
              <Input.TextArea 
                placeholder={field.placeholder} 
                rows={field.rows || 3}
              />
            </Form.Item>
          );
        default:
          return (
            <Form.Item
              key={fieldKey}
              name={fieldKey}
              label={field.label}
              rules={field.rules}
            >
              <Input placeholder={field.placeholder} />
            </Form.Item>
          );
      }
    });
  };

  return (
    <>
      {/* Ana Modal */}
      <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        onOk={handleMainModalOk}
        width={width}
        style={{ top: 20 }}
        bodyStyle={{ padding: '20px' }}
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
            Döküman Ekle
          </Button>
        </div>

        <DraggableAntdTable
          dataSource={documents}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1200, y: 400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} döküman`,
          }}
          localizeThis={localizeThis}
          loading={uploading}
          {...tableProps}
        />

        {documents.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#999',
            fontSize: '16px'
          }}>
            <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>Henüz döküman eklenmedi</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Döküman eklemek için yukarıdaki butonu kullanın
            </div>
          </div>
        )}
      </Modal>

      {/* Döküman Ekleme Modal'ı */}
      <Modal
        title="Yeni Döküman Ekle"
        visible={addDocumentModalVisible}
        onCancel={() => {
          setAddDocumentModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={uploading}
        okText="Ekle"
        cancelText="İptal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDocument}
          initialValues={{
            category: "Genel",
            tags: []
          }}
        >
          <Form.Item
            name="files"
            label="Dosya Seçimi"
            rules={[{ required: true, message: "Lütfen dosya seçin!" }]}
          >
            <Upload
              multiple={multiple}
              beforeUpload={beforeUpload}
              onChange={handleFileSelect}
              fileList={form.getFieldValue('files') || []}
              accept={allowedFileTypes.join(',')}
            >
              <Button icon={<UploadOutlined />} size="large" block>
                Dosya Seç ({allowedFileTypes.join(", ")})
              </Button>
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item
            name="documentName"
            label="Döküman Adı"
            rules={[{ required: false }]}
          >
            <Input placeholder="Döküman adı (boş bırakılırsa dosya adı kullanılır)" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: "Lütfen kategori seçin!" }]}
          >
            <Select placeholder="Kategori seçin">
              <Option value="Genel">Genel</Option>
              <Option value="Rapor">Rapor</Option>
              <Option value="Sunum">Sunum</Option>
              <Option value="Döküman">Döküman</Option>
              <Option value="Görsel">Görsel</Option>
              <Option value="Diğer">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea 
              placeholder="Döküman hakkında açıklama" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Etiketler"
          >
            <Select
              mode="tags"
              placeholder="Etiketler ekleyin"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Özel alanları render et */}
          {renderCustomFields()}
        </Form>
      </Modal>
    </>
  );
};

export default DocumentAddModalGlobal;