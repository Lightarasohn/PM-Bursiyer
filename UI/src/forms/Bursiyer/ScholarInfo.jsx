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
  message
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
  InfoCircleOutlined
} from '@ant-design/icons';
import DraggableAntdTable from '../../reusableComponents/DraggableAntdTable';
import DocumentAddModalGlobal from '../../reusableComponents/DocumentAddModalGlobal';
import GetScholarAPI from "../../services/GetScholarAPI"
import GetTermOfScholar from '../../services/GetTermOfScholar';
import GetAllTermsOfScholar from '../../services/GetAllTermsOfScholar';
import GetScholarPeriodDocuments from '../../services/GetScholarPeriodDocuments';

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
  
  // Modal states for document views - YENİ EKLEMELER
  const [isEntryDocumentsModalVisible, setIsEntryDocumentsModalVisible] = useState(false);
  const [isExitDocumentsModalVisible, setIsExitDocumentsModalVisible] = useState(false);
  const [entryModalLoading, setEntryModalLoading] = useState(false);
  const [exitModalLoading, setExitModalLoading] = useState(false);

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

  // YENİ MODAL HANDLERS
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

  // YENİ MODAL KAPANMA HANDLERS
  const handleEntryModalClose = useCallback(() => {
    setIsEntryDocumentsModalVisible(false);
  }, []);

  const handleExitModalClose = useCallback(() => {
    setIsExitDocumentsModalVisible(false);
  }, []);

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

  // Table columns
  const periodDocumentColumns = [
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
  ];

  // YENİ TABLO KOLONLARI - ENTRY VE EXIT İÇİN
  const entryDocumentColumns = [
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
  ];

  const exitDocumentColumns = [
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
  ];

  const scholarPeriodColumns = [
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
  ];

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
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        color: 'white'
      }}
    >
      <Row align="middle" gutter={16}>
        <Col flex="none">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          />
        </Col>
        <Col flex={1}>
          <Title level={3} style={{ color: 'white', margin: 0, marginBottom: '4px' }}>
            {scholarData?.nameSurname || "Yükleniyor..."}
          </Title>
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
  ), [scholarData]);

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
              <DraggableAntdTable
                dataSource={periodDocumentsData}
                columns={periodDocumentColumns}
                sort={true}
                bordered={true}
                size="small"
                showEdit={true}
                editConfig={{
                  buttonType: 'primary',
                  buttonSize: 'small',
                  width: 50
                }}
                filter={true}
                columnDraggable={true}
                rowKey="ID"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                loading={loading}
                onEdit={handleEdit}
                localizeThis={localizeThis}
              />
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
          },
          {
            key: "3",
            label: (
              <span>
                <UploadOutlined style={{ marginRight: '4px' }} />
                Giriş Dokümanları ({entryDocumentsData.length})
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
                  <Text style={{ color: '#52c41a', fontWeight: 500 }}>
                    <UploadOutlined style={{ marginRight: '6px' }} />
                    Giriş Dokümanları
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Bursiyerin dönem başlangıcında yüklemesi gereken belgeler
                  </Text>
                </div>
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
                    width: 50
                  }}
                  filter={true}
                  columnDraggable={true}
                  rowKey="ID"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  loading={loading}
                  onEdit={handleEntryDocumentEdit}
                  localizeThis={localizeThis}
                  locale={{
                    emptyText: 'Giriş dokümanı bulunamadı'
                  }}
                />
              </div>
            )
          },
          {
            key: "4",
            label: (
              <span>
                <DownloadOutlined style={{ marginRight: '4px' }} />
                Çıkış Dokümanları ({exitDocumentsData.length})
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px' }}>
                  <Text style={{ color: '#fa8c16', fontWeight: 500 }}>
                    <DownloadOutlined style={{ marginRight: '6px' }} />
                    Çıkış Dokümanları
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Bursiyerin dönem bitişinde teslim etmesi gereken belgeler
                  </Text>
                </div>
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
                    width: 50
                  }}
                  filter={true}
                  columnDraggable={true}
                  rowKey="ID"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  loading={loading}
                  onEdit={handleExitDocumentEdit}
                  localizeThis={localizeThis}
                  locale={{
                    emptyText: 'Çıkış dokümanı bulunamadı'
                  }}
                />
              </div>
            )
          }
        ]}
      />
    </Card>
  ), [activeTabKey, periodDocumentsData, periodDocumentColumns, scholarPeriods, scholarPeriodColumns, entryDocumentsData, exitDocumentsData, entryDocumentColumns, exitDocumentColumns, loading, handleEdit, handleDelete, handleEntryDocumentEdit, handleExitDocumentEdit, localizeThis]);

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <MainContent />
      <div style={{ marginTop: '16px' }}>
        <TabContent />
      </div>

      {/* YENİ ENTRY DOKÜMANLARI MODAL */}
      <Modal
        title={
          <span>
            <UploadOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            Giriş Dokümanları
          </span>
        }
        open={isEntryDocumentsModalVisible}
        onCancel={handleEntryModalClose}
        footer={[
          <Button key="close" onClick={handleEntryModalClose}>
            Kapat
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
          <Text style={{ color: '#52c41a', fontWeight: 500 }}>
            <UploadOutlined style={{ marginRight: '6px' }} />
            Giriş Dokümanları Listesi
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Bursiyerin dönem başlangıcında yüklemesi gereken belgeler. Düzenlemek için edit butonuna tıklayın.
          </Text>
        </div>
        
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
            width: 50,
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
          scroll={{ y: 400 }}
        />
      </Modal>

      {/* YENİ EXIT DOKÜMANLARI MODAL */}
      <Modal
        title={
          <span>
            <DownloadOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
            Çıkış Dokümanları
          </span>
        }
        open={isExitDocumentsModalVisible}
        onCancel={handleExitModalClose}
        footer={[
          <Button key="close" onClick={handleExitModalClose}>
            Kapat
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px' }}>
          <Text style={{ color: '#fa8c16', fontWeight: 500 }}>
            <DownloadOutlined style={{ marginRight: '6px' }} />
            Çıkış Dokümanları Listesi
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Bursiyerin dönem bitişinde teslim etmesi gereken belgeler. Düzenlemek için edit butonuna tıklayın.
          </Text>
        </div>
        
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
            width: 50,
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
          scroll={{ y: 400 }}
        />
      </Modal>

      {/* DocumentAddModalGlobal - Tek Modal Tüm Doküman İşlemleri İçin */}
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