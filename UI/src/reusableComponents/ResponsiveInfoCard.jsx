import React from "react";
import { Card, Avatar, Typography, Row, Col, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ResponsiveInfoCard = ({
  mainData,
  additionalSections = [],
  loading = false,
  title = "Bursiyer Bilgileri",
  avatarField = null,
  titleField = null,
  excludeFields = [],
  fieldLabels = {},
}) => {
  const formatLabel = (key) => {
    if (fieldLabels[key]) return fieldLabels[key];
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, "ID")
      .replace(/Email/, "E-posta")
      .replace(/Phone/, "Telefon")
      .replace(/Address/, "Adres")
      .replace(/Name/, "İsim")
      .replace(/Surname/, "Soyisim")
      .replace(/Date/, "Tarih")
      .replace(/Start/, "Başlangıç")
      .replace(/End/, "Bitiş");
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === "") return "Belirtilmemiş";
    if (typeof value === "boolean") return value ? "Evet" : "Hayır";
    if (key.toLowerCase().includes("date") && typeof value === "string") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date.toLocaleDateString("tr-TR");
    }
    return String(value);
  };

  const renderMainDataFields = (data) =>
  Object.entries(data)
    .filter(
      ([key]) =>
        !excludeFields.includes(key) && key !== titleField && key !== avatarField
    )
    .map(([key, value]) => (
      <React.Fragment key={key}>
        <div className="label">{formatLabel(key)}:</div>
        <div className="info-text">{formatValue(key, value)}</div>
      </React.Fragment>
    ));

  const renderAdditionalSections = () =>
    additionalSections.map((section, index) => (
      <div key={index} className="section-block">
        {section.title && (
          <Title level={5} className="section-title">
            {section.title}
          </Title>
        )}
        {Array.isArray(section.data) ? (
          section.data.map((item, i) => (
            <div key={i} className="section-info-grid">
              {item.title && (
                <div className="item-title">
                  <Text strong>{item.title}</Text>
                </div>
              )}
              {Object.entries(item)
                .filter(([key]) => key !== "title")
                .map(([key, value]) => (
  <React.Fragment key={key}>
    <div className="label">{formatLabel(key)}:</div>
    <div className="section-text">{formatValue(key, value)}</div>
  </React.Fragment>
))}
            </div>
          ))
        ) : typeof section.data === "object" ? (
          <div className="section-info-grid">
            {Object.entries(section.data)
              .filter(([key]) => !excludeFields.includes(key))
              .map(([key, value]) => (
                <React.Fragment key={key}>
                  <Text strong>{formatLabel(key)}:</Text>
                  <Text className="section-text">{formatValue(key, value)}</Text>
                </React.Fragment>
              ))}
          </div>
        ) : (
          <Text>Bu bölümde veri bulunmamaktadır.</Text>
        )}
      </div>
    ));

  return (
    <Card
      title={title}
      style={{
        width: "100%",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : mainData ? (
        <Row gutter={[24, 24]}>
          {/* Sol: Bursiyer Bilgileri */}
          <Col xs={24} md={12}>
            <div className="profile-container">
              <div className="profile-header">
                <Avatar
                  size={80}
                  src={mainData[avatarField]}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff", marginRight: 16 }}
                />
                {titleField && (
                  <Title level={4} className="profile-name">
                    {mainData[titleField]}
                  </Title>
                )}
              </div>
              <div className="main-info-grid">{renderMainDataFields(mainData)}</div>
            </div>
          </Col>

          {/* Sağ: Dönem/Ek Bilgiler */}
          <Col xs={24} md={12}>
            {renderAdditionalSections()}
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Title level={4}>Veri bulunamadı</Title>
          <p>Bilgiler yüklenemedi.</p>
        </div>
      )}

      <style jsx>{`
        .profile-container {
          display: flex;
          flex-direction: column;
        }

        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        @media (max-width: 576px) {
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-header .ant-avatar {
            margin-bottom: 8px;
          }
        }

        .profile-name {
          margin: 0;
          font-size: 20px;
        }

        .main-info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 12px;
  row-gap: 8px;
  align-items: start; /* Satırda üstten hizalama */
}

.label {
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  text-align: left; /* Sol hizalama */
  align-self: start; /* Dikeyde yukarı hizalama */
}

        .info-text {
          word-break: break-word;
          font-size: 13px;
        }

        .section-block {
          margin-bottom: 24px;
        }

        .section-title {
          margin-bottom: 12px;
          font-size: 16px;
          color: #1d39c4;
        }

        .section-info-grid {
          display: grid;
          grid-template-columns: 110px 1fr;
          column-gap: 12px;
          row-gap: 8px;
        }

        .item-title {
          grid-column: 1 / -1;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #d9d9d9;
          font-size: 14px;
          color: #1890ff;
        }

        .section-text {
          word-break: break-word;
          font-size: 13px;
        }
      `}</style>
    </Card>
  );
};

export default ResponsiveInfoCard;
