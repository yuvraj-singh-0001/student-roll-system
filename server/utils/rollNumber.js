function generateRollNumber(course, count) {
  const prefix = course.substring(0, 3).toUpperCase();
  return `${prefix}${100 + count}`;
}

function generateExamStudentId(count) {
  return `EXM${100 + count}`;
}

export default generateRollNumber;
export { generateExamStudentId };
