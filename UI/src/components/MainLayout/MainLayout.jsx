import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { useLocalization } from "../../Localization/LocalizationContext";

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const { setLanguage, language, t } = useLocalization();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const siderWidth = collapsed ? 80 : 200;

  const items = [
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

  const matchRoot = useMatch("/");

  return (
    <>
      {/* Global CSS için aşağıdaki stil body ve html için uygun */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100vw;
          height: 100vh;
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
          }}
        >
          <Menu theme="dark" mode="inline" items={items} />
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
              padding: "0 20px",
              background: "black",
              position: "fixed",
              width: `calc(100% - ${siderWidth}px)`,
              left: siderWidth,
              top: 0,
              zIndex: 1000,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {/* Bayrak butonları */}
            <div>
              <button
                onClick={() => setLanguage("tr")}
                style={{
                  marginRight: 10,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                TR
              </button>
              <button
                onClick={() => setLanguage("en")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                EN
              </button>
            </div>
          </Header>
          
          <Content
            style={{
              margin: "64px 16px 70px",
              padding: 24,
              background: "#fff",
              minHeight: "calc(100vh - 134px)", // 64 header + 70 footer
            }}
          >
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: "User" }, { title: "Bill" }]} />
            <div style={{ minHeight: "100%" }}>
              {matchRoot ? <h1>Main Layout</h1> : <Outlet />}
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
            }}
          >
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default MainLayout;