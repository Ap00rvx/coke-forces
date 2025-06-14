const axios = require('axios');

/**
 * Fetches user information from the Codeforces API.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<Object|null>} An object containing user info (handle, rating, maxRating, rank) or null if the request fails.
 * @throws {Error} If the API response status is not "OK" or if the request fails.
 */
async function fetchUserInfo(handle) {
    try {
        const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
        if (res.data.status !== 'OK') {
            throw new Error(`Codeforces API error: ${res.data.comment || 'Unknown error'}`);
        }

        const user = res.data.result[0];

        return {
            handle: user.handle,
            rating: user.rating || 'Unrated',
            maxRating: user.maxRating || 'Unrated',
            rank: user.rank || 'Unranked',
            titlePhoto: user.titlePhoto || null,
            organization: user.organization || 'Not Specified',
            lastOnlineTime: new Date(user.lastOnlineTimeSeconds * 1000),
            registrationTime: new Date(user.registrationTimeSeconds * 1000),
            friendOfCount: user.friendOfCount || 0,
        };
    } catch (err) {
        console.error(`Error fetching user info for ${handle}:`, err.message);
        return null;
    }
}

/**
 * Fetches the rating history of a user from the Codeforces API.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<Array<Object>>} An array of objects containing contest details (contestId, contestName, rank, oldRating, newRating, ratingChange, time) or an empty array if the request fails.
 * @throws {Error} If the API response status is not "OK" or if the request fails.
 */
async function fetchUserRatingHistory(handle) {
    try {
        const res = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
        if (res.data.status !== 'OK') {
            throw new Error(`Codeforces API error: ${res.data.comment || 'Unknown error'}`);
        }
        return res.data.result;  
      } catch (err) {
        console.error(`Error fetching rating history for ${handle}:`, err.message);
        return [];
    }
}

/**
 * Fetches the submission history of a user from the Codeforces API.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<Array<Object>>} An array of submission objects or an empty array if the request fails.
 * @throws {Error} If the API response status is not "OK" or if the request fails.
 */
async function fetchUserSubmissions(handle) {
    try {
        const res = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        if (res.data.status !== 'OK') {
            throw new Error(`Codeforces API error: ${res.data.comment || 'Unknown error'}`);
        }
        return res.data.result;
    } catch (err) {
        console.error(`Error fetching submissions for ${handle}:`, err.message);
        return [];
    }
}

module.exports = {
    fetchUserInfo,
    fetchUserRatingHistory,
    fetchUserSubmissions
};