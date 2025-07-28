import { useEffect, useState } from "react";
import "./BursiyerListesi.css";
import BursiyerListesiAPI from "../API/BursiyerListesiAPI";
import DraggableAntdTable from "../ReusableComponents/DraggableAntdTable";
import { Button, Card } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BursiyerSilmeAPI from "../API/BursiyerSilmeAPI";
import { useLocalization } from "../../Localization/LocalizationContext";

const BursiyerListesi = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0); // Force update için
  const { localizeThis, language } = useLocalization();

  // Kolonları her seferinde fresh olarak hesapla
  const getColumns = () => {
    return [
      {
        title: localizeThis("idColumnTitle"),
        dataIndex: "id",
        key: "id",
      },
      {
        title: localizeThis("nameSurnameColumnTitle"),
        dataIndex: "nameSurname",
        key: "nameSurname",
      },
      {
        title: localizeThis("emailColumnTitle"),
        dataIndex: "email",
        key: "email",
      },
    ];
  };

  const fetchData = async () => {
    const response = await BursiyerListesiAPI();
    setList(response);
    setLoading(false);
  };

  // Dil değiştiğinde force update tetikle
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [language]);

  // Component mount olduğunda veri çek
  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (e) => {
    const id = e.id;
    const params = new URLSearchParams({ targetID: id });
    window.location.href = `/scholar-info?${params.toString()}`;
    console.log(id);
  };

  const handleDelete = async (record) => {
    var response = await BursiyerSilmeAPI(record.id);
    if (response != undefined) {
      fetchData();
    }
  };

  return (
    <Card>
      <DraggableAntdTable
        key={forceUpdate} // Bu key dil değiştiğinde component'i yeniden mount eder
        loading={loading}
        dataSource={list}
        columns={getColumns()} // Her render'da fresh columns
        rowKey="id"
        sort={true}
        filter={true}
        localizeThis={localizeThis}
        columnDraggable={true}
        rowDraggable={false}
        showExportButton={true}
        exportFileName="bursiyer-listesi"
        pagination={{ pageSize: 10 }}
        size="large"
        showEdit={true}
        showDelete={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        editConfig={{
          title: "",
          buttonText: "",
          buttonType: "primary",
          width: 100,
          fixed: false,
        }}
        deleteConfig={{
          title: "",
          buttonText: "",
          confirmTitle: "Are you sure?",
          width: 100,
          buttonDanger: true,
          buttonType: "primary",
          fixed: false,
        }}
      />
    </Card>
  );
};

export default BursiyerListesi;