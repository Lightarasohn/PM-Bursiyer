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
  const [scholarPeriods, setScholarPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);

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
      setPeriodDocumentsData(periodDocuments || []);
      return periodDocuments;
    } catch (error) {
      console.error("Period documents API hatası:", error);
      message.error("Dönem dokümanları alınamadı");
      return [];
    }
  }, []);

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
    
    if (window.generalPopup && typeof window.generalPopup.SetContentUrl === 'function') {
      const url = `/Forms/ReactScholarComponents/ReactAddPeriod.aspx?isPopup=true&hideSrc=true&scholarID=${encodeURIComponent(scholarId)}`;
      
      window.generalPopup.SetSize(1000, 600);
      window.generalPopup.SetHeaderText('Bursiyere Dönem Ekle');
      window.generalPopup.SetContentUrl(url);
      window.generalPopup.Show();
      window.generalPopup.OnCloseButtonClick = () => {
        window.location.reload();
      };
    } else {
      message.info("Dönem ekleme popup'ı açılacak...");
    }
  }, [getScholarIdFromUrl]);

  const handleEdit = useCallback((record) => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman düzenleme yapılamaz.");
      return;
    }

    const documentTypeId = record.documentTypeId || 0;
    const recordId = record.id;
    const scholarId = getScholarIdFromUrl();
    // Modal için URL oluşturma
    const modalUrl = `/Forms/Documents/uploadedDocuments.aspx?isPopup=true&hideSrc=true&requestingFormType=6` +
      `&requesterID=${encodeURIComponent(recordId)}` +
      `&documentTypeID=${encodeURIComponent(documentTypeId)}` +
      `&scholarID=${encodeURIComponent(scholarId)}`;

    // Modal state'lerini güncelle
    setCurrentRecord(record);
    setModalUrl(modalUrl);
    setIsModalVisible(true);
  }, [isScholarStarted, getScholarIdFromUrl]);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setModalUrl('');
    setCurrentRecord(null);
    
    // Modal kapandığında verileri yenile
    const scholarId = getScholarIdFromUrl();
    if (periodData?.id) {
      fetchPeriodDocuments(scholarId, periodData.id);
    }
  }, [periodData?.id, getScholarIdFromUrl, fetchPeriodDocuments]);

  const handleDelete = useCallback((record) => {
    console.log("Delete operation:", record);
    message.info("Silme işlemi geliştirilecek");
  }, []);

  const handleEntryDocuments = useCallback(() => {
    const scholarId = getScholarIdFromUrl();
    const periodId = periodData?.PeriodId;

    if (window.generalPopup && typeof window.generalPopup.SetContentUrl === 'function') {
      const url = `/Forms/ReactScholarComponents/ReactEntryDocuments.aspx?isPopup=true&hideSrc=true&scholarID=${encodeURIComponent(scholarId)}&periodId=${encodeURIComponent(periodId)}`;

      window.generalPopup.SetSize(1200, 700);
      window.generalPopup.SetHeaderText('Giriş Dokümanları');
      window.generalPopup.SetContentUrl(url);
      window.generalPopup.Show();
      window.generalPopup.OnCloseButtonClick = () => {
        window.location.reload();
      };
    } else {
      setEntryModalVisible(true);
    }
  }, [getScholarIdFromUrl, periodData?.PeriodId]);

  const handleExitDocuments = useCallback(() => {
    const scholarId = getScholarIdFromUrl();

    if (window.generalPopup && typeof window.generalPopup.SetContentUrl === 'function') {
      const url = `/Forms/Documents/exitDocuments.aspx?isPopup=true&hideSrc=true&scholarID=${encodeURIComponent(scholarId)}`;

      window.generalPopup.SetSize(1200, 700);
      window.generalPopup.SetHeaderText('Çıkış Dokümanları');
      window.generalPopup.SetContentUrl(url);
      window.generalPopup.Show();
      window.generalPopup.OnCloseButtonClick = () => {
        window.location.reload();
      };
    } else {
      setExitModalVisible(true);
    }
  }, [getScholarIdFromUrl]);

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
      bodyStyle={{ padding: '12px' }}
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
              Giriş Dokümanları
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
              Çıkış Dokümanları
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  ), [periodData, academicianData, formatDate, handleEntryDocuments, handleExitDocuments]);

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
      bodyStyle={{ padding: '20px', textAlign: 'center' }}
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
      bodyStyle={{ padding: '8px' }}
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
          }
        ]}
      />
    </Card>
  ), [activeTabKey, periodDocumentsData, periodDocumentColumns, scholarPeriods, scholarPeriodColumns, loading, handleEdit, handleDelete, localizeThis]);

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <MainContent />
      <div style={{ marginTop: '16px' }}>
        <TabContent />
      </div>

      {/* Document Edit Modal */}
      <Modal
        title="Doküman Düzenle"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
        styles={{ body: { height: '500px', padding: 0 } }}
        destroyOnClose={true}
        centered
      >
        {modalUrl && (
          <iframe
            src={modalUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="Document Upload"
          />
        )}
      </Modal>

      {/* Entry Documents Modal */}
      <Modal
        title={
          <span>
            <UploadOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            Giriş Dokümanları
          </span>
        }
        open={entryModalVisible}
        onCancel={() => setEntryModalVisible(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Giriş dokümanları yükleme sayfası burada görüntülenecek.</p>
          <Button type="primary" onClick={() => setEntryModalVisible(false)}>
            Kapat
          </Button>
        </div>
      </Modal>

      {/* Exit Documents Modal */}
      <Modal
        title={
          <span>
            <DownloadOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
            Çıkış Dokümanları
          </span>
        }
        open={exitModalVisible}
        onCancel={() => setExitModalVisible(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Çıkış dokümanları yükleme sayfası burada görüntülenecek.</p>
          <Button type="primary" onClick={() => setExitModalVisible(false)}>
            Kapat
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ScholarInfo;