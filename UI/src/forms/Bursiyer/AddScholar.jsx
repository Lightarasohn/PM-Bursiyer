import {
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
  Breadcrumb,
} from "antd";
import "../../resources/css/AddScholar.css";
import { useEffect, useState } from "react";
import GetAllAcademicianAPI from "../../services/GetAllAcademicianAPI";
import GetAllRequiredDocumentsAPI from "../../services/GetAllRequiredDocumentsAPI";
import GetAllDocumentsAPI from "../../services/GetAllDocumentsAPI";
import AddTermOfScholarDocumentsAPI from "../../services/AddTermOfScholarDocumentsAPI";
import { useLocalization } from "../../tools/localization/LocalizationContext"

const { Title, Text } = Typography;

const BursiyerEkle = () => {
  const {  localizeThis } = useLocalization();
  const [messageApi, contextHolder] = message.useMessage();
  const [academicianOptions, setAcademicianOptions] = useState([]);
  const [isOpenModal, setIsOpenModel] = useState(false);
  const [requiredDocumentsOnExit, setRequiredDocumentsOnExit] = useState([]);
  const [requiredDocumentsOnEntry, setRequiredDocumentsOnEntry] = useState([]);
  const [requiredDocumentsOnAttendance, setRequiredDocumentsOnAttendance] = useState([]);
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

  const formMessage = (text) => {
    messageApi.open({
      type: "success",
      content: text
    })
  }

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
    setIsSubmitting(true)
    values.termEndDate = values.termEndDate.format("YYYY-MM-DD")
    values.termStartDate = values.termStartDate.format("YYYY-MM-DD")
    console.log(values)
    const requestValues = {
      scholarEmail: values.scholarEmail,
      scholarName: values.scholarName,
      termName: values.termName,
      termEndDate: values.termEndDate,
      termStartDate: values.termEndDate,
      termResponsibleAcademician: values.termResponsibleAcademician,
      entryDocuments: values.entryDocuments,
      ongoingDocuments: values.ongoingDocuments,
      exitDocuments: values.exitDocuments
    }
    const response = await AddTermOfScholarDocumentsAPI(requestValues);
    if(!response){
      error();
    }
    formMessage("Scholar Added Successfully");
    setIsSubmitting(false)
  };

  return (
    <>
<Breadcrumb
  style={{ marginBottom: 16 }}
  items={[
    { title: localizeThis("lblMainPage") },
    { title: localizeThis("lblMainPage") }
  ]}
/>

  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    {contextHolder}
    <Card
      title={
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Typography.Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Add New Scholar
          </Typography.Title>
          <Typography.Text type="secondary">
            Create a new scholar profile and assign term details
          </Typography.Text>
        </div>
      }
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Form
        form={form}
        labelAlign="left"
        labelWrap={true}
        layout="vertical"
        name="bursiyer"
        requiredMark={true}
        scrollToFirstError={true}
        variant="outlined"
        clearOnDestroy={false}
        onFinish={handleFinish}
        onFinishFailed={() => error()}
      >
        <Row gutter={[24, 24]}>
          {/* Scholar Information Section */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Scholar Information
                  </Typography.Title>
                </div>
              }
              style={{
                height: '100%',
                borderRadius: '8px',
                border: '1px solid #e6f7ff',
                background: '#fafafa'
              }}
              headStyle={{ background: '#e6f7ff', borderRadius: '8px 8px 0 0' }}
            >
              <div style={{ padding: '8px 0' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      Full Name
                    </span>
                  }
                  name="scholarName"
                  rules={[
                    { required: true, message: 'Scholar name is required' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    placeholder="Enter scholar's full name"
                    size="large"
                    style={{ borderRadius: '6px' }}
                    prefix={
                      <div style={{ color: '#bfbfbf', marginRight: '4px' }}>
                        👤
                      </div>
                    }
                  />
                </Form.Item>
                
                <Form.Item
                  label={
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      Email Address
                    </span>
                  }
                  name="scholarEmail"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                  style={{ marginBottom: '8px' }}
                >
                  <Input
                    placeholder="scholar@university.edu"
                    size="large"
                    style={{ borderRadius: '6px' }}
                    prefix={
                      <div style={{ color: '#bfbfbf', marginRight: '4px' }}>
                        📧
                      </div>
                    }
                  />
                </Form.Item>
              </div>
            </Card>
          </Col>

          {/* Term Information Section */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Term Details
                  </Typography.Title>
                </div>
              }
              style={{
                height: '100%',
                borderRadius: '8px',
                border: '1px solid #e6f7ff',
                background: '#fafafa'
              }}
              headStyle={{ background: '#e6f7ff', borderRadius: '8px 8px 0 0' }}
            >
              <div style={{ padding: '8px 0' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      Term Name
                    </span>
                  }
                  name="termName"
                  rules={[{ required: true, message: 'Term name is required' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    placeholder="e.g., Spring 2024 Research Term"
                    size="large"
                    style={{ borderRadius: '6px' }}
                    prefix={
                      <div style={{ color: '#bfbfbf', marginRight: '4px' }}>
                        📚
                      </div>
                    }
                  />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>
                          Start Date
                        </span>
                      }
                      name="termStartDate"
                      rules={[
                        {
                          required: true,
                          message: 'Start date is required',
                        },
                      ]}
                      style={{ marginBottom: '20px' }}
                    >
                      <DatePicker
                        placeholder="Select start date"
                        size="large"
                        style={{ width: '100%', borderRadius: '6px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>
                          End Date
                        </span>
                      }
                      name="termEndDate"
                      rules={[
                        {
                          required: true,
                          message: 'End date is required',
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const startDate = getFieldValue('startDate');
                            if (!value || !startDate || value.isAfter(startDate)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('End date must be after start date'));
                          },
                        }),
                      ]}
                      style={{ marginBottom: '20px' }}
                    >
                      <DatePicker
                        placeholder="Select end date"
                        size="large"
                        style={{ width: '100%', borderRadius: '6px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      Responsible Academician
                    </span>
                  }
                  name="termResponsibleAcademician"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a responsible academician',
                    },
                  ]}
                  style={{ marginBottom: '8px' }}
                >
                  <Select
                    placeholder="Choose an academician"
                    size="large"
                    style={{ borderRadius: '6px' }}
                    onChange={handleChange}
                    options={academicianOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Documents Section */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Required Documents
                  </Typography.Title>
                </div>
              }
              style={{
                borderRadius: '8px',
                border: '1px solid #fff7e6',
                background: '#fafafa'
              }}
              headStyle={{ background: '#fff7e6', borderRadius: '8px 8px 0 0' }}
            >
              <Row gutter={[24, 16]} style={{ padding: '8px 0' }}>
                <Col xs={24} md={8}>
                  <div style={{
                    padding: '12px',
                    background: '#f6ffed',
                    borderRadius: '6px',
                    border: '1px solid #b7eb8f',
                    marginBottom: '8px'
                  }}>
                    <Typography.Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '4px' }}>
                      Entry Documents
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      Documents required at the beginning of the term
                    </Typography.Text>
                  </div>
                  <Form.Item
                    name="entryDocuments"
                    rules={[
                      {
                        required: true,
                        message: 'Please select entry documents',
                      },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select entry documents"
                      size="large"
                      style={{ borderRadius: '6px' }}
                      options={allRequiredDocuments}
                      onChange={handleChange}
                      
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <div style={{
                    padding: '12px',
                    background: '#fff1f0',
                    borderRadius: '6px',
                    border: '1px solid #ffadd2',
                    marginBottom: '8px'
                  }}>
                    <Typography.Text strong style={{ color: '#f5222d', display: 'block', marginBottom: '4px' }}>
                      Exit Documents
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      Documents required at the end of the term
                    </Typography.Text>
                  </div>
                  <Form.Item
                    name="exitDocuments"
                    rules={[
                      {
                        required: true,
                        message: 'Please select exit documents',
                      },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select exit documents"
                      size="large"
                      style={{ borderRadius: '6px' }}
                      options={allRequiredDocuments}
                      onChange={handleChange}
                      
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <div style={{
                    padding: '12px',
                    background: '#f9f0ff',
                    borderRadius: '6px',
                    border: '1px solid #d3adf7',
                    marginBottom: '8px'
                  }}>
                    <Typography.Text strong style={{ color: '#722ed1', display: 'block', marginBottom: '4px' }}>
                      Ongoing Documents
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      Documents required periodically during the term
                    </Typography.Text>
                  </div>
                  <Form.Item
                    name="ongoingDocuments"
                    rules={[
                      {
                        required: true,
                        message: 'Please select ongoing documents',
                      },
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select ongoing documents"
                      size="large"
                      style={{ borderRadius: '6px' }}
                      options={allRequiredDocuments}
                      onChange={handleChange}
                      
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Submit Button */}
        <Row justify="center" style={{ marginTop: '32px' }}>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              size="large"
              style={{
                borderRadius: '8px',
                padding: '8px 48px',
                height: 'auto',
                fontSize: '16px',
                fontWeight: '500',
                background: isSubmitting ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>✨</span>
                  Create Scholar Profile
                </>
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      <Modal 
        open={isOpenModal} 
        onCancel={() => setIsOpenModel(false)}
        title="Form Error"
        footer={null}
        centered
        style={{ borderRadius: '8px' }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <Typography.Title level={4} style={{ color: '#f5222d' }}>
            Form Validation Error
          </Typography.Title>
          <Typography.Text type="secondary">
            Please check all required fields and try again.
          </Typography.Text>
        </div>
      </Modal>
    </Card>
  </div>
</>
  );
};

export default BursiyerEkle;