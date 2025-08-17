import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Avatar,
  Skeleton,
  Row,
  Col,
  Typography,
  Tabs,
  Modal,
  Button,
  Space,
  Badge,
  message,
  Select,
  Alert,
  Progress,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  BookOutlined,
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import DraggableAntdTable from '../../reusableComponents/DraggableAntdTable';
import DocumentAddModalGlobal from '../../reusableComponents/DocumentAddModalGlobal';
import ScholarEntryProcess from './ScholarEntryProcess';
import ScholarExitProcess from './ScholarExitProcess';
import ScholarEdit from './ScholarEdit';
import GetScholarAPI from "../../services/GetScholarAPI";
import GetTermOfScholar from '../../services/GetTermOfScholar';
import GetAllTermsOfScholar from '../../services/GetAllTermsOfScholar';
import GetScholarPeriodDocuments from '../../services/GetScholarPeriodDocuments';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Ant Design uyarılarını bastır
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('antd: compatible') || 
      args[0]?.includes?.('antd v5 support React is 16 ~ 18')) {
    return;
  }
  originalWarn.apply(console, args);
};

const ScholarInfo = () => {
  // State tanımlamaları
  const [scholarData, setScholarData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [academicianData, setAcademicianData] = useState(null);
  const [periodDocumentsData, setPeriodDocumentsData] = useState([]);
  const [entryDocumentsData, setEntryDocumentsData] = useState([]);
  const [exitDocumentsData, setExitDocumentsData] = useState([]);
  const [scholarPeriods, setScholarPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [filteredPeriodDocuments, setFilteredPeriodDocuments] = useState([]);
  const [periodSelectorLoading, setPeriodSelectorLoading] = useState(false);
  
  // Modal state'leri
  const [isDocumentAddModalVisible, setIsDocumentAddModalVisible] = useState(false);
  const [documentModalProps, setDocumentModalProps] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEntryProcessModalVisible, setIsEntryProcessModalVisible] = useState(false);
  const [isExitProcessModalVisible, setIsExitProcessModalVisible] = useState(false);

  // Utility fonksiyonları
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Belirtilmemiş";
    return new Date(dateString).toLocaleDateString("tr-TR");
  }, []);

  const getScholarIdFromUrl = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("targetID");
  }, []);

  const localizeThis = useCallback((key) => {
    const translations = {
      editTitle: 'Düzenle',
      deleteTitle: 'Sil',
      deleteConfirmTitle: 'Emin misiniz?',
      deleteConfirmDescription: 'Bu kaydı silmek istediğinizden emin misiniz?',
      deleteConfirmOkText: 'Evet',
      deleteConfirmCancelText: 'Hayır',
    };
    return translations[key] || key;
  }, []);

  const filterDocumentsByType = useCallback((documents, type) => {
    if (!documents || !Array.isArray(documents)) return [];
    return documents.filter(doc => {
      const listType = doc.listType?.toLowerCase();
      return listType === type.toLowerCase();
    });
  }, []);

  // Scholar durumu kontrolleri
  const isScholarStarted = useCallback(() => {
    if (!periodData?.termsOfScholars || !Array.isArray(periodData.termsOfScholars)) {
      return false;
    }
    
    const scholarId = getScholarIdFromUrl();
    const scholarRecord = periodData.termsOfScholars.find(record => 
      record.scholarId == scholarId || 
      record.ScholarId == scholarId ||
      record.scholar_id == scholarId
    );
    
    if (scholarRecord) {
      const startDate = scholarRecord.startDate || 
                       scholarRecord.scholarStartDate || 
                       scholarRecord.ScholarStartDate ||
                       scholarRecord.SCHOLAR_START_DATE ||
                       scholarRecord.start_date;
      
      return startDate !== null && startDate !== undefined;
    }
    
    return false;
  }, [periodData, getScholarIdFromUrl]);

  // Çıkış işlemleri tamamlanmış mı kontrol et
  const isExitProcessCompleted = useCallback(() => {
    // Önce API'den gelen kesin çıkış tamamlandı bilgisini kontrol et
    const apiExitCompleted = periodData?.ExitCompleted === true || 
                             periodData?.IsExitCompleted === true ||
                             periodData?.exitCompleted === true ||
                             periodData?.REAL_END_DATE ||
                             periodData?.RealEndDate;
    
    // Eğer API'den çıkış tamamlandı bilgisi geliyorsa, kesinlikle tamamlandı demektir
    if (apiExitCompleted) {
      return true;
    }
    
    // API'den tamamlanma bilgisi gelmemişse, dönem hala aktiftir
    // Sadece doküman kontrolü yapmayalım çünkü bu yanıltıcı olabilir
    return false;
  }, [periodData]);

  const isPeriodDeletedOrCompleted = useCallback(() => {
    if (!periodData) return true;
    
    // Dönem silinmiş mi?
    if (periodData.DELETED === true || periodData.IsDeleted === true) return true;
    
    // API'den kesin çıkış tamamlandı bilgisi gelmiş mi?
    if (periodData.ExitCompleted === true || 
        periodData.IsExitCompleted === true || 
        periodData.exitCompleted === true) return true;
    
    // Gerçek bitiş tarihi geçmiş mi?
    if (periodData.REAL_END_DATE || periodData.RealEndDate) {
      const endDate = new Date(periodData.REAL_END_DATE || periodData.RealEndDate);
      const today = new Date();
      if (endDate < today) return true;
    }
    
    // Eğer yukarıdaki koşullar sağlanmıyorsa, dönem hala aktiftir
    return false;
  }, [periodData]);

  // Progress hesaplama fonksiyonları
  const getUploadProgress = useCallback((documentsData) => {
    if (!documentsData || documentsData.length === 0) return { uploaded: 0, total: 0, percentage: 0 };
    
    const uploaded = documentsData.filter(doc => doc.realUploadDate).length;
    const total = documentsData.length;
    const percentage = Math.round((uploaded / total) * 100);
    
    return { uploaded, total, percentage };
  }, []);

  const getEntryUploadProgress = useCallback(() => getUploadProgress(entryDocumentsData), [getUploadProgress, entryDocumentsData]);
  const getExitUploadProgress = useCallback(() => getUploadProgress(exitDocumentsData), [getUploadProgress, exitDocumentsData]);

  // API çağrıları
  const fetchScholarData = useCallback(async (scholarId) => {
    try {
      const scholar = await GetScholarAPI(scholarId);
      setScholarData(scholar);
      if (!scholar) {
        message.error("Bursiyer bilgileri alınamadı");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Scholar API hatası:", error);
      message.error("Bursiyer bilgileri alınamadı");
      return false;
    }
  }, []);

  const fetchPeriodData = useCallback(async (scholarId) => {
    try {
      const period = await GetTermOfScholar(scholarId);
      setPeriodData(period);
      return period;
    } catch (error) {
      console.error("Period API hatası:", error);
      message.error("Dönem bilgileri alınamadı");
      return null;
    }
  }, []);

  const fetchAcademicianData = useCallback(async (academicianId) => {
    try {
      const response = await fetch(`/api/reactScholar/getAcademicianNameByPeriodId?targetID=${academicianId}`);
      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setAcademicianData(data);
    } catch (error) {
      console.error("Academician API hatası:", error);
      message.error("Akademisyen bilgileri alınamadı");
    }
  }, []);

  const fetchPeriodDocuments = useCallback(async (scholarId, periodId) => {
    try {
      const periodDocuments = await GetScholarPeriodDocuments(scholarId, periodId);
      const allDocuments = periodDocuments || [];
      setPeriodDocumentsData(allDocuments);
      
      const entryDocs = filterDocumentsByType(allDocuments, 'entry');
      const exitDocs = filterDocumentsByType(allDocuments, 'exit');
      
      setEntryDocumentsData(entryDocs);
      setExitDocumentsData(exitDocs);
      
      return periodDocuments;
    } catch (error) {
      console.error("Period documents API hatası:", error);
      message.error("Dönem dokümanları alınamadı");
      return [];
    }
  }, [filterDocumentsByType]);

  const fetchScholarPeriods = useCallback(async (scholarId) => {
    try {
      const periods = await GetAllTermsOfScholar(scholarId);
      setScholarPeriods(periods || []);
      return periods;
    } catch (error) {
      console.error("Scholar periods API hatası:", error);
      message.error("Burs dönemleri alınamadı");
      return [];
    }
  }, []);

  // Scholar check-in/check-out API çağrıları
  const performScholarCheckin = useCallback(async (scholarId, termId) => {
    try {
      const response = await fetch(`https://localhost:5156/api/term-scholar/checkin?scholarId=${scholarId}&termId=${termId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Check-in API hatası');
      return await response.json();
    } catch (error) {
      console.error('Check-in API hatası:', error);
      throw error;
    }
  }, []);

  const performScholarCheckout = useCallback(async (scholarId, termId, endDate) => {
    try {
      const formattedDate = dayjs(endDate).format('YYYY-MM-DD');
      const response = await fetch(`https://localhost:5156/api/term-scholar/checkout?scholarId=${scholarId}&termId=${termId}&endDate=${formattedDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Check-out API hatası');
      return await response.json();
    } catch (error) {
      console.error('Check-out API hatası:', error);
      throw error;
    }
  }, []);

  const refreshData = useCallback(async (scholarId, termId) => {
    try {
      await Promise.all([
        fetchPeriodData(scholarId),
        fetchScholarPeriods(scholarId),
        termId ? fetchPeriodDocuments(scholarId, termId) : Promise.resolve()
      ]);
    } catch (error) {
      console.error("Data refresh error:", error);
    }
  }, [fetchPeriodData, fetchScholarPeriods, fetchPeriodDocuments]);

  // Event handler'ları
  const handleShowPeriodInfo = useCallback(() => {
    setActiveTabKey("2");
  }, []);

  const handleAddPeriodToScholar = useCallback(() => {
    const scholarId = getScholarIdFromUrl();
    window.location.href = `/add-period-to-scholar?targetID=${scholarId}`;
  }, [getScholarIdFromUrl]);

  const handleEdit = useCallback((record) => {
    if (!isScholarStarted()) {
      message.warning("Doküman düzenlemesi için önce giriş işlemlerini tamamlamanız gerekiyor.");
      return;
    }

    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    const termId = periodData?.id;
    const listType = record.listType || "default";

    setDocumentModalProps({
      title: "Proje Dökümanları",
      moduleType: 6,
      maxFileSize: 5,
      documentTypeId,
      record,
      recordId,
      scholarId,
      termId,
      listType,
      customFields: {
        projectPhase: {
          type: "select",
          label: "Proje Fazı",
          options: [
            { value: "planning", label: "Planlama" },
            { value: "development", label: "Geliştirme" }
          ]
        }
      }
    });

    setIsDocumentAddModalVisible(true);
  }, [getScholarIdFromUrl, periodData?.id, isScholarStarted]);

  const handleEditScholar = useCallback(() => {
    const scholarId = getScholarIdFromUrl();
    if (scholarId) {
      setIsEditModalVisible(true);
    } else {
      message.error("Bursiyer ID'si bulunamadı!");
    }
  }, [getScholarIdFromUrl]);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalVisible(false);
    const scholarId = getScholarIdFromUrl();
    if (scholarId) {
      fetchScholarData(scholarId);
    }
  }, [getScholarIdFromUrl, fetchScholarData]);

  const handleDocumentsAdded = useCallback((documents) => {
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
    
    const scholarId = getScholarIdFromUrl();
    if (periodData?.id) {
      fetchPeriodDocuments(scholarId, periodData.id);
    }
    
    message.success("Dökümanlar başarıyla eklendi!");
  }, [periodData?.id, getScholarIdFromUrl, fetchPeriodDocuments]);

  // changeRealUploadDate fonksiyonu ekleyelim
  const changeRealUploadDate = useCallback(async (documentId, uploadDate) => {
    try {
      // API çağrısı yapılabilir
      const response = await fetch(`/api/documents/updateUploadDate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          uploadDate: uploadDate || new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Upload date update failed');
      
      // Verileri yenile
      const scholarId = getScholarIdFromUrl();
      if (periodData?.id) {
        await fetchPeriodDocuments(scholarId, periodData.id);
      }

      return true;
    } catch (error) {
      console.error('Upload date update error:', error);
      message.error('Doküman tarihi güncellenemedi!');
      return false;
    }
  }, [getScholarIdFromUrl, periodData?.id, fetchPeriodDocuments]);

  const handleModalClose = useCallback(() => {
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
  }, []);

  const handleDelete = useCallback(async (record) => {
    try {
      const periodId = record.ID || record.id;
      const scholarId = getScholarIdFromUrl();
      
      if (!periodId || !scholarId) {
        message.error("Dönem veya bursiyer bilgisi eksik!");
        return;
      }
      
      const periodDocuments = await GetScholarPeriodDocuments(scholarId, periodId);
      const hasUploadedDocuments = periodDocuments?.some(doc => 
        doc.realUploadDate !== null && doc.realUploadDate !== undefined
      );
      
      if (hasUploadedDocuments) {
        message.error({
          content: "Bu dönem silinemez! Döneme ait yüklenmiş dokümanlar bulunmaktadır.",
          duration: 5
        });
        return;
      }
      
      Modal.confirm({
        title: 'Dönem Silme Onayı',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Bu dönemi silmek istediğinizden emin misiniz?</p>
            <p><strong>Dönem:</strong> {record.name || 'İsimsiz Dönem'}</p>
            <p><strong>Tarih:</strong> {formatDate(record.startDate)} - {formatDate(record.endDate)}</p>
          </div>
        ),
        okText: 'Evet, Sil',
        cancelText: 'İptal',
        okButtonProps: { danger: true },
        onOk: () => {
          message.info("Silme işlemi geliştirilecek - API entegrasyonu gerekli");
        }
      });
      
    } catch (error) {
      console.error("Period deletion check error:", error);
      message.error("Dönem kontrol edilirken hata oluştu!");
    }
  }, [getScholarIdFromUrl, formatDate]);

  const handleEntryDocuments = useCallback(() => {
    setIsEntryProcessModalVisible(true);
  }, []);

  const handleExitDocuments = useCallback(() => {
    setIsExitProcessModalVisible(true);
  }, []);

  const handleEntryProcessSuccess = useCallback(async () => {
    const scholarId = getScholarIdFromUrl();
    if (scholarId) {
      await refreshData(scholarId, periodData?.id);
    }
    
    message.success("Giriş işlemleri başarıyla tamamlandı!");
    
    setTimeout(() => {
      const updatedScholarId = getScholarIdFromUrl();
      fetchPeriodData(updatedScholarId);
    }, 1000);
  }, [getScholarIdFromUrl, refreshData, periodData?.id, fetchPeriodData]);

  const handleExitProcessSuccess = useCallback(async () => {
    const scholarId = getScholarIdFromUrl();
    if (scholarId && periodData?.id) {
      // Data'yı yenile ki çıkış tamamlandı durumu güncellensin
      await Promise.all([
        fetchPeriodData(scholarId),
        fetchPeriodDocuments(scholarId, periodData.id),
        fetchScholarPeriods(scholarId)
      ]);
    }
    
    message.success("Çıkış işlemleri başarıyla tamamlandı!");
    
    // Bir süre sonra sayfanın üstüne scroll yap ki kullanıcı değişikliği görsün
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  }, [getScholarIdFromUrl, periodData?.id, fetchPeriodData, fetchPeriodDocuments, fetchScholarPeriods]);

  // Dönem seçimi işlemleri
  const preparePeriodOptions = useCallback(() => {
    if (!scholarPeriods || scholarPeriods.length === 0) return [];

    return scholarPeriods.map(period => ({
      label: `${period.name || 'İsimsiz Dönem'} (${formatDate(period.startDate)} - ${formatDate(period.endDate)})`,
      value: period.ID || period.id,
      startDate: period.startDate,
      endDate: period.endDate,
      isActive: period.isActive || false
    }));
  }, [scholarPeriods, formatDate]);

  const handlePeriodChange = useCallback(async (periodId) => {
    if (!periodId) {
      setFilteredPeriodDocuments([]);
      return;
    }

    setPeriodSelectorLoading(true);
    try {
      const scholarId = getScholarIdFromUrl();
      const documents = await GetScholarPeriodDocuments(scholarId, periodId);
      setFilteredPeriodDocuments(documents || []);
    } catch (error) {
      console.error("Dönem dokümanları yüklenirken hata:", error);
      message.error("Dönem dokümanları alınamadı");
      setFilteredPeriodDocuments([]);
    } finally {
      setPeriodSelectorLoading(false);
    }
  }, [getScholarIdFromUrl]);

  const onPeriodSelect = useCallback((value) => {
    setSelectedPeriodId(value);
    handlePeriodChange(value);
  }, [handlePeriodChange]);

  // Tablo kolonları
  const periodDocumentColumns = React.useMemo(() => [
    {
      title: 'Belge Adı',
      dataIndex: ['documentType', 'name'],
      render: (name) => name || '-',
      key: 'documentTypeId',
      width: 200,
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
      title: 'Belge Türü',
      dataIndex: 'listType',
      key: 'listType',
      width: 120,
    }
  ], [formatDate]);

  const scholarPeriodColumns = React.useMemo(() => [
    {
      title: 'Dönem Adı',
      dataIndex: 'name', 
      key: 'name',
      width: 180,
    },
    {
      title: 'Başlangıç Tarihi',
      dataIndex: 'startDate', 
      key: 'startDate',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Bitiş Tarihi',
      dataIndex: 'endDate', 
      key: 'endDate',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Sorumlu Akademisyen ID',
      dataIndex: 'responsibleAcademician', 
      key: 'responsibleAcademician',
      width: 180,
    }
  ], [formatDate]);

  // Bileşen fonksiyonları
  const HeaderSection = useCallback(() => (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        right: '16px',
        zIndex: 10
      }}>
        <Button
          type="default"
          size="middle"
          icon={<EditOutlined />}
          onClick={handleEditScholar}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            borderRadius: '6px',
            backdropFilter: 'blur(10px)'
          }}
          ghost
        >
          Düzenle
        </Button>
      </div>

      <Row align="middle" gutter={20}>
        <Col flex="none">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)',
              fontSize: '32px'
            }}
          />
        </Col>
        <Col flex={1}>
          <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
            {scholarData?.nameSurname || "Yükleniyor..."}
          </Title>
          
          {periodData && (
            <div style={{ marginBottom: '12px' }}>
              <Title level={4} style={{ color: 'rgba(255,255,255,0.9)', margin: 0, marginBottom: '4px' }}>
                {periodData.name}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                <CalendarOutlined style={{ marginRight: '6px' }} />
                {formatDate(periodData.startDate)} - {formatDate(periodData.endDate)}
              </Text>
            </div>
          )}
          
          <Space size="large" wrap>
            <span style={{ opacity: 0.9 }}>
              <MailOutlined style={{ marginRight: '6px' }} />
              {scholarData?.email || "E-posta belirtilmemiş"}
            </span>
            <span style={{ opacity: 0.9 }}>
              <PhoneOutlined style={{ marginRight: '6px' }} />
              {scholarData?.phone || "Telefon belirtilmemiş"}
            </span>
            <Badge
              status={scholarData?.deleted ? "error" : "success"}
              text={scholarData?.deleted ? "Silinmiş" : "Aktif"}
              style={{ color: 'white' }}
            />
          </Space>
        </Col>
      </Row>
    </div>
  ), [scholarData, periodData, formatDate, handleEditScholar]);

  const PeriodInfoCard = useCallback(() => {
    const entryProgress = getEntryUploadProgress();
    const exitProgress = getExitUploadProgress();
    
    // Giriş işlemleri tamamen tamamlandı mı kontrol et
    const isEntryFullyCompleted = isScholarStarted() && entryProgress.percentage === 100;

    return (
      <Card
        title={
          <span>
            <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Dönem Bilgileri
          </span>
        }
        size="small"
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={5}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Dönem Adı
            </div>
            <div style={{ fontWeight: 500 }}>
              {periodData?.name || "Belirtilmemiş"}
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Başlangıç
            </div>
            <div style={{ fontWeight: 500 }}>
              {formatDate(periodData?.startDate)}
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Bitiş
            </div>
            <div style={{ fontWeight: 500 }}>
              {formatDate(periodData?.endDate)}
            </div>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Sorumlu Akademisyen
            </div>
            {academicianData?.nameSurname ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <img
                  src={
                    academicianData?.photoPath
                      ? `https://localhost:44350${academicianData.photoPath}`
                      : academicianData?.gender === "Kadın"
                      ? "/Resources/images/femaleNoImage.png"
                      : "/Resources/images/maleNoImage.png"
                  }
                  alt="Akademisyen"
                  style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                />
                <span style={{ fontWeight: 500, fontSize: '13px' }}>
                  {academicianData.NAME_SURNAME}
                </span>
              </div>
            ) : (
              <div style={{ color: "#999", fontStyle: "italic" }}>Belirtilmemiş</div>
            )}
          </Col>
          <Col xs={24} sm={24} md={6}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Dönem İşlemleri
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Giriş İşlemleri Butonu - Sadece giriş tamamlanmadığında göster */}
              {!isEntryFullyCompleted && (
                <div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<UploadOutlined />}
                    onClick={handleEntryDocuments}
                    style={{
                      background: isScholarStarted() 
                        ? '#52c41a'
                        : 'linear-gradient(45deg, #1890ff, #40a9ff)',
                      border: 'none',
                      fontSize: '11px',
                      height: '28px',
                      width: '100%'
                    }}
                  >
                    {isScholarStarted() ? 'Giriş Dokümanlarını Tamamla' : 'Giriş İşlemlerini Başlat'} ({entryProgress.uploaded}/{entryProgress.total})
                  </Button>
                  <Progress
                    percent={entryProgress.percentage}
                    size="small"
                    status={isScholarStarted() ? "success" : entryProgress.percentage === 100 ? "success" : "active"}
                    style={{ marginTop: '2px' }}
                  />
                </div>
              )}

              {/* Giriş Tamamlandı Mesajı */}
              {isEntryFullyCompleted && (
                <div>
                  <Button
                    type="default"
                    size="small"
                    icon={<UploadOutlined />}
                    disabled
                    style={{
                      background: '#f6ffed',
                      borderColor: '#b7eb8f',
                      color: '#52c41a',
                      fontSize: '11px',
                      height: '28px',
                      width: '100%'
                    }}
                  >
                    ✓ Giriş İşlemleri Tamamlandı ({entryProgress.uploaded}/{entryProgress.total})
                  </Button>
                </div>
              )}

              {/* Çıkış İşlemleri Butonu - Sadece giriş tamamlandığında göster */}
              {isEntryFullyCompleted && (
                <div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={handleExitDocuments}
                    style={{
                      background: 'linear-gradient(45deg, #fa8c16, #ffa940)',
                      border: 'none',
                      fontSize: '11px',
                      height: '28px',
                      width: '100%'
                    }}
                  >
                    Çıkış İşlemlerini Başlat ({exitProgress.uploaded}/{exitProgress.total})
                  </Button>
                  <Progress
                    percent={exitProgress.percentage}
                    size="small"
                    status={exitProgress.percentage === 100 ? "success" : "active"}
                    style={{ marginTop: '2px' }}
                  />
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    );
  }, [
    periodData, 
    academicianData, 
    formatDate, 
    handleEntryDocuments, 
    handleExitDocuments, 
    isScholarStarted,
    getEntryUploadProgress,
    getExitUploadProgress
  ]);

  const PeriodAlternativeCard = useCallback(() => {
    // Çıkış işlemleri tamamlandı mı kontrolü
    const exitCompleted = isExitProcessCompleted();
    
    return (
      <Card
        title={
          <span>
            <CalendarOutlined style={{ marginRight: '8px', color: exitCompleted ? '#52c41a' : '#ff4d4f' }} />
            {exitCompleted ? 'Dönem Tamamlandı' : 'Dönem Durumu'}
          </span>
        }
        size="small"
        style={{ marginBottom: '16px' }}
      >
        <div style={{ marginBottom: '20px' }}>
          {exitCompleted ? (
            <>
              <Text
                type="success"
                style={{ fontSize: '14px', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
              >
                ✓ Bu dönemin çıkış işlemleri başarıyla tamamlanmıştır.
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Dönem işlemleri sona ermiştir. Geçmiş dönem bilgilerini görüntüleyebilir veya yeni dönem ekleyebilirsiniz.
              </Text>
            </>
          ) : (
            <>
              <Text
                type="secondary"
                style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}
              >
                Bursiyerin aktif dönemi bulunmuyor veya dönem işlemleri tamamlanmış.
              </Text>
              <Text type="warning" style={{ fontSize: '12px' }}>
                Dönem bilgilerini görüntülemek veya yeni dönem eklemek için aşağıdaki seçenekleri kullanabilirsiniz.
              </Text>
            </>
          )}
        </div>
        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<InfoCircleOutlined />}
            onClick={handleShowPeriodInfo}
            style={{
              background: 'linear-gradient(45deg, #1890ff, #40a9ff)',
              border: 'none',
              height: '36px',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}
          >
            Dönem Bilgilerini Göster
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPeriodToScholar}
            style={{
              background: 'linear-gradient(45deg, #52c41a, #73d13d)',
              border: 'none',
              height: '36px',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}
          >
            Bursiyere Dönem Ekle
          </Button>
        </Space>
      </Card>
    );
  }, [handleShowPeriodInfo, handleAddPeriodToScholar, isExitProcessCompleted]);

  const MainContent = useCallback(() => {
    if (loading) {
      return <Skeleton active avatar paragraph={{ rows: 3 }} />;
    }

    if (!scholarData) {
      return (
        <Card style={{ textAlign: "center" }}>
          <Title level={4} type="secondary">Veri bulunamadı</Title>
          <p style={{ color: '#666' }}>Scholar ID bulunamadı veya veri alınamadı.</p>
        </Card>
      );
    }

    return (
      <div>
        <HeaderSection />
        {isPeriodDeletedOrCompleted() ? <PeriodAlternativeCard /> : <PeriodInfoCard />}
      </div>
    );
  }, [loading, scholarData, isPeriodDeletedOrCompleted, HeaderSection, PeriodAlternativeCard, PeriodInfoCard]);

  const TabContent = useCallback(() => (
    <Card
      title={
        <span>
          <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Yönetim Paneli
        </span>
      }
      size="small"
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        size="small"
        style={{ margin: 0 }}
        items={[
          {
            key: "1",
            label: "Dönem Dokümanları",
            children: (
              <div>
                {/* Dönem Seçici */}
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '12px', 
                  backgroundColor: '#f0f8ff', 
                  border: '1px solid #91caff', 
                  borderRadius: '6px' 
                }}>
                  <Row gutter={[16, 8]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                      <Text style={{ color: '#1890ff', fontWeight: 500 }}>
                        <CalendarOutlined style={{ marginRight: '6px' }} />
                        Dönem Seçin:
                      </Text>
                    </Col>
                    <Col xs={24} sm={16} md={12}>
                      <Select
                        placeholder="Bir dönem seçin..."
                        size="large"
                        style={{ width: '100%' }}
                        value={selectedPeriodId}
                        onChange={onPeriodSelect}
                        loading={periodSelectorLoading}
                        options={preparePeriodOptions()}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        dropdownStyle={{ borderRadius: '6px' }}
                      />
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {filteredPeriodDocuments.length} doküman bulundu
                      </Text>
                    </Col>
                  </Row>
                </div>

                {/* Giriş Uyarısı */}
                {!isScholarStarted() && (
                  <Alert
                    message="Doküman İşlemleri Devre Dışı"
                    description="Dönem dokümanlarını düzenleyebilmek için önce giriş işlemlerini tamamlamanız gerekiyor."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                    action={
                      <Button 
                        size="small" 
                        type="primary" 
                        onClick={handleEntryDocuments}
                        icon={<UploadOutlined />}
                      >
                        Giriş İşlemlerini Başlat
                      </Button>
                    }
                  />
                )}

                {/* Doküman Tablosu */}
                <DraggableAntdTable
                  dataSource={filteredPeriodDocuments}
                  columns={periodDocumentColumns}
                  sort={true}
                  bordered={true}
                  size="small"
                  showEdit={isScholarStarted()}
                  editConfig={{
                    buttonType: isScholarStarted() ? 'primary' : 'default',
                    buttonSize: 'small',
                    width: 35,
                    disabled: !isScholarStarted(),
                    title: isScholarStarted() ? 'Düzenle' : 'Giriş Yapılmadı'
                  }}
                  filter={true}
                  columnDraggable={true}
                  rowKey={(record) => record.ID || record.id || record.documentTypeId || Math.random()}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  loading={periodSelectorLoading}
                  onEdit={handleEdit}
                  localizeThis={localizeThis}
                  locale={{
                    emptyText: selectedPeriodId 
                      ? isScholarStarted() 
                        ? 'Bu dönem için doküman bulunamadı' 
                        : 'Önce giriş işlemlerini tamamlayın'
                      : 'Lütfen bir dönem seçin'
                  }}
                />
              </div>
            )
          },
          {
            key: "2",
            label: "Burs Dönemleri",
            children: (
              <DraggableAntdTable
                dataSource={scholarPeriods}
                columns={scholarPeriodColumns}
                rowKey={(record) => record.ID || record.id || Math.random()}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                loading={loading}
                showDelete={true}
                size="small"
                bordered={true}
                deleteConfig={{
                  title: 'Sil',
                  buttonText: 'Sil',
                  buttonSize: 'small',
                  confirmTitle: 'Dönem Silme Kontrolü',
                  confirmDescription: 'Dönem silinebilirlik kontrolü yapılıyor...',
                  width: 60,
                  getDisabled: () => false
                }}
                onDelete={handleDelete}
                localizeThis={localizeThis}
              />
            )
          }
        ]}
      />
    </Card>
  ), [
    activeTabKey, 
    selectedPeriodId,
    filteredPeriodDocuments,
    periodSelectorLoading,
    periodDocumentColumns, 
    scholarPeriods, 
    scholarPeriodColumns, 
    loading, 
    handleEdit, 
    handleDelete, 
    localizeThis,
    preparePeriodOptions,
    onPeriodSelect,
    isScholarStarted,
    handleEntryDocuments
  ]);

  // useEffect hooks
  useEffect(() => {
    const scholarId = getScholarIdFromUrl();
    if (!scholarId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchScholarData(scholarId),
          fetchPeriodData(scholarId),
          fetchScholarPeriods(scholarId)
        ]);
      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getScholarIdFromUrl, fetchScholarData, fetchPeriodData, fetchScholarPeriods]);

  useEffect(() => {
    if (periodData?.ResponsibleAcademicianId) {
      fetchAcademicianData(periodData.ResponsibleAcademicianId);
    }
  }, [periodData?.ResponsibleAcademicianId, fetchAcademicianData]);

  useEffect(() => {
    if (periodData?.id) {
      const scholarId = getScholarIdFromUrl();
      fetchPeriodDocuments(scholarId, periodData.id);
    }
  }, [periodData?.id, getScholarIdFromUrl, fetchPeriodDocuments]);

  useEffect(() => {
    if (scholarPeriods && scholarPeriods.length > 0 && !selectedPeriodId) {
      const activePeriod = scholarPeriods.find(period => period.isActive === true);
      
      if (activePeriod) {
        const periodId = activePeriod.ID || activePeriod.id;
        setSelectedPeriodId(periodId);
        handlePeriodChange(periodId);
        return;
      }

      const sortedPeriods = [...scholarPeriods].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB - dateA; 
      });

      if (sortedPeriods.length > 0) {
        const periodId = sortedPeriods[0].ID || sortedPeriods[0].id;
        setSelectedPeriodId(periodId);
        handlePeriodChange(periodId);
      }
    }
  }, [scholarPeriods, selectedPeriodId, handlePeriodChange]);

  // Ana render
  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <MainContent />
      <div style={{ marginTop: '16px' }}>
        <TabContent />
      </div>

      {/* Entry Process Modal */}
      <ScholarEntryProcess
        visible={isEntryProcessModalVisible}
        onCancel={() => setIsEntryProcessModalVisible(false)}
        onSuccess={handleEntryProcessSuccess}
        scholarData={scholarData}
        periodData={periodData}
        entryDocumentsData={entryDocumentsData}
        isScholarStarted={isScholarStarted()}
        formatDate={formatDate}
        localizeThis={localizeThis}
        performScholarCheckin={performScholarCheckin}
        refreshData={refreshData}
      />

      {/* Exit Process Modal */}
      <ScholarExitProcess
        visible={isExitProcessModalVisible}
        onCancel={() => setIsExitProcessModalVisible(false)}
        onSuccess={handleExitProcessSuccess}
        scholarData={scholarData}
        periodData={periodData}
        exitDocumentsData={exitDocumentsData}
        periodDocumentsData={periodDocumentsData}
        isScholarStarted={isScholarStarted()}
        formatDate={formatDate}
        localizeThis={localizeThis}
        performScholarCheckout={performScholarCheckout}
        refreshData={refreshData}
        changeRealUploadDate={changeRealUploadDate}
      />

      {/* Document Add Modal */}
      {isDocumentAddModalVisible && documentModalProps && (
        <DocumentAddModalGlobal
          visible={isDocumentAddModalVisible}
          onCancel={handleModalClose}
          onOk={handleDocumentsAdded}
          changeRealUploadDate={changeRealUploadDate}
          {...documentModalProps}
        />
      )}

      {/* Scholar Edit Modal */}
      <Modal
        title="Bursiyer Bilgilerini Düzenle"
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={null}
        width="95%"
        style={{ maxWidth: '1200px', top: 20 }}
        centered
        destroyOnClose
      >
        {isEditModalVisible && (
          <ScholarEdit 
            scholarId={getScholarIdFromUrl()}
            onSuccess={handleEditModalClose}
            isModal={true}
          />
        )}
      </Modal>
    </div>
  );
};

export default ScholarInfo;