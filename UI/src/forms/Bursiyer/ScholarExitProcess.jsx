import React, { useState, useCallback } from 'react';
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Progress,
  Badge,
  Form,
  DatePicker,
  message,
} from 'antd';
import {
  DownloadOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import DraggableAntdTable from '../../reusableComponents/DraggableAntdTable';
import DocumentAddModalGlobal from '../../reusableComponents/DocumentAddModalGlobal';
import dayjs from 'dayjs';

const { Text } = Typography;

const ScholarExitProcess = ({
  visible,
  onCancel,
  onSuccess,
  scholarData,
  periodData,
  exitDocumentsData,
  periodDocumentsData,
  isScholarStarted,
  onDocumentEdit,
  formatDate,
  localizeThis,
  // API functions
  performScholarCheckout,
  refreshData
}) => {
  // States
  const [checkoutProcessLoading, setCheckoutProcessLoading] = useState(false);
  const [isDocumentAddModalVisible, setIsDocumentAddModalVisible] = useState(false);
  const [documentModalProps, setDocumentModalProps] = useState(null);
  const [exitModalLoading] = useState(false);
  const [selectedExitDate, setSelectedExitDate] = useState(null);
  const [exitForm] = Form.useForm();

  // Get URL parameter
  const getScholarIdFromUrl = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("targetID");
  }, []);

  // Check if all exit documents are uploaded
  const areAllExitDocumentsUploaded = useCallback(() => {
    if (!exitDocumentsData || exitDocumentsData.length === 0) return false;
    return exitDocumentsData.every(doc => doc.realUploadDate !== null && doc.realUploadDate !== undefined);
  }, [exitDocumentsData]);

  // Check for documents that should be uploaded before exit date but are missing
  const getMissingDocumentsBeforeExitDate = useCallback((exitDate) => {
    if (!periodDocumentsData || !exitDate) return [];
    
    const exitDateTime = new Date(exitDate);
    return periodDocumentsData.filter(doc => {
      const expectedDate = new Date(doc.expectedUploadDate);
      const hasRealUpload = doc.realUploadDate !== null && doc.realUploadDate !== undefined;
      return expectedDate < exitDateTime && !hasRealUpload;
    });
  }, [periodDocumentsData]);

  // Get upload progress for exit documents
  const getExitUploadProgress = useCallback(() => {
    if (!exitDocumentsData || exitDocumentsData.length === 0) return { uploaded: 0, total: 0, percentage: 0 };
    
    const uploaded = exitDocumentsData.filter(doc => doc.realUploadDate).length;
    const total = exitDocumentsData.length;
    const percentage = Math.round((uploaded / total) * 100);
    
    return { uploaded, total, percentage };
  }, [exitDocumentsData]);

  // Exit process - Check-out handler
  const handleStartCheckoutProcess = useCallback(async () => {
    if (!selectedExitDate) {
      message.warning("Lütfen çıkış tarihi seçin!");
      return;
    }

    if (!areAllExitDocumentsUploaded()) {
      message.warning("Tüm çıkış dokümanları yüklenmeden çıkış işlemi başlatılamaz!");
      return;
    }

    // Check for missing documents before exit date
    const missingDocs = getMissingDocumentsBeforeExitDate(selectedExitDate);
    if (missingDocs.length > 0) {
      const missingDocNames = missingDocs.map(doc => doc.documentType?.name || 'İsimsiz Doküman').join(', ');
      Modal.confirm({
        title: 'Eksik Dokümanlar Uyarısı',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Seçilen çıkış tarihinden önce yüklenmesi gereken şu dokümanlar eksik:</p>
            <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{missingDocNames}</p>
            <p>Yine de çıkış işlemini başlatmak istiyor musunuz?</p>
          </div>
        ),
        okText: 'Devam Et',
        cancelText: 'İptal',
        onOk: () => performCheckout(),
        okButtonProps: {
          danger: true,
        },
      });
      return;
    }

    performCheckout();
  }, [selectedExitDate, areAllExitDocumentsUploaded, getMissingDocumentsBeforeExitDate]);

  const performCheckout = useCallback(async () => {
    try {
      setCheckoutProcessLoading(true);
      
      const scholarId = getScholarIdFromUrl();
      const termId = periodData?.id;
      
      await performScholarCheckout(scholarId, termId, selectedExitDate);
      
      message.success("Çıkış işlemleri başarıyla tamamlandı!");
      
      // Refresh all data
      await refreshData(scholarId, termId);
      
      // Close modal and notify parent
      onCancel();
      onSuccess();
      
      // Reset form
      setSelectedExitDate(null);
      exitForm.resetFields();
      
    } catch (error) {
      console.error("Check-out process error:", error);
      message.error("Çıkış işlemleri başlatılırken hata oluştu!");
    } finally {
      setCheckoutProcessLoading(false);
    }
  }, [
    getScholarIdFromUrl, 
    periodData?.id, 
    selectedExitDate, 
    performScholarCheckout, 
    refreshData,
    onCancel,
    onSuccess,
    exitForm
  ]);

  // Exit document edit handler
  const handleExitDocumentEdit = useCallback((record) => {
    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    const termId = periodData?.id;

    // Exit dokümanları için modal props'ları ayarla
    setDocumentModalProps({
      title: "Çıkış Dokümanları",
      moduleType: 6,
      maxFileSize: 5,
      documentTypeId,
      record,
      recordId,
      scholarId,
      termId,
      listType: "exit",
      customFields: {
        exitReason: {
          type: "select",
          label: "Çıkış Nedeni",
          options: [
            { value: "completion", label: "Dönem Tamamlama" },
            { value: "early_completion", label: "Erken Tamamlama" },
            { value: "termination", label: "Feshi" }
          ]
        },
        exitDate: {
          type: "date",
          label: "Çıkış Tarihi"
        }
      }
    });

    // Modalı aç
    setIsDocumentAddModalVisible(true);
  }, [getScholarIdFromUrl, periodData?.id]);

  // Document modal handlers
  const handleDocumentsAdded = useCallback((documents) => {
    console.log("Eklenen dökümanlar:", documents);
    
    // Modalı kapat
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
    
    // Refresh data through parent
    const scholarId = getScholarIdFromUrl();
    if (periodData?.id) {
      refreshData(scholarId, periodData.id);
    }
    
    message.success("Dökümanlar başarıyla eklendi!");
  }, [periodData?.id, getScholarIdFromUrl, refreshData]);

  const handleDocumentModalClose = useCallback(() => {
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
  }, []);

  // Modal close handler
  const handleModalClose = useCallback(() => {
    setSelectedExitDate(null);
    exitForm.resetFields();
    onCancel();
  }, [exitForm, onCancel]);

  // Exit document columns
  const exitDocumentColumns = React.useMemo(() => [
    {
      title: 'Belge Adı',
      dataIndex: ['documentType', 'name'],
      render: (name) => name || '-',
      key: 'documentTypeId',
      width: 250,
    },
    {
      title: 'Beklenen Yükleme',
      dataIndex: 'expectedUploadDate',
      key: 'expectedUploadDate',
      render: (date) => formatDate(date),
      width: 160,
    },
    {
      title: 'Gerçek Yükleme',
      dataIndex: 'realUploadDate',
      key: 'realUploadDate',
      render: (date) => formatDate(date),
      width: 160,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const hasUpload = record.realUploadDate;
        return (
          <Badge
            status={hasUpload ? "success" : "error"}
            text={hasUpload ? "Tamamlandı" : "Eksik"}
          />
        );
      }
    }
  ], [formatDate]);

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DownloadOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
            <span>Çıkış Dokümanları - Çıkış İşlemlerini Başlat</span>
          </div>
        }
        open={visible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Kapat
          </Button>,
          <Button 
            key="start-checkout" 
            type="primary" 
            icon={<PlayCircleOutlined />}
            loading={checkoutProcessLoading}
            onClick={handleStartCheckoutProcess}
            disabled={!selectedExitDate || !areAllExitDocumentsUploaded()}
            style={{
              background: (selectedExitDate && areAllExitDocumentsUploaded()) 
                ? 'linear-gradient(45deg, #fa8c16, #ffa940)' 
                : '#d9d9d9',
              border: 'none'
            }}
          >
            Çıkış İşlemlerini Başlat
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        {/* Exit Date Selection */}
        <Card 
          title={
            <span>
              <ClockCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
              Çıkış Tarihi Seçimi ve İşlem Durumu
            </span>
          }
          size="small" 
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form form={exitForm} layout="vertical">
                <Form.Item
                  label="Çıkış Tarihi"
                  name="exitDate"
                  rules={[{ required: true, message: 'Lütfen çıkış tarihi seçin!' }]}
                >
                  <DatePicker
                    placeholder="Çıkış tarihini seçin"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    value={selectedExitDate}
                    onChange={setSelectedExitDate}
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf('day');
                    }}
                  />
                </Form.Item>
                {selectedExitDate && (
                  <Alert
                    message="Çıkış Tarihi Seçildi"
                    description={`Seçilen tarih: ${selectedExitDate.format('DD/MM/YYYY')}`}
                    type="info"
                    showIcon
                  />
                )}
              </Form>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '8px' }}>
                <Text>Çıkış Dokümanları Durumu</Text>
              </div>
              <Progress
                percent={getExitUploadProgress().percentage}
                status={getExitUploadProgress().percentage === 100 ? "success" : "active"}
                strokeColor={{
                  '0%': '#fa8c16',
                  '100%': '#ffa940',
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                {getExitUploadProgress().uploaded} / {getExitUploadProgress().total} çıkış dokümanı yüklendi
              </Text>
              
              {/* Missing documents warning */}
              {selectedExitDate && getMissingDocumentsBeforeExitDate(selectedExitDate).length > 0 && (
                <Alert
                  message="Eksik Dokümanlar Uyarısı"
                  description={`Seçilen çıkış tarihinden önce yüklenmesi gereken ${getMissingDocumentsBeforeExitDate(selectedExitDate).length} doküman eksik.`}
                  type="warning"
                  showIcon
                  style={{ marginTop: '8px' }}
                />
              )}
            </Col>
          </Row>
        </Card>
        
        <DraggableAntdTable
          dataSource={exitDocumentsData}
          columns={exitDocumentColumns}
          sort={true}
          bordered={true}
          size="small"
          showEdit={true}
          editConfig={{
            buttonType: 'primary',
            buttonSize: 'small',
            width: 35,
            title: 'Düzenle'
          }}
          filter={true}
          columnDraggable={true}
          rowKey={(record) => record.ID || record.id || record.documentTypeId || Math.random()}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          loading={exitModalLoading}
          onEdit={handleExitDocumentEdit}
          localizeThis={localizeThis}
          locale={{
            emptyText: 'Çıkış dokümanı bulunamadı'
          }}
        />
      </Modal>

      {/* Document Add Modal */}
      {isDocumentAddModalVisible && documentModalProps && (
        <DocumentAddModalGlobal
          visible={isDocumentAddModalVisible}
          onCancel={handleDocumentModalClose}
          onOk={handleDocumentsAdded}
          {...documentModalProps}
        />
      )}
    </>
  );
};

export default ScholarExitProcess;