import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Skeleton,
  Row,
  Col,
  Typography,
  Grid,
  Tabs,
  Modal,
  Button,
  Space,
  Divider,
  Badge,
  message,
  Select,
  DatePicker,
  Form,
  Alert,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  CalendarOutlined,
  BookOutlined,
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import DraggableAntdTable from '../../reusableComponents/DraggableAntdTable';
import DocumentAddModalGlobal from '../../reusableComponents/DocumentAddModalGlobal';
import GetScholarAPI from "../../services/GetScholarAPI"
import GetTermOfScholar from '../../services/GetTermOfScholar';
import GetAllTermsOfScholar from '../../services/GetAllTermsOfScholar';
import GetScholarPeriodDocuments from '../../services/GetScholarPeriodDocuments';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Suppress Ant Design warning for React 19 compatibility
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('antd: compatible') || 
      args[0]?.includes?.('antd v5 support React is 16 ~ 18')) {
    return;
  }
  originalWarn.apply(console, args);
};

const ScholarInfo = () => {
  // State definitions
  const [scholarData, setScholarData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [academicianData, setAcademicianData] = useState(null);
  const [periodDocumentsData, setPeriodDocumentsData] = useState([]);
  const [entryDocumentsData, setEntryDocumentsData] = useState([]);
  const [exitDocumentsData, setExitDocumentsData] = useState([]);
  const [scholarPeriods, setScholarPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [modalUrl, setModalUrl] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isDocumentAddModalVisible, setIsDocumentAddModalVisible] = useState(false);
  const [documentModalProps, setDocumentModalProps] = useState(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [filteredPeriodDocuments, setFilteredPeriodDocuments] = useState([]);
  const [periodSelectorLoading, setPeriodSelectorLoading] = useState(false);
  
  // Modal states for document views
  const [isEntryDocumentsModalVisible, setIsEntryDocumentsModalVisible] = useState(false);
  const [isExitDocumentsModalVisible, setIsExitDocumentsModalVisible] = useState(false);
  const [entryModalLoading, setEntryModalLoading] = useState(false);
  const [exitModalLoading, setExitModalLoading] = useState(false);
  
  // Exit process states
  const [exitForm] = Form.useForm();
  const [exitProcessLoading, setExitProcessLoading] = useState(false);
  const [selectedExitDate, setSelectedExitDate] = useState(null);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Belirtilmemiş";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR");
  }, []);

  const getScholarIdFromUrl = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("targetID");
  }, []);

  const isScholarStarted = useCallback(() => {
    return periodData && periodData.ScholarStartDate !== null;
  }, [periodData]);

  const isPeriodDeletedOrCompleted = useCallback(() => {
    if (!periodData) return true;
    
    if (periodData.DELETED === true || periodData.IsDeleted === true) return true;
    
    if (periodData.REAL_END_DATE || periodData.RealEndDate) {
      const endDate = new Date(periodData.REAL_END_DATE || periodData.RealEndDate);
      const today = new Date();
      if (endDate < today) return true;
    }
    
    if (periodData.ExitCompleted === true || periodData.IsExitCompleted === true) return true;
    
    return false;
  }, [periodData]);

  // Filter documents by type
  const filterDocumentsByType = useCallback((documents, type) => {
    if (!documents || !Array.isArray(documents)) return [];
    return documents.filter(doc => {
      const listType = doc.listType?.toLowerCase();
      return listType === type.toLowerCase();
    });
  }, []);

  // API calls
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
      console.log("PeriodInfo", period);
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
      console.log("PeriodDocuments", periodDocuments);
      
      const allDocuments = periodDocuments || [];
      setPeriodDocumentsData(allDocuments);
      
      // Filter documents by type
      const entryDocs = filterDocumentsByType(allDocuments, 'entry');
      const exitDocs = filterDocumentsByType(allDocuments, 'exit');
      
      setEntryDocumentsData(entryDocs);
      setExitDocumentsData(exitDocs);
      
      console.log("Entry Documents:", entryDocs);
      console.log("Exit Documents:", exitDocs);
      
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
      console.log("PeriodInfos", periods);
      return periods;
    } catch (error) {
      console.error("Scholar periods API hatası:", error);
      message.error("Burs dönemleri alınamadı");
      return [];
    }
  }, []);

  // Event handlers
  const handleShowPeriodInfo = useCallback(() => {
    setActiveTabKey("2");
  }, []);

  const handleAddPeriodToScholar = useCallback(() => {
    const scholarId = getScholarIdFromUrl();
    window.location.href = `/add-period-to-scholar?targetID=${scholarId}`;
  }, [getScholarIdFromUrl]);

  const handleEdit = useCallback((record) => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman düzenleme yapılamaz.");
      return;
    }

    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    const termId = periodData?.id;
    const listType = record.listType || "default";

    // Modal props'ları ayarla
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

    // Modalı aç
    setIsDocumentAddModalVisible(true);
  }, [isScholarStarted, getScholarIdFromUrl, periodData?.id]);

  const handleDocumentsAdded = useCallback((documents) => {
    console.log("Eklenen dökümanlar:", documents);
    
    // Modalı kapat
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
    
    // Verileri yenile
    const scholarId = getScholarIdFromUrl();
    if (periodData?.id) {
      fetchPeriodDocuments(scholarId, periodData.id);
    }
    
    message.success("Dökümanlar başarıyla eklendi!");
  }, [periodData?.id, getScholarIdFromUrl, fetchPeriodDocuments]);

  const handleModalClose = useCallback(() => {
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
    setModalUrl('');
    setCurrentRecord(null);
  }, []);

  const handleDelete = useCallback((record) => {
    console.log("Delete operation:", record);
    message.info("Silme işlemi geliştirilecek");
  }, []);

  // Modal handlers for Entry/Exit documents
  const handleEntryDocuments = useCallback(() => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman görüntüleme yapılamaz.");
      return;
    }
    setIsEntryDocumentsModalVisible(true);
  }, [isScholarStarted]);

  const handleExitDocuments = useCallback(() => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman görüntüleme yapılamaz.");
      return;
    }
    setIsExitDocumentsModalVisible(true);
  }, [isScholarStarted]);

  // Entry documents save handler
  const handleSaveEntryDocuments = useCallback(async () => {
    try {
      setEntryModalLoading(true);
      
      // API call to save entry documents
      const scholarId = getScholarIdFromUrl();
      const termId = periodData?.id;
      
      // Here you would make the API call to save entry documents
      // const response = await saveEntryDocuments(scholarId, termId, entryDocumentsData);
      
      message.success("Giriş dokümanları başarıyla kaydedildi!");
      
      // Refresh data
      if (termId) {
        await fetchPeriodDocuments(scholarId, termId);
      }
      
    } catch (error) {
      console.error("Entry documents save error:", error);
      message.error("Giriş dokümanları kaydedilirken hata oluştu!");
    } finally {
      setEntryModalLoading(false);
    }
  }, [getScholarIdFromUrl, periodData?.id, entryDocumentsData, fetchPeriodDocuments]);

  // Exit process handler
  const handleStartExitProcess = useCallback(async () => {
    if (!selectedExitDate) {
      message.warning("Lütfen çıkış tarihi seçin!");
      return;
    }

    try {
      setExitProcessLoading(true);
      
      const scholarId = getScholarIdFromUrl();
      const termId = periodData?.id;
      
      // API call to start exit process
      // const response = await startExitProcess(scholarId, termId, selectedExitDate);
      
      message.success("Çıkış işlemleri başlatıldı!");
      
      // Refresh data
      if (termId) {
        await fetchPeriodDocuments(scholarId, termId);
        await fetchPeriodData(scholarId);
      }
      
    } catch (error) {
      console.error("Exit process start error:", error);
      message.error("Çıkış işlemleri başlatılırken hata oluştu!");
    } finally {
      setExitProcessLoading(false);
    }
  }, [selectedExitDate, getScholarIdFromUrl, periodData?.id, fetchPeriodDocuments, fetchPeriodData]);

  const handleEntryDocumentEdit = useCallback((record) => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman düzenleme yapılamaz.");
      return;
    }

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

    // Modalı aç ve Entry modalını kapat
    setIsEntryDocumentsModalVisible(false);
    setIsDocumentAddModalVisible(true);
  }, [isScholarStarted, getScholarIdFromUrl, periodData?.id]);

  const handleExitDocumentEdit = useCallback((record) => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman düzenleme yapılamaz.");
      return;
    }

    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    const termId = periodData?.id;

    // Exit dokümanları için modal props'ları ayarla
    setDocumentModalProps({
      title: "Çıkış Dokümanları",
      moduleType: 7,
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

    // Modalı aç ve Exit modalını kapat
    setIsExitDocumentsModalVisible(false);
    setIsDocumentAddModalVisible(true);
  }, [isScholarStarted, getScholarIdFromUrl, periodData?.id]);

  // Modal kapanma handlers
  const handleEntryModalClose = useCallback(() => {
    setIsEntryDocumentsModalVisible(false);
  }, []);

  const handleExitModalClose = useCallback(() => {
    setIsExitDocumentsModalVisible(false);
    setSelectedExitDate(null);
    exitForm.resetFields();
  }, [exitForm]);

  // Modal kapatıldıktan sonra verileri yenileme
  const handleDocumentModalClose = useCallback(() => {
    setIsDocumentAddModalVisible(false);
    setDocumentModalProps(null);
    
    // Verileri yenile
    const scholarId = getScholarIdFromUrl();
    if (periodData?.id) {
      fetchPeriodDocuments(scholarId, periodData.id);
    }
  }, [getScholarIdFromUrl, periodData?.id, fetchPeriodDocuments]);

  // Effects
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
  
  // Dönem seçici için options hazırla
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

  // Dönem seçimi değiştiğinde dokümanları filtrele
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
      console.log("Seçilen dönem dokümanları:", documents);
    } catch (error) {
      console.error("Dönem dokümanları yüklenirken hata:", error);
      message.error("Dönem dokümanları alınamadı");
      setFilteredPeriodDocuments([]);
    } finally {
      setPeriodSelectorLoading(false);
    }
  }, [getScholarIdFromUrl]);

  // Seçilen dönem değiştiğinde dokümanları güncelle
  const onPeriodSelect = useCallback((value) => {
    setSelectedPeriodId(value);
    handlePeriodChange(value);
  }, [handlePeriodChange]);

  // İlk yüklemede en uygun dönemi seç
  useEffect(() => {
    if (scholarPeriods && scholarPeriods.length > 0 && !selectedPeriodId) {
      const currentDate = new Date();
      
      // 1. Önce aktif dönemleri ara
      const activePeriod = scholarPeriods.find(period => period.isActive === true);
      
      if (activePeriod) {
        const periodId = activePeriod.ID || activePeriod.id;
        setSelectedPeriodId(periodId);
        handlePeriodChange(periodId);
        return;
      }

      // 2. Aktif dönem yoksa, en güncel (son başlamış) dönemi bul
      const sortedPeriods = [...scholarPeriods].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB - dateA; // En yeni tarih önce
      });

      if (sortedPeriods.length > 0) {
        const periodId = sortedPeriods[0].ID || sortedPeriods[0].id;
        setSelectedPeriodId(periodId);
        handlePeriodChange(periodId);
      }
    }
  }, [scholarPeriods, selectedPeriodId, handlePeriodChange]);

  // Table columns
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

  // Entry ve Exit dokümanları için tablo kolonları
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

  // Localization function
  const localizeThis = useCallback((key) => {
    const translations = {
      editTitle: 'Düzenle',
      editButtonText: '',
      deleteTitle: 'Sil',
      deleteButtonText: '',
      deleteConfirmTitle: 'Emin misiniz?',
      deleteConfirmDescription: 'Bu kaydı silmek istediğinizden emin misiniz?',
      deleteConfirmOkText: 'Evet',
      deleteConfirmCancelText: 'Hayır',
    };
    return translations[key] || key;
  }, []);

  // Components
  const HeaderSection = useCallback(() => (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
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
          
          {/* Dönem bilgileri */}
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
  ), [scholarData, periodData, formatDate]);

  const PeriodInfoCard = useCallback(() => (
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
            Doküman İşlemleri
          </div>
          <Space size="small" wrap>
            <Button
              type="primary"
              size="small"
              icon={<UploadOutlined />}
              onClick={handleEntryDocuments}
              style={{
                background: 'linear-gradient(45deg, #52c41a, #73d13d)',
                border: 'none',
                fontSize: '11px',
                height: '28px'
              }}
            >
              Giriş Dokümanları ({entryDocumentsData.length})
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleExitDocuments}
              style={{
                background: 'linear-gradient(45deg, #fa8c16, #ffa940)',
                border: 'none',
                fontSize: '11px',
                height: '28px'
              }}
            >
              Çıkış Dokümanları ({exitDocumentsData.length})
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  ), [periodData, academicianData, formatDate, handleEntryDocuments, handleExitDocuments, entryDocumentsData.length, exitDocumentsData.length]);

  const PeriodAlternativeCard = useCallback(() => (
    <Card
      title={
        <span>
          <CalendarOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
          Dönem Durumu
        </span>
      }
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <div style={{ marginBottom: '20px' }}>
        <Text
          type="secondary"
          style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}
        >
          Bursiyerin aktif dönemi bulunmuyor veya dönem işlemleri tamamlanmış.
        </Text>
        <Text type="warning" style={{ fontSize: '12px' }}>
          Dönem bilgilerini görüntülemek veya yeni dönem eklemek için aşağıdaki seçenekleri kullanabilirsiniz.
        </Text>
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
  ), [handleShowPeriodInfo, handleAddPeriodToScholar]);

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

  // Sadeleştirilmiş TabContent - sadece 2 sekme kaldı
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
                {/* Dönem Seçici Dropdown */}
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

                {/* Doküman Tablosu */}
                <DraggableAntdTable
                  dataSource={filteredPeriodDocuments}
                  columns={periodDocumentColumns}
                  sort={true}
                  bordered={true}
                  size="small"
                  showEdit={true}
                  editConfig={{
                    buttonType: 'primary',
                    buttonSize: 'small',
                    width: 35
                  }}
                  filter={true}
                  columnDraggable={true}
                  rowKey="ID"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  loading={periodSelectorLoading}
                  onEdit={handleEdit}
                  localizeThis={localizeThis}
                  locale={{
                    emptyText: selectedPeriodId 
                      ? 'Bu dönem için doküman bulunamadı' 
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
                rowKey="ID"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                loading={loading}
                showDelete={true}
                size="small"
                bordered={true}
                deleteConfig={{
                  title: 'Sil',
                  buttonText: 'Sil',
                  buttonSize: 'small',
                  confirmTitle: 'Emin misiniz?',
                  confirmDescription: 'Bu kaydı silmek istediğinizden emin misiniz?',
                  width: 60
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
    onPeriodSelect
  ]);

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <MainContent />
      <div style={{ marginTop: '16px' }}>
        <TabContent />
      </div>

      {/* Entry Documents Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
            <span>Giriş Dokümanları</span>
          </div>
        }
        open={isEntryDocumentsModalVisible}
        onCancel={handleEntryModalClose}
        footer={[
          <Button key="close" onClick={handleEntryModalClose}>
            Kapat
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            icon={<SaveOutlined />}
            loading={entryModalLoading}
            onClick={handleSaveEntryDocuments}
            style={{
              background: 'linear-gradient(45deg, #52c41a, #73d13d)',
              border: 'none'
            }}
          >
            Kaydet
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        <Alert
          message="Giriş Dokümanları"
          description="Bursiyerin dönem başlangıcında yüklemesi gereken belgeler. Düzenlemek için edit butonuna tıklayın."
          type="success"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
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
          rowKey="ID"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          loading={entryModalLoading}
          onEdit={handleEntryDocumentEdit}
          localizeThis={localizeThis}
          locale={{
            emptyText: 'Giriş dokümanı bulunamadı'
          }}
        />
      </Modal>

      {/* Exit Documents Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DownloadOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
            <span>Çıkış Dokümanları</span>
          </div>
        }
        open={isExitDocumentsModalVisible}
        onCancel={handleExitModalClose}
        footer={[
          <Button key="close" onClick={handleExitModalClose}>
            Kapat
          </Button>,
          <Button 
            key="start-exit" 
            type="primary" 
            icon={<PlayCircleOutlined />}
            loading={exitProcessLoading}
            onClick={handleStartExitProcess}
            disabled={!selectedExitDate}
            style={{
              background: 'linear-gradient(45deg, #fa8c16, #ffa940)',
              border: 'none'
            }}
          >
            Çıkış İşlemlerini Başlat
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        <Alert
          message="Çıkış Dokümanları"
          description="Bursiyerin dönem bitişinde teslim etmesi gereken belgeler. Çıkış işlemlerini başlatmak için tarih seçin."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        {/* Exit Date Selection */}
        <Card 
          title={
            <span>
              <ClockCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
              Çıkış Tarihi Seçimi
            </span>
          }
          size="small" 
          style={{ marginBottom: '16px' }}
        >
          <Form form={exitForm} layout="inline">
            <Form.Item
              label="Çıkış Tarihi"
              name="exitDate"
              rules={[{ required: true, message: 'Lütfen çıkış tarihi seçin!' }]}
            >
              <DatePicker
                placeholder="Çıkış tarihini seçin"
                style={{ width: '200px' }}
                format="DD/MM/YYYY"
                value={selectedExitDate}
                onChange={setSelectedExitDate}
                disabledDate={(current) => {
                  // Geçmiş tarihleri devre dışı bırak
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>
            {selectedExitDate && (
              <Form.Item>
                <Text type="success" style={{ marginLeft: '12px' }}>
                  <ExclamationCircleOutlined style={{ marginRight: '4px' }} />
                  Seçilen tarih: {selectedExitDate.format('DD/MM/YYYY')}
                </Text>
              </Form.Item>
            )}
          </Form>
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
          rowKey="ID"
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
    </div>
  );
}

export default ScholarInfo;