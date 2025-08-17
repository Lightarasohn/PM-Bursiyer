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
  message,
} from 'antd';
import {
  UploadOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import DraggableAntdTable from '../../reusableComponents/DraggableAntdTable';
import DocumentAddModalGlobal from '../../reusableComponents/DocumentAddModalGlobal';

const { Text } = Typography;

const ScholarEntryProcess = ({
  visible,
  onCancel,
  onSuccess,
  scholarData,
  periodData,
  entryDocumentsData,
  isScholarStarted,
  onDocumentEdit,
  formatDate,
  localizeThis,
  // API functions
  performScholarCheckin,
  refreshData
}) => {
  // States
  const [checkinProcessLoading, setCheckinProcessLoading] = useState(false);
  const [isDocumentAddModalVisible, setIsDocumentAddModalVisible] = useState(false);
  const [documentModalProps, setDocumentModalProps] = useState(null);
  const [entryModalLoading] = useState(false);

  // Get URL parameter
  const getScholarIdFromUrl = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("targetID");
  }, []);

  // Check if all entry documents are uploaded
  const areAllEntryDocumentsUploaded = useCallback(() => {
    if (!entryDocumentsData || entryDocumentsData.length === 0) return false;
    return entryDocumentsData.every(doc => doc.realUploadDate !== null && doc.realUploadDate !== undefined);
  }, [entryDocumentsData]);

  // Get upload progress for entry documents
  const getEntryUploadProgress = useCallback(() => {
    if (!entryDocumentsData || entryDocumentsData.length === 0) return { uploaded: 0, total: 0, percentage: 0 };
    
    const uploaded = entryDocumentsData.filter(doc => doc.realUploadDate).length;
    const total = entryDocumentsData.length;
    const percentage = Math.round((uploaded / total) * 100);
    
    return { uploaded, total, percentage };
  }, [entryDocumentsData]);

  // Entry process - Check-in handler
  const handleStartCheckinProcess = useCallback(async () => {
    if (!areAllEntryDocumentsUploaded()) {
      message.warning("Tüm giriş dokümanları yüklenmeden giriş işlemi başlatılamaz!");
      return;
    }

    try {
      setCheckinProcessLoading(true);
      
      const scholarId = getScholarIdFromUrl();
      const termId = periodData?.id;
      
      console.log("Starting check-in process for:", { scholarId, termId });
      
      await performScholarCheckin(scholarId, termId);
      
      message.success("Giriş işlemleri başarıyla tamamlandı!");
      
      console.log("Check-in successful, refreshing data...");
      
      // Refresh data with a small delay to ensure backend is updated
      setTimeout(async () => {
        await refreshData(scholarId, termId);
        console.log("Data refreshed after check-in");
      }, 500);
      
      // Close modal and notify parent
      onCancel();
      
      // Notify parent with delay to ensure data is fresh
      setTimeout(() => {
        onSuccess();
      }, 800);
      
    } catch (error) {
      console.error("Check-in process error:", error);
      message.error("Giriş işlemleri başlatılırken hata oluştu!");
    } finally {
      setCheckinProcessLoading(false);
    }
  }, [
    areAllEntryDocumentsUploaded, 
    getScholarIdFromUrl, 
    periodData?.id, 
    performScholarCheckin, 
    refreshData,
    onCancel,
    onSuccess
  ]);

  // Entry document edit handler
  const handleEntryDocumentEdit = useCallback((record) => {
    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    const termId = periodData?.id;

    // Entry dokümanları için modal props'ları ayarla
    setDocumentModalProps({
      title: "Giriş Dokümanları",
      moduleType: 6,
      maxFileSize: 5,
      documentTypeId,
      record,
      recordId,
      scholarId,
      termId,
      listType: "entry",
      customFields: {
        documentCategory: {
          type: "select",
          label: "Doküman Kategorisi",
          options: [
            { value: "personal", label: "Kişisel Belgeler" },
            { value: "academic", label: "Akademik Belgeler" },
            { value: "administrative", label: "İdari Belgeler" }
          ]
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

  // Entry document columns
  const entryDocumentColumns = React.useMemo(() => [
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
            status={hasUpload ? "success" : "warning"}
            text={hasUpload ? "Yüklendi" : "Bekliyor"}
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
            <UploadOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
            <span>Giriş Dokümanları</span>
            {!isScholarStarted && <Badge count="Giriş İşlemi Bekliyor" style={{ backgroundColor: '#faad14' }} />}
          </div>
        }
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Kapat
          </Button>,
          // Sadece giriş yapılmamışsa göster
          !isScholarStarted && (
            <Button 
              key="start-checkin" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              loading={checkinProcessLoading}
              onClick={handleStartCheckinProcess}
              disabled={!areAllEntryDocumentsUploaded()}
              style={{
                background: areAllEntryDocumentsUploaded() 
                  ? 'linear-gradient(45deg, #52c41a, #73d13d)' 
                  : '#d9d9d9',
                border: 'none'
              }}
            >
              Giriş İşlemlerini Başlat
            </Button>
          )
        ].filter(Boolean)}
        width={1200}
        destroyOnClose
      >
        {/* Progress Card - sadece giriş yapılmamışsa göster */}
        {!isScholarStarted && (
          <Card 
            title={
              <span>
                <CheckCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Giriş İşlem Durumu
              </span>
            }
            size="small" 
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={[16, 8]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '8px' }}>
                  <Text>Doküman Tamamlanma Durumu</Text>
                </div>
                <Progress
                  percent={getEntryUploadProgress().percentage}
                  status={getEntryUploadProgress().percentage === 100 ? "success" : "active"}
                  strokeColor={{
                    '0%': '#52c41a',
                    '100%': '#73d13d',
                  }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {getEntryUploadProgress().uploaded} / {getEntryUploadProgress().total} doküman yüklendi
                </Text>
              </Col>
              <Col xs={24} md={12}>
                <Alert
                  message={areAllEntryDocumentsUploaded() ? "Tüm dokümanlar hazır!" : "Dokümanlar bekleniyor"}
                  description={
                    areAllEntryDocumentsUploaded() 
                      ? "Giriş işlemlerini başlatabilirsiniz."
                      : "Tüm giriş dokümanları yüklendikten sonra giriş işlemlerini başlatabileceksiniz."
                  }
                  type={areAllEntryDocumentsUploaded() ? "success" : "warning"}
                  showIcon
                  style={{ height: '100%' }}
                />
              </Col>
            </Row>
          </Card>
        )}
        
        <DraggableAntdTable
          dataSource={entryDocumentsData}
          columns={entryDocumentColumns}
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
          loading={entryModalLoading}
          onEdit={handleEntryDocumentEdit}
          localizeThis={localizeThis}
          locale={{
            emptyText: 'Giriş dokümanı bulunamadı'
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

export default ScholarEntryProcess;