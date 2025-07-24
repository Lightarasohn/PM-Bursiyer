import {
  Alert,
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  message,
  Divider,
  Space,
} from "antd";
import { UserOutlined, CalendarOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import "./BursiyerEkle.css";
import { useEffect, useState } from "react";
import GetAllAcademicianAPI from "../API/GetAllAcademicianAPI";
import AddScholarAPI from "../API/AddScholarAPI";
import addTermAPI from "../API/AddTermAPI";
import addTermOfScholarAPI from "../API/addTermOfScholarAPI";
import GetAllRequiredDocumentsAPI from "../API/GetAllRequiredDocumentsAPI";
import GetAllDocumentsAPI from "../API/GetAllDocumentsAPI";
import AddTermDocumentTypesAPI from "../API/AddTermDocumentTypesAPI";
import GetSystemConstantsAPI from "../API/GetSystemConstants";
import AddTermOfScholarDocumentsAPI from "../API/AddTermOfScholarDocumentsAPI";

const { Title, Text } = Typography;

const BursiyerEkle = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [academicianOptions, setAcademicianOptions] = useState([]);
  const [isOpenModal, setIsOpenModel] = useState(false);
  const [requiredDocumentsOnExit, setRequiredDocumentsOnExit] = useState([]);
  const [requiredDocumentsOnEntry, setRequiredDocumentsOnEntry] = useState([]);
  const [requiredDocumentsOnAttendance, setRequiredDocumentsOnAttendance] =
    useState([]);
  const [allRequiredDocuments, setAllRequiredDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAllRequiredDocuments = async () => {
    try {
      const allDocuments = await GetAllDocumentsAPI();
      const requiredDocumentsConstants = await GetAllRequiredDocumentsAPI();

      const allRequiredIds = new Set();

      requiredDocumentsConstants.forEach((item) => {
        const valueInt = item.valueText.split(",").map((id) => parseInt(id));
        const requiredDocumentsObjects = allDocuments
          .filter((x) => valueInt.find((y) => y === x.id))
          .map((item) => {
            return { label: item.name, value: item.id };
          });

        valueInt.forEach((id) => allRequiredIds.add(id));

        switch (item.constantName) {
          case "requiredDocumentTypesOnEntry":
            setRequiredDocumentsOnEntry(requiredDocumentsObjects);
            break;
          case "requiredDocumentTypesOnAttendance":
            setRequiredDocumentsOnAttendance(requiredDocumentsObjects);
            break;
          case "requiredDocumentTypesOnExit":
            setRequiredDocumentsOnExit(requiredDocumentsObjects);
            break;
          default:
            break;
        }
      });

      const uniqueAllRequiredDocuments = allDocuments.filter((doc) =>
        allRequiredIds.has(doc.id)
      );

      setAllRequiredDocuments(
        uniqueAllRequiredDocuments.map((item) => {
          return { label: item.name, value: item.id };
        })
      );
    } catch (error) {
      console.error("Error fetching documents:", error);
      messageApi.open({
        type: "error",
        content: "Failed to load documents. Please refresh the page.",
      });
    }
  };

  useEffect(() => {
    getAllRequiredDocuments();
  }, []);

  const [form] = Form.useForm();

  useEffect(() => {
    if (requiredDocumentsOnEntry.length > 0) {
      form.setFieldsValue({
        entryDocuments: requiredDocumentsOnEntry.map((doc) => doc.value),
        exitDocuments: requiredDocumentsOnExit.map((doc) => doc.value),
        ongoingDocuments: requiredDocumentsOnAttendance.map((doc) => doc.value),
      });
    }
  }, [
    requiredDocumentsOnEntry,
    requiredDocumentsOnExit,
    requiredDocumentsOnAttendance,
    form,
  ]);

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Error in form",
    });
  };

  const handleChange = (val) => {
    console.log(val);
  };

  const fetchAcademician = async () => {
    try {
      const response = await GetAllAcademicianAPI();
      const academicianNames = response.map((x) => ({
        label: x.nameSurname,
        value: x.id,
      }));
      setAcademicianOptions(academicianNames);
    } catch (error) {
      console.error("Error fetching academicians:", error);
      messageApi.open({
        type: "error",
        content: "Failed to load academicians. Please refresh the page.",
      });
    }
  };

  useEffect(() => {
    fetchAcademician();
  }, []);

  const handleFinish = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.log(values);
      // Scholar ekleme
      const scholarValues = {
        nameSurname: values.nameSurname,
        email: values.email,
      };

      const scholarResponse = await AddScholarAPI(scholarValues);
      if (!scholarResponse) {
        messageApi.open({
          type: "error",
          content: "Scholar could not be added. Please try again.",
        });
        return;
      }

      // Term ekleme
      const termValues = {
        name: values.name,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        responsibleAcademician: values.responsibleAcademician,
      };

      const termResponse = await addTermAPI(termValues);

      if (!termResponse) {
        messageApi.open({
          type: "error",
          content: "Term could not be added. Please try again.",
        });
        return;
      }

      // TermDocumentTypes ekleme
      const allDocIds = [
        ...(values.entryDocuments || []),
        ...(values.exitDocuments || []),
        ...(values.ongoingDocuments || []),
      ];

      const uniqueDocIds = Array.from(new Set(allDocIds));

      const getListType = (docId) => {
        if ((values.exitDocuments || []).includes(docId)) return "EXIT";
        if ((values.ongoingDocuments || []).includes(docId)) return "ONGOING";
        return "ENTRY";
      };
      console.log(uniqueDocIds);

      for (const docId of uniqueDocIds) {
        const listType = getListType(docId);

        const payload = {
          termId: termResponse.id,
          documentTypeId: docId,
          listType,
        };

        const termDocumentTypeResponse = await AddTermDocumentTypesAPI(payload);
        if (!termDocumentTypeResponse) {
          messageApi.open({
            type: "error",
            content:
              "Necessary documents could not be added to the created term. Please try again.",
          });
          return;
        }
      }

      // TermOfScholar ekleme
      const termOfScholarValues = {
        scholarId: scholarResponse.id,
        termId: termResponse.id,
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
      };

      const termOfScholarResponse = await addTermOfScholarAPI(
        termOfScholarValues
      );

      if (!termOfScholarResponse) {
        messageApi.open({
          type: "error",
          content:
            "Scholar-Term relation could not be created. Please try again.",
        });
        return;
      }

      // TermOfScholarDocuments ekleme
      if (values.entryDocuments && values.entryDocuments.length > 0) {
        for (const item of values.entryDocuments) {
          const TermOfScholarDocumentValues = {
            scholarId: scholarResponse.id,
            termId: termResponse.id,
            documentTypeId: item,
            realUploadDate: null,
            expectedUploadDate: termResponse.startDate,
            listType: "ENTRY",
          };

          const termDocumentTypeResponse = await AddTermOfScholarDocumentsAPI(
            TermOfScholarDocumentValues
          );
          if (!termDocumentTypeResponse) {
            messageApi.open({
              type: "error",
              content:
                "Entry documents could not be added to the created term of the scholar. Please try again.",
            });
            return;
          }
        }
      }

      // Exit documents için
      if (values.exitDocuments && values.exitDocuments.length > 0) {
        for (const item of values.exitDocuments) {
          const TermOfScholarDocumentValues = {
            scholarId: scholarResponse.id,
            termId: termResponse.id,
            documentTypeId: item,
            realUploadDate: null,
            expectedUploadDate: termResponse.endDate,
            listType: "EXIT",
          };

          const termDocumentTypeResponse = await AddTermOfScholarDocumentsAPI(
            TermOfScholarDocumentValues
          );
          if (!termDocumentTypeResponse) {
            messageApi.open({
              type: "error",
              content:
                "Exit documents could not be added to the created term of the scholar. Please try again.",
            });
            return;
          }
        }
      }

      // Ongoing documents için
      if (values.ongoingDocuments && values.ongoingDocuments.length > 0) {
        const ongoingDocumentUploadRateResponse = await GetSystemConstantsAPI(
          "ongoing"
        );
        const ongoingDocumentUploadRate =
          ongoingDocumentUploadRateResponse?.[0];

        if (!ongoingDocumentUploadRate) {
          messageApi.open({
            type: "error",
            content:
              "Could not get ongoing document upload rate. Please try again.",
          });
          return;
        }

        const uploadInterval = parseInt(ongoingDocumentUploadRate, 10);

        for (const item of values.ongoingDocuments) {
          let currentDate = new Date(termResponse.startDate);
          const endDate = new Date(termResponse.endDate);

          while (currentDate <= endDate) {
            const TermOfScholarDocumentValues = {
              scholarId: scholarResponse.id,
              termId: termResponse.id,
              documentTypeId: item,
              realUploadDate: null,
              expectedUploadDate: currentDate.toISOString().split("T")[0],
              listType: "ONGOING",
            };

            const termDocumentTypeResponse = await AddTermOfScholarDocumentsAPI(
              TermOfScholarDocumentValues
            );
            if (!termDocumentTypeResponse) {
              messageApi.open({
                type: "error",
                content:
                  "Ongoing documents could not be added to the created term. Please try again.",
              });
              return;
            }
            currentDate.setMonth(currentDate.getMonth() + uploadInterval);
          }
        }
      }

      messageApi.open({
        type: "success",
        content: "Scholar added successfully!",
      });

      form.resetFields();
    } catch (error) {
      console.error("Error in form submission:", error);
      messageApi.open({
        type: "error",
        content: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {contextHolder}
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px' 
        }}>
          <Title level={2} style={{ 
            color: '#1890ff', 
            marginBottom: '8px' 
          }}>
            Add New Scholar
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Fill in the information below to register a new scholar
          </Text>
        </div>

        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="bursiyer"
            requiredMark="optional"
            scrollToFirstError={true}
            onFinish={handleFinish}
            onFinishFailed={() => error()}
            size="large"
          >
            <Row gutter={32}>
              
              <Col xs={24} lg={8}>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#262626',
                    marginBottom: '16px'
                  }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    Scholar Information
                  </Title>
                  
                  <Form.Item
                    label="Full Name"
                    name="nameSurname"
                    rules={[{ required: true, message: "Scholar name is required" }]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input 
                      placeholder="Enter scholar's full name"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: "Email is required" },
                      { type: "email", message: "Please enter a valid email address" },
                    ]}
                    style={{ marginBottom: '0' }}
                  >
                    <Input 
                      placeholder="scholar@university.edu"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </div>
              </Col>

              
              <Col xs={24} lg={8}>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#262626',
                    marginBottom: '16px'
                  }}>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    Term Information
                  </Title>
                  
                  <Form.Item
                    label="Term Name"
                    name="name"
                    rules={[{ required: true, message: "Term name is required" }]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input 
                      placeholder="e.g., Spring 2024"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Responsible Academician"
                    name="responsibleAcademician"
                    rules={[
                      { required: true, message: "Responsible academician is required" },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      placeholder="Select academician"
                      options={academicianOptions}
                      onChange={handleChange}
                      style={{ borderRadius: '8px' }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Start Date"
                    name="startDate"
                    rules={[
                      { required: true, message: "Start date is required" },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <DatePicker 
                      style={{ width: "100%", borderRadius: '8px' }}
                      placeholder="Select start date"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="End Date"
                    name="endDate"
                    rules={[
                      { required: true, message: "End date is required" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const startDate = getFieldValue("startDate");
                          if (!value || !startDate || value.isAfter(startDate)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("End date must be after start date")
                          );
                        },
                      }),
                    ]}
                    style={{ marginBottom: '0' }}
                  >
                    <DatePicker 
                      style={{ width: "100%", borderRadius: '8px' }}
                      placeholder="Select end date"
                    />
                  </Form.Item>
                </div>
              </Col>

              
              <Col xs={24} lg={8}>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#262626',
                    marginBottom: '16px'
                  }}>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    Required Documents
                  </Title>
                  
                  <Form.Item
                    label="Entry Documents"
                    name="entryDocuments"
                    rules={[
                      { required: true, message: "Entry documents are required" },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select entry documents"
                      options={allRequiredDocuments}
                      onChange={handleChange}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Ongoing Documents"
                    name="ongoingDocuments"
                    rules={[
                      { required: true, message: "Ongoing documents are required" },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select ongoing documents"
                      options={allRequiredDocuments}
                      onChange={handleChange}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Exit Documents"
                    name="exitDocuments"
                    rules={[
                      { required: true, message: "Exit documents are required" },
                    ]}
                    style={{ marginBottom: '0' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select exit documents"
                      options={allRequiredDocuments}
                      onChange={handleChange}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>

            
            <div style={{ 
              textAlign: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => form.resetFields()}
                  style={{ 
                    borderRadius: '8px',
                    minWidth: '120px'
                  }}
                >
                  Reset Form
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    minWidth: '120px',
                    background: isSubmitting ? undefined : '#1890ff'
                  }}
                >
                  {isSubmitting ? "Processing..." : "Add Scholar"}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>

      <Modal 
        open={isOpenModal} 
        onCancel={() => setIsOpenModel(false)}
        footer={null}
        centered
      >
        <Alert
          message="Form Error"
          description="There was an error processing your form. Please check your inputs and try again."
          type="error"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default BursiyerEkle;