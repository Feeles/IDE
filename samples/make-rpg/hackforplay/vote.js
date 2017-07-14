/* Feeles Voting System */
const {USER_UUID, VERSION_UUID} = feeles.env;
export const isEnabled = !!(USER_UUID && VERSION_UUID);
export const API = `https://www.feeles.com/api`;
export const API_V1 = `${API}/v1/vote?user=${USER_UUID}&version=${VERSION_UUID}`;
export const REST_API_V1 = `${API}/v1/votes?user=${USER_UUID}&version=${VERSION_UUID}`;

/**
 * vote('key', 'value'); Set Key-Value data
 * vote('key'); Get value which has key
 */
export default async function vote(key, value) {

  if (value === undefined) {

    const votes = await getVotes();
    return votes[key] || '';

  } else {

    return await doVoting(key, value);

  }

}


async function doVoting(key, value) {
  if (isEnabled) {
    return await fetch(`${API_V1}&key=${key}&value=${value}`);
  }
}

async function getVotes() {
  if (isEnabled) {
		const response = await fetch(REST_API_V1);
		const text = await response.text();
		const paginator = JSON.parse(text);
    if (paginator.data) {
      return paginator.data[0].value;
    } else {
      return paginator;
    }
  }
  return {};
}
