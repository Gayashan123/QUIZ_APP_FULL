export const apiurl = "http://127.0.0.1:8000/api/";

export const token = () => { 
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null; // if userInfo doesn't exist
  try {
    const data = JSON.parse(userInfo);
    return data.token;
  } catch (error) {
    console.error("Error parsing userInfo from localStorage:", error);
    return null;
  }
};
