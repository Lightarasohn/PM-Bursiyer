import { useEffect, useState } from "react";
import { Card, Descriptions, Avatar, Skeleton, Row, Col, Typography, Grid } from "antd";
import { UserOutlined, MailOutlined, IdcardOutlined, PhoneOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import GetScholarAPI from "../API/GetScholarAPI";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const ScholarInfo = () => {
  const [scholarData, setScholarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const screens = useBreakpoint();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const scholarId = query.get("targetID");

    if (!scholarId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const response = await GetScholarAPI(scholarId);
        setScholarData(response);
      } catch (error) {
        console.error("API hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  const descriptionsColumn = 1;

  return (
    <Row justify="center" style={{ padding: 20 }}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24}>
        <Card
          style={{
            borderRadius: 12,
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: 24,
          }}
        >
          {loading ? (
            <Skeleton active avatar paragraph={{ rows: 5 }} />
          ) : scholarData ? (
            <Row gutter={24} align="stretch">
              {/* Sol taraf: Bursiyer Bilgileri */}
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                  <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
                  <div style={{ marginLeft: 20 }}>
                    <Title level={3} style={{ marginBottom: 4, textAlign: "left" }}>
                      {scholarData.nameSurname}
                    </Title>
                  </div>
                </div>

               <Descriptions
  column={1}
  bordered
  size="middle"
  labelStyle={{
    fontWeight: 600,
    width: 150,
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  }}
  contentStyle={{
    fontSize: 15,
    backgroundColor: "#fff",
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    minWidth: 0,
  }}
                >
                  <Descriptions.Item label={<><MailOutlined /> E-posta</>}>
                    {scholarData.email || "Belirtilmemiş"}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><IdcardOutlined /> Durum</>}>
                    {scholarData.deleted ? "Silinmiş" : "Aktif"}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined /> Telefon</>}>
                    {"Veri yok"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {/* Sağ taraf: Dönem Bilgileri */}
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
                style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}
              >
                <Title level={4} style={{ textAlign: "left", marginBottom: 16, marginTop: 0 }}>
                  Dönem Bilgisi
                </Title>
              <Descriptions
  column={1}
  bordered
  size="middle"
  labelStyle={{
    fontWeight: 600,
    width: 150,
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  }}
  contentStyle={{
    fontSize: 15,
    backgroundColor: "#fff",
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    minWidth: 0,
  }}
  >
                  <Descriptions.Item label="Dönem Adı">2025 Güz</Descriptions.Item>
                  <Descriptions.Item label="Başlangıç Tarihi">01.09.2025</Descriptions.Item>
                  <Descriptions.Item label="Bitiş Tarihi">31.12.2025</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Title level={4}>Veri bulunamadı</Title>
              <p>Scholar ID bulunamadı veya veri alınamadı.</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ScholarInfo;
