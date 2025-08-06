// ScholarEdit.js - API düzeltmesi ve modal için optimize edilmiş versiyon

import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Row,
  Col,
  Skeleton,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SaveOutlined,
  IdcardOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import UpdateScholarAPI from '../../services/UpdateScholarAPI';
import GetScholarAPI from '../../services/GetScholarAPI';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ScholarEdit = ({ scholarId, scholarData: initialScholarData, onSuccess, isModal = false }) => {
  const [form] = Form.useForm();
  const [scholarData, setScholarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Scholar ID'yi prop'tan veya URL'den al
  const getScholarId = useCallback(() => {
    if (scholarId) return scholarId;
    
    const query = new URLSearchParams(window.location.search);
    return query.get("scholarId") || query.get("targetID");
  }, [scholarId]);

  // GetScholarAPI artık import edildi, tekrar tanımlamaya gerek yok

  // Update API fonksiyonu
  
  // Scholar verilerini yükle
  useEffect(() => {
    const loadScholarData = async () => {
      const id = getScholarId();
      if (!id) {
        message.error("Geçersiz bursiyer ID'si!");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let data;
        
        // Eğer initialScholarData prop'tan geliyorsa önce onu kullan
        if (initialScholarData && isModal) {
          console.log("Using initial scholar data from props:", initialScholarData);
          data = initialScholarData;
        } else {
          // Mevcut GetScholarAPI servisinizi kullan
          console.log("Fetching scholar data from API for ID:", id);
          data = await GetScholarAPI(id);
        }
        
        console.log("Final scholar data:", data);
        setScholarData(data);
        
        // Form verilerini hazırla - farklı field isimlerini kontrol et
       const formData = {
  nameSurname: data.nameSurname || '',
  email: data.email || '',
  phone: data.phone || '',
  tcNo: data.tcNo || '',
  birthDate: data.birthDate || '',
  address: data.address || ''
  
};

        console.log("Setting form values:", formData);
        
        // Form'u doldur
        form.setFieldsValue(formData);
        
        // Form değerlerinin doğru yüklendiğini kontrol et
        setTimeout(() => {
          const currentValues = form.getFieldsValue();
          console.log("Current form values after setting:", currentValues);
        }, 100);
        
      } catch (error) {
        console.error("Scholar data fetch error:", error);
        message.error("Bursiyer bilgileri alınamadı!");
        
        // Eğer modal modundaysak ve initialData varsa yine de form'u doldur
        if (isModal && initialScholarData) {
          console.log("Using fallback initial data due to API error");
          setScholarData(initialScholarData);
          
          const formData = {
  nameSurname: initialScholarData.nameSurname || '',
  email: initialScholarData.email || '',
  phone: initialScholarData.phone || '',
  tcNo: initialScholarData.tcNo || '',
  birthDate: initialScholarData.birthDate || '',
  address: initialScholarData.address || ''
};
          
          form.setFieldsValue(formData);
        }
      } finally {
        setLoading(false);
      }
    };

    loadScholarData();
  }, [getScholarId, form, initialScholarData, isModal]);

  // Form submit handler
  const handleFinish = async (values) => {
    setSubmitting(true);
    
    try {
      const id = getScholarId();
      const updateData = {
        id: id,
        ...values
      };

      console.log("Submitting form with values:", updateData);
      
      // Update API'yi çağır
      const result = await UpdateScholarAPI(updateData);
      
      if (result) {
        message.success("Bursiyer bilgileri başarıyla güncellendi!");
        
        if (isModal && onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = `/scholar-info?targetID=${id}`;
          }, 2000);
        }
      } else {
        message.error("Güncelleme işlemi başarısız!");
      }
    } catch (error) {
      console.error("Form submit error:", error);
      message.error(`Güncelleme sırasında hata oluştu: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // İptal/Geri dön
  const handleCancel = () => {
    if (isModal && onSuccess) {
      onSuccess(); // Modal'ı kapat
    } else {
      const id = getScholarId();
      window.location.href = `/scholar-info?targetID=${id}`;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: isModal ? '16px' : '24px' }}>
      {/* Modal Header */}
      {isModal && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {scholarData?.nameSurname || scholarData?.NAME_SURNAME || 'Bursiyer Bilgileri'}
          </Title>
          <Text type="secondary">Bursiyer bilgilerini güncelleyebilirsiniz</Text>
        </div>
      )}

      {/* Normal Page Header */}
      {!isModal && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white'
        }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Bursiyer Bilgilerini Düzenle
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            {scholarData?.nameSurname || scholarData?.NAME_SURNAME || 'Yükleniyor...'}
          </Text>
        </div>
      )}

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        size="large"
        preserve={false}
        validateTrigger={["onBlur", "onChange"]}
      >
        <Row gutter={[24, 16]}>
          {/* Ad Soyad */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Ad Soyad"
              name="nameSurname"
              rules={[
                { required: true, message: 'Ad soyad alanı zorunludur!' },
                { min: 2, message: 'Ad soyad en az 2 karakter olmalıdır!' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="Ad Soyad giriniz"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>

          {/* Email */}
          <Col xs={24} md={12}>
            <Form.Item
              label="E-mail"
              name="email"
              rules={[
                { required: true, message: 'E-mail alanı zorunludur!' },
                { type: 'email', message: 'Geçerli bir e-mail adresi giriniz!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder="email@example.com"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
          
        </Row>

        <Divider />

        {/* Action Buttons */}
        <Row justify="center" gutter={16}>
          <Col>
            <Button
              size="large"
              onClick={handleCancel}
              style={{
                borderRadius: '8px',
                padding: '8px 32px',
                height: 'auto'
              }}
            >
              {isModal ? 'İptal' : 'Geri Dön'}
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              loading={submitting}
              htmlType="submit"
              icon={<SaveOutlined />}
              style={{
                borderRadius: '8px',
                padding: '8px 32px',
                height: 'auto',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
              }}
            >
              {submitting ? 'Güncelleniyor...' : 'Bilgileri Kaydet'}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ScholarEdit;