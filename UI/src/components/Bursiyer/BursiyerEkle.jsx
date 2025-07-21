import {
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
  message
} from "antd";
import "./BursiyerEkle.css";
import { useEffect, useState } from "react";
import GetAllAcademicianAPI from "../API/GetAllAcademicianAPI";

const BursiyerEkle = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [academicianOptions, setAcademicianOptions] = useState([]);
  const [isOpenModal, setIsOpenModel] = useState(false);
  
  const error = () => {
    messageApi.open({
      type: 'error',
      content: 'Error in form',
    });
  };

  const handleChange = (val) => {
    console.log(val)
  }

  useEffect(() => {
    const fetchAcademician = async () => {
    const response = await GetAllAcademicianAPI();
    const academicianNames = response.map(x => ({
      label: x.nameSurname,
      value: x.id,
    }));
    setAcademicianOptions(academicianNames)
  }

    fetchAcademician();
  },[])

  const handleFinish = (values) =>  {
    console.log(values);
    const scholarValues = {
      nameSurname: values.nameSurname,
      email: values.email
    }

    const termValues = {
      name: values.name,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      responsibleAcademician: values.responsibleAcademician
    }


    const scholarTermValues = {}
  };

  return (
    <Card>
       {contextHolder}
      <Form
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
                    styles={{width:"100px"}}
                  />
                </Form.Item>
              </Row>
            </Col>
          </Card>
        </Row>
        <Button variant="solid" htmlType="submit">
          Submit
        </Button>
      </Form>
      <Modal open={isOpenModal}
      onCancel={() => setIsOpenModel(false)}>FORM HATASI</Modal>
    </Card>
  );
};

export default BursiyerEkle;
