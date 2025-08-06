// services/UpdateScholarAPI.js
const UpdateScholarAPI = async (scholarData) => {
  const base = import.meta.env.VITE_API_BASE_URL;
  const scholarId = scholarData.id;
  const url = `${base}api/scholar/${scholarId}`;
  
  // ID'yi body'den çıkar, sadece güncellenmek istenen alanları gönder
  const { id, ...updateData } = scholarData;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    // Response boş olabilir, kontrol et
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('Scholar update response:', result);
      return result;
    } else {
      // Başarılı ama JSON response yoksa
      console.log('Scholar updated successfully (no JSON response)');
      return { success: true };
    }
    
  } catch (error) {
    console.error('UpdateScholarAPI Error:', error);
    throw error;
  }
};

export default UpdateScholarAPI;