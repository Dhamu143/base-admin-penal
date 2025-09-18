import axios from "axios";

const API_URL = "https://setu.apnamandal.com/api/mantra";

const mantraService = {
  /**
   * Fetch all Mantras
   */
  getMantras: async () => {
    const response = await axios.get(API_URL);
    return response.data.data.data;
  },

  /**
   * Add a new Mantra
   */
  createMantra: async (mantraData) => {
    const response = await axios.post(`${API_URL}/create`, mantraData);
    return response.data.data;
  },

  /**
   * Update an existing Mantra
   */
  updateMantra: async (id, mantraData) => {
    const response = await axios.put(`${API_URL}/${id}`, mantraData);
    return response.data.data;
  },

  /**
   * Delete a Mantra
   */
  deleteMantra: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  },
};

export default mantraService;
