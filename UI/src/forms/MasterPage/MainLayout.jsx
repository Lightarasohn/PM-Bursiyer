import { Breadcrumb, Layout, Menu, theme, Dropdown, Avatar, Button, Space } from "antd";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserOutlined, LogoutOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons";
import { useLocalization } from "../../tools/localization/LocalizationContext";
import LoginAPI from "../../services/LoginAPI";
import { decryptToken } from "../../tools/cryptoToken/AES-CBC.js";

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const { setLanguage, localizeThis, currentLanguage } = useLocalization();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("Yükleniyor...");
  const [loading, setLoading] = useState(true);
  
  const {
    token: { colorBgContainer, colorPrimary, colorText, colorTextSecondary },
  } = theme.useToken();

  const siderWidth = collapsed ? 80 : 200;

  // Kullanıcı adını getiren fonksiyon
  const getUserName = () => {
    try {
      const encryptedToken = localStorage.getItem("userToken");
      
      if (!encryptedToken) {
        console.log("Token bulunamadı");
        setUsername("Giriş yapınız");
        setLoading(false);
        return;
      }

      const decryptedToken = decryptToken(encryptedToken);
      
      // JWT token'ı parçalara ayır
      const tokenParts = decryptedToken.split('.');
      
      if (tokenParts.length !== 3) {
        throw new Error("Geçersiz JWT token formatı");
      }

      // Base64 decode işlemi için padding ekle
      let payload = tokenParts[1];
      while (payload.length % 4) {
        payload += '=';
      }
      
      const decodedPayload = JSON.parse(atob(payload));
      
      console.log("Payload:", decodedPayload);
      
      // Kullanıcı adını set et
      setUsername(decodedPayload.given_name || "İsim bulunamadı");
      setLoading(false);
      
    } catch (error) {
      console.error("Token decode hatası:", error);
      setUsername("Hata oluştu");
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserName();
  }, []);

  const menuItems = [
    {
      key: "1",
      label: "Bursiyer",
      icon: <UserOutlined />,
      children: [
        {
          key: "1-1",
          label: <Link to="/bursiyer-listesi">Bursiyer Listesi</Link>,
        },
        {
          key: "1-2",
          label: <Link to="/bursiyer-ekle">Bursiyer Ekle</Link>,
        },
        {
          key: "1-3",
          label: <Link to="/scholar-info">Bursiyer Bilgileri</Link>,
        },
      ],
    },
  ];

  // Kullanıcı dropdown menüsü
  const userDropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil Ayarları',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Sistem Ayarları',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
    },
  ];

  const handleUserMenuClick = (e) => {
    switch (e.key) {
      case 'logout':
        // Çıkış yapma işlemi
        localStorage.removeItem("userToken");
        localStorage.removeItem("lang");
        window.location.href = "/login";
        break;
      case 'profile':
        // Profil sayfasına yönlendirme
        console.log('Profil sayfasına yönlendiriliyor...');
        break;
      case 'settings':
        // Ayarlar sayfasına yönlendirme
        console.log('Ayarlar sayfasına yönlendiriliyor...');
        break;
      default:
        break;
    }
  };

  const matchRoot = useMatch("/");

  return (
    <>
      {/* Global CSS */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100vw;
          height: 100vh;
        }
        
        .language-button {
          padding: 6px 12px;
          border: 1px solid #d9d9d9;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.85);
          transition: all 0.2s;
        }
        
        .language-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          color: white;
        }
        
        .language-button.active {
          background: ${colorPrimary};
          border-color: ${colorPrimary};
          color: white;
        }
        
        .user-info {
          color: rgba(255, 255, 255, 0.85);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .user-info:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .user-name {
          font-weight: 500;
          font-size: 14px;
          margin-left: 8px;
        }
      `}</style>

      <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={200}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            height: "100vh",
            overflow: "auto",
            background: "#001529",
            boxShadow: "2px 0 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              height: 32,
              margin: 16,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: collapsed ? '12px' : '16px',
            }}
          >
            {collapsed ? 'PM' : 'Professional Minds'}
          </div>
          <Menu 
            theme="dark" 
            mode="inline" 
            items={menuItems}
            style={{
              borderRight: 0,
              background: 'transparent',
            }}
          />
        </Sider>

        <Layout
          style={{
            marginLeft: siderWidth,
            minHeight: "100vh",
            overflow: "auto",
          }}
        >
          <Header 
            style={{
              padding: "0 24px",
              position: "fixed",
              background: "linear-gradient(90deg, #001529 0%, #002140 100%)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              width: `calc(100% - ${siderWidth}px)`,
              left: siderWidth,
              top: 0,
              zIndex: 1000,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Space size="large">
              {/* Dil Seçimi */}
              <Space size="small">
                <button
                  onClick={() => setLanguage("tr")}
                  className={`language-button ${currentLanguage === "tr" ? "active" : ""}`}
                >
                  🇹🇷 TR
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`language-button ${currentLanguage === "en" ? "active" : ""}`}
                >
                  🇬🇧 EN
                </button>
              </Space>

              {/* Kullanıcı Bilgileri */}
              <Dropdown
                menu={{
                  items: userDropdownItems,
                  onClick: handleUserMenuClick,
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <div className="user-info">
                  <Space>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: colorPrimary,
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                    <span className="user-name">
                      {loading ? "Yükleniyor..." : username}
                    </span>
                    <DownOutlined style={{ fontSize: '10px', opacity: 0.7 }} />
                  </Space>
                </div>
              </Dropdown>
            </Space>
          </Header>
          
          <Content
            style={{
              margin: "80px 24px 80px",
              padding: 24,
              background: "#fff",
              minHeight: "calc(100vh - 160px)",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ minHeight: "100%" }}>
              {matchRoot ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <h1 style={{ 
                    color: colorPrimary, 
                    fontSize: '28px',
                    marginBottom: '16px',
                    fontWeight: '600'
                  }}>
                    {localizeThis("welcomeMessage")}
                  </h1>
                  <p style={{ 
                    color: colorTextSecondary, 
                    fontSize: '16px',
                    maxWidth: '500px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                  }}>
                    Bursiyerlerinizi yönetmek için sol menüden ilgili seçeneği seçiniz.
                  </p>
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </Content>

          <Footer
            style={{
              textAlign: "center",
              position: "fixed",
              bottom: 0,
              left: siderWidth,
              width: `calc(100% - ${siderWidth}px)`,
              background: colorBgContainer,
              borderTop: "1px solid #f0f0f0",
              padding: "16px 24px",
              color: colorTextSecondary,
              fontSize: "14px",
              boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Space>
              <span>Professional Minds ©{new Date().getFullYear()}</span>
              <span>•</span>
              <span>Tüm hakları saklıdır</span>
            </Space>
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default MainLayout;