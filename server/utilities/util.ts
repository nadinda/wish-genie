/**
 *
 * Generate a random string given a specific length
 *
 * @see https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a#comment-11ib9
 *
 **/

export const generateRandomString = (
  length: number = 3,
  randomString: string = ""
): string => {
  randomString += Math.floor(Math.random() * Date.now())
    .toString(36)
    .substring(0, length);

  if (randomString.length > length) return randomString.slice(0, length);
  return generateRandomString(length, randomString);
};
