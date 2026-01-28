function generateRollNumber(course, count) {
  const prefix = course.substring(0, 3).toUpperCase();
  return `${prefix}${100 + count}`;
}
// Export the function for use in other files
module.exports = generateRollNumber;
