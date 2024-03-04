import { useState, useEffect } from 'react';

export const useDataHandler = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url,{

          credentials: "include"
        })
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [url]);

  return data;
};

export const useFollowersData = (userId) => {
  const [followersData, setFollowersData] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/data/users/follow?id=${userId}`, {
          credentials:'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch followers');
        }
        const data = await response.json();
        setFollowersData(data);
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    };

    fetchFollowers();
  }, [userId]);

  return followersData;
};

export const FetchData = async (url) => {
  //const url = `http://localhost:8080/api/data/follow?id=${userId}&status=${status}&followId=${followId}`;
  try {
      const response = await fetch(url, {
        credentials: "include"
      })
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      console.log('Data:', data);
      return data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};

// followUtils.js
const handleFollow = async (follower, status) => {

  const url = `http://localhost:8080/api/data/follow?id=${follower}&status=${status}`;
  await FetchData(url);
};

export default handleFollow;
