import React, { useState, useEffect, useCallback } from "react";
import { AutoComplete, DatePicker, Select, Button, message, Form, Row, Col, Card } from "antd";
import dayjs from "dayjs";

export default function AddPeriodToScholar({ targetID }) {
  const [periodOptions, setPeriodOptions] = useState([]);
  const [periodMap, setPeriodMap] = useState({});  // value -> full period objesi map
  const [academicians, setAcademicians] = useState([]);
  const [scholarTypes, setScholarTypes] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    Promise.all([
      fetch("/api/Scholars/GetAllAcademicians").then((res) => res.json()),
      fetch("/api/Scholars/GetAllScholarTypes").then((res) => res.json()),
      fetch("/api/Documents/GetAllDocumentTypes").then((res) => res.json())
    ])
      .then(([acadData, scholarData, docData]) => {
        setAcademicians(acadData || []);
        setScholarTypes(scholarData || []);
        setDocumentTypes((docData || []).map((d) => ({
          label: d.TypeName,
          value: d.Id.toString()
        })));
      })
      .catch(() => {
        message.error("Veriler yüklenirken hata oluştu");
      });
  }, []);

  // Dönem arama
 const handleSearchPeriod = useCallback((value) => {
  if (!value) return;
  fetch(`https://localhost:5156/api/term/scholarTermsWithName?termName=${encodeURIComponent(value)}`)
    .then((res) => res.json())
    .then((data) => {
      setPeriodOptions(data.map(p => ({
        value: p.name,
        label: p.name
      })));
      setPeriodMap(data.reduce((acc, p) => {
        acc[p.name] = p;
        return acc;
      }, {}));
    })
    .catch(() => message.error("Dönem listesi alınamadı"));
}, []);

// Dönem seçildiğinde
const handleSelectPeriod = (value) => {
  const period = periodMap[value];
  if (!period) return;

  const entryDocuments = period.termDocumentTypes
    .filter(d => d.listType === "ENTRY" && !d.deleted)
    .map(d => d.documentTypeId.toString());

  const ongoingDocuments = period.termDocumentTypes
    .filter(d => d.listType === "ONGOING" && !d.deleted)
    .map(d => d.documentTypeId.toString());

  const exitDocuments = period.termDocumentTypes
    .filter(d => d.listType === "EXIT" && !d.deleted)
    .map(d => d.documentTypeId.toString());

  form.setFieldsValue({
    periodName: period.name || "",
    startDate: period.startDate ? dayjs(period.startDate) : null,
    endDate: period.endDate ? dayjs(period.endDate) : null,
    responsibleId: period.responsibleAcademician?.toString() || "",
    scholarTypeId: period.scholarTypeId?.toString() || "",
    entryDocuments,
    ongoingDocuments,
    exitDocuments
  });
};

  // Kaydetme
  const handleSave = () => {
    form.validateFields()
      .then((values) => {
        const payload = {
          ScholarId: parseInt(targetID),
          PeriodId: 0, // Burayı uygun şekilde set et (backend'den Id gelirse burada tutabilirsin)
          PeriodName: values.periodName,
          StartDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
          EndDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
          RequiredDocumentTypeNamesOnEntry: values.entryDocuments || [],
          RequiredDocumentTypeNamesOnBoarding: values.ongoingDocuments || [],
          RequiredDocumentTypeNamesOnExit: values.exitDocuments || [],
          ResponsibleAcademicianId: values.responsibleId,
          ScholarTypeId: values.scholarTypeId
        };

        fetch("/api/scholars/save-period-infos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then((res) => {
            if (res.ok) {
              message.success("Kayıt başarıyla yapıldı");
            } else {
              message.error("Kayıt sırasında bir hata oluştu");
            }
          })
          .catch(() => message.error("Kayıt sırasında bir hata oluştu"));
      })
      .catch(() => message.warning("Lütfen tüm gerekli alanları doldurun"));
  };

  return (
    <Card title="Dönem Bilgileri" className="max-w-3xl mx-auto mt-6 shadow" variant="outlined">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="periodName"
              label="Dönem Adı"
              rules={[{ required: true, message: "Dönem adı gerekli" }]}
            >
              <AutoComplete
                options={periodOptions}
                onSearch={handleSearchPeriod}
                onSelect={handleSelectPeriod}
                placeholder="Dönem adını yazın"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="startDate"
              label="Başlangıç Tarihi"
              rules={[{ required: true, message: "Başlangıç tarihi gerekli" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="endDate"
              label="Bitiş Tarihi"
              rules={[{ required: true, message: "Bitiş tarihi gerekli" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="responsibleId" label="İlgili Akademisyen" rules={[{ required: true }]}>
              <Select
                options={academicians.map((a) => ({ label: a.FullName, value: a.Id.toString() }))}
                placeholder="Seçiniz"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="scholarTypeId" label="Burs Türü" rules={[{ required: true }]}>
              <Select
                options={scholarTypes.map((s) => ({ label: s.TypeName, value: s.Id.toString() }))}
                placeholder="Seçiniz"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="ongoingDocuments" label="Devam Eden Belgeler" rules={[{ required: true }]}>
              <Select mode="multiple" options={documentTypes} placeholder="Seçiniz" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="entryDocuments" label="Giriş Belgeleri" rules={[{ required: true }]}>
              <Select mode="multiple" options={documentTypes} placeholder="Seçiniz" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="exitDocuments" label="Çıkış Belgeleri" rules={[{ required: true }]}>
              <Select mode="multiple" options={documentTypes} placeholder="Seçiniz" />
            </Form.Item>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button type="primary" size="large" onClick={handleSave}>
            Kaydet
          </Button>
        </div>
      </Form>
    </Card>
  );
}
