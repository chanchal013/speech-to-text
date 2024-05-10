import axios from 'axios';

export const fetchProductDetails = async (queryTxt: string) => {
  try {
    const response = await axios.post(
      'https://oc8ogahd5j.execute-api.us-west-2.amazonaws.com/ai/query',
      { query: queryTxt },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;
    if (response.status === 200) {
      return data.data;
    } else if (response.status === 404) {
      throw new Error('Not found');
    } else if (response.status === 400) {
      throw new Error('Invalid input');
    } else {
      throw new Error('Unexpected error occurred');
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};
