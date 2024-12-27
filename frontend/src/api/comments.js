import axios from "axios";

const API_URL = "http://localhost:3000/api/comments";

export const getComments = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const createComment = async (comment) => {
  try {
    const response = await axios.post(API_URL, comment);
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};
