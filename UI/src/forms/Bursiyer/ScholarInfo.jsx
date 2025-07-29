import React, { useState, useEffect } from 'react';
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

const { Title, Text } = Typography;

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


  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "Belirtilmemiş";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR");
  };

  const getScholarIdFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("targetID");
  };

  const isScholarStarted = () => {
    return periodData && periodData.ScholarStartDate !== null;
  };

  const isPeriodDeletedOrCompleted = () => {
    if (!periodData) return true;
    
    if (periodData.DELETED === true || periodData.IsDeleted === true) return true;
    
    if (periodData.REAL_END_DATE || periodData.RealEndDate) {
      const endDate = new Date(periodData.REAL_END_DATE || periodData.RealEndDate);
      const today = new Date();
      if (endDate < today) return true;
    }
    
    if (periodData.ExitCompleted === true || periodData.IsExitCompleted === true) return true;
    
    return false;
  };

  // API calls
  const fetchScholarData = async (scholarId) => {
    const scholar = await GetScholarAPI(scholarId);
    setScholarData(scholar);
    if (!scholar) {
      message.error("Bursiyer bilgileri alınamadı");
      setLoading(false);
      return;
    }
    setScholarData(scholar);
  };

  const fetchPeriodData = async (scholarId) => {
    try {
      const response = await fetch(`/api/reactScholar/getPeriodInfoById?targetID=${scholarId}`);
      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setPeriodData(data);
    } catch (error) {
      console.error("Period API hatası:", error);
      message.error("Dönem bilgileri alınamadı");
    }
  };

  const fetchAcademicianData = async (academicianId) => {
    try {
      const response = await fetch(`/api/reactScholar/getAcademicianNameByPeriodId?targetID=${academicianId}`);
      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setAcademicianData(data);
    } catch (error) {
      console.error("Academician API hatası:", error);
      message.error("Akademisyen bilgileri alınamadı");
    }
  };

  const fetchPeriodDocuments = async (scholarId, periodId) => {
    try {
      const response = await fetch(`/api/reactScholar/getPeriodDocuments?scholarID=${scholarId}&periodID=${periodId}`);
      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setPeriodDocumentsData(data || []);
    } catch (error) {
      console.error("Period Documents API hatası:", error);
      message.error("Dönem dokümanları alınamadı");
    }
  };

  const fetchScholarPeriods = async (scholarId) => {
    try {
      const response = await fetch(`/api/reactScholar/getScholarPeriods?targetID=${scholarId}`);
      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setScholarPeriods(data || []);
    } catch (error) {
      console.error("Scholar Periods API hatası:", error);
      message.error("Bursiyer dönemleri alınamadı");
    }
  };

  // Event handlers
  const handleShowPeriodInfo = () => {
    setActiveTabKey("2");
  };

  const handleAddPeriodToScholar = () => {
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
  };

  const handleEdit = (record) => {
    if (!isScholarStarted()) {
      message.warning("Bursiyerin dönemi henüz başlamadığı için doküman düzenleme yapılamaz.");
      return;
    }

    const documentTypeId = record.DOCUMENT_TYPE_ID || 0;
    const recordId = record.ID;
    const scholarId = getScholarIdFromUrl();

    if (window.generalPopup && typeof window.generalPopup.SetContentUrl === 'function') {
      const url = `/Forms/Documents/uploadedDocuments.aspx?isPopup=true&hideSrc=true&requestingFormType=6` +
        `&requesterID=${encodeURIComponent(recordId)}` +
        `&documentTypeID=${encodeURIComponent(documentTypeId)}` +
        `&scholarID=${encodeURIComponent(scholarId)}`;

      window.generalPopup.SetSize(1200, 600);
      window.generalPopup.SetHeaderText('Doküman Yükle');
      window.generalPopup.SetContentUrl(url);
      window.generalPopup.Show();
      window.generalPopup.OnCloseButtonClick = () => {
        window.location.href = `/Forms/ReactScholarComponents/ReactScholarInfo.aspx?scholarID=${encodeURIComponent(scholarId)}`;
      };
    } else {
      message.error("generalPopup bulunamadı!");
    }
  };

  const handleDelete = (record) => {
    console.log("Delete operation:", record);
    message.info("Silme işlemi geliştirilecek");
  };

  const handleEntryDocuments = () => {
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
  };

  const handleExitDocuments = () => {
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
  };

  // Effects
  useEffect(() => {
    const scholarId = getScholarIdFromUrl();
    if (!scholarId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchScholarData(scholarId),
        fetchPeriodData(scholarId),
        fetchScholarPeriods(scholarId)
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (periodData?.ResponsibleAcademicianId) {
      fetchAcademicianData(periodData.ResponsibleAcademicianId);
    }
  }, [periodData]);

  useEffect(() => {
    if (periodData?.PeriodId) {
      const scholarId = getScholarIdFromUrl();
      fetchPeriodDocuments(scholarId, periodData.PeriodId);
    }
  }, [periodData]);

  // Table columns
  const periodDocumentColumns = [
    {
      title: 'Doküman Türü',
      dataIndex: 'DOCUMENT_TYPE',
      key: 'DOCUMENT_TYPE',
      width: 180,
    },
    {
      title: 'Liste Tipi',
      dataIndex: 'LIST_TYPE',
      key: 'LIST_TYPE',
      width: 120,
    },
    {
      title: 'Beklenen Yükleme Tarihi',
      dataIndex: 'EXPECTED_UPLOAD_DATE',
      key: 'EXPECTED_UPLOAD_DATE',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Gerçek Yükleme Tarihi',
      dataIndex: 'REAL_UPLOAD_DATE',
      key: 'REAL_UPLOAD_DATE',
      width: 160,
      render: (date) => formatDate(date),
    },
  ];

  const scholarPeriodColumns = [
    {
      title: 'Dönem Adı',
      dataIndex: 'PERIOD_NAME',
      key: 'PERIOD_NAME',
      width: 180,
    },
    {
      title: 'Akademisyen',
      dataIndex: 'ACADEMICIAN_NAME',
      key: 'ACADEMICIAN_NAME',
      width: 180,
    },
    {
      title: 'Burs Türü',
      dataIndex: 'SCHOLAR_TYPE_NAME',
      key: 'SCHOLAR_TYPE_NAME',
      width: 150,
    },
    {
      title: 'Gerçek Başlangıç',
      dataIndex: 'REAL_START_DATE',
      key: 'REAL_START_DATE',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Gerçek Bitiş',
      dataIndex: 'REAL_END_DATE',
      key: 'REAL_END_DATE',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Beklenen Başlangıç',
      dataIndex: 'EXPECTED_START_DATE',
      key: 'EXPECTED_START_DATE',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Beklenen Bitiş',
      dataIndex: 'EXPECTED_END_DATE',
      key: 'EXPECTED_END_DATE',
      width: 160,
      render: (date) => formatDate(date),
    },
  ];

  // Localization function (mock)
  const localizeThis = (key) => {
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
  };

  // Components
  const HeaderSection = () => (
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
  );

  const PeriodInfoCard = () => (
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
  );

  const PeriodAlternativeCard = () => (
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
  );

  const MainContent = () => {
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
  };

  const TabContent = () => (
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
  );

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <MainContent />
      <div style={{ marginTop: '16px' }}>
        <TabContent />
      </div>

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