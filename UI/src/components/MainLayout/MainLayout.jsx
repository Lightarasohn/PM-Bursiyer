import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Link, Outlet, useMatch } from "react-router-dom";
import "./MainLayout.css";
import { useState } from "react";
import Sider from "antd/es/layout/Sider";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { UserOutlined } from "@ant-design/icons";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items = [
    {
      key: "1",
      label: "Bursiyer",
      icon: <UserOutlined />,
      children: [
        {
          key: "1-1",
          label: <Link to="/bursiyer-listesi">Bursiyer Listesi</Link>
        },
        {
          key: "1-2",
          label: <Link to="/bursiyer-ekle">Bursiyer Ekle</Link>,
        }
      ],
    },
  ];

  const matchRoot = useMatch("/");
  
  return (
    <>
      <Layout style={{ height: "100vh", width: "100vw" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="demo-logo-vertical" style={{ marginBottom: 32 }}>Deneme</div>
            <Menu
              theme="dark"
              mode="inline"
              items={items}
              style={{}}
            />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }} />
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb
              style={{ margin: "16px 0" }}
              items={[{ title: "User" }, { title: "Bill" }]}
            />
            <div>
              {matchRoot ? (
                <h1>Main Layout</h1>
              ) : (
                <Outlet />
              )}
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default MainLayout;
