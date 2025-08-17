import { Button } from "antd";
import DocumentAddModalGlobal from "../../reusableComponents/DocumentAddModalGlobal";
import { useState } from "react";

const Test = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDocumentsAdded = (documents) => {
    console.log("Eklenen dökümanlar:", documents);
    // Dökümanları backend'e gönder
  };

  return (
    <DocumentAddModalGlobal
      visible={true}
      onCancel={() => setModalVisible(false)}
      onOk={handleDocumentsAdded}
      title="Proje Dökümanları"
      moduleType="project"
      allowedFileTypes={[".pdf", ".doc", ".docx"]}
      maxFileSize={5}
      customFields={{
        projectPhase: {
          type: "select",
          label: "Proje Fazı",
          options: [
            { value: "planning", label: "Planlama" },
            { value: "development", label: "Geliştirme" },
          ],
        },
      }}
    />
  );
};

export default Test;
