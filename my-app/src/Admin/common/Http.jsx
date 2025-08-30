export const apiurl = "http://127.0.0.1:8000/api/";

export const token = () => {
  const userInfo = localStorage.getItem("userInfo");
  if (!userInfo) return null;
  try {
    const data = JSON.parse(userInfo);
    return data?.token || null;
  } catch (error) {
    console.error("Error parsing userInfo from localStorage:", error);
    return null;
  }
};