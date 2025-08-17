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
  List,
} from 'antd';
import {
  DownloadOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  FileOutlined,
} from '@ant-design/icons';
import DraggableAntdTable from '../../reusableComponents/DraggableAntdTable';
import DocumentAddModalGlobal from '../../reusableComponents/DocumentAddModalGlobal';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

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
  refreshData,
  // Document functions
  changeRealUploadDate
}) => {
  // States
  const [checkoutProcessLoading, setCheckoutProcessLoading] = useState(false);
  const [isDocumentAddModalVisible, setIsDocumentAddModalVisible] = useState(false);
  const [documentModalProps, setDocumentModalProps] = useState(null);
  const [exitModalLoading] = useState(false);
  const [selectedExitDate, setSelectedExitDate] = useState(null);
  const [exitForm] = Form.useForm();
  const [showMissingDocsModal, setShowMissingDocsModal] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState([]);

  // localizeThis fonksiyonunu tanımlayalım eğer props'tan gelmemişse
  const defaultLocalizeThis = (key) => {
    const translations = {
      editTitle: 'Düzenle',
      deleteTitle: 'Sil',
      deleteConfirmTitle: 'Emin misiniz?',
      deleteConfirmDescription: 'Bu kaydı silmek istediğinizden emin misiniz?',
      deleteConfirmOkText: 'Evet',
      deleteConfirmCancelText: 'Hayır',
    };
    return translations[key] || key;
  };

  const localizeThisFunc = localizeThis || defaultLocalizeThis;

  // Get URL parameter
  const getScholarIdFromUrl = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("targetID");
  }, []);

  // Check if all exit documents are uploaded
  const areAllExitDocumentsUploaded = useCallback(() => {
    if (!exitDocumentsData || exitDocumentsData.length === 0) return true; // Eğer çıkış dokümanı yoksa true döner
    return exitDocumentsData.every(doc => doc.realUploadDate !== null && doc.realUploadDate !== undefined);
  }, [exitDocumentsData]);

  // Check for documents that should be uploaded before exit date but are missing
  const getMissingDocumentsBeforeExitDate = useCallback((exitDate) => {
    if (!periodDocumentsData || !exitDate) return [];
    
    // exitDate bir dayjs objesi, onu Date'e çevir
    const exitDateTime = exitDate.toDate ? exitDate.toDate() : new Date(exitDate);
    
    return periodDocumentsData.filter(doc => {
      // Beklenen yükleme tarihi var mı?
      if (!doc.expectedUploadDate) return false;
      
      // expectedUploadDate string olduğu için Date'e çevir
      const expectedDate = new Date(doc.expectedUploadDate);
      
      // Geçersiz tarih kontrolü
      if (isNaN(expectedDate.getTime()) || isNaN(exitDateTime.getTime())) {
        console.warn('Invalid date detected:', { 
          expectedDate: doc.expectedUploadDate, 
          exitDate: exitDate 
        });
        return false;
      }
      
      // Gerçek yükleme tarihi var mı?
      const hasRealUpload = doc.realUploadDate !== null && 
                           doc.realUploadDate !== undefined && 
                           doc.realUploadDate !== '' && 
                           doc.realUploadDate.trim && 
                           doc.realUploadDate.trim() !== '';
      
      // Çıkış dokümanları bu kontrolden muaf (sadece ongoing dokümanları kontrol et)
      const isExitDocument = doc.listType?.toLowerCase() === 'exit';
      const isEntryDocument = doc.listType?.toLowerCase() === 'entry';
      
      // Sadece ongoing (normal) dokümanları kontrol et
      const isOngoingDocument = !isExitDocument && !isEntryDocument;
      
      // Koşul: Beklenen tarih çıkış tarihinden önce VE gerçek yükleme yok VE ongoing doküman
      // ÖNEMLI: Tarihleri sadece gün bazında karşılaştıralım (saat önemsiz)
      const expectedDateOnly = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate());
      const exitDateOnly = new Date(exitDateTime.getFullYear(), exitDateTime.getMonth(), exitDateTime.getDate());
      
      const shouldBeUploadedBeforeExit = expectedDateOnly < exitDateOnly;
      
      console.log('Document check:', {
        docName: doc.documentType?.name || 'Unknown',
        expectedDateString: doc.expectedUploadDate,
        expectedDateParsed: expectedDate.toISOString().split('T')[0],
        exitDateString: exitDate.format ? exitDate.format('YYYY-MM-DD') : exitDate,
        exitDateParsed: exitDateTime.toISOString().split('T')[0],
        expectedDateOnly: expectedDateOnly.toISOString().split('T')[0],
        exitDateOnly: exitDateOnly.toISOString().split('T')[0],
        hasRealUpload,
        isOngoingDocument,
        shouldBeUploadedBeforeExit,
        listType: doc.listType,
        willBeFiltered: shouldBeUploadedBeforeExit && !hasRealUpload && isOngoingDocument
      });
      
      return shouldBeUploadedBeforeExit && !hasRealUpload && isOngoingDocument;
    });
  }, [periodDocumentsData]);

  // Get upload progress for exit documents
  const getExitUploadProgress = useCallback(() => {
    if (!exitDocumentsData || exitDocumentsData.length === 0) return { uploaded: 0, total: 0, percentage: 100 };
    
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

    console.log('=== ÇIKİŞ İŞLEMİ KONTROL BAŞLADI ===');
    console.log('Seçilen çıkış tarihi:', selectedExitDate.format('DD/MM/YYYY'));
    console.log('Tüm dönem dokümanları:', periodDocumentsData);
    
    // Çıkış tarihinden önce yüklenmesi gereken eksik dokümanları kontrol et
    const missingDocs = getMissingDocumentsBeforeExitDate(selectedExitDate);
    
    console.log('Eksik dokümanlar:', missingDocs);
    console.log('Eksik doküman sayısı:', missingDocs.length);
    
    if (missingDocs.length > 0) {
      console.log('Eksik doküman bulundu, uyarı modalı açılıyor...');
      // Eksik dokümanları state'e kaydet ve uyarı modalını göster
      setMissingDocuments(missingDocs);
      setShowMissingDocsModal(true);
      return;
    }

    // Çıkış dokümanları tamamlanmış mı kontrol et
    const exitDocsComplete = areAllExitDocumentsUploaded();
    console.log('Çıkış dokümanları tamamlandı mı?', exitDocsComplete);
    
    if (!exitDocsComplete) {
      message.warning("Tüm çıkış dokümanları yüklenmeden çıkış işlemi başlatılamaz!");
      return;
    }

    console.log('Tüm kontroller geçildi, çıkış işlemi başlatılıyor...');
    // Herşey tamamsa çıkış işlemini başlat
    performCheckout();
  }, [selectedExitDate, getMissingDocumentsBeforeExitDate, areAllExitDocumentsUploaded, periodDocumentsData]);

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

  // Force continue checkout after seeing missing documents warning
  const handleForceContinueCheckout = useCallback(() => {
    setShowMissingDocsModal(false);
    
    if (!areAllExitDocumentsUploaded()) {
      message.warning("Tüm çıkış dokümanları yüklenmeden çıkış işlemi başlatılamaz!");
      return;
    }
    
    performCheckout();
  }, [areAllExitDocumentsUploaded, performCheckout]);

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

  // Handle missing document edit
  const handleMissingDocumentEdit = useCallback((record) => {
    // Eksik doküman düzenleme modalını aç
    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    const termId = periodData?.id;

    setDocumentModalProps({
      title: "Eksik Doküman Yükleme",
      moduleType: 6,
      maxFileSize: 5,
      documentTypeId,
      record,
      recordId,
      scholarId,
      termId,
      listType: record.listType || "default",
    });

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
    
    // Eksik dokümanlar modalı açıksa, yeniden kontrol et
    if (showMissingDocsModal && selectedExitDate) {
      const updatedMissingDocs = getMissingDocumentsBeforeExitDate(selectedExitDate);
      setMissingDocuments(updatedMissingDocs);
      
      if (updatedMissingDocs.length === 0) {
        setShowMissingDocsModal(false);
        message.success("Tüm eksik dokümanlar tamamlandı! Şimdi çıkış işlemini başlatabilirsiniz.");
      }
    }
  }, [periodData?.id, getScholarIdFromUrl, refreshData, showMissingDocsModal, selectedExitDate, getMissingDocumentsBeforeExitDate]);

  const handleDocumentModalClose = useCallback(() => {
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
  }, []);

  // Modal close handler
  const handleModalClose = useCallback(() => {
    setSelectedExitDate(null);
    exitForm.resetFields();
    setShowMissingDocsModal(false);
    setMissingDocuments([]);
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

  // Missing documents columns for the warning modal
  const missingDocumentColumns = React.useMemo(() => [
    {
      title: 'Belge Adı',
      dataIndex: ['documentType', 'name'],
      render: (name) => name || '-',
      width: 200,
    },
    {
      title: 'Doküman Türü',
      dataIndex: 'listType',
      render: (listType) => listType || 'ongoing',
      width: 120,
    },
    {
      title: 'Beklenen Yükleme Tarihi',
      dataIndex: 'expectedUploadDate',
      render: (date) => formatDate(date),
      width: 160,
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleMissingDocumentEdit(record)}
        >
          Yükle
        </Button>
      )
    }
  ], [formatDate, handleMissingDocumentEdit]);

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
            disabled={!selectedExitDate} // Sadece çıkış tarihi seçilmesini bekle
            style={{
              background: selectedExitDate 
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
          localizeThis={localizeThisFunc}
          locale={{
            emptyText: 'Çıkış dokümanı bulunamadı'
          }}
        />
      </Modal>

      {/* Missing Documents Warning Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WarningOutlined style={{ color: '#faad14', fontSize: '18px' }} />
            <span>Eksik Dokümanlar - Önce Bunları Yüklemeniz Gerekiyor</span>
          </div>
        }
        open={showMissingDocsModal}
        onCancel={() => setShowMissingDocsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowMissingDocsModal(false)}>
            Geri Dön
          </Button>
        ]}
        width={800}
      >
        <Alert
          message="Dikkat! Eksik Ongoing Dokümanlar"
          description={
            <div>
              <p>Seçtiğiniz çıkış tarihinden (<strong>{selectedExitDate?.format('DD/MM/YYYY')}</strong>) önce yüklenmesi gereken aşağıdaki <strong>ongoing dokümanlar</strong> eksik:</p>
              <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Bu dokümanları yüklemeden çıkış işlemine devam edemezsiniz!</p>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <DraggableAntdTable
          dataSource={missingDocuments}
          columns={missingDocumentColumns}
          size="small"
          bordered={true}
          pagination={false}
          rowKey={(record) => record.ID || record.id || record.documentTypeId || Math.random()}
          localizeThis={localizeThisFunc}
        />
        
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff2e8', border: '1px solid #ffcc02', borderRadius: '6px' }}>
          <Text type="warning">
            <FileOutlined style={{ marginRight: '6px' }} />
            Bu dokümanları yüklemek için "Yükle" butonlarını kullanın. Tüm eksik dokümanları yükledikten sonra çıkış işlemini başlatabilirsiniz.
          </Text>
        </div>
      </Modal>

      {/* Document Add Modal */}
      {isDocumentAddModalVisible && documentModalProps && (
        <DocumentAddModalGlobal
          visible={isDocumentAddModalVisible}
          onCancel={handleDocumentModalClose}
          onOk={handleDocumentsAdded}
          changeRealUploadDate={changeRealUploadDate}
          {...documentModalProps}
        />
      )}
    </>
  );
};

export default ScholarExitProcess;