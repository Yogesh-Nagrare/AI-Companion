import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // your backend
  withCredentials: true, // VERY IMPORTANT
});

export default API;