// This file implements the algorithm for weighted convolution.
// This is useful for job search based on several criteria with
// customized priority order.

/**
 * This function generates weight object based on the criteria order
 * @param array Array of criterias, described as strings
 * @returns Object, where key is the current criterion, and the value is the
 * numerical representation of a weight
 */
export const generateWeights = (array: string[]) =>
  array.reduce(
    (accumulator, key, index) => {
      const total = array.length;
      const weight = (2 * (total - index)) / (total * (total + 1));

      accumulator[key] = weight;
      return accumulator;
    },
    {} as Record<string, number>,
  );

/**
 * This function generates algorithms for MongoDB to calculate weights for
 * recommendation criteria.
 * @param maxSalary Maximal salary across searched jobs
 * @param interestedCategories Array of categories in which user is interested
 * @returns Aggregation object for MongoDB
 */
export const generateScoreCalculation = (
  maxSalary: number,
  interestedCategories: string[],
) => ({
  $set: {
    salaryScore: {
      $divide: ['$hourRate', maxSalary],
    },
    distanceScore: {
      $max: [{ $subtract: [1, '$distance'] }, 0],
    },
    categoryScore: {
      $cond: [{ $in: ['$category', interestedCategories ?? []] }, 1, 0],
    },
    reputationScore: {
      $divide: [{ $ifNull: ['$owner.rating', 0] }, 5],
    },
  },
});

/**
 * This function generates algorithm for MongoDB to perform a weighted
 * convolution for the criterion scores.
 * @param weights Complex object which contains weights for criteria
 * @returns Aggregation object for MongoDB
 */
export const generateWeightConvolution = (
  weights: Record<string, number | undefined>,
) => ({
  $set: {
    score: {
      $add: [
        { $multiply: ['$distanceScore', weights.distance ?? 0] },
        { $multiply: ['$salaryScore', weights.salary ?? 0] },
        { $multiply: ['$categoryScore', weights.categories ?? 0] },
        { $multiply: ['$reputationScore', weights.reputation ?? 0] },
      ],
    },
  },
});
