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
} from "antd";
import "./BursiyerEkle.css";
import { useEffect, useState } from "react";
import GetAllAcademicianAPI from "../API/GetAllAcademicianAPI";
import AddScholarAPI from "../API/AddScholarAPI";
import addTermAPI from "../API/AddTermAPI";
import addTermOfScholarAPI from "../API/addTermOfScholarAPI";
import GetAllRequiredDocumentsAPI from "../API/GetAllRequiredDocumentsAPI";
import GetAllDocumentsAPI from "../API/GetAllDocumentsAPI";

const BursiyerEkle = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [academicianOptions, setAcademicianOptions] = useState([]);
  const [isOpenModal, setIsOpenModel] = useState(false);
  const [requiredDocumentsOnExit, setRequiredDocumentsOnExit] = useState([]);
  const [requiredDocumentsOnEntry, setRequiredDocumentsOnEntry] = useState([]);
  const [requiredDocumentsOnAttendance, setRequiredDocumentsOnAttendance] =
    useState([]);
  const [allRequiredDocuments, setAllRequiredDocuments] = useState([]);

  const getAllRequiredDocuments = async () => {
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

      // Tüm ID'leri topla
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

    // Unique dokümanlari filtrele
    const uniqueAllRequiredDocuments = allDocuments.filter((doc) =>
      allRequiredIds.has(doc.id)
    );

    setAllRequiredDocuments(
      uniqueAllRequiredDocuments.map((item) => {
        return { label: item.name, value: item.id };
      })
    );
  };

  useEffect(() => {
    getAllRequiredDocuments();
  }, []);

  const [form] = Form.useForm();

useEffect(() => {
  if (requiredDocumentsOnEntry.length > 0) {
    form.setFieldsValue({
      entryDocuments: requiredDocumentsOnEntry.map(doc => doc.value),
      exitDocuments: requiredDocumentsOnExit.map(doc => doc.value),
      ongoingDocuments: requiredDocumentsOnAttendance.map(doc => doc.value),
    });
  }
}, [requiredDocumentsOnEntry, requiredDocumentsOnExit, requiredDocumentsOnAttendance, form]);


  useEffect(() => {
    console.log(requiredDocumentsOnAttendance);
  }, [requiredDocumentsOnAttendance]);

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
    const response = await GetAllAcademicianAPI();
    const academicianNames = response.map((x) => ({
      label: x.nameSurname,
      value: x.id,
    }));
    setAcademicianOptions(academicianNames);
  };

  useEffect(() => {
    fetchAcademician();
  }, []);

  const handleFinish = async (values) => {
    try {
      console.log(values);

      // Scholar ekleme
      const scholarValues = {
        nameSurname: values.nameSurname,
        email: values.email,
      };

      const scholarResponse = await AddScholarAPI(scholarValues);
      console.log("scholarResponse:", scholarResponse);

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
      console.log("termResponse:", termResponse);

      if (!termResponse) {
        messageApi.open({
          type: "error",
          content: "Term could not be added. Please try again.",
        });
        return;
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
      console.log("termOfScholarResponse:", termOfScholarResponse);

      if (!termOfScholarResponse) {
        messageApi.open({
          type: "error",
          content:
            "Scholar-Term relation could not be created. Please try again.",
        });
        return;
      }

      messageApi.open({
        type: "success",
        content: "Scholar added successfully!",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      messageApi.open({
        type: "error",
        content: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <Card>
      {contextHolder}
      <Form
      form={form}
        labelAlign="left"
        labelWrap={true}
        layout="horizontal"
        name="bursiyer"
        requiredMark={true}
        scrollToFirstError={true}
        variant="outlined"
        clearOnDestroy={false}
        onFinish={handleFinish}
        onFinishFailed={() => error()}
      >
        <Row>
          <Card>
            <Col>
              <Typography.Title>Scholar</Typography.Title>
              <Form.Item
                colon={true}
                htmlFor="input"
                label={"Name Surname"}
                name={"nameSurname"}
                required={true}
                rules={[
                  { required: true, message: `Scholar Name is required` },
                ]}
              >
                <Input></Input>
              </Form.Item>
              <Form.Item
                colon={true}
                htmlFor="input"
                label={"Email"}
                name={"email"}
                required={true}
                rules={[{ required: true, message: `Email is required` }]}
              >
                <Input></Input>
              </Form.Item>
            </Col>
          </Card>
          <Card>
            <Col>
              <Typography.Title>Term</Typography.Title>
              <Form.Item
                colon={true}
                htmlFor="input"
                label={"Term Name"}
                name={"name"}
                required={true}
                rules={[{ required: true, message: `Term Name is required` }]}
              >
                <Input></Input>
              </Form.Item>
              <Row>
                <Form.Item
                  colon={true}
                  htmlFor="input"
                  label={"Start Date"}
                  name={"startDate"}
                  required={true}
                  rules={[
                    {
                      required: true,
                      message: `Start Date of the term is required`,
                    },
                  ]}
                >
                  <DatePicker></DatePicker>
                </Form.Item>
                <Form.Item
                  colon={true}
                  htmlFor="input"
                  label={"End Date"}
                  name={"endDate"}
                  required={true}
                  rules={[
                    {
                      required: true,
                      message: `End Date of the term is required`,
                    },
                  ]}
                >
                  <DatePicker></DatePicker>
                </Form.Item>
                <Form.Item
                  colon={true}
                  htmlFor="input"
                  label={"Responsible Academician"}
                  name={"responsibleAcademician"}
                  required={true}
                  rules={[
                    {
                      required: true,
                      message: `Responsible Academician of the term is required`,
                    },
                  ]}
                >
                  <Select
                    mode="single"
                    style={{ width: "100%" }}
                    placeholder="Select Academician"
                    onChange={handleChange}
                    options={academicianOptions}
                    styles={{ width: "100px" }}
                  />
                </Form.Item>
              </Row>
              <Form.Item
                colon={true}
                htmlFor="input"
                label={"Entry Documents"}
                name={"entryDocuments"}
                required={true}
                rules={[
                  {
                    required: true,
                    message: `Entry Documents are necessary`,
                  },
                ]}
                initialValue={requiredDocumentsOnEntry.map(doc => doc.value)}
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Select Documents"
                  styles={{ width: "100px" }}
                  options={allRequiredDocuments}
                />
              </Form.Item>
              <Form.Item
                colon={true}
                htmlFor="input"
                label={"Exit Documents"}
                name={"exitDocuments"}
                required={true}
                rules={[
                  {
                    required: true,
                    message: `Exit Documents are necessary`,
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Select Documents"
                  styles={{ width: "100px" }}
                  options={allRequiredDocuments}
                  defaultValue={requiredDocumentsOnExit}
                />
              </Form.Item>
              <Form.Item
                colon={true}
                htmlFor="input"
                label={"Ongoing Documents"}
                name={"ongoingDocuments"}
                required={true}
                rules={[
                  {
                    required: true,
                    message: `Ongoing Documents are necessary`,
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Select Documents"
                  styles={{ width: "100px" }}
                  options={allRequiredDocuments}
                  defaultValue={requiredDocumentsOnAttendance}
                  opti
                />
              </Form.Item>
            </Col>
          </Card>
        </Row>
        <Button variant="solid" htmlType="submit">
          Submit
        </Button>
      </Form>
      <Modal open={isOpenModal} onCancel={() => setIsOpenModel(false)}>
        FORM HATASI
      </Modal>
    </Card>
  );
};

export default BursiyerEkle;
