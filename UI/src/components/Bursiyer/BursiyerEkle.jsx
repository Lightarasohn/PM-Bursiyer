import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import "./BursiyerEkle.css";

const BursiyerEkle = () => {
    const handleFinish = (values) => {
        console.log(values)
        const fixedValues = {
            nameSurname: values.nameSurname,
            email: values.email,
            name: values.name,
            startDate: values.startDate.format("YYYY-MM-DD"),
            endDate: values.endDate.format("YYYY-MM-DD"),
            responsibleAcademician: values.responsibleAcademician
        }
        console.log(fixedValues)
    }

  return (
    <Card>
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
        onFinishFailed={() => console.log("hata")}
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
              rules={[{ required: true, message: `Name Surname is required` }]}
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
                    message: `Start Date of the term is required`,
                  },
                ]}
              >
                <AutoComplete style={{ width: "200px" }} />
              </Form.Item>
            </Row>
          </Col>
        </Card>
        </Row>
        <Button 
            variant="solid"
            htmlType="submit"
        >Submit</Button>
      </Form>
    </Card>
  );
};

export default BursiyerEkle;
