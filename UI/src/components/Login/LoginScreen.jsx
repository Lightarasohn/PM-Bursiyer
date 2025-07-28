import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
  Tabs,
  Row,
  Col,
  Divider,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useLocalization } from "../../Localization/LocalizationContext";
import "./LoginScreen.css";
import LoginAPI from "../API/LoginAPI";

const { Title, Text, Link } = Typography;

const LoginScreen = () => {
  const { localizeThis } = useLocalization();
  const [messageApi, contextHolder] = message.useMessage();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoginLoading(true);
    try {
      console.log("Login values:", values);
      const ValuesToSend = {
        email: values.email,
        password: values.password,
      }
      const response = await LoginAPI(ValuesToSend);
      if(response){
        messageApi.success("Login successful!");
        localStorage.setItem("userToken", response.token);
        localStorage.setItem("lang", response.language);
        window.location.href = "/"; 
      } else {
        messageApi.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      messageApi.error("Login failed. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setRegisterLoading(true);
    try {
      console.log("Register values:", values);
      // Burada register API çağrısı yapılacak
      messageApi.success("Registration successful!");
      setActiveTab("login");
    } catch (error) {
      messageApi.error("Registration failed. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const LoginForm = () => (
    <Form
      form={loginForm}
      name="login"
      onFinish={handleLogin}
      layout="vertical"
      size="large"
      requiredMark={false}
    >
      <Form.Item
        label={
          <span style={{ fontWeight: "500", fontSize: "14px" }}>
            {localizeThis("emailLabel") || "Email Address"}
          </span>
        }
        name="email"
        rules={[
          { required: true, message: "Please enter your email!" },
          { type: "email", message: "Please enter a valid email address!" },
        ]}
        style={{ marginBottom: "20px" }}
      >
        <Input
          prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
          placeholder="admin@university.edu"
          style={{ borderRadius: "8px", padding: "12px" }}
        />
      </Form.Item>

      <Form.Item
        label={
          <span style={{ fontWeight: "500", fontSize: "14px" }}>
            {localizeThis("passwordLabel") || "Password"}
          </span>
        }
        name="password"
        rules={[{ required: true, message: "Please enter your password!" }]}
        style={{ marginBottom: "24px" }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
          placeholder="Enter your password"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          style={{ borderRadius: "8px", padding: "12px" }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loginLoading}
          block
          style={{
            borderRadius: "8px",
            height: "48px",
            fontSize: "16px",
            fontWeight: "500",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          }}
        >
          {loginLoading ? "Signing In..." : "Sign In"}
        </Button>
      </Form.Item>

      <div style={{ textAlign: "center" }}>
        <Link
          style={{ color: "#667eea", fontSize: "14px" }}
          onClick={() => messageApi.info("Password reset feature coming soon!")}
        >
          Forgot your password?
        </Link>
      </div>
    </Form>
  );

  const RegisterForm = () => (
    <Form
      form={registerForm}
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      size="large"
      requiredMark={false}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: "500", fontSize: "14px" }}>
                First Name
              </span>
            }
            name="firstName"
            rules={[
              { required: true, message: "Please enter your first name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
            ]}
            style={{ marginBottom: "20px" }}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="John"
              style={{ borderRadius: "8px", padding: "12px" }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: "500", fontSize: "14px" }}>
                Last Name
              </span>
            }
            name="lastName"
            rules={[
              { required: true, message: "Please enter your last name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
            ]}
            style={{ marginBottom: "20px" }}
          >
            <Input
              placeholder="Doe"
              style={{ borderRadius: "8px", padding: "12px" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={
          <span style={{ fontWeight: "500", fontSize: "14px" }}>
            Email Address
          </span>
        }
        name="email"
        rules={[
          { required: true, message: "Please enter your email!" },
          { type: "email", message: "Please enter a valid email address!" },
        ]}
        style={{ marginBottom: "20px" }}
      >
        <Input
          prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
          placeholder="john.doe@university.edu"
          style={{ borderRadius: "8px", padding: "12px" }}
        />
      </Form.Item>

      <Form.Item
        label={
          <span style={{ fontWeight: "500", fontSize: "14px" }}>
            Password
          </span>
        }
        name="password"
        rules={[
          { required: true, message: "Please enter your password!" },
          { min: 6, message: "Password must be at least 6 characters!" },
        ]}
        style={{ marginBottom: "20px" }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
          placeholder="Create a strong password"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          style={{ borderRadius: "8px", padding: "12px" }}
        />
      </Form.Item>

      <Form.Item
        label={
          <span style={{ fontWeight: "500", fontSize: "14px" }}>
            Confirm Password
          </span>
        }
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
        style={{ marginBottom: "24px" }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
          placeholder="Confirm your password"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          style={{ borderRadius: "8px", padding: "12px" }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={registerLoading}
          block
          style={{
            borderRadius: "8px",
            height: "48px",
            fontSize: "16px",
            fontWeight: "500",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          }}
        >
          {registerLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: "login",
      label: (
        <span style={{ fontSize: "16px", fontWeight: "500" }}>
          <UserOutlined style={{ marginRight: "8px" }} />
          Sign In
        </span>
      ),
      children: <LoginForm />,
    },
    {
      key: "register",
      label: (
        <span style={{ fontSize: "16px", fontWeight: "500" }}>
          <MailOutlined style={{ marginRight: "8px" }} />
          Sign Up
        </span>
      ),
      children: <RegisterForm />,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {contextHolder}
      
      <Row justify="center" align="middle" style={{ width: "100%", minHeight: "100vh" }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
          {/* Logo/Brand Section */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              🎓
            </div>
            <Title
              level={2}
              style={{
                margin: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "600",
              }}
            >
              Scholar Management System
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Welcome to the academic portal
            </Text>
          </div>

          {/* Main Card */}
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              border: "none",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              size="large"
              style={{
                marginBottom: "0",
              }}
              tabBarStyle={{
                borderBottom: "2px solid #f0f0f0",
                marginBottom: "32px",
              }}
              items={tabItems}
            />
          </Card>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              © {new Date().getFullYear()} University Scholar Management System
            </Text>
            <br />
            <Space split={<Divider type="vertical" />} style={{ marginTop: "8px" }}>
              <Link
                style={{ color: "#8c8c8c", fontSize: "12px" }}
                onClick={() => messageApi.info("Privacy policy coming soon!")}
              >
                Privacy Policy
              </Link>
              <Link
                style={{ color: "#8c8c8c", fontSize: "12px" }}
                onClick={() => messageApi.info("Terms of service coming soon!")}
              >
                Terms of Service
              </Link>
              <Link
                style={{ color: "#8c8c8c", fontSize: "12px" }}
                onClick={() => messageApi.info("Support contact coming soon!")}
              >
                Support
              </Link>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginScreen;